/**
 * ARCHIVO: src/app/admin/dashboard/page.tsx
 * ARQUITECTURA: Componente de Cliente (Dashboard UI)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como la "cabina de control" privada de Zoe Plasma Beauty.
 * Lee y formatea los datos de la base de datos para mostrarlos en una tabla clínica.
 * Soporta el flujo de Triage, permitiendo al admin ver 
 * el estado real del turno y abrir las fichas médicas para su aprobación.
 * Comprende funciones de Reprogramación y Cancelación Manual para turnos en estados específicos.
 * Permite generar alerta de cancelación a traves de un Modal interactivo 
 * capturando y enviando el motivo (razón) exacto de la cancelación al paciente.
 * * RESPONSABILIDADES:
 * 1. Orquestación: Hacer la petición a la API segura (/api/admin/turnos).
 * 2. Renderizado Seguro: Mostrar la información sensible de los pacientes.
 * 3. Formateo: Convertir las fechas ISO de la base de datos a formato horario local.
 * 4. Gestión de Acciones: Permitir la revisión de turnos, cancelaciones motivadas y reprogramaciones.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Motor de redirección de Next.js
import Link from 'next/link'; // Componente optimizado para enlaces internos

// Definimos la estructura estricta de lo que la base de datos nos va a devolver
// Aqui estan los campos que necesitaremos para identificar el estado médico
interface Turno {
  id: string;
  appointment_date: string;
  status: 'awaiting_triage' | 'under_review' | 'approved_unpaid' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_dni: string;
  service_name: string; // Traemos el nombre real del servicio, no solo el ID
}

export default function DashboardPage() {
  // Estados para controlar los datos, la carga y los errores
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Control del Modal de Reprogramación
  const [isReprogramModalOpen, setIsReprogramModalOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState(''); // Para customDurationMinutes
  
  // Control del Modal de Cancelación con Motivo
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const [isActionLoading, setIsActionLoading] = useState(false); // Para spinners en botones

  // Instanciamos el enrutador para empujar al usuario tras cerrar sesión o al ver detalles
  const router = useRouter();

  // Función encargada de extraer los datos (Esta separada para poder llamarla al recargar)
  const fetchTurnos = async () => {
    setIsLoading(true);
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

  useEffect(() => {
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

  // ============================================================================
  // FUNCIONES DE GESTIÓN (CANCELAR Y REPROGRAMAR)
  // ============================================================================

  // A.1 Abrir Modal de Cancelación
  const openCancelModal = (appointmentId: string) => {
    setSelectedTurnoId(appointmentId);
    setCancelReason(''); // Limpiamos cualquier motivo anterior
    setIsCancelModalOpen(true);
  };

  // A.2 Ejecutar Cancelación con Motivo
  const handleConfirmarCancelacion = async () => {
    if (!selectedTurnoId) return;
    if (cancelReason.trim().length < 5) {
      alert("Por favor, escribe un motivo válido y claro para el paciente.");
      return;
    }
    
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/turnos/modificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el 'cancelReason' junto con la orden de cancelar
        body: JSON.stringify({ appointmentId: selectedTurnoId, action: 'cancel', cancelReason: cancelReason.trim() })
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo cancelar el turno.");
      
      alert("Turno cancelado y paciente notificado.");
      setIsCancelModalOpen(false);
      fetchTurnos(); // Recargamos la tabla
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // B. Abrir Modal de Reprogramación
  const openReprogramModal = (appointmentId: string) => {
    setSelectedTurnoId(appointmentId);
    setNewDate('');
    setNewTime('');
    setNewDuration('');
    setIsReprogramModalOpen(true);
  };

  // C. Ejecutar Reprogramación
  const handleReprogramarTurno = async () => {
    if (!selectedTurnoId || !newDate || !newTime) {
      alert("Debes seleccionar una fecha y hora.");
      return;
    }

    setIsActionLoading(true);
    try {
      // Construimos el string ISO concatenando fecha y hora local asumiendo huso horario AR
      const isoDateString = new Date(`${newDate}T${newTime}:00-03:00`).toISOString();

      const res = await fetch('/api/admin/turnos/modificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appointmentId: selectedTurnoId, 
          action: 'reprogram',
          newDateISO: isoDateString,
          customDuration: newDuration ? parseInt(newDuration) : null 
        })
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo reprogramar.");
      
      alert("Turno reprogramado exitosamente. Se notificó al paciente.");
      setIsReprogramModalOpen(false);
      fetchTurnos(); // Recargamos la tabla
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ============================================================================


  // 2. DICCIONARIO DE ESTADOS (UI Dinámica)
  // Devuelve colores y textos amigables según el estado técnico de la BD
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_triage':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">Esperando Ficha</span>;
      case 'under_review':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">Requiere Revisión</span>;
      case 'approved_unpaid':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Falta Pago</span>;
      case 'confirmed':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmado</span>;
      case 'rejected':
      case 'cancelled': // Añadimos cancelled al mismo badge rojo
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status === 'rejected' ? 'Rechazado' : 'Cancelado'}</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado del Panel con Controles de Navegación */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Panel de <span className="font-semibold text-stone-700">Control</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Gestión de reservas y Triage Médico de Zoe Plasma Beauty
            </p>
          </div>
          
          {/* Grupo de Botones de Acción */}
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchTurnos}
              className="px-4 py-2 text-sm font-semibold text-stone-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Refrescar
            </button>
            <Link 
              href="/#inicio" 
              className="px-4 py-2 text-sm font-semibold text-[var(--color-zoe-blue)] bg-white border border-[var(--color-zoe-blue)]/30 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
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
            Conectando con la base de datos...
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
                  <th className="px-6 py-4 text-right text-xs font-bold text-stone-600 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {turnos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay turnos registrados en el sistema.
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[200px] truncate">
                        {turno.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(turno.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        
                        {/* LÓGICA DE BOTONES DINÁMICOS SEGÚN EL ESTADO */}
                        {turno.status === 'under_review' && (
                          <Link 
                            href={`/admin/dashboard/revisar/${turno.id}`}
                            className="text-[var(--color-zoe-blue)] hover:text-blue-800 font-bold"
                          >
                            Revisar Ficha &rarr;
                          </Link>
                        )}

                        {/* Modificamos el onclick de Cancelar para que abra el modal */}
                        {(turno.status === 'approved_unpaid' || turno.status === 'confirmed') && (
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => openReprogramModal(turno.id)}
                              disabled={isActionLoading}
                              className="text-stone-600 hover:text-stone-900 underline text-xs"
                            >
                              Reprogramar
                            </button>
                            <button 
                              onClick={() => openCancelModal(turno.id)}
                              disabled={isActionLoading}
                              className="text-red-500 hover:text-red-700 underline text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}

                        {turno.status !== 'under_review' && turno.status !== 'approved_unpaid' && turno.status !== 'confirmed' && (
                          <span className="text-gray-400">Histórico</span>
                        )}

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* =========================================================
          MODAL DE CANCELACIÓN (Flota por encima del dashboard)
          ========================================================= */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold text-red-700 mb-2">Cancelar Turno</h3>
            <p className="text-sm text-gray-600 mb-6">Esta acción liberará el espacio en la agenda. Por favor, escribe el motivo de la cancelación. Este mensaje será enviado por correo al paciente.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Cancelación</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-red-500 min-h-[100px] resize-none"
                placeholder="Ej: Estimado paciente, lamentamos informarle que por motivos de fuerza mayor debemos cancelar su turno..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Volver
              </button>
              <button 
                onClick={handleConfirmarCancelacion}
                disabled={isActionLoading || cancelReason.trim().length < 5}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${cancelReason.trim().length < 5 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isActionLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE REPROGRAMACIÓN (Flota por encima del dashboard)
          ========================================================= */}
      {isReprogramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Modificar Turno</h3>
            <p className="text-sm text-gray-500 mb-6">Selecciona el nuevo horario. Puedes definir una duración personalizada si la complejidad del paciente lo requiere.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Fecha</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-zoe-blue)]"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Hora</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-zoe-blue)]"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración Personalizada (Minutos) - Opcional</label>
                <input 
                  type="number" 
                  placeholder="Ej: 120"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-zoe-blue)]"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                />
                <span className="text-xs text-gray-400 mt-1 block">Deja en blanco para usar la duración estándar del servicio.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsReprogramModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReprogramarTurno}
                disabled={isActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-zoe-blue)] hover:bg-blue-800 rounded-lg shadow-sm"
              >
                {isActionLoading ? 'Guardando...' : 'Confirmar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}