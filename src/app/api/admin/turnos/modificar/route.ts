/**
 * ARCHIVO: src/app/api/admin/turnos/modificar/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Gestionar las acciones de modificación manual de turnos por parte del Administrador.
 * Permite cancelar turnos (liberando agenda) o reprogramarlos ajustando fecha/hora y duración.
 * Se inyectó el motor de notificaciones por correo electrónico (Brevo API).
 * Al cancelar o reprogramar, el sistema extrae la información del paciente
 * y dispara las plantillas de correo correspondientes de forma automática.
 * * RESPONSABILIDADES:
 * 1. Autenticación: Validar la sesión del administrador para evitar accesos no autorizados.
 * 2. Ruteo de Acción: Determinar si el payload exige una cancelación o una reprogramación.
 * 3. Validación de Colisiones: Evitar el solapamiento de turnos durante reprogramaciones.
 * 4. Actualización de Base de Datos: Modificar los registros en D1 asegurando la integridad.
 * 5. Notificaciones: Comunicar al paciente los cambios realizados.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../../db';
// Importamos las tablas patients y services para hacer los cruces (JOIN)
import { appointments, patients, services } from '../../../../../db/schema';
// Importamos operadores adicionales para el radar de colisiones
import { eq, and, gte, lt, inArray, ne } from 'drizzle-orm';
// Importamos date-fns para la matemática de tiempo absoluta
import { addMinutes, parseISO, isBefore, isAfter, format } from 'date-fns';

// Importamos las funciones constructoras de los correos de modificación
import { getCancellationEmail, getReprogrammingEmail } from '../../../../../lib/emailTemplates';

export const runtime = 'edge';

// Contrato estricto para asegurar la estructura de los datos entrantes
// cancelReason como string opcional para capturar el motivo del administrador
interface ModificarPayload {
  appointmentId: string;
  action: 'cancel' | 'reprogram';
  newDateISO?: string;
  customDuration?: number | null;
  cancelReason?: string; 
}

export async function POST(request: Request) {
  console.log("\n==================================================");
  console.log("⚙️ [API MODIFICAR TURNO] 1. Iniciando petición de administrador");

  try {
    // 1. AUDITORÍA DE SEGURIDAD (Blindaje)
    const cookieStore = await cookies();
    const session = cookieStore.get('zoe_admin_session');

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: "Acceso denegado. Exclusivo para administradores." }, { status: 401 });
    }

    // 2. LECTURA DEL PAYLOAD
    const clonedRequest = request.clone();
    const body = (await clonedRequest.json()) as ModificarPayload;
    // Extraemos la nueva variable 'cancelReason' del cuerpo de la petición
    const { appointmentId, action, newDateISO, customDuration, cancelReason } = body;

    if (!appointmentId || !action) {
      return NextResponse.json({ error: "Faltan parámetros críticos (ID o Acción)." }, { status: 400 });
    }

    // 3. CONEXIÓN AL ENTORNO Y BASE DE DATOS D1
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Extraemos la variable de entorno de Brevo para poder enviar correos
    const cloudflareEnv = env as unknown as Record<string, string>;
    const brevoApiKey = cloudflareEnv.BREVO_API_KEY || process.env.BREVO_API_KEY;

    // ============================================================================
    // 4. EXTRACCIÓN DE DATOS DE CONTEXTO (JOIN)
    // Antes de modificar nada, necesitamos saber a quién le estamos alterando el turno
    // para poder enviarle el correo correctamente.
    // ============================================================================
    console.log("⚙️ [API MODIFICAR TURNO] Extrayendo datos del paciente...");
    const turnosEncontrados = await db.select({
      patientName: patients.fullName,
      patientEmail: patients.email,
      serviceName: services.name,
      serviceDuration: services.durationMinutes // Necesitamos saber cuánto dura para el radar
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, appointmentId));

    const turnoData = turnosEncontrados[0];

    if (!turnoData) {
      return NextResponse.json({ error: "No se encontró el turno a modificar en la base de datos." }, { status: 404 });
    }

    // ============================================================================
    // FLUJO A: CANCELAR TURNO
    // ============================================================================
    if (action === 'cancel') {
      console.log(`🛑 [API MODIFICAR] Cancelando turno ID: ${appointmentId}`);
      
      // A.1 Cambiamos el estado a 'cancelled', liberando el espacio en el calendario público
      await db.update(appointments)
        .set({ status: 'cancelled' })
        .where(eq(appointments.id, appointmentId));
        
      console.log("✅ [API MODIFICAR] Turno cancelado en base de datos.");

      // A.2 NOTIFICACIÓN DE CANCELACIÓN (Brevo)
      // Si tenemos la llave de Brevo y el administrador envió un motivo, disparamos el correo
      if (brevoApiKey && cancelReason) {
        const emailHtml = getCancellationEmail({
          patientName: turnoData.patientName,
          serviceName: turnoData.serviceName,
          cancellationReason: cancelReason
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
            subject: "Aviso importante sobre tu reserva - Zoe Plasma Beauty",
            htmlContent: emailHtml 
          })
        });
        console.log("✅ [API MODIFICAR] Correo de cancelación enviado al paciente.");
      }

      console.log("==================================================\n");
      return NextResponse.json({ success: true, message: "Turno cancelado y notificado." }, { status: 200 });
    }

    // ============================================================================
    // FLUJO B: REPROGRAMAR TURNO (CON RADAR DE COLISIONES)
    // ============================================================================
    if (action === 'reprogram') {
      console.log(`🔄 [API MODIFICAR] Reprogramando turno ID: ${appointmentId}`);
      
      if (!newDateISO) {
        return NextResponse.json({ error: "Falta la nueva fecha y hora para reprogramar." }, { status: 400 });
      }

      // --------------------------------------------------------------------------
      // RADAR DE COLISIONES: Prevenir solapamiento de agenda por el administrador
      // --------------------------------------------------------------------------
      const proposedStartDate = parseISO(newDateISO);
      const proposedDuration = customDuration || turnoData.serviceDuration;
      const proposedEndDate = addMinutes(proposedStartDate, proposedDuration);

      // Extraemos la fecha base (YYYY-MM-DD) para buscar turnos en ese mismo día
      const dateParam = format(proposedStartDate, 'yyyy-MM-dd');
      
      // Límites del día propuesto usando Matemática Absoluta (-03:00)
      const startOfDayUTC = new Date(`${dateParam}T00:00:00.000-03:00`);
      const endOfDayUTC = new Date(`${dateParam}T23:59:59.999-03:00`);

      // Buscamos todos los turnos activos en ese día (EXCEPTO el turno actual que estamos moviendo)
      const turnosExistentes = await db.select({
        id: appointments.id,
        fechaInicio: appointments.appointmentDate,
        duracion: services.durationMinutes,
        duracionPersonalizada: appointments.customDurationMinutes 
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          gte(appointments.appointmentDate, startOfDayUTC.toISOString()),
          lt(appointments.appointmentDate, endOfDayUTC.toISOString()),
          ne(appointments.id, appointmentId), // No compararse contra sí mismo
          inArray(appointments.status, [
            'awaiting_triage', 
            'under_review', 
            'approved_unpaid', 
            'confirmed', 
            'completed'
          ])
        )
      );

      // Verificamos si hay solapamiento (Phase Cancellation)
      let hayColision = false;
      for (const turno of turnosExistentes) {
        const turnoInicio = parseISO(turno.fechaInicio);
        const turnoFin = addMinutes(turnoInicio, turno.duracionPersonalizada || turno.duracion);

        // La regla de oro del solapamiento
        if (isBefore(proposedStartDate, turnoFin) && isAfter(proposedEndDate, turnoInicio)) {
          hayColision = true;
          break;
        }
      }

      if (hayColision) {
        console.log("🛑 [API MODIFICAR] Bloqueo de colisión activado. Turno no reprogramado.");
        return NextResponse.json({ error: "El horario seleccionado ya está ocupado por otro paciente. Por favor, elige un horario diferente." }, { status: 409 });
      }
      // --------------------------------------------------------------------------

      // B.1 Actualizamos la fecha y, si se proporcionó, la duración personalizada
      // Si customDuration es null, la base de datos usará la duración estándar del servicio
      await db.update(appointments)
        .set({ 
          appointmentDate: newDateISO,
          customDurationMinutes: customDuration || null 
        })
        .where(eq(appointments.id, appointmentId));
        
      console.log("✅ [API MODIFICAR] Turno reprogramado en base de datos.");

      // B.2 NOTIFICACIÓN DE REPROGRAMACIÓN (Brevo)
      if (brevoApiKey) {
        // Formateamos la nueva fecha (newDateISO) al formato amigable estilo Buenos Aires
        const fechaObjeto = new Date(newDateISO);
        const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Argentina/Buenos_Aires'
        }).format(fechaObjeto);

        const emailHtml = getReprogrammingEmail({
          patientName: turnoData.patientName,
          serviceName: turnoData.serviceName,
          newDateFormatted: fechaFormateada
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
            subject: "Actualización de tu turno - Zoe Plasma Beauty",
            htmlContent: emailHtml 
          })
        });
        console.log("✅ [API MODIFICAR] Correo de reprogramación enviado al paciente.");
      }

      console.log("==================================================\n");
      return NextResponse.json({ success: true, message: "Turno reprogramado y notificado." }, { status: 200 });
    }

    // Si la acción no es ni cancel ni reprogram, rechazamos la petición
    return NextResponse.json({ error: "Acción no reconocida por el servidor." }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 Error crítico modificando turno:", error.message);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la modificación." }, 
      { status: 500 }
    );
  }
}