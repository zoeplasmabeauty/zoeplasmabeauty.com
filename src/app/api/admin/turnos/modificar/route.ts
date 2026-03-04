/**
 * ARCHIVO: src/app/api/admin/turnos/modificar/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Gestionar las acciones de modificación manual de turnos por parte del Administrador.
 * Permite cancelar turnos (liberando agenda) o reprogramarlos ajustando fecha/hora y duración.
 * * RESPONSABILIDADES:
 * 1. Autenticación: Validar la sesión del administrador para evitar accesos no autorizados.
 * 2. Ruteo de Acción: Determinar si el payload exige una cancelación o una reprogramación.
 * 3. Actualización de Base de Datos: Modificar los registros en D1 asegurando la integridad.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../../db';
import { appointments } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// Contrato estricto para asegurar la estructura de los datos entrantes
interface ModificarPayload {
  appointmentId: string;
  action: 'cancel' | 'reprogram';
  newDateISO?: string;
  customDuration?: number | null;
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
    const { appointmentId, action, newDateISO, customDuration } = body;

    if (!appointmentId || !action) {
      return NextResponse.json({ error: "Faltan parámetros críticos (ID o Acción)." }, { status: 400 });
    }

    // 3. CONEXIÓN AL ENTORNO Y BASE DE DATOS D1
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // ============================================================================
    // FLUJO A: CANCELAR TURNO
    // ============================================================================
    if (action === 'cancel') {
      console.log(`🛑 [API MODIFICAR] Cancelando turno ID: ${appointmentId}`);
      
      // Cambiamos el estado a 'cancelled', liberando el espacio en el calendario público
      await db.update(appointments)
        .set({ status: 'cancelled' })
        .where(eq(appointments.id, appointmentId));
        
      console.log("✅ [API MODIFICAR] Turno cancelado exitosamente.");
      console.log("==================================================\n");

      return NextResponse.json({ success: true, message: "Turno cancelado." }, { status: 200 });
    }

    // ============================================================================
    // FLUJO B: REPROGRAMAR TURNO
    // ============================================================================
    if (action === 'reprogram') {
      console.log(`🔄 [API MODIFICAR] Reprogramando turno ID: ${appointmentId}`);
      
      if (!newDateISO) {
        return NextResponse.json({ error: "Falta la nueva fecha y hora para reprogramar." }, { status: 400 });
      }

      // Actualizamos la fecha y, si se proporcionó, la duración personalizada
      // Si customDuration es null, la base de datos usará la duración estándar del servicio
      await db.update(appointments)
        .set({ 
          appointmentDate: newDateISO,
          customDurationMinutes: customDuration || null 
        })
        .where(eq(appointments.id, appointmentId));
        
      console.log("✅ [API MODIFICAR] Turno reprogramado exitosamente.");
      console.log("==================================================\n");

      return NextResponse.json({ success: true, message: "Turno reprogramado." }, { status: 200 });
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