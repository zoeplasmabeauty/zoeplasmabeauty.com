/**
 * ARCHIVO: src/middleware.ts
 * ARQUITECTURA: Next.js Middleware (Edge Runtime)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el escudo de seguridad perimetral de la aplicación.
 * Intercepta todas las peticiones web ANTES de que lleguen a la página solicitada.
 * * RESPONSABILIDADES:
 * 1. Monitoreo de Rutas: Vigilar exclusivamente los intentos de acceso a la zona `/admin`.
 * 2. Validación de Sesión: Buscar la cookie de autenticación 'zoe_admin_session'.
 * 3. Control de Acceso: 
 * - Si el usuario no tiene la cookie y quiere entrar al dashboard, lo patea al login.
 * - Si el usuario YA tiene la cookie y quiere ver el login, lo redirige al dashboard.
 * 4. Inyección de logs de auditoría.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. EXTRACCIÓN DE IDENTIDAD
  // Buscamos la "pulsera VIP" en el navegador del visitante
  const sessionCookie = request.cookies.get('zoe_admin_session');
  
  // Obtenemos la ruta exacta a la que intenta entrar (ej: /admin/dashboard)
  const currentPath = request.nextUrl.pathname;

  // SONDA DE DEBUG: Mostramos en terminal qué está viendo el middleware en cada petición
  console.log(`🛡️ [MIDDLEWARE] Ruta: ${currentPath} | Cookie detectada:`, sessionCookie ? 'SÍ' : 'NO');

  // 2. REGLA DE PROTECCIÓN (El Escudo)
  // Si el visitante intenta entrar a CUALQUIER página dentro de /admin/ (excepto el login principal)
  // y NO tiene la cookie de sesión...
  if (currentPath.startsWith('/admin/') && !sessionCookie) {
    console.log(`🛡️ [MIDDLEWARE] Acceso denegado. Redirigiendo al login...`);
    // Clonamos la URL actual y la cambiamos hacia la pantalla de login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin';
    // Expulsamos al usuario y lo redirigimos
    return NextResponse.redirect(loginUrl);
  }

  // 3. REGLA DE COMODIDAD (UX)
  // Si el visitante YA inició sesión (tiene la cookie) y por error intenta 
  // entrar de nuevo a la pantalla de login (/admin)...
  if (currentPath === '/admin' && sessionCookie) {
    console.log(`🛡️ [MIDDLEWARE] Usuario ya logueado. Redirigiendo al dashboard...`);
    // Lo empujamos directamente al panel de control
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. PASE LIBRE
  // Si no se rompió ninguna regla de seguridad, dejamos que la petición continúe su camino normal.
  return NextResponse.next();
}

// CONFIGURACIÓN DE RENDIMIENTO (Matcher)
// Le decimos a Next.js que no ejecute este guardia en CADA imagen o archivo de la web pública.
// Solo debe vigilar las rutas que empiecen con /admin.
export const config = {
  matcher: ['/admin/:path*'],
};