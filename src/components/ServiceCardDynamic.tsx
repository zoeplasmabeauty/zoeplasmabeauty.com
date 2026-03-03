/**
 * ARCHIVO: src/components/ServiceCardDynamic.tsx
 * * ARQUITECTURA: Componente Interactivo (Cliente) y Presentacional Complejo.
 *
 * * PROPÓSITO ESTRATÉGICO:
 * Renderizar de forma independiente la tarjeta estática (UI) que ve el usuario 
 * al navegar, y controlar bajo la misma lógica el estado, flujo y despliegue del 
 * "Modal / Drawer" interactivo con el catálogo profundo (Información Expandida).
 * * RESPONSABILIDADES:
 * 1. Encapsulamiento de Estado: Contener la booleana (isOpen) de la apertura o cierre 
 * y gestionar la interacción con ella del usuario. 
 * 2. Accesibilidad y Escape: Prevenir interacciones subyacentes montando un "backdrop"
 * visual negro, y manejar el scroll suave al cierre de lectura.
 * * NOTA ARQUITECTÓNICA CRÍTICA:
 * Como este componente maneja hooks ('useState'), requiere imperativamente
 * compilarse del lado del cliente ('use client') y no debe bloquear renderización inicial.
 */

'use client'; 

import Image from "next/image";
import { useState } from "react";

// 1. CONTRATO DE INTERFAZ: 
// Modelamos el tipo exacto para el array de servicios, garantizando el intellisense.
interface ServiceModel {
  title: string;
  description: string;
  duration: string;
  tag: string | null;
  imageUrl: string;
  extended?: {
    fullDescription: string;
    result?: string; // Propiedad para aislar el "Resultado"
    benefits: string[];
    priceTable: { type: string; cost: string }[];
  }
}

export default function ServiceCardDynamic({ service }: { service: ServiceModel }) {
  // 2. GESTIÓN DE ESTADO (STATE): 
  // 'isDrawerOpen' define si el panel lateral está oculto o a la vista.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 3. EVENTO DE POST-LECTURA (Auto-Scroll y Cierre)
  const handleAgendarClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    // Primero, ocultamos el modal.
    setIsDrawerOpen(false);
    
    // Y tras el cierre, guiamos la experiencia hacia la transacción
    setTimeout(() => {
      const section = document.getElementById("agendar");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 150); // Mínimo retardo para permitir la animación de cierre.
  };

  return (
    <>
      {/* ==================================================================== */}
      {/* 4. FRONT-END: TARJETA BASE (Vista por Defecto) */}
      {/* ==================================================================== */}
      <div className="group relative flex flex-col items-stretch overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-zoe-blue)]/40 hover:bg-white hover:shadow-xl hover:shadow-[var(--color-zoe-blue)]/10 md:flex-row">
        
        {/* COLUMNA VISUAL: La Foto del Tratamiento */}
        <div className="relative w-full overflow-hidden md:w-2/5">
          <Image
            src={service.imageUrl}
            alt={`Tratamiento: ${service.title}`}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent md:bg-gradient-to-r md:from-transparent md:via-white/50 md:to-white"></div>
        </div>

        {/* COLUMNA DESCRIPTIVA: La Oferta Compacta */}
        <div className="relative z-10 flex w-full flex-col justify-between p-8 md:w-3/5">
          <div className="mb-6 flex justify-end">
            {service.tag && (
              <span className="rounded-full bg-[var(--color-zoe-blue)]/10 px-3 py-1 text-xs font-bold tracking-wider text-[var(--color-zoe-blue)] uppercase">
                {service.tag}
              </span>
            )}
          </div>

          <div className="mb-10 flex-grow">
            <h3 className="mb-4 text-3xl font-bold text-[var(--color-zoe-dark)] transition-colors group-hover:text-[var(--color-zoe-blue)]">
              {service.title}
            </h3>
            <p className="mb-6 text-base font-medium leading-relaxed text-[var(--color-zoe-muted)] uppercase">
              {service.description}
            </p>
            <div className="flex items-center justify-end gap-2 text-sm font-bold text-[var(--color-zoe-muted)] opacity-80">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duración aprox: {service.duration}
            </div>
          </div>

          {/* BOTÓN DISPARADOR DEL MODAL: Almacenado y configurado el Switch Local */}
          <div className="mt-auto border-t border-[var(--color-zoe-blue)]/10 pt-6">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex w-full items-center justify-end gap-3 text-base font-extrabold text-[var(--color-zoe-blue)] transition-colors hover:text-[#4375af]"
            >
              Ver más detalles
              <svg className="h-6 w-6 transform transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. BACK-END VISUAL: EL PANEL MODAL (Offcanvas/Drawer) */}
      {/* ==================================================================== */}
      {/* Este bloque solo renderiza en el DOM si el paciente oprimió "Ver Más" */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* CORTINA DE PROTECCIÓN (Backdrop): Evita acciones de fondo y clics fantasma */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDrawerOpen(false)} // Si hace click fuera, se cierra
          />

          {/* EL PANEL LATERAL DESLIZANTE (DRAWER) */}
          <div className="relative z-50 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto transform transition-transform animate-slide-in-right">
            
            {/* Cabecera del Drawer con Botón de Cierre "X" */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-[var(--color-zoe-dark)]">Detalles del Tratamiento</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Cerrar detalles"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido Extenso Inyectado dinámicamente */}
            <div className="p-6">
              <div className="mb-6 relative h-48 w-full rounded-2xl overflow-hidden">
                 <Image src={service.imageUrl} alt={service.title} fill className="object-cover" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-4">{service.title}</h3>
              
              <div className="prose prose-sm text-gray-600 mb-6">
                <p>{service.extended?.fullDescription || service.description}</p>
              </div>

              {/* SECCIÓN DE RESULTADO (Renderizado Condicional) */}
              {/* Esta sección se inyecta visualmente como una tarjeta destacada si el dato existe */}
              {service.extended?.result && (
                <div className="mb-8 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <h4 className="font-bold text-[var(--color-zoe-blue)] uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Resultado Esperado
                  </h4>
                  <p className="text-sm font-medium text-gray-700 italic">
                    "{service.extended.result}"
                  </p>
                </div>
              )}

              {/* LISTA DE BENEFICIOS (Renderizado Mapeado) */}
              {service.extended?.benefits && service.extended.benefits.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4 border-b pb-2">Zonas a mejorar</h4>
                  <ul className="space-y-3">
                    {service.extended.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-[var(--color-zoe-blue)] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* TABLA DE PRECIOS Y VARIACIONES (Renderizado Condicional) */}
              {service.extended?.priceTable && service.extended.priceTable.length > 0 && (
                <div className="mb-10">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4 border-b pb-2">Tiempos y Precios</h4>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                    {service.extended.priceTable.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm text-gray-600 pr-4">{item.type}</span>
                        <span className="font-bold text-[var(--color-zoe-blue)] whitespace-nowrap">{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BARRA INFERIOR (Footer Fijo) con el CTA Principal */}
            <div className="sticky bottom-0 border-t border-gray-100 bg-white p-6 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleAgendarClick}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-stone-800 hover:bg-stone-900 active:scale-[0.98] transition-all shadow-md"
              >
                Agendar este tratamiento
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}