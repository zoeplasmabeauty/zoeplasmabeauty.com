/**
 * ARCHIVO: src/components/admin/ReviewTriageClient.tsx
 * ARQUITECTURA: Componente de Cliente (React/Next.js)
 * * PROPÓSITO ESTRATÉGICO:
 * Renderizar el expediente clínico unificado de un paciente. 
 * Permite al administrador tomar la decisión de Aprobar (generando el cobro) 
 * o Rechazar (cancelando el turno) basándose en factores de riesgo médico.
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
  const handleDecision = async (action: 'approve' | 'reject') => {
    // Confirmación de seguridad para evitar clics accidentales graves
    const confirmMessage = action === 'approve' 
      ? `¿Estás seguro de APROBAR a ${expediente.patientName}? Se le enviará el enlace de pago.`
      : `¿Estás seguro de RECHAZAR a ${expediente.patientName}? Se cancelará el turno.`;
      
    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(action);
    setError('');

    try {
      // Llamamos a la API maestra de procesamiento (La construiremos en el siguiente paso)
      const res = await fetch('/api/admin/turnos/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: expediente.appointmentId,
          action: action
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
    }
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
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
          
          {/* BOTÓN RECHAZAR */}
          <button
            onClick={() => handleDecision('reject')}
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
    </div>
  );
}