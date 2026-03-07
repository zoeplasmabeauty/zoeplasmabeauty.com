/**
 * ARCHIVO: src/app/api/admin/turnos/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el proveedor exclusivo de datos para el Dashboard de Administrador.
 * Realiza consultas complejas (JOINs) a la base de datos D1 para combinar 
 * los registros de turnos con los datos personales de los pacientes.
 * Validación estricta de cookies y cruce con la tabla 'services'.
 * * RESPONSABILIDADES:
 * 1. Seguridad: Confía en el Middleware para el bloqueo de acceso, pero ejecuta 
 * validación de sesión nativa en el entorno seguro del Edge (Doble Blindaje).
 * 2. Extracción Relacional: Une la tabla 'appointments' con 'patients' y 'services'.
 * 3. Ordenamiento: Devuelve los turnos ordenados por fecha.
 * 4. Serialización: Retorna un JSON perfectamente estructurado para la tabla visual.
 */

// Importamos cookies para la validación de seguridad nativa
import { cookies } from 'next/headers'; 
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
// Añadimos 'services' a la importación del esquema
import { appointments, patients, services } from '../../../../db/schema'; 
import { eq, desc } from 'drizzle-orm';

// DIRECTIVA CRÍTICA: Ejecución en la red de borde (Edge) para latencia cero.
export const runtime = 'edge';

export async function GET() {
  try {
    // ========================================================================
    // 0. AUDITORÍA DE SEGURIDAD (Doble Blindaje)
    // Extraemos las cookies de la petición directamente desde los headers.
    // Esto evita que herramientas externas (como Postman) extraigan datos de pacientes.
    // ========================================================================
    const cookieStore = await cookies();
    const session = cookieStore.get('zoe_admin_session');

    if (!session || session.value !== 'authenticated') {
      return new Response(
        JSON.stringify({ error: "Acceso denegado. No tienes autorización." }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. CONEXIÓN AL ENTORNO
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;

    // Guardia de infraestructura: Verificamos que la BD esté inyectada
    if (!env || !env.DB) {
      throw new Error("Base de datos D1 no disponible en el entorno Edge.");
    }

    const db = createDbConnection(env);

    // 2. EXTRACCIÓN Y CRUCE DE DATOS (JOIN SQL)
    // Usamos Drizzle ORM para pedir piezas específicas de tres tablas distintas al mismo tiempo.
    const turnosData = await db.select({
      // Datos del turno
      id: appointments.id,
      appointment_date: appointments.appointmentDate,
      status: appointments.status,
      // En lugar del ID, extraemos el nombre real del servicio
      service_name: services.name, 
      // Datos del paciente vinculado
      patient_name: patients.fullName,
      patient_phone: patients.phone,
      patient_email: patients.email,
      patient_dni: patients.dni,
    })
    .from(appointments)
    // INNER JOIN: Solo trae los turnos que tengan un paciente válido asociado
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    // INNER JOIN: Conectamos el turno con el catálogo de servicios
    .innerJoin(services, eq(appointments.serviceId, services.id))
    // ORDER BY: Ordenamos para que los turnos más recientes/futuros aparezcan arriba
    .orderBy(desc(appointments.appointmentDate));

    // 3. RESPUESTA EXITOSA
    // Enviamos el paquete de datos al Dashboard en formato JSON
    return new Response(
      JSON.stringify(turnosData), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    // 4. MANEJO DE CRISIS
    console.error("🔴 Error en la API de Admin/Turnos:", error);
    return new Response(
      JSON.stringify({ error: "Fallo interno al extraer los registros." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}