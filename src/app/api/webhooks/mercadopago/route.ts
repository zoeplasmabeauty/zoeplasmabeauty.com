/**
 * ARCHIVO: src/app/api/webhooks/mercadopago/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "Receptor de Notificaciones" (Webhook) oficial de Mercado Pago.
 * Recibe señales asíncronas de servidor a servidor cuando ocurre un evento de pago.
 * * * RESPONSABILIDADES:
 * 1. Escucha Activa: Recibir el paquete de datos (JSON) que envía Mercado Pago.
 * 2. Validación Antifraude: Consultar directamente a la API de Mercado Pago usando 
 * el ID recibido para confirmar que el pago es real y está "approved" (aprobado).
 * 3. Actualización de Base de Datos: Cambiar el estado del turno a "confirmed".
 * 4. Disparo de Correos: Ejecutar la llamada a Brevo API para enviar el recibo al paciente.
 * * * SEGURIDAD CRÍTICA:
 * Nunca se confía ciegamente en el JSON que entra al Webhook. Siempre se toma el ID 
 * del pago y se hace una petición HTTP GET segura a Mercado Pago para verificar la verdad.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db';
import { appointments, patients, services } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getBookingConfirmationEmail } from '../../../../lib/emailTemplates';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // 1. LECTURA DE LA SEÑAL (REQUEST BODY)
    // Mercado Pago envía un JSON detallando qué evento acaba de ocurrir.
    const bodyText = await request.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error("🔴 Error parseando JSON del Webhook:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 2. FILTRO DE EVENTOS (Ruteo de señal)
    // Mercado Pago manda muchos eventos. Solo nos interesan los eventos de tipo "payment".
    // Dependiendo de la versión de la API de MP, puede llegar como body.type o body.topic
    const isPaymentEvent = body.type === 'payment' || body.topic === 'payment';
    
    // Si no es un pago, devolvemos un 200 OK rápido para que MP no reintente enviarlo.
    if (!isPaymentEvent) {
      return NextResponse.json({ success: true, message: "Evento ignorado (no es un pago)" }, { status: 200 });
    }

    // Extraemos el ID numérico del pago. 
    // En Webhooks estándar viene en body.data.id
    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      return NextResponse.json({ error: "Falta el ID del pago" }, { status: 400 });
    }

    // 3. ENTORNO Y VARIABLES SEGURAS
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Record<string, unknown>;
    const mpAccessToken = (env.MP_ACCESS_TOKEN as string) || process.env.MP_ACCESS_TOKEN;
    const brevoApiKey = (env.BREVO_API_KEY as string) || process.env.BREVO_API_KEY;

    if (!mpAccessToken) {
      console.error("🔴 Fatal: MP_ACCESS_TOKEN no configurado en el Webhook.");
      return NextResponse.json({ error: "Error de configuración de servidor" }, { status: 500 });
    }

    // 4. VALIDACIÓN ANTIFRAUDE (Petición de retorno a Mercado Pago)
    // Le preguntamos a Mercado Pago: "Alguien dice que el pago X se completó. ¿Es cierto?"
    const mpVerifyResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });

    if (!mpVerifyResponse.ok) {
      console.error("🔴 Error validando pago con MP:", await mpVerifyResponse.text());
      return NextResponse.json({ error: "No se pudo validar el pago" }, { status: 500 });
    }

    // Forzamos el tipado para indicarle a TypeScript qué esperamos leer
    const paymentData = (await mpVerifyResponse.json()) as {
      status: string;
      external_reference: string;
    };

    // 5. EVALUACIÓN DEL ESTADO DEL PAGO
    // Si el pago fue rechazado o está pendiente, simplemente devolvemos 200 OK 
    // para que MP sepa que recibimos el mensaje, pero no enviamos correos ni confirmamos turno.
    if (paymentData.status !== 'approved') {
      console.log(`🟡 Pago ${paymentId} en estado: ${paymentData.status}. Se ignora confirmación.`);
      return NextResponse.json({ success: true, status: paymentData.status }, { status: 200 });
    }

    // 6. IDENTIFICACIÓN DEL TURNO (El Puente)
    // Extraemos el UUID del turno que escondimos en "external_reference" durante la Fase 2.
    const appointmentId = paymentData.external_reference;

    if (!appointmentId) {
      console.error("🔴 Pago aprobado, pero no contiene external_reference para vincular al turno.");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 7. CONEXIÓN A BASE DE DATOS D1
    const dbEnv = ctx.env as unknown as Env;
    if (!dbEnv || !dbEnv.DB) throw new Error("Base de datos D1 no disponible.");
    const db = createDbConnection(dbEnv);

    // 8. ACTUALIZACIÓN DEL REGISTRO (Mastering)
    // Cambiamos el estado del turno de 'pending' a 'confirmed'
    await db.update(appointments)
      .set({ status: 'confirmed' })
      .where(eq(appointments.id, appointmentId));
    
    console.log(`✅ Turno ${appointmentId} confirmado exitosamente en base de datos.`);

    // ============================================================================
    // FASE 3: AUTOMATIZACIÓN DEL CORREO DE CONFIRMACIÓN (BREVO)
    // ============================================================================
    try {
      if (brevoApiKey) {
        // A. EXTRACCIÓN DE DATOS RELACIONALES (JOIN)
        // Necesitamos buscar los datos del paciente y del servicio para armar el correo
        const [turnoData] = await db.select({
          fechaISO: appointments.appointmentDate,
          pacienteNombre: patients.fullName,
          pacienteEmail: patients.email,
          pacienteTelefono: patients.phone,
          servicioNombre: services.name,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .where(eq(appointments.id, appointmentId));

        if (turnoData) {
          // B. MASTERIZACIÓN DE FECHA
          const fechaObjeto = new Date(turnoData.fechaISO);
          const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires'
          }).format(fechaObjeto);

          // C. GENERACIÓN DE LA PLANTILLA HTML
          const emailHtml = getBookingConfirmationEmail({
            fullName: turnoData.pacienteNombre,
            serviceId: turnoData.servicioNombre, // Ahora usamos el nombre bonito, no el ID técnico
            fechaFormateada: fechaFormateada,
            phone: turnoData.pacienteTelefono
          });

          // D. DISPARO DEL CORREO A TRAVÉS DE BREVO
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': brevoApiKey
            },
            body: JSON.stringify({
              sender: { name: "Zoe Plasma Beauty", email: "contacto@zoeplasmabeauty.com" },
              to: [{ email: turnoData.pacienteEmail, name: turnoData.pacienteNombre }],
              subject: "Confirmación de Turno - Zoe Plasma Beauty",
              htmlContent: emailHtml
            })
          });
          
          console.log(`📨 Correo de confirmación enviado a: ${turnoData.pacienteEmail}`);
        }
      }
    } catch (emailError) {
      console.error("🔴 Fallo no crítico enviando correo Brevo en Webhook:", emailError);
      // No lanzamos throw aquí para asegurar que MP reciba su código 200 OK.
    }

    // 9. ACUSE DE RECIBO FINAL A MERCADO PAGO
    // Si llegamos hasta aquí, todo fue perfecto. Le decimos a MP que no envíe más notificaciones.
    return NextResponse.json({ success: true, message: "Webhook procesado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error crítico en Webhook Mercado Pago:", error);
    return NextResponse.json({ error: "Fallo interno procesando webhook" }, { status: 500 });
  }
}