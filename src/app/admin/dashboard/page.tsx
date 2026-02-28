/**
 * ARCHIVO: src/app/admin/dashboard/page.tsx
 * ARQUITECTURA: Componente de Cliente (Dashboard UI)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como la "cabina de control" privada de Zoe Plasma Beauty.
 * Lee y formatea los datos de la base de datos para mostrarlos en una tabla clínica.
 * * RESPONSABILIDADES:
 * 1. Orquestación: Hacer la petición a la API segura (/api/admin/turnos).
 * 2. Renderizado Seguro: Mostrar la información sensible de los pacientes.
 * 3. Formateo: Convertir las fechas ISO de la base de datos a formato horario local.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Motor de redirección de Next.js
import Link from 'next/link'; // Componente optimizado para enlaces internos

// Definimos la estructura estricta de lo que la base de datos nos va a devolver
interface Turno {
  id: string;
  appointment_date: string;
  status: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_dni: string;
  service_id: string;
}

export default function DashboardPage() {
  // Estados para controlar los datos, la carga y los errores
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Instanciamos el enrutador para empujar al usuario tras cerrar sesión
  const router = useRouter();

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        // Llamaremos a una API protegida que construiremos en el siguiente paso
        const res = await fetch('/api/admin/turnos');
        if (!res.ok) throw new Error('Error al cargar la base de datos.');
        
        // Mapeo seguro para TypeScript
        const data = (await res.json()) as Turno[];
        setTurnos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurnos();
  }, []);

  // Función de apoyo para formatear la fecha estilo Buenos Aires
  const formatearFecha = (fechaIso: string) => {
    const date = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 1. MANEJADOR DE APAGADO (LOGOUT)
  const handleLogout = async () => {
    try {
      // Disparamos la petición POST a nuestra API destructora
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Una vez que el servidor destruye la cookie, el Guardia (Middleware) 
      // nos vuelve a ver como desconocidos. Redirigimos a la pantalla de login.
      router.push('/admin');
      
      // Forzamos un refresco de ruta para limpiar cualquier caché visual en Next.js
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado del Panel con Controles de Navegación */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Panel de <span className="font-semibold text-stone-700">Control</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Gestión de reservas y pacientes de Zoe Plasma Beauty
            </p>
          </div>
          
          {/* Grupo de Botones de Acción */}
          <div className="flex items-center gap-3">
            {/* Botón de Retorno al Sitio Público */}
            <Link 
              href="/#inicio" 
              className="px-4 py-2 text-sm font-semibold text-stone-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Ir al inicio
            </Link>

            {/* Botón de Destrucción de Sesión */}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Manejo de Estados Visuales */}
        {isLoading && (
          <div className="text-center p-12 text-gray-500 font-medium animate-pulse">
            Conectando con la base de datos local...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        {/* Tabla de Datos (Solo se muestra si hay datos y no está cargando) */}
        {!isLoading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {turnos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay turnos agendados todavía.
                    </td>
                  </tr>
                ) : (
                  turnos.map((turno) => (
                    <tr key={turno.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatearFecha(turno.appointment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{turno.patient_name}</div>
                        <div className="text-xs text-gray-500">DNI: {turno.patient_dni}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{turno.patient_phone}</div>
                        <div className="text-xs text-gray-500">{turno.patient_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {turno.service_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 uppercase">
                          {turno.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}