/**
 * ARCHIVO: src/components/TriageForm.tsx
 * ARQUITECTURA: Componente de Cliente (React)
 * * PROPÓSITO ESTRATÉGICO:
 * Renderizar la Anamnesis (Ficha Clínica) del paciente, consolidando el Paso 2 
 * del embudo de ventas y mitigando riesgos legales/médicos.
 * Incluye un "Roadmap de Tranquilidad" interactivo al finalizar y un 
 * temporizador de urgencia inquebrantable basado en la fecha de la base de datos.
 * * RESPONSABILIDADES:
 * 1. Presentación de Datos Base: Mostrar la información del Paso 1 (Solo lectura).
 * 2. Recolección Estricta: Manejar el estado de decenas de variables médicas.
 * 3. Orquestación: Enviar el paquete completo a la nueva API de Fichas Médicas.
 * 4. Urgencia UX: Mostrar un reloj regresivo estricto para forzar la conversión.
 */

'use client';

// Importamos useEffect para manejar el temporizador de redirección
import { useState, useEffect } from 'react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
// Importamos useRouter para mover al usuario programáticamente
import { useRouter } from 'next/navigation';

// Definición de las propiedades que nos inyecta el Servidor
interface InitialData {
  appointmentId: string;
  appointmentDate: string;
  serviceName: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  createdAt: string; // INYECCIÓN: Fecha absoluta de creación del turno para el reloj maestro
}

