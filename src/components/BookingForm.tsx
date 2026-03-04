/**
 * ARCHIVO: src/components/BookingForm.tsx
 * ARQUITECTURA: Componente de Cliente (React/Next.js)
 * PROPÓSITO: Gestionar la reserva de turnos estética. 
 * RESPONSABILIDADES:
 * 1. Recolección de datos (Nombre, DNI, WhatsApp, Email).
 * 2. Validación de reglas de negocio (Bloqueo de domingos y fechas pasadas, validación de inputs).
 * 3. Comunicación con la API de turnos y la API de Disponibilidad.
 * 4. UX Responsiva: Evita el solapamiento visual mediante una grilla expandida.
 * 5. Flujo Médico: Redirección automática al Paso 2 (Ficha Clínica).
 * 6. Lógica de selección anidada (Categoría -> Variante) para soportar
 * múltiples duraciones/precios bajo un mismo "Servicio Visual" sin alterar la estructura plana de D1.
 */

'use client'; // Directiva estricta: Este código corre en el navegador del paciente.

import { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definición de tipos para TypeScript basado en tu base de datos
interface Service {
  id: string;
  name: string;
  durationMinutes: number; // Usamos durationMinutes 
}

export default function BookingForm() {
  // 1. ESTADOS DE LA INTERFAZ (UI STATE)
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Estados para manejar la cuadrícula de horarios dinámicos
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // ----------------------------------------------------------------------
  // ESTADOS DEL FORMULARIO (UX Categorizada)
  // El usuario selecciona primero la categoría, y luego la opción exacta.
  // ----------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState(''); // Guarda la hora clickeada por el usuario
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dni: '',
    email: '', 
  });

  // 3. ESTADOS DE TRANSACCIÓN (NETWORK STATE)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================================
  // CONSTANTES FINANCIERAS (El Motor de Precios)
  // Nota: Estas constantes se mantienen para lógica interna, pero se han 
  // ocultado de la interfaz visual en favor del aviso de revisión médica.
  // ============================================================================
  const COSTO_RESERVA_BASE = 50000;
  const PORCENTAJE_IMPUESTOS_MP = 0.0825; 
  const CARGOS_SERVICIO = COSTO_RESERVA_BASE * PORCENTAJE_IMPUESTOS_MP;
  const TOTAL_A_PAGAR = COSTO_RESERVA_BASE + CARGOS_SERVICIO;

  // 4. EXTRACCIÓN AL INICIAR (ON MOUNT)
  // Llama a tu ruta GET para poblar el select dinámicamente.
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/turnos/servicios');
        if (!res.ok) throw new Error('Fallo al cargar servicios');
        const data = (await res.json()) as Service[];
        setServices(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Error al conectar con el catálogo de tratamientos.');
      } finally {
        setIsLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // ============================================================================
  // LÓGICA DE AGRUPACIÓN (Mastering de Catálogo)
  // Como la DB entrega una lista plana (6 items), React la procesa aquí para la UI.
  // Identificamos las categorías por el nombre base (ej: "Plasma Fibroblast").
  // ============================================================================
  const categories = useMemo(() => {
    if (services.length === 0) return {};
    
    const grouped: Record<string, Service[]> = {
      "Plasma Fibroblast": [],
      "Tratamiento de estrias con plasma fibroblast": [],
      "Eliminacion de lesiones benignas": [],
      "Skin regeneration y tratamientos complementarios": []
    };

    services.forEach(service => {
      // Usamos includes() para determinar a qué categoría pertenece cada variante plana
      if (service.name.includes("Tratamiento de estrias")) {
        grouped["Tratamiento de estrias con plasma fibroblast"].push(service);
      } else if (service.name.includes("lesiones benignas")) {
        grouped["Eliminacion de lesiones benignas"].push(service);
      } else if (service.name.includes("Skin regeneration")) {
        grouped["Skin regeneration y tratamientos complementarios"].push(service);
      } else if (service.name.includes("Plasma Fibroblast") && !service.name.includes("estrias")) {
        grouped["Plasma Fibroblast"].push(service);
      } else {
        // Fallback por si agregas un servicio que no coincide con los patrones
        grouped[service.name] = [service];
      }
    });

    // Limpiamos categorías vacías si faltan registros en la DB
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) delete grouped[key];
    });

    return grouped;
  }, [services]);


  useEffect(() => {
    async function fetchAvailableSlots() {
        // Solo lanzamos el radar si tenemos ambos datos (Día y Tratamiento)
        if (!selectedDate || !selectedServiceId) {
        setAvailableSlots([]);
        setSelectedTime(''); // Reseteamos la hora si cambia el día
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime(''); // Limpiamos selección previa por seguridad
      
      try {
        // Formateamos la fecha para que la API la entienda (YYYY-MM-DD)
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await fetch(`/api/turnos/disponibilidad?date=${dateStr}&serviceId=${selectedServiceId}`);
        
        if (!res.ok) throw new Error('Fallo al cargar disponibilidad');
        
        // TypeScript estricto para la respuesta de nuestra nueva API
        const data = (await res.json()) as { availableSlots: string[] };
        setAvailableSlots(data.availableSlots || []);
      } catch (error) {
        console.error("Error consultando horarios:", error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchAvailableSlots();
  }, [selectedDate, selectedServiceId]); 
    // Las dependencias indican que este efecto corre si cambia selectedDate o selectedServiceId

  // 5. MANEJADOR DE ENVÍO (SUBMIT HANDLER)  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validación radical: exige también la hora (selectedTime)
    if (!selectedDate || !selectedServiceId || !selectedTime) {
      setErrorMessage('Por favor, selecciona un tratamiento, una fecha y un horario.');
      return;
    }

    if (formData.dni.length < 7 || formData.dni.length > 9) {
      setErrorMessage('El DNI debe contener entre 7 y 9 números.');
      return;
    }

    if (!formData.phone) {
      setErrorMessage('Por favor, ingresa un número de WhatsApp válido.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // ----------------------------------------------------------------------
      // MATEMÁTICA DE TIEMPO ABSOLUTA (Mastering de Zona Horaria)
      // Juntamos el día (YYYY-MM-DD) con la hora (HH:mm) y le pegamos el 
      // identificador de huso horario de Buenos Aires (-03:00) para forzar 
      // que el servidor guarde el momento exacto sin importar en qué país 
      // esté corriendo el Edge de Cloudflare.
      // ----------------------------------------------------------------------    
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const localDateTimeStr = `${dateStr}T${selectedTime}:00.000-03:00`;
      
      // Convertimos ese string estricto a ISO estándar universal (UTC) para la BD
      const appointmentDate = new Date(localDateTimeStr).toISOString();

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        dni: formData.dni,
        email: formData.email, // INYECCIÓN: Email enviado al backend
        serviceId: selectedServiceId, // Enviamos el ID específico (ej: Fibroblast 120min)
        appointmentDate: appointmentDate
      };

      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Esperamos el ID del turno
      const result = (await res.json()) as { error?: string, appointmentId?: string };

      if (!res.ok) {
        throw new Error(result.error || 'Error desconocido en el servidor');
      }

      // ========================================================================
      // REDIRECCIÓN AL PASO 2 (FICHA CLÍNICA)
      // ========================================================================
      if (result.appointmentId) {
        // Redirigimos al usuario dinámicamente usando el ID del turno recién creado
        window.location.href = `/ficha-clinica/${result.appointmentId}`;
        
        // Dejamos la función aquí. El navegador ya está cargando la nueva URL.
        // Mantenemos setIsSubmitting(true) para que el botón siga diciendo "Procesando..." 
        return; 
      }

      // FALLBACK DE SEGURIDAD
      setSubmitStatus('success');
      // Limpiamos el formulario tras un éxito rotundo
      setFormData({ fullName: '', phone: '', dni: '', email: '' });
      setSelectedDate(undefined);
      setSelectedTime(''); // Limpiamos la hora
      setSelectedCategory('');
      setSelectedServiceId('');
      setIsSubmitting(false);

    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message);
      setIsSubmitting(false); // Liberamos el botón si hubo un fallo
    }
  };

  // 6. RENDERIZADO CONDICIONAL DE ÉXITO (Fallback)
  // Nota: Este bloque casi nunca se verá en el nuevo flujo, ya que redirigiremos antes,
  // pero se mantiene como red de seguridad por si falla la redirección.
  if (submitStatus === 'success') {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-2xl font-semibold text-green-800 mb-2">¡Paso 1 Completado!</h3>
        <p className="text-green-700">
          Por favor, completa tu ficha clínica para continuar con la reserva.
        </p>
        <button 
          onClick={() => setSubmitStatus('idle')}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Agendar otro turno
        </button>
      </div>
    );
  }

  // 7. MOTOR GRÁFICO (UI RENDER)
  return (
    /* REESTRUCTURACIÓN: max-w-5xl para dar más espacio y evitar solapamiento lateral */
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-light text-gray-800 mb-8 border-b pb-4">
        Reserva tu <span className="font-semibold text-stone-700">Tratamiento</span>
      </h2>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* COLUMNA IZQUIERDA: Datos del Paciente */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre Completo</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Ej: María Pérez"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">DNI</label>
              <input 
                type="text" 
                required
                minLength={7}
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
                value={formData.dni}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, dni: soloNumeros});
                }}
                placeholder="Ej: 12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">WhatsApp</label>
              <input 
                type="tel" 
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
                value={formData.phone}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, phone: soloNumeros});
                }}
                placeholder="Ej: 1112345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="tu@email.com"
            />
          </div>

          {/* ====================================================================
              SELECCIÓN ANIDADA (Categoría -> Variante)
              ==================================================================== */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Tratamiento de Interés</label>
            <select 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-white"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedServiceId(''); // Reseteamos la variante si cambia la categoría principal
                setAvailableSlots([]);
              }}
              disabled={isLoadingServices}
            >
              <option value="" disabled>Selecciona un servicio...</option>
              {Object.keys(categories).map(catName => (
                <option key={catName} value={catName}>{catName}</option>
              ))}
            </select>
          </div>

          {/* Renderizado Condicional: Solo aparece si la categoría tiene múltiples opciones */}
          {selectedCategory && categories[selectedCategory]?.length > 1 && (
             <div>
               <label className="block text-sm font-semibold text-[var(--color-zoe-blue)] mb-2">Variante del Tratamiento</label>
               <select 
                 required
                 className="w-full px-4 py-3 border border-[var(--color-zoe-blue)]/30 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-blue-50/50"
                 value={selectedServiceId}
                 onChange={(e) => setSelectedServiceId(e.target.value)}
               >
                 <option value="" disabled>Selecciona una opción específica...</option>
                 {categories[selectedCategory].map(service => {
                   // Limpiamos el nombre para que el usuario no lea información redundante
                   const cleanName = service.name.replace(selectedCategory, "").replace("-", "").trim();
                   return (
                     <option key={service.id} value={service.id}>
                       {cleanName || service.name} ({service.durationMinutes} min)
                     </option>
                   );
                 })}
               </select>
             </div>
          )}

          {/* Si la categoría solo tiene una opción, la auto-seleccionamos detrás de escena */}
          {selectedCategory && categories[selectedCategory]?.length === 1 && (() => {
            if (selectedServiceId !== categories[selectedCategory][0].id) {
               setSelectedServiceId(categories[selectedCategory][0].id);
            }
            return null;
          })()}

        </div>

        {/* COLUMNA DERECHA: Calendario con protección de espacio */}
        <div className="flex flex-col items-center lg:items-start justify-start w-full">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 w-full max-w-md mx-auto">
            <label className="block text-sm font-bold text-gray-700 text-center mb-4">
              1. Selecciona la Fecha
            </label>
            {/* DayPicker: Ajustado para que no se desborde del contenedor gris */}
            <div className="flex justify-center bg-white p-2 rounded-xl shadow-inner">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                disabled={[
                  { before: new Date() },
                  { dayOfWeek: [0] } // Bloquea los domingos visualmente
                ]}
              />
            </div>
            
            {/* ====================================================================
            // SECCIÓN VISUAL DE HORARIOS (Aparece tras elegir día y tratamiento)
            {/* ==================================================================== */}
            {selectedDate && selectedServiceId && (
              <div className="mt-8">
                <label className="block text-sm font-bold text-gray-700 text-center mb-4">
                  2. Selecciona la Hora
                </label>
                
                {isLoadingSlots ? (
                  <div className="text-center py-4 text-sm text-stone-500 animate-pulse font-medium">
                    Calculando espacios disponibles...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 text-sm font-semibold rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'bg-stone-800 text-white border-stone-800 shadow-md scale-105'
                            : 'bg-white text-stone-600 border-gray-200 hover:border-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 px-2 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 text-sm font-medium">
                    No hay espacios libres este día para la duración de este tratamiento. Por favor, elige otra fecha.
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN Y AVISO DE REVISIÓN: Ocupa toda la base de la grilla */}
        <div className="lg:col-span-2 pt-6">

          {/* ========================================================================
              BLOQUE INFORMATIVO DE TRIAGE:
              ======================================================================== */}      
          {selectedTime && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl max-w-xl mx-auto shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {/* Icono de información sutil */}
                  <svg className="h-5 w-5 text-[var(--color-zoe-blue)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-blue-900 font-medium">
                  Al reservar su turno debe completar la <span className="font-bold">ficha estética clínica</span> para su posterior revisión y aprobación. Una vez que sea aprobada, podremos confirmar el turno solicitado.
                </p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || !selectedTime} // Desactivado si falta la hora
            className={`w-full max-w-xl mx-auto block py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all shadow-md
              ${(isSubmitting || !selectedTime)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-stone-800 hover:bg-stone-900 active:scale-[0.98] shadow-stone-200'
              }`}
          >
            {/* Mensaje de carga acorde al nuevo flujo */}
            {isSubmitting ? 'Procesando reserva...' : 'Confirmar y Reservar'}
          </button>
        </div>

      </form>
    </div>
  );
}