/**
 * ARCHIVO: src/components/BookingForm.tsx
 * ARQUITECTURA: Componente de Cliente (React/Next.js)
 * PROPÓSITO: Gestionar la reserva de turnos estética. 
 * RESPONSABILIDADES:
 * 1. Recolección de datos (Nombre, DNI, WhatsApp, Email).
 * 2. Validación de reglas de negocio (Bloqueo de domingos y fechas pasadas, validación de inputs).
 * 3. Comunicación con la API de turnos y la API de Disponibilidad.
 * 4. UX Responsiva: Evita el solapamiento visual mediante una grilla expandida.
 * 5. Redirección automática a pasarela de cobro (Mercado Pago).
 */

'use client'; // Directiva estricta: Este código corre en el navegador del paciente.

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definición de tipos para TypeScript basado en tu base de datos
interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

export default function BookingForm() {
  // 1. ESTADOS DE LA INTERFAZ (UI STATE)
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  // Estados para manejar la cuadrícula de horarios dinámicos
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // 2. ESTADOS DEL FORMULARIO (DATA STATE)
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
  // 4.5. RADAR DE DISPONIBILIDAD (ESCUCHA DE CALENDARIO Y SERVICIO)
  // Se dispara automáticamente cada vez que el usuario cambia el día o el tratamiento.
  // ============================================================================
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

    // NUEVA VALIDACIÓN LÓGICA: Auditoría estricta de longitud para el DNI.
    // Como el input ya bloquea letras, solo evaluamos la cantidad de caracteres.
    if (formData.dni.length < 7 || formData.dni.length > 9) {
      setErrorMessage('El DNI debe contener entre 7 y 9 números.');
      return;
    }

    // NUEVA VALIDACIÓN LÓGICA: Prevención de campos vacíos tras la limpieza de caracteres.
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
        serviceId: selectedServiceId,
        appointmentDate: appointmentDate
      };

      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Agregamos checkoutUrl a la interfaz esperada
      const result = (await res.json()) as { error?: string, checkoutUrl?: string };

      if (!res.ok) {
        throw new Error(result.error || 'Error desconocido en el servidor');
      }

      // ========================================================================
      // REDIRECCIÓN AUTOMÁTICA A LA BÓVEDA DE MERCADO PAGO
      // ========================================================================
      if (result.checkoutUrl) {
        // Saltamos directamente al cobro
        window.location.href = result.checkoutUrl;
        
        // Dejamos la función aquí. El navegador ya está cargando la nueva URL.
        // No cambiamos setIsSubmitting a false para que el botón siga diciendo "Confirmando..." 
        // y el paciente no haga doble clic.
        return; 
      }

      // FALLBACK DE SEGURIDAD: Si por alguna razón Mercado Pago no devolvió URL, 
      // actuamos como antes y mostramos el éxito manual.
      setSubmitStatus('success');
      // Limpiamos el formulario tras un éxito rotundo
      setFormData({ fullName: '', phone: '', dni: '', email: '' });
      setSelectedDate(undefined);
      setSelectedTime(''); // Limpiamos la hora
      setSelectedServiceId('');
      setIsSubmitting(false);

    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message);
      setIsSubmitting(false); // Liberamos el botón si hubo un fallo
    }
  };

  // 6. RENDERIZADO CONDICIONAL DE ÉXITO (Fallback)
  if (submitStatus === 'success') {
    return (
      <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-2xl font-semibold text-green-800 mb-2">¡Turno Solicitado!</h3>
        <p className="text-green-700">
          Hemos registrado tu solicitud correctamente. Te hemos enviado un correo con las instrucciones y nos contactaremos por WhatsApp pronto.
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

      {/* AJUSTE DE GRIDS: Separación aumentada (gap-12) para evitar que el calendario toque los inputs */}
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
                // ATRIBUTOS HTML NATIVOS: Bloquean el ingreso más allá de 9 caracteres por defecto.
                minLength={7}
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-gray-50/50"
                value={formData.dni}
                onChange={(e) => {
                  // MODIFICACIÓN UX: replace(/\D/g, '') intercepta lo que el usuario tipea y elimina
                  // instantáneamente cualquier cosa que no sea un dígito numérico.
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
                  // MODIFICACIÓN UX: Al igual que el DNI, limpiamos espacios, símbolos (+, -) o letras,
                  // forzando un string limpio de puros números para la base de datos.
                  const soloNumeros = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, phone: soloNumeros});
                }}
                placeholder="Ej: 1112345678"
              />
            </div>
          </div>

          {/* NUEVO: Campo de Email para notificaciones profesionales */}
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

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Tratamiento de Interés</label>
            <select 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition bg-white"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={isLoadingServices}
            >
              <option value="" disabled>Selecciona un servicio...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>
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

        {/* BOTÓN DE ACCIÓN: Ocupa toda la base de la grilla */}
        <div className="lg:col-span-2 pt-6">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedTime} // Desactivado si falta la hora
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all shadow-md
              ${(isSubmitting || !selectedTime)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-stone-800 hover:bg-stone-900 active:scale-[0.98] shadow-stone-200'
              }`}
          >
            {isSubmitting ? 'Conectando con pasarela de pago...' : 'Abonar Seña de $50000 y Agendar'}
          </button>
        </div>

      </form>
    </div>
  );
}