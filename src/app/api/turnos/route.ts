/**
 * ARCHIVO: src/app/api/turnos/route.ts
 * * ARQUITECTURA: Controlador Backend (Edge API Route)
 *
 * * PROPÓSITO:
 * Recibir las peticiones POST desde el formulario del frontend, 
 * validar la información y orquestar la escritura segura en la base de datos D1.
 * Genera un ticket de cobro (Preference) en Mercado Pago.
 * * * RESPONSABILIDADES:
 * 1. Deserialización: Extraer y tipar el cuerpo de la petición (JSON).
 * 2. Validación: Asegurar que campos críticos como DNI, Teléfono y Email estén presentes.
 * 3. Persistencia Dual: Registrar o actualizar al paciente (Upsert) y crear el registro del turno.
 * 4. Pasarela de Pagos: Generar el enlace de pago dinámico de Mercado Pago.
 * 5. Gestión de Errores: Capturar fallos de infraestructura para evitar caídas del Worker.
 * * * SEGURIDAD:
 * Utiliza el Edge Runtime de Cloudflare para ejecución cercana al usuario y 
 * validación estricta de tipos para evitar inyecciones o datos corruptos.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../db'; 
// Importamos 'services' y 'eq' para buscar el nombre real del tratamiento para el recibo de pago
import { patients, appointments, services } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getBookingConfirmationEmail } from '../../../lib/emailTemplates';

// Fuerza la compilación para el Edge Runtime de Cloudflare.
// Esto permite que el código corra en los nodos globales de Cloudflare, no en un servidor central.
export const runtime = 'edge';

// INTERFAZ DE CONTRATO DE DATOS:
// Define la estructura exacta que el frontend DEBE enviar. 
// Previene errores de "Property does not exist on type unknown".
interface BookingRequestBody {
  fullName: string;
  phone: string;
  dni: string;
  email: string; // INYECCIÓN: Nuevo campo obligatorio en el contrato de datos.
  serviceId: string;
  appointmentDate: string;
}

export async function POST(request: Request) {
  try {
    // 1. INTERCEPCIÓN DEL ENTORNO DE CLOUDFLARE
    // Obtenemos el contexto de ejecución que contiene los "bindings" (conexiones) a D1.
    const ctx = getRequestContext();

    // RESOLUCIÓN DE TIPOS (TypeScript FIX):
    // Extraemos 'env' y lo forzamos a nuestro tipo 'Env' inmediatamente.
    // Esto soluciona el error "Property DB does not exist on type CloudflareEnv".
    const env = ctx.env as unknown as Env;
    
    // VERIFICACIÓN DE SEGURIDAD DE INFRAESTRUCTURA: 
    // Si env o env.DB no están presentes, la comunicación con Cloudflare D1 está rota.
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ error: "Servicio de base de datos no disponible." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // INICIALIZACIÓN DE CONEXIÓN:
    // Creamos la instancia de Drizzle pasando el motor D1 verificado.
    const db = createDbConnection(env);

    // -----------------------------------------------------------------------------
    // FIX DE INFRAESTRUCTURA (EL TRUCO DEL CLON):
    // Clonamos la petición antes de consumirla. Esto evita el bug crítico de Wrangler:
    // "Can't read from request stream after response has been sent."
    // -----------------------------------------------------------------------------
    const clonedRequest = request.clone();
    const body = (await clonedRequest.json()) as BookingRequestBody;
    
    // EXTRACCIÓN: Incluimos 'email' en la desestructuración del cuerpo.
    const { fullName, phone, dni, email, serviceId, appointmentDate } = body;

    // GENERACIÓN MANUAL DE IDs (Evita crashes por funciones SQL inexistentes localmente)
    const patientUUID = crypto.randomUUID();
    const appointmentUUID = crypto.randomUUID();

    // VALIDACIÓN DE INTEGRIDAD: Se añade 'email' a la comprobación de campos obligatorios.
    if (!fullName || !phone || !dni || !email || !serviceId || !appointmentDate) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para agendar el turno." }, 
        { status: 400 }
      );
    }

    // REGISTRO DE PACIENTE CON UPSERT SEGURO:
    // El 'email' se guarda en la tabla 'patients'. Si el DNI ya existe, se actualizan 
    // el nombre, el teléfono y el correo electrónico.
    const [newPatient] = await db.insert(patients).values({
      id: patientUUID, 
      dni,
      fullName,
      phone,
      email, // MAPEO: El dato llega a la columna correspondiente.
    })
    .onConflictDoUpdate({
      target: patients.dni,
      set: { fullName, phone, email } // ACTUALIZACIÓN: Mantenemos los datos frescos.
    })
    .returning({ id: patients.id });

    // CREACIÓN DEL TURNO
    // El turno nace como 'pending'. Solo cambiará a 'confirmed' cuando Mercado Pago avise que se pagó.
    const [newAppointment] = await db.insert(appointments).values({
      id: appointmentUUID,
      patientId: newPatient.id,
      serviceId,
      appointmentDate,
      status: "pending", 
    }).returning({ id: appointments.id });

    // ============================================================================
    // MÁQUINA DE PAGOS (MERCADO PAGO API)
    // ============================================================================
    let checkoutUrl = "";

    try {
      const cloudflareEnv = env as unknown as Record<string, unknown>;
      const mpAccessToken = (cloudflareEnv.MP_ACCESS_TOKEN as string) || process.env.MP_ACCESS_TOKEN;

      if (!mpAccessToken) {
        throw new Error("Token de Mercado Pago no configurado.");
      }

      // Buscamos el nombre real del servicio para que el recibo de Mercado Pago luzca profesional
      const [servicioDB] = await db.select().from(services).where(eq(services.id, serviceId));
      const nombreServicio = servicioDB ? servicioDB.name : "Tratamiento Estético";

      // DEFINICIÓN ESTRICTA DE ENTORNO:
      // Evitamos leer los headers locales de Cloudflare que causan strings rotos.
      // Si estamos en producción usamos el dominio real, de lo contrario forzamos localhost estricto.
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://zoeplasmabeauty.com' 
        : 'http://localhost:3000';

      // Petición directa y segura a la API de Preferencias de Mercado Pago
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              title: `Reserva: ${nombreServicio}`,
              description: `Turno de evaluación estética para ${fullName}`,
              quantity: 1,
              currency_id: "ARS",
              unit_price: 50000 // SEÑA FIJA DE RESERVA. 
            }
          ],
          payer: {
            name: fullName,
            email: email,
          },
          back_urls: {
            success: `${baseUrl}/success`, // URL a la que vuelve si paga
            failure: `${baseUrl}/`, // Si falla, vuelve al inicio
            pending: `${baseUrl}/`
          },
          auto_return: "approved",
          // EL PUENTE CRÍTICO: Adjuntamos el ID del turno para que Mercado Pago nos lo devuelva en el Webhook
          external_reference: newAppointment.id 
        })
      });

      const mpData = (await mpResponse.json()) as { init_point?: string };

      if (!mpResponse.ok) {
        console.error("Error de Mercado Pago:", mpData);
        throw new Error("No se pudo generar el link de pago.");
      }

      // init_point es el enlace de cobro de Mercado Pago
      if (!mpData.init_point) {
        throw new Error("Mercado Pago no devolvió un enlace de cobro válido.");
      }
      checkoutUrl = mpData.init_point;

    } catch (mpError) {
      const msg = mpError instanceof Error ? mpError.message : 'Error desconocido de MP';
      console.error("🔴 Fallo al generar pago:", msg);
      // Opcional: Podrías decidir fallar todo el proceso si MP falla, pero por ahora
      // solo lo capturamos.
      return NextResponse.json({ error: "No se pudo generar el enlace de pago. Intenta de nuevo." }, { status: 500 });
    }

    // ============================================================================
    // FASE MUDADA: AUTOMATIZACIÓN DE CORREO TRANSACCIONAL (BREVO API)
    // ============================================================================
    /*
     * EL CÓDIGO DE BREVO HA SIDO COMENTADO Y DESACTIVADO TEMPORALMENTE AQUÍ.
     * Motivo Arquitectónico: No queremos enviar el correo confirmando el turno
     * ANTES de que el paciente pague. Este código exacto se moverá a la nueva ruta
     * /api/webhooks/mercadopago en la Fase 3.
     */
    /*
    try {
      const cloudflareEnv = env as unknown as Record<string, unknown>;
      const brevoApiKey = (cloudflareEnv.BREVO_API_KEY as string) || process.env.BREVO_API_KEY;

      if (brevoApiKey) { ... código de formateo y fetch a brevo ... }
    } catch (emailError) { ... }
    */
    // ============================================================================

    // RESPUESTA EXITOSA FINAL AL FRONTEND:
    // Ahora retornamos la URL de Checkout (checkoutUrl) en lugar de un simple success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Turno pre-registrado. Redirigiendo a pago...",
        appointmentId: newAppointment.id,
        checkoutUrl: checkoutUrl // INYECCIÓN: El frontend usará esto para redirigir
      }), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // MANEJO DE CRISIS Y LOGS DE LA BASE DE DATOS:
    const msg = error instanceof Error ? error.message : 'Error interno desconocido';
    console.error("🔥 Error crítico en API Turnos:", msg);
    
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } } // Error de servidor
    );
  }
}