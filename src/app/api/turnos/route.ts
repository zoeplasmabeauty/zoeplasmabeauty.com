/**
 * ARCHIVO: src/app/api/turnos/route.ts
 * * ARQUITECTURA: Controlador Backend (Edge API Route)
 *
 * * PROPÓSITO:
 * Recibir las peticiones POST desde el formulario del frontend (Fase 2), 
 * validar la información y orquestar la escritura segura en la base de datos D1.
 * * RESPONSABILIDADES:
 * 1. Deserialización: Extraer y tipar el cuerpo de la petición (JSON).
 * 2. Validación: Asegurar que campos críticos como DNI, Teléfono y Email estén presentes.
 * 3. Persistencia Dual: Registrar o actualizar al paciente (Upsert) y crear el registro del turno.
 * 4. Gestión de Errores: Capturar fallos de infraestructura para evitar caídas del Worker.
 * * SEGURIDAD:
 * Utiliza el Edge Runtime de Cloudflare para ejecución cercana al usuario y 
 * validación estricta de tipos para evitar inyecciones o datos corruptos.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../db'; 
import { patients, appointments } from '../../../db/schema';
import { getBookingConfirmationEmail } from '../../../lib/emailTemplates';

// DIRECTIVA CRÍTICA: Fuerza la compilación para el Edge Runtime de Cloudflare.
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
    const [newAppointment] = await db.insert(appointments).values({
      id: appointmentUUID,
      patientId: newPatient.id,
      serviceId,
      appointmentDate,
      status: "pending",
    }).returning({ id: appointments.id });

    // ============================================================================
    // NUEVA FASE: AUTOMATIZACIÓN DE CORREO TRANSACCIONAL (BREVO API)
    // ============================================================================
    // Aislamiento Acústico (Try/Catch interno): Si el envío del correo falla 
    // (ej. Brevo se cae), NO queremos que el paciente vea un error en rojo, 
    // porque su turno SÍ se guardó en nuestra base de datos con éxito.
    try {
      // 1. EXTRACCIÓN DE LA LLAVE (API KEY)
      // Buscamos la variable en Cloudflare o en local. Forzamos el tipo Record para
      // evitar que el Linter estricto de Next.js se queje por variables no declaradas.
      const cloudflareEnv = env as unknown as Record<string, unknown>;
      const brevoApiKey = (cloudflareEnv.BREVO_API_KEY as string) || process.env.BREVO_API_KEY;

      if (brevoApiKey) {
        // 2. MASTERIZACIÓN DE FECHA (Timezone local)
        // Convertimos el estándar ISO a texto legible, asegurando que respete
        // el huso horario oficial independientemente de dónde esté alojado el servidor.
        const fechaObjeto = new Date(appointmentDate);
        const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires'
        }).format(fechaObjeto);

        // 3. DISEÑO DEL CORREO (PLANTILLA HTML IMPORTADA)
        // llamamos a la librería → src/lib/emailTemplates.ts
        // Si queremos cambiar colores o textos en el futuro, solo modificamos el archivo emailTemplates.ts
        const emailHtml = getBookingConfirmationEmail({
          fullName,
          serviceId,
          fechaFormateada,
          phone
        });

        // 4. DISPARO DE LA SEÑAL (PETICIÓN POST A BREVO)
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: "Zoe Plasma Beauty", email: "contacto@zoeplasmabeauty.com" },
            to: [{ email: email, name: fullName }],
            subject: "Evaluación Recibida - Zoe Plasma Beauty",
            htmlContent: emailHtml
          })
        });
        
        console.log("📨 Correo enviado exitosamente vía Brevo a:", email);
      } else {
        console.warn("⚠️ Advertencia: BREVO_API_KEY no encontrada. Correo no enviado.");
      }
    } catch (emailError) {
      // Prevención de tipado estricto: Evitamos usar "any" verificando la instancia del error
      const msg = emailError instanceof Error ? emailError.message : 'Error desconocido';
      console.error("🔴 Fallo en servicio auxiliar (Brevo):", msg);
    }
    // ============================================================================

    // RESPUESTA EXITOSA FINAL AL FRONTEND:
    // Retornamos el appointmentId para que el frontend pueda mostrar la confirmación visual.
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Turno procesado correctamente",
        appointmentId: newAppointment.id 
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