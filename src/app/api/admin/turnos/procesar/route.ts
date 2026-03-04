/**
 * ARCHIVO: src/app/api/admin/turnos/procesar/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Ejecutar la decisión médica del Administrador (Aprobar o Rechazar).
 * Orquesta la comunicación con servicios de terceros (Mercado Pago y Brevo) 
 * y actualiza el estado inmutable del turno en la base de datos D1.
 * Se delega la construcción del HTML de los correos a la librería 'emailTemplates' 
 * para mantener el controlador limpio y focalizado en la lógica transaccional.
 * Se implementó el motor de cálculo de desgloses para enviar al paciente el detalle
 * exacto de Seña, Cargos por Servicio y Saldo Restante a pagar en la clínica y que se envia al mail
 * * RESPONSABILIDADES:
 * 1. Seguridad: Verificar la cookie 'zoe_admin_session'.
 * 2. Extracción de Contexto: Buscar datos del paciente y servicio (incluyendo PRECIO).
 * 3. Flujo de Aprobación:
 * - Calcular matemática financiera (Seña + Impuestos + Saldo).
 * - Conectar con Mercado Pago API para generar el link de cobro.
 * - Conectar con Brevo API para enviar el correo de aprobación con el link y desglose.
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

// Importamos las funciones constructoras de correos
import { getApprovalEmail, getRejectionEmail } from '../../../../../lib/emailTemplates';

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
    // Agregamos la extracción de 'services.price'
    const turnosEncontrados = await db.select({
      id: appointments.id,
      status: appointments.status,
      patientName: patients.fullName,
      patientEmail: patients.email,
      serviceName: services.name,
      servicePrice: services.price // Extraemos el valor real del tratamiento
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

      // ========================================================================
      // A.1 MOTOR FINANCIERO (Matemática Estricta)
      // ========================================================================
      const PRECIO_TRATAMIENTO = turnoData.servicePrice; // Viene de la base de datos
      const COSTO_RESERVA_BASE = 50000; // Seña fija
      const PORCENTAJE_IMPUESTOS_MP = 0.0825; // 8.25%
      
      // Cálculos
      const CARGOS_SERVICIO = COSTO_RESERVA_BASE * PORCENTAJE_IMPUESTOS_MP;
      const TOTAL_A_PAGAR_MP = COSTO_RESERVA_BASE + CARGOS_SERVICIO;
      const SALDO_RESTANTE = PRECIO_TRATAMIENTO - COSTO_RESERVA_BASE; // El cargo de servicio no se descuenta
      // ========================================================================

      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://zoeplasmabeauty.com' : 'http://localhost:3000';

      // A.2 CREACIÓN DEL LINK DE PAGO (Mercado Pago)
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
            unit_price: TOTAL_A_PAGAR_MP 
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

      // A.3 NOTIFICACIÓN AL PACIENTE (Brevo)
      if (brevoApiKey) {
        // Inyectamos todas las variables financieras al HTML
        const emailHtml = getApprovalEmail({
          patientName: turnoData.patientName,
          serviceName: turnoData.serviceName,
          precioTratamiento: PRECIO_TRATAMIENTO.toLocaleString('es-AR'),
          valorSena: COSTO_RESERVA_BASE.toLocaleString('es-AR'),
          cobroServicio: CARGOS_SERVICIO.toLocaleString('es-AR'),
          totalAPagarMP: TOTAL_A_PAGAR_MP.toLocaleString('es-AR'),
          saldoRestante: SALDO_RESTANTE.toLocaleString('es-AR'),
          checkoutUrl: checkoutUrl
        });

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
            htmlContent: emailHtml // Inyectamos el HTML limpio
          })
        });
        console.log("✅ [API PROCESAR] Correo de aprobación enviado.");
      }

      // A.4 PERSISTENCIA (Actualizar BD a 'approved_unpaid')
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
        // Usamos la plantilla centralizada
        const emailHtml = getRejectionEmail({
          patientName: turnoData.patientName,
          serviceName: turnoData.serviceName
        });

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
            htmlContent: emailHtml // Inyectamos el HTML limpio
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