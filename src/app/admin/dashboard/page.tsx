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
 * 5. Gestión de Agenda: Controlar los cierres globales (Vacaciones/Feriados).
 * 6. Gestión de Catálogo: Modificar precios y señas de la tabla 'services'.
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

// Interfaz para tipar los bloqueos de agenda
interface Bloqueo {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// ============================================================================
// Estructura para manejar los Servicios y sus Precios
// ============================================================================
interface ServicioCatalogo {
  id: string;
  name: string;
  price: number;
  deposit: number;
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
  
  // ============================================================================
  // ESTADOS PARA LA GESTIÓN DE BLOQUEOS (VACACIONES)
  // ============================================================================
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // ============================================================================
  // GESTIÓN DE PRECIOS Y SEÑAS
  // ============================================================================
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<ServicioCatalogo[]>([]);
  const [isPricesLoading, setIsPricesLoading] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false); // Para spinners en botones

  // Instanciamos el enrutador para empujar al usuario tras cerrar sesión o al ver detalles
  const router = useRouter();

  // Función encargada de extraer los datos (Esta separada para poder llamarla al recargar)
  const fetchTurnos = async () => {
    setIsLoading(true);
    try {
      // Llamaremos a una API protegida
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

  // Función para obtener la lista de bloqueos activos
  const fetchBloqueos = async () => {
    try {
      const res = await fetch('/api/admin/bloqueos');
      if (res.ok) {
        const data = (await res.json()) as Bloqueo[];
        setBloqueos(data);
      }
    } catch (err) {
      console.error("Error obteniendo bloqueos:", err);
    }
  };

  useEffect(() => {
    fetchTurnos();
    fetchBloqueos(); // Cargamos los bloqueos en segundo plano al iniciar
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

  // Formateador simple para fechas YYYY-MM-DD
  const formatoCorto = (fechaYYYYMMDD: string) => {
    // Forzamos la interpretación local para evitar desfases UTC en el display
    const date = new Date(`${fechaYYYYMMDD}T12:00:00`); 
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
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
  // FUNCIONES DE BLOQUEOS (Cerrar Agenda)
  // ============================================================================
  const handleCrearBloqueo = async () => {
    if (!blockStartDate || !blockEndDate) {
      alert("Debes seleccionar una fecha de inicio y fin.");
      return;
    }
    if (blockStartDate > blockEndDate) {
      alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/bloqueos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: blockStartDate, 
          endDate: blockEndDate, 
          reason: blockReason.trim() || "Cierre programado" 
        })
      });

      if (!res.ok) throw new Error("Fallo al crear el bloqueo.");
      
      setBlockStartDate('');
      setBlockEndDate('');
      setBlockReason('');
      fetchBloqueos(); // Recargamos la lista interna
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEliminarBloqueo = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este bloqueo y abrir la agenda en estas fechas?")) return;
    
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bloqueos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Fallo al eliminar el bloqueo.");
      fetchBloqueos();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ============================================================================
  // GESTIÓN DE PRECIOS
  // ============================================================================
  
  // Abre el modal y consulta los precios actuales a la API
  const handleOpenPriceModal = async () => {
    setIsPriceModalOpen(true);
    setIsPricesLoading(true);
    try {
      const res = await fetch('/api/admin/servicios');
      if (res.ok) {
        // Aseguramos la forma de los datos para Typescript
        const data = (await res.json()) as ServicioCatalogo[];
        setServiciosCatalogo(data);
      } else {
        throw new Error("No se pudieron cargar los servicios.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPricesLoading(false);
    }
  };

  // Maneja el cambio de valores en los inputs numéricos (controlado en memoria)
  const handlePriceChange = (id: string, field: 'price' | 'deposit', value: string) => {
    // Si el campo queda vacío lo interpretamos como 0 para no romper React
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    
    setServiciosCatalogo(prev => 
      prev.map(servicio => 
        servicio.id === id ? { ...servicio, [field]: numericValue } : servicio
      )
    );
  };

  // Envía el paquete completo de servicios a la base de datos para guardarlos
  const handleGuardarPrecios = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/servicios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el array completo con las modificaciones
        body: JSON.stringify({ servicios: serviciosCatalogo })
      });

      if (!res.ok) throw new Error("Error al guardar los nuevos precios.");
      
      alert("Precios y señas actualizados correctamente en el sistema.");
      setIsPriceModalOpen(false);
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

  // ============================================================================
  // LIMITADOR DE FECHAS (UX Defensiva)
  // Calculamos la fecha de hoy y el 31 de diciembre del año próximo
  // ============================================================================
  const today = new Date();
  const currentYearStr = today.getFullYear();
  // Formato YYYY-MM-DD necesario para el input type="date"
  const minDateStr = today.toISOString().split('T')[0]; 
  const maxDateStr = `${currentYearStr + 1}-12-31`;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado del Panel con Controles de Navegación */}
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Panel de <span className="font-semibold text-stone-700">Control</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Gestión de reservas y Triage Médico de Zoe Plasma Beauty
            </p>
          </div>
          
          {/* Grupo de Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* INYECCIÓN DEL BOTÓN: Gestión de Precios */}
            <button 
              onClick={handleOpenPriceModal}
              className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg hover:bg-emerald-200 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Gestionar Precios
            </button>

            {/* NUEVO BOTÓN: Gestión de Agenda/Vacaciones */}
            <button 
              onClick={() => setIsBlockModalOpen(true)}
              className="px-4 py-2 text-sm font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Bloquear Fechas
            </button>

            <div className="h-6 w-px bg-gray-300 hidden sm:block mx-1"></div> {/* Divisor visual */}
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
          MODAL DE GESTIÓN DE PRECIOS
          ========================================================= */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 relative my-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Gestión de Precios y Señas
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Modifica los valores del catálogo. Los cambios se reflejarán instantáneamente en todo el sitio web y en Mercado Pago.
                </p>
              </div>
              <button onClick={() => setIsPriceModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {isPricesLoading ? (
              <div className="py-12 text-center text-gray-500 animate-pulse">
                Cargando el catálogo de la base de datos...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mb-6">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tratamiento</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-40">Precio Total ($)</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 uppercase w-40">Valor Seña ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {serviciosCatalogo.map((servicio) => (
                      <tr key={servicio.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {servicio.name}
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number"
                            value={servicio.price === 0 ? '' : servicio.price}
                            onChange={(e) => handlePriceChange(servicio.id, 'price', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[var(--color-zoe-blue)] outline-none"
                            placeholder="Ej: 350000"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number"
                            value={servicio.deposit === 0 ? '' : servicio.deposit}
                            onChange={(e) => handlePriceChange(servicio.id, 'deposit', e.target.value)}
                            className="w-full border border-emerald-300 bg-emerald-50 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none font-bold text-emerald-900"
                            placeholder="Ej: 30000"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsPriceModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarPrecios}
                disabled={isActionLoading || isPricesLoading}
                className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {isActionLoading ? 'Guardando...' : 'Guardar Nuevos Precios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE GESTIÓN DE BLOQUEOS (VACACIONES)
          ========================================================= */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gestión de Agenda y Cierres</h3>
                <p className="text-sm text-gray-500 mt-1">Bloquea fechas para evitar que los pacientes agenden turnos (Vacaciones, Feriados, etc).</p>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Formulario para Nuevo Bloqueo */}
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-8">
              <h4 className="font-semibold text-orange-800 mb-4 text-sm uppercase tracking-wide">Crear Nuevo Bloqueo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                  {/* INYECCIÓN DEL LÍMITE MÁXIMO AQUÍ */}
                  <input 
                    type="date" 
                    min={minDateStr}
                    max={maxDateStr}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 bg-white"
                    value={blockStartDate}
                    onChange={(e) => setBlockStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Fin</label>
                  <input 
                    type="date" 
                    min={blockStartDate || minDateStr}
                    max={maxDateStr}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 bg-white"
                    value={blockEndDate}
                    onChange={(e) => setBlockEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Motivo (Visible para el paciente)</label>
                <input 
                  type="text" 
                  placeholder="Ej: Clínica cerrada por vacaciones de verano"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 bg-white"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleCrearBloqueo}
                  disabled={isActionLoading || !blockStartDate || !blockEndDate}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isActionLoading ? 'Guardando...' : 'Aplicar Bloqueo'}
                </button>
              </div>
            </div>

            {/* Lista de Bloqueos Activos */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Bloqueos Activos</h4>
              {bloqueos.length === 0 ? (
                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">No hay bloqueos registrados en la agenda.</p>
              ) : (
                <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {bloqueos.map((bloqueo) => (
                    <li key={bloqueo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-200 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {formatoCorto(bloqueo.startDate)} <span className="text-gray-400 font-normal mx-1">hasta</span> {formatoCorto(bloqueo.endDate)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{bloqueo.reason}</p>
                      </div>
                      <button 
                        onClick={() => handleEliminarBloqueo(bloqueo.id)}
                        disabled={isActionLoading}
                        className="mt-3 sm:mt-0 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      )}

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
                {/* LÍMITES INYECTADOS: min (hoy) y max (fin del próximo año) */}
                <input 
                  type="date" 
                  min={minDateStr}
                  max={maxDateStr}
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