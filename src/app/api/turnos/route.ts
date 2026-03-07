/**
 * ARCHIVO: src/app/api/turnos/route.ts
 * * ARQUITECTURA: Controlador Backend (Edge API Route)
 *
 * * PROPÓSITO:
 * Recibir las peticiones POST desde el formulario del frontend, 
 * validar la información y orquestar la escritura segura en la base de datos D1.
 * Actúa como el PASO 1 del embudo médico. Registra el turno en estado 'awaiting_triage'
 *  y detiene la generación de cobro hasta la aprobación del admin.
 * * * RESPONSABILIDADES:
 * 1. Deserialización: Extraer y tipar el cuerpo de la petición (JSON).
 * 2. Validación: Asegurar que campos críticos como DNI, Teléfono y Email estén presentes.
 * 3. Persistencia Dual: Registrar o actualizar al paciente (Upsert) y crear el registro del turno.
 * 4. Gestión de Errores: Capturar fallos de infraestructura para evitar caídas del Worker.
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
    // El turno nace como 'awaiting_triage' porque falta la ficha médica.
    const [newAppointment] = await db.insert(appointments).values({
      id: appointmentUUID,
      patientId: newPatient.id,
      serviceId,
      appointmentDate,
      status: "awaiting_triage", // FIX: Nuevo estado inicial de la Máquina de Estados
    }).returning({ id: appointments.id });

    
    // RESPUESTA EXITOSA FINAL AL FRONTEND:
    // No retornamos checkoutUrl. El frontend usará el appointmentId para llevar 
    // al usuario al formulario de Ficha Clínica.
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Paso 1 completado. Redirigiendo a la Ficha Clínica...",
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