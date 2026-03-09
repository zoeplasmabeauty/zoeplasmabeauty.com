/**
 * ARCHIVO: src/app/api/admin/servicios/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET & PUT)
 * * PROPÓSITO ESTRATÉGICO:
 * API privada y exclusiva para el Panel de Administración. Permite a Zoe consultar 
 * el catálogo completo (incluyendo servicios inactivos) y realizar modificaciones 
 * masivas a los precios totales y las señas (deposits) de cada tratamiento.
 * * SEGURIDAD:
 * Al estar bajo el directorio `/api/admin/`, esta ruta está protegida por el Middleware
 * global que verifica la existencia y validez de la cookie de sesión (JWT).
 * * RESPONSABILIDADES:
 * 1. GET: Retornar todos los servicios al panel (activos e inactivos).
 * 2. PUT: Recibir un array modificado y actualizar cada registro en D1.
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { services } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// DIRECTIVA CRÍTICA: Fuerza la ejecución en el Edge de Cloudflare (baja latencia).
export const runtime = 'edge';

/**
 * ============================================================================
 * MANEJADOR GET: Lectura del Catálogo Administrativo
 * ============================================================================
 */
export async function GET() {
  try {
    const ctx = getRequestContext();
    const env = ctx?.env as unknown as Env;
    
    if (!env || !env.DB) {
      throw new Error("DB_BINDING_FAILED: Next.js no encuentra la variable DB.");
    }

    const db = createDbConnection(env);

    // A diferencia de la API pública, aquí traemos TODOS los servicios, 
    // incluso si isActive es false, porque el admin necesita ver todo el catálogo.
    const allServices = await db.select().from(services);
    
    return new Response(
      JSON.stringify(allServices), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("🔴 [ADMIN API GET] Error interno:", error.message);
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", message: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * ============================================================================
 * MANEJADOR PUT: Actualización Masiva de Precios y Señas
 * ============================================================================
 */
export async function PUT(req: Request) {
  try {
    const ctx = getRequestContext();
    const env = ctx?.env as unknown as Env;
    
    if (!env || !env.DB) {
      throw new Error("DB_BINDING_FAILED: Contexto de base de datos no disponible.");
    }

    const db = createDbConnection(env);

    // Parseamos el JSON que viene desde el modal del Dashboard
    const body = await req.json();
    const { servicios: catalogoActualizado } = body as { 
      servicios: { id: string, price: number, deposit: number }[] 
    };

    if (!catalogoActualizado || !Array.isArray(catalogoActualizado)) {
      return new Response(
        JSON.stringify({ error: "BAD_REQUEST", message: "Formato de datos inválido." }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ITERACIÓN DE ESCRITURA:
    // Recorremos el array que nos envió el frontend y actualizamos cada servicio individualmente.
    // Usamos un bucle for...of para respetar la asincronía en las operaciones de base de datos.
    for (const servicio of catalogoActualizado) {
      await db.update(services)
        .set({ 
          price: servicio.price, 
          deposit: servicio.deposit 
        })
        .where(eq(services.id, servicio.id));
    }

    return new Response(
      JSON.stringify({ success: true, message: "Catálogo actualizado exitosamente." }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("🔴 [ADMIN API PUT] Error al actualizar precios:", error.message);
    return new Response(
      JSON.stringify({ error: "UPDATE_FAILED", message: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}