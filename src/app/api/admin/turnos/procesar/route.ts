/**
 * ARCHIVO: src/app/api/admin/turnos/procesar/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Ejecutar la decisión médica del Administrador (Aprobar o Rechazar).
 * Orquesta la comunicación con servicios de terceros (Mercado Pago y Brevo) 
 * y actualiza el estado inmutable del turno en la base de datos D1.
 * * RESPONSABILIDADES:
 * 1. Seguridad: Verificar la cookie 'zoe_admin_session'.
 * 2. Extracción de Contexto: Buscar datos del paciente y servicio para el recibo/email.
 * 3. Flujo de Aprobación:
 * - Conectar con Mercado Pago API para generar el link de cobro.
 * - Conectar con Brevo API para enviar el correo de aprobación con el link.
 * - Actualizar estado a 'approved_unpaid'.
 * 4. Flujo de Rechazo:
 * - Conectar con Brevo API para enviar correo de denegación médica.
 * - Actualizar estado a 'rejected' (liberando automáticamente el calendario).
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../../db';
import { appointments, patients, services } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

interface ProcesarPayload {
  appointmentId: string;
  action: 'approve' | 'reject';
}

export async function POST(request: Request) {
  console.log("\n==================================================");
  console.log("⚙️ [API PROCESAR] 1. Iniciando motor de decisión médica");

  try {
    // 1. AUDITORÍA DE SEGURIDAD (Blindaje)
    const cookieStore = await cookies();
    const session = cookieStore.get('zoe_admin_session');

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: "Acceso denegado. Exclusivo para administradores." }, { status: 401 });
    }

    // 2. LECTURA DEL PAYLOAD
    const clonedRequest = request.clone();
    const { appointmentId, action } = (await clonedRequest.json()) as ProcesarPayload;

    if (!appointmentId || !action) {
      return NextResponse.json({ error: "Faltan parámetros críticos (ID o Acción)." }, { status: 400 });
    }

    // 3. CONEXIÓN AL ENTORNO
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Variables de entorno para APIs externas
    const cloudflareEnv = env as unknown as Record<string, string>;
    const mpAccessToken = cloudflareEnv.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
    const brevoApiKey = cloudflareEnv.BREVO_API_KEY || process.env.BREVO_API_KEY;

    // 4. EXTRACCIÓN DEL CONTEXTO DEL TURNO
    // Necesitamos los datos del paciente (email, nombre) y del servicio (nombre)
    const turnosEncontrados = await db.select({
      id: appointments.id,
      status: appointments.status,
      patientName: patients.fullName,
      patientEmail: patients.email,
      serviceName: services.name,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, appointmentId));

    const turnoData = turnosEncontrados[0];

    if (!turnoData) {
      return NextResponse.json({ error: "No se encontró el turno a procesar." }, { status: 404 });
    }

    if (turnoData.status !== 'under_review') {
      return NextResponse.json({ error: "Este turno ya fue procesado anteriormente." }, { status: 400 });
    }

    // ============================================================================
    // FLUJO A: APROBACIÓN DEL TRATAMIENTO
    // ============================================================================
    if (action === 'approve') {
      console.log(`✅ [API PROCESAR] Acción: APROBAR paciente ${turnoData.patientName}`);
      
      if (!mpAccessToken) throw new Error("Token de Mercado Pago no configurado.");

      // A.1 MOTOR FINANCIERO (Mercado Pago)
      const COSTO_RESERVA_BASE = 50000;
      const PORCENTAJE_IMPUESTOS_MP = 0.0825; 
      const CARGOS_SERVICIO = COSTO_RESERVA_BASE * PORCENTAJE_IMPUESTOS_MP;
      const TOTAL_A_PAGAR = COSTO_RESERVA_BASE + CARGOS_SERVICIO;

      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://zoeplasmabeauty.com' : 'http://localhost:3000';

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            title: `Seña: ${turnoData.serviceName} (Incluye cargos por servicio)`,
            description: `Reserva de tratamiento estético para ${turnoData.patientName}`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: TOTAL_A_PAGAR 
          }],
          payer: {
            name: turnoData.patientName,
            email: turnoData.patientEmail,
          },
          back_urls: {
            success: `${baseUrl}/success`, 
            failure: `${baseUrl}/`, 
            pending: `${baseUrl}/`
          },
          auto_return: "approved",
          external_reference: turnoData.id // Puente crítico para el Webhook futuro
        })
      });

      const mpData = await mpResponse.json() as { init_point?: string };

      if (!mpResponse.ok || !mpData.init_point) {
        throw new Error("Mercado Pago rechazó la creación del link de cobro.");
      }

      const checkoutUrl = mpData.init_point;
      console.log("✅ [API PROCESAR] Link de Mercado Pago generado con éxito.");

      // A.2 NOTIFICACIÓN AL PACIENTE (Brevo)
      if (brevoApiKey) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: "Zoe Plasma Beauty", email: "contacto@zoeplasmabeauty.com" },
            to: [{ email: turnoData.patientEmail, name: turnoData.patientName }],
            subject: "¡Tu tratamiento ha sido aprobado! - Zoe Plasma Beauty",
            htmlContent: `
              <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
                <h2 style="color: #425482;">Hola ${turnoData.patientName},</h2>
                <p>Nuestro equipo médico ha revisado tu Ficha Clínica y nos alegra confirmarte que <strong>eres apto/a para el tratamiento de ${turnoData.serviceName}</strong>.</p>
                <p>Para confirmar tu turno de manera oficial y bloquear tu espacio en la agenda, por favor abona la seña de <strong>$${TOTAL_A_PAGAR.toLocaleString('es-AR')} ARS</strong> a través de Mercado Pago.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${checkoutUrl}" style="background-color: #568dcd; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Pagar Seña y Confirmar Turno</a>
                </div>
                <p style="font-size: 12px; color: #666;">Nota: Si no realizas el pago en las próximas horas, el sistema podría liberar tu espacio automáticamente.</p>
                <p>¡Te esperamos!</p>
              </div>
            `
          })
        });
        console.log("✅ [API PROCESAR] Correo de aprobación enviado.");
      }

      // A.3 PERSISTENCIA (Actualizar BD a 'approved_unpaid')
      await db.update(appointments)
        .set({ status: 'approved_unpaid' })
        .where(eq(appointments.id, appointmentId));

      console.log("✅ [API PROCESAR] Proceso de aprobación completado.");
      console.log("==================================================\n");
      
      return NextResponse.json({ success: true, message: "Aprobado. Correo y link enviados." }, { status: 200 });
    } 
    
    // ============================================================================
    // FLUJO B: RECHAZO DEL TRATAMIENTO (Protección Médica)
    // ============================================================================
    else if (action === 'reject') {
      console.log(`🛑 [API PROCESAR] Acción: RECHAZAR paciente ${turnoData.patientName}`);

      // B.1 NOTIFICACIÓN DE RECHAZO (Brevo)
      if (brevoApiKey) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: "Zoe Plasma Beauty", email: "contacto@zoeplasmabeauty.com" },
            to: [{ email: turnoData.patientEmail, name: turnoData.patientName }],
            subject: "Aviso importante sobre tu turno - Zoe Plasma Beauty",
            htmlContent: `
              <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
                <h2 style="color: #425482;">Hola ${turnoData.patientName},</h2>
                <p>Nuestro equipo ha evaluado cuidadosamente tu Ficha Clínica.</p>
                <p>Priorizando siempre tu salud y seguridad, hemos determinado que en este momento <strong>no es seguro proceder con el tratamiento de ${turnoData.serviceName}</strong> debido a las condiciones de salud o contraindicaciones indicadas en tu formulario.</p>
                <p>Tu turno ha sido cancelado y no se ha realizado ningún cargo.</p>
                <p>Si consideras que hubo un error o deseas consultar cuándo podrías ser apto/a, por favor responde a este correo o escríbenos a nuestro WhatsApp oficial.</p>
                <p>Agradecemos tu comprensión.</p>
                <p><strong>El equipo de Zoe Plasma Beauty</strong></p>
              </div>
            `
          })
        });
        console.log("🛑 [API PROCESAR] Correo de rechazo enviado.");
      }

      // B.2 PERSISTENCIA (Actualizar BD a 'rejected')
      // Esto libera inmediatamente ese bloque horario en el calendario de la web principal.
      await db.update(appointments)
        .set({ status: 'rejected' })
        .where(eq(appointments.id, appointmentId));

      console.log("🛑 [API PROCESAR] Proceso de rechazo completado.");
      console.log("==================================================\n");

      return NextResponse.json({ success: true, message: "Turno rechazado y paciente notificado." }, { status: 200 });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 Error crítico procesando decisión médica:", error.message);
    return NextResponse.json(
      { error: "Fallo en la conexión con servicios de pago o correo." }, 
      { status: 500 }
    );
  }
}