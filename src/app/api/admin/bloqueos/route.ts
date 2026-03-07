/**
 * ARCHIVO: src/app/api/admin/bloqueos/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET, POST, DELETE)
 * * PROPÓSITO ESTRATÉGICO:
 * Gestionar la tabla 'blocked_dates' para controlar los cierres de agenda 
 * por vacaciones, feriados o refacciones.
 * * RESPONSABILIDADES:
 * 1. Autenticación: Validar la sesión del administrador en cada petición.
 * 2. GET: Obtener la lista completa de fechas bloqueadas.
 * 3. POST: Insertar un nuevo rango de bloqueo.
 * 4. DELETE: Eliminar un bloqueo existente si la clínica decide abrir.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db';
import { blockedDates } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'edge';

// Función auxiliar para blindar cada método
async function isAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get('zoe_admin_session');
  return session && session.value === 'authenticated';
}

// 1. LEER BLOQUEOS (GET)
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  try {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Obtenemos los bloqueos ordenados por fecha de inicio
    const bloqueos = await db.select()
      .from(blockedDates)
      .orderBy(desc(blockedDates.startDate));

    return NextResponse.json(bloqueos, { status: 200 });
  } catch (error: any) {
    console.error("Error leyendo bloqueos:", error);
    return NextResponse.json({ error: "Error obteniendo fechas bloqueadas." }, { status: 500 });
  }
}

// 2. CREAR BLOQUEO (POST)
export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  try {
    const body = await request.json() as { startDate: string; endDate: string; reason?: string };
    
    if (!body.startDate || !body.endDate) {
      return NextResponse.json({ error: "La fecha de inicio y fin son obligatorias." }, { status: 400 });
    }

    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    // Usamos Web Crypto API (nativo en Edge/Cloudflare) para generar un ID único
    const newId = crypto.randomUUID();

    await db.insert(blockedDates).values({
      id: newId,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason || "Cierre programado",
    });

    return NextResponse.json({ success: true, message: "Bloqueo registrado correctamente." }, { status: 200 });
  } catch (error: any) {
    console.error("Error creando bloqueo:", error);
    return NextResponse.json({ error: "Error al guardar el bloqueo." }, { status: 500 });
  }
}

// 3. ELIMINAR BLOQUEO (DELETE)
export async function DELETE(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  try {
    // Leemos el ID que viene en los parámetros de la URL (Ej: ?id=1234)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del bloqueo." }, { status: 400 });
    }

    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    const db = createDbConnection(env);

    await db.delete(blockedDates).where(eq(blockedDates.id, id));

    return NextResponse.json({ success: true, message: "Bloqueo eliminado correctamente." }, { status: 200 });
  } catch (error: any) {
    console.error("Error eliminando bloqueo:", error);
    return NextResponse.json({ error: "Error al eliminar el bloqueo." }, { status: 500 });
  }
}