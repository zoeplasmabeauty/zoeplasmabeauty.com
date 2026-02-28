/**
 * ARCHIVO: src/app/api/turnos/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route)
 * * PROPÓSITO ESTRATÉGICO:
 * Recibir las peticiones POST desde el formulario del frontend (Fase 2), 
 * validar la información y orquestar la escritura segura en la base de datos D1.
 * * SEGURIDAD:
 * Utiliza el Edge Runtime de Cloudflare para ejecución cercana al usuario y 
 * validación estricta de tipos para evitar inyecciones o datos corruptos.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../db'; 
import { patients, appointments } from '../../../db/schema';

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
    
    const { fullName, phone, dni, serviceId, appointmentDate } = body;

    // GENERACIÓN MANUAL DE IDs (Evita crashes por funciones SQL inexistentes localmente)
    const patientUUID = crypto.randomUUID();
    const appointmentUUID = crypto.randomUUID();

    // VALIDACIÓN DE INTEGRIDAD
    if (!fullName || !phone || !dni || !serviceId || !appointmentDate) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para agendar el turno." }, 
        { status: 400 }
      );
    }

    // REGISTRO DE PACIENTE CON UPSERT SEGURO
    const [newPatient] = await db.insert(patients).values({
      id: patientUUID, 
      dni,
      fullName,
      phone,
    })
    .onConflictDoUpdate({
      target: patients.dni,
      set: { fullName, phone }
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

    // RESPUESTA EXITOSA:
    // Retornamos el appointmentId para que el frontend pueda mostrar una confirmación.
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Turno procesado correctamente",
        appointmentId: newAppointment.id 
      }), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // MANEJO DE CRISIS Y LOGS:
    // Capturamos cualquier fallo (Error de red, violación de restricción en DB, etc.)
    // para evitar que el proceso de Cloudflare colapse (Worker Restart).
    console.error("🔥 Error crítico en API Turnos:", error);
    
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } } // Error de servidor
    );
  }
}