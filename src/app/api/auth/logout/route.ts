/**
 * ARCHIVO: src/app/api/auth/logout/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "interruptor de apagado" (Kill Switch) para la sesión del administrador.
 * * RESPONSABILIDADES:
 * 1. Invalidación de Identidad: Sobrescribir la cookie 'admin_session' con un valor vacío.
 * 2. Expiración Forzada: Configurar la fecha de caducidad de la cookie en el pasado 
 * (Epoch 0) para obligar al navegador del usuario a borrarla inmediatamente.
 */

import { NextResponse } from 'next/server';

// DIRECTIVA CRÍTICA: Ejecución en la red de borde (Edge) para latencia cero.
export const runtime = 'edge';

export async function POST() {
  try {
    // 1. PREPARACIÓN DE LA RESPUESTA
    const response = NextResponse.json(
      { success: true, message: "Sesión cerrada correctamente" },
      { status: 200 }
    );

    // 2. DESTRUCCIÓN DE LA BÓVEDA (COOKIE HTTP-ONLY)
    // Para borrar una cookie segura, debemos enviarla de nuevo pero caducada.
    response.cookies.set({
      name: 'admin_session', // El mismo nombre exacto que usamos en el login
      value: '', // Vaciamos su contenido
      httpOnly: true, // Mantenemos la seguridad estructural
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // CRÍTICO: Fecha 1 de Enero de 1970. El navegador la elimina al instante.
    });

    return response;

  } catch (error) {
    // MANEJO DE CRISIS
    console.error("🔴 Error al intentar cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error interno al cerrar la sesión." },
      { status: 500 }
    );
  }
}