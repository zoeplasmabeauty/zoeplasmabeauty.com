/**
 * ARCHIVO: src/app/api/cron/recordatorios/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Ejecutar la automatización de envíos de recordatorios diarios (Cron Job).
 * Escanea la base de datos en busca de todos los turnos confirmados para "HOY"
 * y dispara correos electrónicos personalizados con la hora y la dirección.
 * * RESPONSABILIDADES:
 * 1. Seguridad: Bloquear el acceso público mediante una llave 'CRON_SECRET'.
 * 2. Cálculo de Fecha: Determinar matemáticamente qué día es "hoy" en Buenos Aires.
 * 3. Extracción de Base de Datos: Obtener los pacientes que tienen cita hoy.
 * 4. Despacho Masivo: Conectar con Brevo API para enviar los correos sin fricción.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db';
import { appointments, patients, services } from '../../../../db/schema';
import { eq, and, gte, lt, inArray } from 'drizzle-orm';
import { format } from 'date-fns';
import { getReminderEmail } from '../../../../lib/emailTemplates';

export const runtime = 'edge';

// Constantes estáticas
const MAPS_LINK = "https://maps.app.goo.gl/SLYdt74rvRprihxL6";

export async function GET(request: Request) {
  console.log("\n==================================================");
  console.log("⏰ [CRON] 1. Iniciando motor de recordatorios diarios");

  try {
    // 1. CONEXIÓN AL ENTORNO
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Extraemos variables de entorno críticas
    const cloudflareEnv = env as unknown as Record<string, string>;
    const cronSecret = cloudflareEnv.CRON_SECRET || process.env.CRON_SECRET;
    const brevoApiKey = cloudflareEnv.BREVO_API_KEY || process.env.BREVO_API_KEY;

    // 2. AUDITORÍA DE SEGURIDAD (El Blindaje)
    // Permite validar mediante cabecera Authorization o parámetro en la URL (?secret=...)
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    
    const isAuthorized = 
      (querySecret && querySecret === cronSecret) || 
      (authHeader && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      console.log("🛑 [CRON] Acceso denegado: Intento de ejecución sin credenciales.");
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    if (!brevoApiKey) {
      throw new Error("La API Key de Brevo no está configurada.");
    }

    // 3. MATEMÁTICA DE TIEMPO: ¿Qué día es "Hoy" en Buenos Aires?
    // Extraemos la hora exacta actual forzando el huso horario de Argentina
    const hoyBuenosAires = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
    const fechaObj = new Date(hoyBuenosAires);
    const fechaYYYYMMDD = format(fechaObj, 'yyyy-MM-dd'); // Ej: 2026-03-05

    console.log(`📅 [CRON] Escaneando agenda para el día: ${fechaYYYYMMDD}`);

    // Construimos los límites absolutos del día (-03:00) para buscar en la base de datos
    const startOfDayUTC = new Date(`${fechaYYYYMMDD}T00:00:00.000-03:00`);
    const endOfDayUTC = new Date(`${fechaYYYYMMDD}T23:59:59.999-03:00`);

    // 4. EXTRACCIÓN DE LA AGENDA DEL DÍA (JOIN)
    const turnosDeHoy = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
      patientName: patients.fullName,
      patientEmail: patients.email,
      serviceName: services.name,
      servicePrice: services.price,
      serviceDeposit: services.deposit // INYECCIÓN: Extraemos el valor real de la seña para el cálculo
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        gte(appointments.appointmentDate, startOfDayUTC.toISOString()),
        lt(appointments.appointmentDate, endOfDayUTC.toISOString()),
        // Solo mandamos recordatorio a quienes tienen turno confirmado o aprobado pendiente de pago en estetica
        inArray(appointments.status, ['confirmed', 'approved_unpaid']) 
      )
    );

    console.log(`👥 [CRON] Se encontraron ${turnosDeHoy.length} pacientes agendados para hoy.`);

    // Si no hay turnos, terminamos el proceso exitosamente sin hacer nada
    if (turnosDeHoy.length === 0) {
      console.log("✅ [CRON] Proceso finalizado. No hay envíos pendientes.");
      console.log("==================================================\n");
      return NextResponse.json({ success: true, message: "No hay turnos para hoy.", sentCount: 0 }, { status: 200 });
    }

    // 5. MOTOR DE DESPACHO (Envío masivo de correos)
    let enviosExitosos = 0;

    for (const turno of turnosDeHoy) {
      try {
        // INYECCIÓN LÓGICA: Cálculo del saldo restante (Precio del tratamiento menos la seña dinámica)
        const saldoRestante = turno.servicePrice - turno.serviceDeposit;

        // Extraemos solo la hora del turno y la formateamos al estilo local (Ej: 14:30)
        const fechaTurno = new Date(turno.appointmentDate);
        const horaFormateada = new Intl.DateTimeFormat('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires'
        }).format(fechaTurno);

        // Construimos el HTML inyectando las variables
        const emailHtml = getReminderEmail({
          patientName: turno.patientName,
          serviceName: turno.serviceName,
          timeFormatted: horaFormateada,
          saldoRestante: saldoRestante.toLocaleString('es-AR'),
          mapsLink: MAPS_LINK
        });

        // Disparamos la petición a Brevo
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: "Zoe Plasma Beauty", email: "contacto@zoeplasmabeauty.com" },
            to: [{ email: turno.patientEmail, name: turno.patientName }],
            subject: "Recordatorio: ¡Hoy es tu cita en Zoe Plasma Beauty!",
            htmlContent: emailHtml 
          })
        });

        console.log(`📩 [CRON] Recordatorio enviado a: ${turno.patientEmail} (Hora: ${horaFormateada})`);
        enviosExitosos++;

      } catch (mailError) {
        console.error(`❌ [CRON] Error enviando recordatorio a ${turno.patientEmail}:`, mailError);
        // Continuamos con el siguiente paciente en caso de que uno falle
      }
    }

    console.log(`✅ [CRON] Proceso finalizado. Total correos enviados: ${enviosExitosos}/${turnosDeHoy.length}`);
    console.log("==================================================\n");

    return NextResponse.json({ 
      success: true, 
      message: "Motor CRON ejecutado correctamente.", 
      sentCount: enviosExitosos 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Error crítico en motor CRON:", error.message);
    return NextResponse.json(
      { error: "Fallo interno en el servidor CRON." }, 
      { status: 500 }
    );
  }
}