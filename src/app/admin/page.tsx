/**
 * ARCHIVO: src/app/admin/page.tsx
 * ARQUITECTURA: Componente de Cliente (Client Component) en React/Next.js
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como la única interfaz gráfica de acceso (Login) para el personal autorizado.
 * Es la "puerta" donde el administrador ingresa la Contraseña Maestra.
 * * RESPONSABILIDADES:
 * 1. Captura de Datos: Recibir la contraseña ingresada por el usuario en tiempo real.
 * 2. Orquestación de Red: Enviar la contraseña al backend (/api/auth/login) para validación.
 * 3. Feedback Visual: Mostrar estados de carga y mensajes de error (contraseña incorrecta).
 * 4. Redirección: Enviar al usuario al panel de control si el backend otorga la "pulsera VIP" (Cookie).
 */

'use client'; // Directiva estricta: Este código maneja interactividad en el navegador.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook de Next.js para cambiar de página

export default function AdminLoginPage() {
  // 1. ESTADOS DE INTERFAZ Y DATOS
  // Guardamos lo que el usuario escribe en el campo de contraseña
  const [password, setPassword] = useState('');
  
  // Controlamos si la petición está en proceso para desactivar el botón y evitar doble clic
  const [isLoading, setIsLoading] = useState(false);
  
  // Guardamos los mensajes de error que nos devuelva el servidor (ej: "Contraseña incorrecta")
  const [errorMessage, setErrorMessage] = useState('');
  
  // Instanciamos el enrutador para poder empujar al usuario al dashboard tras el éxito
  const router = useRouter();

  // 2. MANEJADOR DE ENVÍO (SUBMIT)
  // Esta función se dispara cuando el usuario hace clic en "Entrar" o presiona Enter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página web se recargue bruscamente
    setIsLoading(true); // Encendemos el estado de carga
    setErrorMessage(''); // Limpiamos cualquier error previo

    try {
      // Hacemos la petición POST a nuestra futura API de autenticación
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos la contraseña envuelta en un objeto JSON
        body: JSON.stringify({ password }), 
      });

      // Si el servidor nos devuelve un código de error (ej: 401 No Autorizado)
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Contraseña incorrecta');
      }

      // Si llegamos aquí, el servidor validó la contraseña y ya inyectó la Cookie secreta.
      // Redirigimos inmediatamente a la bóveda (el dashboard).
      router.push('/admin/dashboard');

    } catch (error: any) {
      // Capturamos el error y lo mostramos en la pantalla
      setErrorMessage(error.message);
    } finally {
      // Apagamos el estado de carga sin importar si hubo éxito o error
      setIsLoading(false);
    }
  };

  // 3. MOTOR GRÁFICO (UI RENDER)
  return (
    // Contenedor principal que ocupa toda la pantalla, con un fondo sutil
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      
      {/* Tarjeta de Login (Estética Clinical Light) */}
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        
        {/* Encabezado del Login */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-800 mb-2">
            Zoe Plasma <span className="font-semibold text-stone-700">Admin</span>
          </h1>
          <p className="text-sm text-gray-500">
            Ingresa la contraseña maestra para acceder al panel.
          </p>
        </div>

        {/* Mensaje de Error Condicional */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-md
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-stone-800 hover:bg-stone-900 active:scale-[0.98] shadow-stone-200'
              }`}
          >
            {isLoading ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>
        
      </div>
    </div>
  );
}