export default function TriageForm({ initialData }: { initialData: InitialData }) {
  // Instanciamos el enrutador de Next.js
  const router = useRouter();

  // 1. FORMATEO DE FECHAS PARA VISUALIZACIÓN
  const rawDate = parseISO(initialData.appointmentDate);
  const displayDate = format(rawDate, 'dd/MM/yyyy');
  const displayTime = format(rawDate, 'HH:mm');

  // ============================================================================
  // LÍMITES DE CALENDARIO (Validación estricta de 4 dígitos y rango de 100 años)
  // Calculamos la fecha de hoy y la fecha de hace exactamente 100 años
  // ============================================================================
  const today = new Date();
  const maxDateStr = today.toISOString().split('T')[0]; // Ej: "2026-03-04" (No permite fechas futuras)
  
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const minDateStr = minDate.toISOString().split('T')[0]; // Ej: "1926-03-04" (Límite histórico de 100 años)

  // 2. ESTADOS DE TRANSACCIÓN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================================
  // MOTOR DE TIEMPO: RELOJ REGRESIVO INQUEBRANTABLE
  // Calcula el tiempo restante desde la creación del turno en BD, no desde que carga la página
  // ============================================================================
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutos por defecto
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    // Si la ficha ya fue enviada con éxito, detenemos el reloj
    if (submitStatus === 'success') return;

    const calculateTimeLeft = () => {
      const createdDate = parseISO(initialData.createdAt);
      // El límite real del CRON es 20 minutos (1200 segundos)
      const expirationDate = new Date(createdDate.getTime() + 20 * 60 * 1000); 
      const now = new Date();
      const secondsRemaining = differenceInSeconds(expirationDate, now);

      if (secondsRemaining <= 0) {
        setIsTimeUp(true);
        setTimeLeft(0);
      } else {
        setTimeLeft(secondsRemaining);
      }
    };

    // Calculamos inmediatamente al montar
    calculateTimeLeft();

    // Actualizamos cada segundo
    const intervalId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(intervalId); // Limpieza de memoria
  }, [initialData.createdAt, submitStatus]); // Dependencias

  // Formateador visual del reloj (mm:ss)
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  // ============================================================================

  // 3. ESTADO GLOBAL DEL FORMULARIO MÉDICO (Cubre Secciones 2 a 7)
  const [formData, setFormData] = useState({
    // Extras Sección 2
    dob: '',
    address: '',
    instagram: '',
    howFoundUs: '',
    // Sección 3: Antecedentes
    hasDisease: 'no',
    diseaseDetails: '',
    recentSurgery: '',
    coagulationDisorder: 'no',
    takesMedication: 'no',
    medicationDetails: '',
    allergies: '',
    // Sección 4: Cutánea
    skinType: '',
    usesRetinoids: 'no',
    retinoidsDetails: '',
    usesSunscreen: 'no',
    // Sección 5: Hábitos
    smokes: 'no',
    drinksAlcohol: 'no',
    // Sección 6: Hormonal
    pregnantNursing: 'no',
    lastMenstrualCycle: '', // Guarda un string en formato YYYY-MM-DD
    contraceptive: '',
    // Sección 7: Estética y Riesgos
    recentAestheticTreatments: 'no',
    treatmentDetails: '',
    contraindications: [] as string[], // Array para múltiples checkboxes
    consentGiven: false,
  });

  // Manejador para los Checkboxes de Contraindicaciones (Añade o quita del array)
  const handleContraindicationChange = (item: string) => {
    setFormData((prev) => {
      const exists = prev.contraindications.includes(item);
      if (exists) {
        return { ...prev, contraindications: prev.contraindications.filter((i) => i !== item) };
      } else {
        return { ...prev, contraindications: [...prev.contraindications, item] };
      }
    });
  };

  // 4. MANEJADOR DE ENVÍO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setErrorMessage('Debes aceptar el consentimiento informado para continuar.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // AQUÍ enviaremos los datos a la nueva ruta API que crearemos: /api/turnos/ficha
      const res = await fetch('/api/turnos/ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: initialData.appointmentId,
          ...formData
        })
      });

      if (!res.ok) throw new Error('Ocurrió un error al guardar tu ficha.');
      
      setSubmitStatus('success');
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  // EFECTO DE REDIRECCIÓN AUTOMÁTICA (Temporizador de 15 segundos)
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        router.push('/');
      }, 45000); // 45000 milisegundos = 45 segundos

      // Limpieza de memoria si el usuario hace clic en el botón antes de que acabe el tiempo
      return () => clearTimeout(timer);
    }
  }, [submitStatus, router]);


  // ============================================================================
  // PANTALLA DE BLOQUEO POR TIEMPO EXPIRADO
  // Si el cron ya eliminó o está por eliminar el turno, no permitimos el envío
  // ============================================================================
  if (isTimeUp && submitStatus !== 'success') {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl border border-red-100">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-stone-800">Tiempo Expirado</h3>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Por motivos de seguridad y organización de agenda, tu solicitud de turno ha sido liberada porque excedió el tiempo máximo (60 min) para completar la Ficha Médica.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-md"
        >
          Volver a solicitar un turno
        </button>
      </div>
    );
  }


  // 5. PANTALLA DE ÉXITO (El "Roadmap de Tranquilidad")
  if (submitStatus === 'success') {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* INYECCIÓN DE ESTILOS: Animación pura en CSS para la barra de progreso */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shrinkProgressBar {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}} />

        {/* Barra de progreso superior sutil */}
        <div 
          className="absolute top-0 left-0 h-1 bg-[var(--color-zoe-blue)]" 
          style={{ animation: 'shrinkProgressBar 45s linear forwards' }}
        ></div>

        {/* Icono de Check Animado (Minimalista) */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="mb-2 text-3xl font-light text-stone-800">Ficha <span className="font-semibold text-[var(--color-zoe-blue)]">Completada</span></h3>
        <p className="text-stone-500 mb-8 text-sm">Tu solicitud de tratamiento está ahora en manos de nuestro equipo.</p>
        
        {/* TIMELINE VISUAL (Roadmap) */}
        <div className="bg-stone-50 rounded-2xl p-6 text-left mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">✓</div>
            <p className="text-sm font-semibold text-stone-700">Paso 1 y 2: Solicitud y Ficha enviadas</p>
          </div>
          <div className="flex items-center gap-4 opacity-80">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[var(--color-zoe-blue)] text-xs font-bold shadow-inner">⏳</div>
            <p className="text-sm font-semibold text-stone-700">Revisión médica (En proceso - 6/12hs)</p>
          </div>
          <div className="flex items-center gap-4 opacity-50">
            <div className="h-6 w-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold">💳</div>
            <p className="text-sm font-semibold text-stone-700">Confirmación y link de pago (Pendiente)</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-zoe-mint)]/20 border border-[var(--color-zoe-mint)]/40 rounded-xl text-sm text-[var(--color-zoe-dark)] font-medium mb-8">
          Te enviaremos un correo a <strong>{initialData.email}</strong> en cuanto el equipo apruebe tu perfil.
        </div>

        {/* BOTONES DE ACCIÓN DUAL */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => router.push('/')}
            className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-md"
          >
            Volver al Inicio
          </button>
          <a 
            href="https://wa.me/5491133850211" // Enlace genérico de WhatsApp a tu número
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 bg-white text-stone-600 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            Tengo una duda
          </a>
        </div>
        
        <p className="text-xs text-stone-400 mt-6">Serás redirigido automáticamente en unos segundos...</p>
      </div>
    );
  }

  // 6. RENDERIZADO DEL FORMULARIO GIGANTE
  return (
    <div className="mx-auto max-w-4xl bg-white p-6 md:p-12 rounded-3xl shadow-lg border border-gray-100 relative">
      
      {/* ====================================================================
          INYECCIÓN VISUAL: El Reloj Maestro (Sticky en escritorio)
          ==================================================================== */}
      <div className={`sticky top-4 z-40 mx-auto max-w-sm flex items-center justify-center gap-3 px-6 py-3 mb-8 rounded-full border shadow-sm backdrop-blur-md transition-colors duration-500
        ${timeLeft <= 600 ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 
          timeLeft <= 1800 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
          'bg-stone-50 border-stone-200 text-stone-700'}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold tracking-widest font-mono text-lg">{formatTime(timeLeft)}</span>
        <span className="text-xs font-semibold uppercase opacity-80">restantes</span>
      </div>


      <div className="mb-8 border-b pb-6 text-center">
        <h2 className="text-3xl font-light text-stone-800">Ficha Clínica y <span className="font-semibold text-[var(--color-zoe-blue)]">Anamnesis</span></h2>
        <p className="mt-2 text-sm text-stone-500">Paso 2 de 2: Seguridad y Evaluación del Paciente</p>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 text-center font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* =========================================================
            SECCIÓN 1 y 2: DATOS BLOQUEADOS (Vienen de la BD)
            ========================================================= */}
        <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
          <h3 className="mb-4 text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
            Datos del Turno y Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
            <div><span className="font-semibold block text-stone-800">Tratamiento:</span> {initialData.serviceName}</div>
            <div><span className="font-semibold block text-stone-800">Fecha y Hora:</span> {displayDate} a las {displayTime} hs</div>
            <div><span className="font-semibold block text-stone-800">Paciente:</span> {initialData.fullName}</div>
            <div><span className="font-semibold block text-stone-800">DNI:</span> {initialData.dni}</div>
            <div><span className="font-semibold block text-stone-800">WhatsApp:</span> {initialData.phone}</div>
            <div><span className="font-semibold block text-stone-800">Email:</span> {initialData.email}</div>
          </div>
        </div>

        {/* =========================================================
            SECCIÓN 2B: DATOS PERSONALES RESTANTES
            ========================================================= */}
        <section>
          <h3 className="mb-6 text-lg font-semibold text-stone-800 border-b pb-2">Información Adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Fecha de Nacimiento</label>
              {/* Atributos min y max aplicados aquí */}
              <input 
                type="date" 
                required 
                min={minDateStr} 
                max={maxDateStr}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-zoe-blue)] bg-gray-50/50" 
                value={formData.dob} 
                onChange={e => setFormData({...formData, dob: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Usuario de Instagram</label>
              <input type="text" placeholder="@usuario" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-zoe-blue)] bg-gray-50/50" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Domicilio Completo</label>
              <input type="text" required placeholder="Calle, Número, Localidad" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-zoe-blue)] bg-gray-50/50" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">¿Cómo nos conociste?</label>
              <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-zoe-blue)] bg-gray-50/50" value={formData.howFoundUs} onChange={e => setFormData({...formData, howFoundUs: e.target.value})}>
                <option value="" disabled>Selecciona una opción...</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Recomendacion">Recomendación Personal</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECCIÓN 3: ANTECEDENTES DE SALUD
            ========================================================= */}
        <section>
          <h3 className="mb-6 text-lg font-semibold text-stone-800 border-b pb-2">Antecedentes de Salud</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-sm font-semibold text-gray-600">¿Presenta alguna enfermedad actual?</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.hasDisease} onChange={e => setFormData({...formData, hasDisease: e.target.value})}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
              {formData.hasDisease === 'si' && (
                <input type="text" required placeholder="¿Cuál?" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={formData.diseaseDetails} onChange={e => setFormData({...formData, diseaseDetails: e.target.value})} />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">¿Tuvo alguna cirugía reciente?</label>
              <input type="text" placeholder="Detalle si aplica, o deje en blanco" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.recentSurgery} onChange={e => setFormData({...formData, recentSurgery: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <label className="text-sm font-semibold text-gray-600">¿Trastornos de coagulación?</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.coagulationDisorder} onChange={e => setFormData({...formData, coagulationDisorder: e.target.value})}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-sm font-semibold text-gray-600">¿Toma medicación actualmente?</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.takesMedication} onChange={e => setFormData({...formData, takesMedication: e.target.value})}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
              {formData.takesMedication === 'si' && (
                <input type="text" required placeholder="¿Cuál?" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={formData.medicationDetails} onChange={e => setFormData({...formData, medicationDetails: e.target.value})} />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">¿Alergias conocidas?</label>
              <input type="text" placeholder="Ej: Penicilina, látex, anestesia..." className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
            </div>
          </div>
        </section>

        {/* =========================================================
            SECCIÓN 4 y 5: CUTÁNEA Y HÁBITOS
            ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section>
            <h3 className="mb-6 text-lg font-semibold text-stone-800 border-b pb-2">Evaluación Cutánea</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Tipo de Piel</label>
                <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.skinType} onChange={e => setFormData({...formData, skinType: e.target.value})}>
                  <option value="" disabled>Selecciona...</option>
                  <option value="Seca">Seca</option>
                  <option value="Mixta">Mixta</option>
                  <option value="Grasa">Grasa</option>
                  <option value="Sensible">Sensible</option>
                  <option value="Reactiva">Reactiva</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">¿Usa retinoides o ácidos exfoliantes?</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50 mb-2" value={formData.usesRetinoids} onChange={e => setFormData({...formData, usesRetinoids: e.target.value})}>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
                {formData.usesRetinoids === 'si' && (
                  <input type="text" required placeholder="¿Cuáles?" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={formData.retinoidsDetails} onChange={e => setFormData({...formData, retinoidsDetails: e.target.value})} />
                )}
                <p className="text-xs text-stone-500 mt-1">* Se recomienda traer su rutina habitual el día del turno.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">¿Usa protector solar diariamente?</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.usesSunscreen} onChange={e => setFormData({...formData, usesSunscreen: e.target.value})}>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-6 text-lg font-semibold text-stone-800 border-b pb-2">Hábitos y Salud Hormonal</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-600">¿Fuma?</label>
                <select className="px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.smokes} onChange={e => setFormData({...formData, smokes: e.target.value})}>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-600">¿Consume alcohol?</label>
                <select className="px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.drinksAlcohol} onChange={e => setFormData({...formData, drinksAlcohol: e.target.value})}>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-600">¿Está embarazada/amamantando?</label>
                <select className="px-4 py-2 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.pregnantNursing} onChange={e => setFormData({...formData, pregnantNursing: e.target.value})}>
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Fecha del último ciclo menstrual</label>
                {/* Atributos min y max aplicados aquí también */}
                <input 
                  type="date" 
                  min={minDateStr}
                  max={maxDateStr}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-zoe-blue)] bg-gray-50/50" 
                  value={formData.lastMenstrualCycle} 
                  onChange={e => setFormData({...formData, lastMenstrualCycle: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Método anticonceptivo</label>
                <input type="text" placeholder="Si aplica" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.contraceptive} onChange={e => setFormData({...formData, contraceptive: e.target.value})} />
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            SECCIÓN 7: ANTECEDENTES ESTÉTICOS Y CONTRAINDICACIONES
            ========================================================= */}
        <section>
          <h3 className="mb-6 text-lg font-semibold text-stone-800 border-b pb-2">Antecedentes Estéticos y Precauciones</h3>
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-600 mb-2">¿Realizó tratamientos estéticos recientes?</label>
            <select className="w-full md:w-1/3 px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50 mb-4" value={formData.recentAestheticTreatments} onChange={e => setFormData({...formData, recentAestheticTreatments: e.target.value})}>
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
            {formData.recentAestheticTreatments === 'si' && (
              <input type="text" required placeholder="Detallar tratamientos..." className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50" value={formData.treatmentDetails} onChange={e => setFormData({...formData, treatmentDetails: e.target.value})} />
            )}
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-8">
            <h4 className="text-red-800 font-bold mb-4">Contraindicaciones Médicas</h4>
            <p className="text-sm text-red-600 mb-4">En caso de presentar alguna de las siguientes, debes marcarla para informar al especialista antes de que apruebe tu tratamiento:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Herpes activo o recurrente", "Infecciones cutáneas", "Tratamientos estéticos recientes", 
                "Piel bronceada o sensibilizada", "Uso de anticoagulantes", "Enfermedades autoinmunes", 
                "Cuadro viral reciente o fiebre", "Medicación oral fotosensibilizante", "Diabetes no controlada", 
                "Tendencia a mala cicatrización", "Enfermedades cardíacas", "Uso de marcapasos", 
                "Enfermedades en fase aguda", "Hipertensión arterial no controlada", "Alergia a anestésicos tópicos", 
                "Heridas abiertas en zona", "Presencia de tumores", "Tuberculosis", 
                "Prótesis metálicas en zona", "Fototipos altos (Piel oscura)"
              ].map((item) => (
                <label key={item} className="flex items-start space-x-3 text-sm text-stone-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-zoe-blue)] focus:ring-[var(--color-zoe-blue)]"
                    checked={formData.contraindications.includes(item)}
                    onChange={() => handleContraindicationChange(item)}
                  />
                  <span className="leading-tight">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CONSENTIMIENTO INFORMADO (Obligatorio) */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <label className="flex items-start space-x-4 cursor-pointer">
              <input 
                type="checkbox" 
                required
                className="mt-1 h-5 w-5 rounded border-gray-300 text-stone-800 focus:ring-stone-800"
                checked={formData.consentGiven}
                onChange={(e) => setFormData({...formData, consentGiven: e.target.checked})}
              />
              <span className="text-sm text-stone-700 leading-relaxed">
                <strong>Consentimiento Informado:</strong> Declaro que la información proporcionada es verdadera y completa. 
                He sido informado/a sobre las características del tratamiento estético seleccionado, sus cuidados previos 
                y posteriores, y autorizo su realización dentro del ámbito estético no médico.
              </span>
            </label>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={isSubmitting || !formData.consentGiven}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all shadow-md
            ${(isSubmitting || !formData.consentGiven)
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-stone-800 hover:bg-stone-900 active:scale-[0.98]'
            }`}
        >
          {isSubmitting ? 'Enviando Ficha Clínica...' : 'Firmar y Enviar Ficha'}
        </button>

      </form>
    </div>
  );
}