/**
 * ARCHIVO: src/app/api/turnos/servicios/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el proveedor oficial del catálogo de tratamientos para el frontend. 
 * Permite que el formulario de reservas se mantenga actualizado sin necesidad de 
 * modificar el código del cliente cada vez que cambie un servicio.
 * * RESPONSABILIDADES:
 * 1. Gestión de Contexto: Interceptar el entorno de ejecución (Runtime) de Cloudflare para acceder a D1.
 * 2. Seguridad de Datos: Validar la disponibilidad de la conexión a la base de datos antes de consultar.
 * 3. Abstracción Relacional: Consultar la tabla 'services' utilizando el ORM Drizzle.
 * 4. Filtrado Lógico: Excluir del catálogo cualquier servicio que no esté marcado como activo (isActive: true).
 * 5. Serialización: Retornar los datos en formato JSON estandarizado con los headers de seguridad correctos.
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { services } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// DIRECTIVA CRÍTICA: Fuerza la ejecución en el Edge de Cloudflare (baja latencia).
export const runtime = 'edge';

/**
 * MANEJADOR GET: Extrae la lista de tratamientos disponibles.
 * No requiere parámetros de entrada, ya que consulta el estado global del catálogo.
 */
export async function GET() {
  try {
    // 1. OBTENCIÓN DEL CONTEXTO: 
    // Extraemos el objeto 'env' que contiene el binding 'DB' definido en wrangler.toml.
    const ctx = getRequestContext();
    const env = ctx?.env as unknown as Env;
    
    // RED DE SEGURIDAD (Mantenemos el log de error fatal)
    if (!env || !env.DB) {
      console.error("🔴 [FATAL] env.DB NO EXISTE. El binding de la base de datos está roto.");
      return new Response(
        JSON.stringify({ 
          error: "DB_BINDING_FAILED", 
          details: "Next.js no encuentra la variable DB. Revisa los logs del servidor." 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = createDbConnection(env);

    const activeServices = await db.select()
      .from(services)
      .where(eq(services.isActive, true));
    
    return new Response(
      JSON.stringify(activeServices), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    // CAPTURA DE CRISIS (Mantenemos el log detallado para debugging en producción)
    console.error("\n🔴 [FATAL CATCH] La API explotó con este error interno:");
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", message: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}