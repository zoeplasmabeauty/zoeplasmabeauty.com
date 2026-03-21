/**
 * ARCHIVO: src/app/api/cron/limpiar-turnos/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "Recolector de Basura" (Garbage Collector) del sistema.
 * Escanea la base de datos buscando turnos en estado 'awaiting_triage' 
 * que hayan sido creados hace más de 60 minutos. Si el paciente no completó 
 * la ficha médica en ese tiempo, el turno se cancela automáticamente, liberando 
 * el bloque horario en el calendario para otros pacientes.
 * * RESPONSABILIDADES:
 * 1. Seguridad: Bloquear acceso público mediante la llave 'CRON_SECRET'.
 * 2. Matemática de Tiempo Absoluta: Calcular la ventana de expiración (Ahora - 60 min).
 * 3. Ejecución Masiva: Encontrar y detonar los turnos caducados actualizando su estado a 'cancelled'.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db';
import { appointments } from '../../../../db/schema';
import { eq, and, lt } from 'drizzle-orm';

export const runtime = 'edge';

// Tiempo límite de tolerancia en minutos (1 hora)
const TIEMPO_EXPIRACION_MINUTOS = 60;

export async function GET(request: Request) {
  console.log("\n==================================================");
  console.log("🧹 [CRON] 1. Iniciando Recolector de Turnos Zombie");

  try {
    // 1. CONEXIÓN AL ENTORNO Y BASE DE DATOS
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Extraemos la llave de seguridad
    const cloudflareEnv = env as unknown as Record<string, string>;
    const cronSecret = cloudflareEnv.CRON_SECRET || process.env.CRON_SECRET;

    // 2. AUDITORÍA DE SEGURIDAD (Blindaje)
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    
    const isAuthorized = 
      (querySecret && querySecret === cronSecret) || 
      (authHeader && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      console.log("🛑 [CRON] Acceso denegado: Intento de ejecución sin credenciales.");
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // 3. MATEMÁTICA DE TIEMPO (Cálculo del Límite)
    // Obtenemos la hora actual en UTC y restamos 60 minutos
    const limiteTiempo = new Date(Date.now() - TIEMPO_EXPIRACION_MINUTOS * 60 * 1000);

    console.log(`⏰ [CRON] Buscando turnos creados antes de: ${limiteTiempo.toISOString()}`);

    // 4. EJECUCIÓN DE LIMPIEZA MASIVA
    // Buscamos turnos en 'awaiting_triage' cuya fecha de creación (createdAt) sea MENOR (lt) al límite.
    // NOTA: Esto asume que tienes una columna 'createdAt' en tu tabla appointments. 
    // Si tu columna se llama diferente (ej: 'created_at'), ajusta la variable abajo.
    const turnosEliminados = await db.update(appointments)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(appointments.status, 'awaiting_triage'),
          lt(appointments.createdAt, limiteTiempo)  
        )
      )
      .returning({ id: appointments.id });

    console.log(`✅ [CRON] Limpieza completada. Se liberaron ${turnosEliminados.length} espacios en la agenda.`);
    console.log("==================================================\n");

    return NextResponse.json({ 
      success: true, 
      message: "Limpieza ejecutada correctamente.", 
      freedSlots: turnosEliminados.length 
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Error crítico en Recolector de Basura:", error.message);
    return NextResponse.json(
      { error: "Fallo interno en el servidor CRON de limpieza." }, 
      { status: 500 }
    );
  }
}