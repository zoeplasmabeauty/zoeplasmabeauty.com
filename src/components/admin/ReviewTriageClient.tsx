/**
 * ARCHIVO: src/components/admin/ReviewTriageClient.tsx
 * ARQUITECTURA: Componente de Cliente (React/Next.js)
 * * PROPÓSITO ESTRATÉGICO:
 * Renderizar el expediente clínico unificado de un paciente. 
 * Permite al administrador tomar la decisión de Aprobar (generando el cobro) 
 * o Rechazar (cancelando el turno) basándose en factores de riesgo médico.
 * Rechazo Médico interactivo, permitiendo al administrador redactar el motivo
 * específico por el cual el paciente no es apto.
 * * RESPONSABILIDADES:
 * 1. Formateo Condicional: Resaltar en rojo alertas médicas graves (Alergias, Enfermedades).
 * 2. Deserialización: Convertir el string JSON de contraindicaciones en una lista legible.
 * 3. Orquestación de Decisión: Comunicarse con la API para ejecutar la aprobación o el rechazo.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

// Definimos la estructura gigante que nos envía el Servidor
interface ExpedienteProps {
  appointmentId: string;
  appointmentDate: string;
  status: string;
  serviceName: string;
  servicePrice: number;
  patientName: string;
  patientDni: string;
  patientPhone: string;
  patientEmail: string;
  patientDob: string | null;
  patientAddress: string | null;
  patientInstagram: string | null;
  patientHowFoundUs: string | null;
  hasDisease: boolean;
  diseaseDetails: string | null;
  recentSurgery: string | null;
  coagulationDisorder: boolean;
  takesMedication: boolean;
  medicationDetails: string | null;
  allergies: string | null;
  skinType: string;
  usesRetinoids: boolean;
  retinoidsDetails: string | null;
  usesSunscreen: boolean;
  smokes: boolean;
  drinksAlcohol: boolean;
  pregnantNursing: boolean;
  lastMenstrualCycle: string | null;
  contraceptive: string | null;
  recentAestheticTreatments: boolean;
  treatmentDetails: string | null;
  contraindications: string | null;
  consentGiven: boolean;
}

export default function ReviewTriageClient({ expediente }: { expediente: ExpedienteProps }) {
  const router = useRouter();
  
  // ESTADOS DE TRANSACCIÓN
  // Usamos un string para saber qué botón está cargando específicamente
  const [isProcessing, setIsProcessing] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [error, setError] = useState('');

  // ESTADOS DEL MODAL DE RECHAZO
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 1. FORMATEO DE DATOS
  const rawDate = parseISO(expediente.appointmentDate);
  const displayDate = format(rawDate, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const displayTime = format(rawDate, 'HH:mm');

  // Parseamos las contraindicaciones (vienen como JSON string desde SQLite)
  let contraindicationsList: string[] = [];
  try {
    contraindicationsList = JSON.parse(expediente.contraindications || '[]');
  } catch (e) {
    console.error("Error parseando contraindicaciones");
  }

  // 2. MOTOR DE DECISIÓN (Aprobar o Rechazar)
  // Añadimos reason como parámetro opcional para inyectarlo en el payload
  const handleDecision = async (action: 'approve' | 'reject', reason?: string) => {
    
    // Si es aprobar, mantenemos el confirm original
    if (action === 'approve') {
      const confirmMessage = `¿Estás seguro de APROBAR a ${expediente.patientName}? Se le enviará el enlace de pago.`;
      if (!window.confirm(confirmMessage)) return;
    }

    setIsProcessing(action);
    setError('');

    try {
      // Llamamos a la API maestra de procesamiento
      const res = await fetch('/api/admin/turnos/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: expediente.appointmentId,
          action: action,
          rejectionReason: reason // Inyectamos el motivo (si existe) para que la API lo lea
        })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Error procesando la decisión.');
      }

      // ÉXITO: Redirigimos al panel de control y forzamos refresco
      router.push('/admin/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
      setIsProcessing('idle');
      setIsRejectModalOpen(false); // Cerramos el modal si hubo error para no bloquear la pantalla
    }
  };

  // Función puente para ejecutar el rechazo desde el Modal
  const executeRejection = () => {
    if (rejectionReason.trim().length < 10) {
      alert("Por favor, escribe un motivo médico claro y detallado.");
      return;
    }
    handleDecision('reject', rejectionReason.trim());
  };

  // 3. COMPONENTES VISUALES DE APOYO (UX Defensiva)
  // Función para renderizar respuestas de Sí/No con colores de alerta
  const RenderBooleanWarning = ({ value, label, details }: { value: boolean, label: string, details?: string | null }) => {
    if (!value) return <div className="text-sm text-stone-600"><span className="font-semibold">{label}:</span> No</div>;
    
    return (
      <div className="text-sm bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 mb-2">
        <span className="font-bold flex items-center gap-2">
          ⚠️ {label}: SÍ
        </span>
        {details && <div className="mt-1 ml-6 text-red-700 italic">Detalle: {details}</div>}
      </div>
    );
  };

  // 4. MOTOR GRÁFICO PRINCIPAL
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* CABECERA DEL EXPEDIENTE */}
      <div className="bg-stone-900 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light">
            Expediente de <span className="font-bold">{expediente.patientName}</span>
          </h2>
          <p className="text-stone-400 mt-1 capitalize">
            {displayDate} - {displayTime} hs | {expediente.serviceName}
          </p>
        </div>
        <Link 
          href="/admin/dashboard"
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-medium transition-colors border border-stone-700"
        >
          &larr; Volver al Panel
        </Link>
      </div>

      <div className="p-6 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-200 text-center">
            {error}
          </div>
        )}

        {/* GRILLA DE INFORMACIÓN MÉDICA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* COLUMNA IZQUIERDA: Demografía y Cutánea */}
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase border-b pb-2 mb-4">
                Datos Personales
              </h3>
              <ul className="space-y-3 text-sm text-stone-700">
                <li><strong className="text-stone-900">DNI:</strong> {expediente.patientDni}</li>
                <li><strong className="text-stone-900">WhatsApp:</strong> {expediente.patientPhone}</li>
                <li><strong className="text-stone-900">Email:</strong> {expediente.patientEmail}</li>
                <li><strong className="text-stone-900">Fecha Nacimiento:</strong> {expediente.patientDob || 'No indicado'}</li>
                <li><strong className="text-stone-900">Domicilio:</strong> {expediente.patientAddress || 'No indicado'}</li>
                <li><strong className="text-stone-900">Instagram:</strong> {expediente.patientInstagram || 'No indicado'}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase border-b pb-2 mb-4">
                Evaluación Cutánea
              </h3>
              <ul className="space-y-3 text-sm text-stone-700">
                <li><strong className="text-stone-900">Tipo de Piel:</strong> {expediente.skinType}</li>
                <li><strong className="text-stone-900">Uso de Protector Solar:</strong> {expediente.usesSunscreen ? 'Sí' : 'No'}</li>
              </ul>
              <div className="mt-3">
                <RenderBooleanWarning 
                  value={expediente.usesRetinoids} 
                  label="Usa Retinoides/Ácidos" 
                  details={expediente.retinoidsDetails} 
                />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase border-b pb-2 mb-4">
                Hábitos y Hormonas
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <RenderBooleanWarning value={expediente.smokes} label="Fuma" />
                <RenderBooleanWarning value={expediente.drinksAlcohol} label="Consume Alcohol" />
                <RenderBooleanWarning value={expediente.pregnantNursing} label="Embarazo/Lactancia" />
              </div>
              <ul className="space-y-2 text-sm text-stone-700">
                <li><strong className="text-stone-900">Ciclo Menstrual:</strong> {expediente.lastMenstrualCycle || 'N/A'}</li>
                <li><strong className="text-stone-900">Anticonceptivo:</strong> {expediente.contraceptive || 'N/A'}</li>
              </ul>
            </section>
          </div>

          {/* COLUMNA DERECHA: Riesgos Médicos y Decisión */}
          <div className="space-y-8">
            <section className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <h3 className="text-sm font-bold tracking-widest text-red-700 uppercase border-b border-red-200 pb-2 mb-4">
                Historial Médico (Riesgos)
              </h3>
              
              <div className="space-y-1 mb-4">
                <RenderBooleanWarning value={expediente.hasDisease} label="Enfermedad Actual" details={expediente.diseaseDetails} />
                <RenderBooleanWarning value={expediente.takesMedication} label="Toma Medicación" details={expediente.medicationDetails} />
                <RenderBooleanWarning value={expediente.coagulationDisorder} label="Trastornos de Coagulación" />
                <RenderBooleanWarning value={expediente.recentAestheticTreatments} label="Tratamientos Estéticos Recientes" details={expediente.treatmentDetails} />
              </div>

              <div className="mb-4">
                <strong className="text-sm text-stone-900 block mb-1">Cirugías Recientes:</strong>
                <div className="text-sm text-stone-700 bg-white p-2 rounded border border-stone-200">
                  {expediente.recentSurgery || 'Ninguna'}
                </div>
              </div>

              <div className="mb-4">
                <strong className="text-sm text-stone-900 block mb-1">Alergias Conocidas:</strong>
                <div className={`text-sm p-2 rounded border ${expediente.allergies ? 'bg-red-50 text-red-800 border-red-200 font-bold' : 'bg-white text-stone-700 border-stone-200'}`}>
                  {expediente.allergies ? `⚠️ ${expediente.allergies}` : 'Ninguna declarada'}
                </div>
              </div>

              {/* LISTA DE CONTRAINDICACIONES (CRÍTICO) */}
              <div>
                <strong className="text-sm text-stone-900 block mb-2">Contraindicaciones Seleccionadas por el Paciente:</strong>
                {contraindicationsList.length > 0 ? (
                  <ul className="space-y-2">
                    {contraindicationsList.map((item, idx) => (
                      <li key={idx} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded shadow-sm flex items-center gap-2">
                        <span>🛑</span> {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-green-50 text-green-700 border border-green-200 text-sm p-2 rounded font-medium flex items-center gap-2">
                    <span>✅</span> Ninguna contraindicación seleccionada
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ÁREA DE BOTONES DE DECISIÓN (Sticky al fondo o integrado abajo) */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
          
          {/* BOTÓN RECHAZAR - Abre el modal */}
          <button
            onClick={() => {
              setRejectionReason(''); // Limpiamos razón anterior
              setIsRejectModalOpen(true);
            }}
            disabled={isProcessing !== 'idle'}
            className={`px-8 py-4 rounded-xl font-bold transition-all
              ${isProcessing === 'reject' 
                ? 'bg-red-300 text-red-800 cursor-wait' 
                : isProcessing !== 'idle' 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed hidden sm:block'
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white'
              }`}
          >
            {isProcessing === 'reject' ? 'Cancelando Turno...' : 'Rechazar Paciente'}
          </button>

          {/* BOTÓN APROBAR */}
          <button
            onClick={() => handleDecision('approve')}
            disabled={isProcessing !== 'idle'}
            className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md
              ${isProcessing === 'approve' 
                ? 'bg-[var(--color-zoe-blue)]/70 text-white cursor-wait' 
                : isProcessing !== 'idle' 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed hidden sm:block'
                  : 'bg-stone-900 text-white hover:bg-[var(--color-zoe-blue)]'
              }`}
          >
            {isProcessing === 'approve' ? 'Generando Enlace de Pago...' : 'Aprobar y Enviar Cobro'}
          </button>
        </div>

      </div>

      {/* =========================================================
          MODAL DE RECHAZO MÉDICO (Flota por encima de la ficha)
          ========================================================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🛑</span>
              <h3 className="text-2xl font-bold text-red-700">Rechazo por Triage</h3>
            </div>
            
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Estás a punto de cancelar el turno de <strong>{expediente.patientName}</strong> debido a contraindicaciones médicas detectadas en su ficha. 
              Por favor, detalla el motivo. Este mensaje será enviado al paciente por correo electrónico junto a un botón de WhatsApp para que te contacte si tiene dudas.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-stone-800 mb-2">Motivo Clínico del Rechazo:</label>
              <textarea 
                className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 min-h-[120px] resize-none"
                placeholder="Ej: Detectamos que estás bajo tratamiento con anticoagulantes. Por tu seguridad, no podemos realizar el procedimiento en este momento..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isProcessing === 'reject'}
                className="px-5 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeRejection}
                disabled={isProcessing === 'reject' || rejectionReason.trim().length < 10}
                className={`px-6 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all
                  ${isProcessing === 'reject' || rejectionReason.trim().length < 10 
                    ? 'bg-red-300 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
              >
                {isProcessing === 'reject' ? 'Procesando...' : 'Confirmar Rechazo y Enviar Correo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}