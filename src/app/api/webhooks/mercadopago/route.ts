/**
 * ARCHIVO: src/app/api/webhooks/mercadopago/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "Receptor de Notificaciones" (Webhook) oficial de Mercado Pago.
 * Recibe señales asíncronas de servidor a servidor cuando ocurre un evento de pago.
 * Este webhook representa el PASO 4 (Final) del embudo médico.
 * Se encarga de enviar doble notificación (Brevo): Envía recibo al paciente y alerta
 * de confirmación inmediata al administrador.
 * * * RESPONSABILIDADES:
 * 1. Escucha Activa: Recibir el paquete de datos (JSON) que envía Mercado Pago.
 * 2. Validación Antifraude: Consultar directamente a la API de Mercado Pago usando 
 * el ID recibido para confirmar que el pago es real y está "approved" (aprobado).
 * 3. Actualización de Base de Datos: Cambiar el estado del turno a "confirmed".
 * 4. Disparo de Correos: Ejecutar llamadas a Brevo API para notificar a ambas partes.
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
  console.log("\n🔔 [WEBHOOK MP] 1. Señal recibida desde Mercado Pago");

  try {
    // 1. LECTURA DE LA SEÑAL (REQUEST BODY)
    // Mercado Pago envía un JSON detallando qué evento acaba de ocurrir.
    const bodyText = await request.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error("🔴 [WEBHOOK MP] Error parseando JSON:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 2. FILTRO DE EVENTOS (Ruteo de señal)
    // Mercado Pago manda muchos eventos. Solo nos interesan los eventos de tipo "payment".
    // Dependiendo de la versión de la API de MP, puede llegar como body.type o body.topic
    const isPaymentEvent = body.type === 'payment' || body.topic === 'payment';
    
    // Si no es un pago, devolvemos un 200 OK rápido para que MP no reintente enviarlo.
    if (!isPaymentEvent) {
      console.log(`🟡 [WEBHOOK MP] Evento tipo "${body.type || body.topic}" ignorado.`);
      return NextResponse.json({ success: true, message: "Evento ignorado" }, { status: 200 });
    }

    // Extraemos el ID numérico del pago. 
    // En Webhooks estándar viene en body.data.id
    const paymentId = body.data?.id || body.id;
    console.log(`🔔 [WEBHOOK MP] 2. Procesando ID de pago: ${paymentId}`);

    if (!paymentId) {
      return NextResponse.json({ error: "Falta el ID del pago" }, { status: 400 });
    }

    // 3. ENTORNO Y VARIABLES SEGURAS
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Record<string, unknown>;
    const mpAccessToken = (env.MP_ACCESS_TOKEN as string) || process.env.MP_ACCESS_TOKEN;
    const brevoApiKey = (env.BREVO_API_KEY as string) || process.env.BREVO_API_KEY;

    if (!mpAccessToken) {
      console.error("🔴 [WEBHOOK MP] FATAL: MP_ACCESS_TOKEN no encontrado.");
      return NextResponse.json({ error: "Error de configuración" }, { status: 500 });
    }

    // 4. VALIDACIÓN ANTIFRAUDE (Petición de retorno a Mercado Pago)
    console.log("🔔 [WEBHOOK MP] 3. Validando autenticidad con API de Mercado Pago...");
    const mpVerifyResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });

    if (!mpVerifyResponse.ok) {
      const errorText = await mpVerifyResponse.text();
      console.error("🔴 [WEBHOOK MP] Error validando con MP:", errorText);
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
      console.log(`🟡 [WEBHOOK MP] Pago ${paymentId} está en estado: ${paymentData.status}.`);
      return NextResponse.json({ success: true, status: paymentData.status }, { status: 200 });
    }

    // 6. IDENTIFICACIÓN DEL TURNO (El Puente)
    // Extraemos el UUID del turno que escondimos en "external_reference" durante la Fase 2.
    const appointmentId = paymentData.external_reference;
    console.log(`🔔 [WEBHOOK MP] 4. Vinculando pago con Turno ID: ${appointmentId}`);

    if (!appointmentId) {
      console.error("🔴 [WEBHOOK MP] Pago aprobado pero sin external_reference.");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 7. CONEXIÓN A BASE DE DATOS D1
    const dbEnv = ctx.env as unknown as Env;
    if (!dbEnv || !dbEnv.DB) throw new Error("Base de datos D1 no disponible.");
    const db = createDbConnection(dbEnv);

    // 8. ACTUALIZACIÓN DEL REGISTRO (Mastering)
    console.log("🔔 [WEBHOOK MP] 5. Actualizando estado a 'confirmed'...");
    await db.update(appointments)
      .set({ status: 'confirmed' })
      .where(eq(appointments.id, appointmentId));
    
    console.log(`✅ [WEBHOOK MP] Turno ${appointmentId} CONFIRMADO exitosamente.`);

    // ============================================================================
    // FASE 3: DOBLE NOTIFICACIÓN (BREVO)
    // ============================================================================
    try {
      if (brevoApiKey) {
        console.log("🔔 [WEBHOOK MP] 6. Buscando datos para correos...");
        const turnosData = await db.select({
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
        
        const turnoData = turnosData[0];

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

          // Generación de HTML para el paciente
          const emailHtmlPaciente = getBookingConfirmationEmail({
            fullName: turnoData.pacienteNombre,
            serviceId: turnoData.servicioNombre, // Ahora usamos el nombre bonito, no el ID técnico
            fechaFormateada: fechaFormateada,
            phone: turnoData.pacienteTelefono
          });

          // DISPARO 1: Al Paciente
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
              htmlContent: emailHtmlPaciente
            })
          });
          console.log(`📨 [WEBHOOK MP] Correo enviado a Paciente: ${turnoData.pacienteEmail}`);

          // DISPARO 2: Al Administrador (Alerta de Ingreso)
          // Usamos un HTML directo y simple exclusivo para ti
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-key': brevoApiKey
            },
            body: JSON.stringify({
              sender: { name: "Sistema Zoe Plasma", email: "no-reply@zoeplasmabeauty.com" },
              to: [{ email: "contacto@zoeplasmabeauty.com", name: "Admin Zoe Plasma" }],
              subject: `💰 PAGO RECIBIDO: Turno Confirmado (${turnoData.pacienteNombre})`,
              htmlContent: `
                <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
                  <div style="max-width: 500px; background-color: #ffffff; padding: 30px; border-radius: 8px; border-left: 4px solid #34d399;">
                    <h2 style="color: #065f46; margin-top: 0;">¡Nuevo Pago Acreditado!</h2>
                    <p style="color: #333; font-size: 16px;">El paciente <strong>${turnoData.pacienteNombre}</strong> ha abonado su seña a través de Mercado Pago.</p>
                    <ul style="color: #555; font-size: 14px; padding-left: 20px;">
                      <li><strong>Tratamiento:</strong> ${turnoData.servicioNombre}</li>
                      <li><strong>Fecha del turno:</strong> ${fechaFormateada}</li>
                      <li><strong>WhatsApp:</strong> ${turnoData.pacienteTelefono}</li>
                    </ul>
                    <p style="color: #666; font-size: 14px;">El estado del turno ha cambiado automáticamente a <strong>Confirmado</strong> en el panel de control.</p>
                  </div>
                </div>
              `
            })
          });
          console.log("📨 [WEBHOOK MP] Alerta de pago enviada al Administrador.");
        }
      }
    } catch (emailError) {
      console.error("🔴 [WEBHOOK MP] Error enviando correos:", emailError);
    }

    // 9. ACUSE DE RECIBO FINAL A MERCADO PAGO
    console.log("🔔 [WEBHOOK MP] 8. Proceso finalizado con éxito.");
    return NextResponse.json({ success: true, message: "Webhook procesado" }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 [WEBHOOK MP] Error crítico:", error.message);
    return NextResponse.json({ error: "Fallo interno" }, { status: 500 });
  }
}