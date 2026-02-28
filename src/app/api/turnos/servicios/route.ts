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
  console.log("\n==================================================");
  console.log("🟢 [DEBUG API] 1. INICIANDO PETICIÓN A /api/servicios");
  console.log("==================================================");
  
  try {
    // 1. OBTENCIÓN DEL CONTEXTO: 
    // Extraemos el objeto 'env' que contiene el binding 'DB' definido en wrangler.toml.
    const ctx = getRequestContext();
    console.log("🟢 [DEBUG API] 2. ¿Contexto de Cloudflare existe?:", !!ctx);

    const env = ctx?.env as unknown as Env;
    console.log("🟢 [DEBUG API] 3. ¿Objeto ENV existe?:", !!env);
    
    // Rastreamos qué variables de entorno está viendo realmente Next.js
    if (env) {
      console.log("🟢 [DEBUG API] 4. Llaves detectadas dentro de ENV:", Object.keys(env));
    } else {
      console.log("🔴 [DEBUG API] 4. ENV es undefined.");
    }

    if (!env || !env.DB) {
      console.error("🔴 [FATAL] 5. env.DB NO EXISTE. El binding de la base de datos está roto.");
      return new Response(
        JSON.stringify({ 
          error: "DB_BINDING_FAILED", 
          details: "Next.js no encuentra la variable DB. Revisa los logs de la terminal." 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log("🟢 [DEBUG API] 5. env.DB encontrado exitosamente. Conectando ORM...");
    const db = createDbConnection(env);

    console.log("🟢 [DEBUG API] 6. Ejecutando query SQL en D1...");
    const activeServices = await db.select()
      .from(services)
      .where(eq(services.isActive, true));

    console.log("🟢 [DEBUG API] 7. Query exitosa. Servicios encontrados:", activeServices.length);
    console.log("==================================================\n");
    
    return new Response(
      JSON.stringify(activeServices), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("\n🔴 [FATAL CATCH] 8. La API explotó con este error interno:");
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    console.log("==================================================\n");
    
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", message: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}