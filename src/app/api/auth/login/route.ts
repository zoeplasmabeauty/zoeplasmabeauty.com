/**
 * ARCHIVO: src/app/api/auth/login/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el punto de verificación (Endpoint) para el acceso administrativo.
 * Recibe intentos de inicio de sesión, valida credenciales y establece sesiones seguras.
 * Incluye sondas de debug y correcciones de entorno local para cookies.
 * * RESPONSABILIDADES:
 * 1. Extracción de Datos: Leer la contraseña enviada desde el formulario del frontend.
 * 2. Validación de Entorno: Obtener la contraseña maestra (SECRET) desde las variables de Cloudflare.
 * 3. Autenticación: Comparar el intento del usuario con la contraseña real.
 * 4. Gestión de Sesión: Si el acceso es válido, inyectar una Cookie 'HTTP-Only' en el navegador 
 * del usuario. Esta cookie es indescifrable e inalcanzable para scripts maliciosos.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

// DIRECTIVA CRÍTICA: Ejecutamos este código en los nodos Edge de Cloudflare
// para garantizar que la validación sea casi instantánea y resistente a ataques DDoS.
export const runtime = 'edge';

// Definimos la estructura exacta que esperamos recibir desde el formulario
interface LoginRequest {
  password?: string;
}

export async function POST(request: Request) {
  // SONDA DE DEBUG 1: Confirmamos que la petición llegó al backend
  console.log("\n🔑 [API LOGIN] 1. Petición de autenticación iniciada");

  try {
    // 1. LECTURA DEL INTENTO DE ACCESO
    // Clonamos y extraemos el cuerpo de la petición (JSON) de forma segura
    const clonedRequest = request.clone();
    const body = (await clonedRequest.json()) as LoginRequest;
    const { password } = body;

    // Si el usuario no envió ninguna contraseña, cortamos el proceso inmediatamente (Bad Request)
    if (!password) {
      return NextResponse.json(
        { error: "La contraseña es obligatoria." },
        { status: 400 }
      );
    }

    // 2. CONEXIÓN CON EL ENTORNO DE CLOUDFLARE
    // Obtenemos el contexto para leer nuestras variables secretas inyectadas
    const ctx = getRequestContext();
    // Usamos 'any' temporalmente aquí porque las variables de entorno dinámicas 
    // (como los SECRETS) pueden no estar explícitamente tipadas en nuestro Env general.
    const env = ctx.env as any; 

    // Extraemos la contraseña maestra que configuraremos en Cloudflare
    const secretPassword = env?.SECRET_ADMIN_PASSWORD || process.env.SECRET_ADMIN_PASSWORD;

    // SONDA DE DEBUG 2: Verificamos si el backend pudo leer el archivo .dev.vars o .env
    console.log(`🔑 [API LOGIN] 2. ¿Contraseña maestra detectada en el entorno?:`, !!secretPassword);

    // GUARDIA DE INFRAESTRUCTURA: Si olvidaste configurar la variable en Cloudflare o en local,
    // el sistema falla de forma segura (cerrado por defecto) en lugar de permitir el paso.
    if (!secretPassword) {
      console.error("🔴 [FATAL] La variable SECRET_ADMIN_PASSWORD no está configurada.");
      return NextResponse.json(
        { error: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    // 3. COMPARACIÓN DE CREDENCIALES
    if (password === secretPassword) {
      // SONDA DE DEBUG 3: Contraseña validada
      console.log("🔑 [API LOGIN] 3. Contraseña CORRECTA. Generando cookie...");

      // ÉXITO: Las contraseñas coinciden. Preparamos una respuesta positiva.
      const response = NextResponse.json(
        { success: true, message: "Acceso autorizado" },
        { status: 200 }
      );

      // Calculamos dinámicamente si estamos en localhost. Wrangler suele forzar NODE_ENV a 'production', 
      // lo que hace que 'secure: true' destruya las cookies en HTTP.
      const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');

      // 4. INYECCIÓN DE LA BÓVEDA (COOKIE HTTP-ONLY)
      // Esta es la "pulsera VIP". Le decimos al navegador que guarde esta cookie.
      response.cookies.set({
        name: 'zoe_admin_session', // Nombre de la cookie que buscaremos luego en el middleware
        value: 'authenticated', // El valor (podría ser un token complejo, pero aquí basta con una bandera)
        httpOnly: true, // CRÍTICO: Prohíbe que el JavaScript del navegador lea esta cookie (Previene ataques XSS)
        secure: !isLocalhost, // Solo exige HTTPS (secure: true) si NO estamos en localhost
        sameSite: 'lax', // Relajado en lugar de 'strict' para evitar bloqueos del navegador en redirecciones inmediatas
        path: '/', // Válida para todas las páginas de tu sitio
        maxAge: 60 * 60 * 8, // La sesión expira automáticamente en 8 horas por seguridad
      });

      console.log("🔑 [API LOGIN] 4. Cookie inyectada en la respuesta. Redireccionando...");
      return response;
    } else {
      // FRACASO: La contraseña no coincide. Devolvemos un error 401 (No Autorizado).
      console.log("🔴 [API LOGIN] 3. Intento fallido: Contraseña INCORRECTA.");
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

  } catch (error) {
    // MANEJO DE CRISIS: Si algo explota (ej. error al leer el JSON), capturamos el fallo.
    console.error("🔴 Error en la API de Login:", error);
    return NextResponse.json(
      { error: "Error interno procesando la solicitud." },
      { status: 500 }
    );
  }
}