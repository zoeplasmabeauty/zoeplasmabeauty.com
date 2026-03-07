/**
 * ARCHIVO: src/components/sections/FAQ.tsx
 * ARQUITECTURA: Componente de Cliente (Sección de Landing Page)
 * * PROPÓSITO ESTRATÉGICO:
 * Reducir la fricción y la ansiedad pre-compra del paciente.
 * Al resolver dudas comunes sobre dolor, recuperación y seguridad justo antes
 * del formulario de reserva, aumentamos drásticamente la tasa de conversión.
 * * RESPONSABILIDADES:
 * 1. Presentación interactiva: Utiliza un patrón de "Acordeón" para mantener 
 * la interfaz limpia sin abrumar al usuario con paredes de texto.
 * 2. Accesibilidad: Permite abrir y cerrar respuestas de forma fluida.
 */

'use client';

import { useState } from 'react';

export default function FAQ() {
  // Estado para rastrear qué pregunta está abierta actualmente.
  // Usamos el índice (number) o null si todas están cerradas.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Diccionario de Preguntas y Respuestas
  const faqs = [
    {
      question: "¿Cuánto tiempo debo esperar entre sesiones?",
      answer: "El tiempo entre sesiones depende de la evolución de la piel y del tipo de tratamiento realizado. Generalmente se recomienda esperar varias semanas para permitir que la piel complete su proceso natural de regeneración."
    },
    {
      question: "¿Qué cuidados debo tener después del tratamiento?",
      // Usamos un array mixto o HTML estructurado para la lista de cuidados
      answer: (
        <>
          <p className="mb-2">Después del procedimiento se indican cuidados específicos para favorecer una correcta recuperación de la piel. Estas indicaciones son personalizadas, ya que pueden variar según el tipo de piel, la zona tratada y la respuesta individual de cada paciente. De forma general se recomienda:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-[var(--color-zoe-muted)]">
            <li>Evitar manipular o retirar las costras.</li>
            <li>Evitar la exposición directa al sol durante el proceso de recuperación.</li>
            {/* Nota: Autocompleté la oración cortada para mantener la coherencia clínica */}
            <li>Utilizar protector solar de forma estricta y constante.</li>
          </ul>
        </>
      )
    },
    {
      question: "¿Es un tratamiento seguro?",
      answer: "Cuando es realizado por un profesional capacitado y siguiendo los protocolos adecuados, el Plasma Fibroblast es un procedimiento estético seguro. Además, antes de cada tratamiento se realiza una evaluación para verificar que el paciente sea apto para el procedimiento."
    },
    {
      question: "¿El tratamiento es doloroso?",
      // Nota: Autocompleté la oración cortada
      answer: "Para mayor comodidad del paciente utilizamos anestesia tópica de alta calidad, formulada para procedimientos estéticos avanzados. A diferencia de anestesias convencionales utilizadas en tratamientos superficiales, esta formulación permite lograr una mayor profundidad y duración del efecto anestésico, lo que ayuda a reducir significativamente las molestias durante el procedimiento. Gracias a esto, la mayoría de los pacientes describe la experiencia como muy tolerable."
    },
    {
      question: "¿Cuánto dura la recuperación?",
      answer: (
        <>
          <p className="mb-2">El tiempo de recuperación puede variar según la zona tratada y la respuesta individual de cada piel, pero generalmente el proceso inicial dura entre 5 y 10 días. Durante este período se presenta:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2 mb-3 text-[var(--color-zoe-muted)]">
            <li>Inflamación durante los primeros días.</li>
            <li>Pequeñas costras superficiales que forman parte del proceso normal de regeneración.</li>
            <li>Una coloración rosada, más clara o tono café claro en la piel una vez que las costras se desprenden.</li>
          </ul>
          <p>Estas manifestaciones son temporales y forman parte del proceso natural de reparación cutánea. Para favorecer una correcta recuperación, se brindan indicaciones personalizadas de cuidado que el paciente debe seguir durante los días posteriores al tratamiento.</p>
        </>
      )
    }
  ];

  // Función manejadora del click en el acordeón
  const toggleFAQ = (index: number) => {
    // Si hace click en la que ya está abierta, la cierra. Si no, abre la nueva.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-6 py-24 bg-white" id="preguntas-frecuentes">
      <div className="mx-auto max-w-4xl">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
            Resolviendo tus dudas
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-5xl">
            Preguntas <span className="text-[var(--color-zoe-blue)]">Frecuentes</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--color-zoe-blue)]"></div>
        </div>

        {/* CONTENEDOR DEL ACORDEÓN */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`border rounded-2xl transition-all duration-300 ${isOpen ? 'border-[var(--color-zoe-blue)]/30 bg-blue-50/30 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
              >
                {/* BOTÓN PREGUNTA */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-[var(--color-zoe-blue)]' : 'text-[var(--color-zoe-dark)]'}`}>
                    {faq.question}
                  </span>
                  
                  {/* ICONO DE EXPANSIÓN (+ / -) */}
                  <span className="ml-4 flex-shrink-0 text-[var(--color-zoe-blue)]">
                    <svg
                      className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </span>
                </button>

                {/* CONTENEDOR RESPUESTA (Animación de altura) */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-base leading-relaxed text-[var(--color-zoe-muted)] border-t border-gray-100/50 mt-2">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}