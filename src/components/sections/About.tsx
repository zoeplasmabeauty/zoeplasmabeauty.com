"use client";
// ^ DIRECTIVA CRÍTICA: Añadida porque ahora usaremos interactividad (Intersection Observer y Estado)

/**
 * COMPONENTE: About.tsx
 * ARQUITECTURA: Sección de Landing Page / Construcción de Autoridad con Micro-interacción
 * * PROPÓSITO ESTRATÉGICO: 
 * Educar al usuario sobre la tecnología y anclar la confianza mediante prueba social dinámica.
 * * RESPONSABILIDADES:
 * 1. Animación de Métricas: Utiliza IntersectionObserver para animar el contador de pacientes 
 * SOLO cuando el elemento entra en el campo visual (viewport), optimizando el rendimiento.
 * 2. Renderizado Condicional de Estado: Maneja el conteo desde 0 hasta el objetivo (1000) 
 * usando un requestAnimationFrame para garantizar 60 cuadros por segundo fluidos.
 * 3. Prevención de Solapamiento: Utiliza 'scroll-mt-24' para que el título no quede 
 * oculto debajo del Navbar fijo al hacer clic en el menú.
 */
 

import { useEffect, useState, useRef } from "react";

export default function About() {
  // --- MOTOR DE ANIMACIÓN DEL CONTADOR ---
  // Estado para guardar el número actual que se muestra en pantalla.
  const [count, setCount] = useState(0);
  
  // Referencia al elemento HTML del contador para que el observador sepa a quién vigilar.
  const counterRef = useRef<HTMLDivElement>(null);
  
  // Referencia para asegurar que la animación se ejecute una sola vez y no cada vez que subes y bajas.
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Parámetros de la animación
    const target = 100; // El número final
    const duration = 2000; // Duración en milisegundos (2 segundos)

    // Función que se dispara cuando el usuario ve la sección
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // Si el elemento es visible y la animación no ha ocurrido aún
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true; // Bloqueamos futuras ejecuciones
        let startTimestamp: number | null = null;

        // Lógica de conteo usando los cuadros por segundo del monitor para fluidez absoluta
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          
          // Ecuación matemática (easeOutExpo) para que el conteo empiece rápido y frene al llegar
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          setCount(Math.floor(easeProgress * target));

          // Si no hemos llegado al final, pedimos el siguiente cuadro de animación
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };

        window.requestAnimationFrame(step);
      }
    };

    // Configuramos el observador del navegador
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5, // Se dispara cuando el 50% de la caja es visible en pantalla
    });

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    // Limpieza de memoria: cuando el componente se destruye, matamos al observador
    return () => {
      if (counterRef.current) observer.unobserve(counterRef.current);
    };
  }, []);
  // --- FIN DEL MOTOR DE ANIMACIÓN ---

  // Diccionario de Beneficios (Mantenido intacto)
  const coreValues = [
    {
      title: "Tecnología de Punta",
      description: "Equipos electrónicos de última generación para resultados precisos.",
      icon: (
        <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "No Invasivo",
      description: "Tratamientos seguros que respetan la integridad de tu piel sin cirugías.",
      icon: (
        <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Recuperación Rápida",
      description: "Minimizamos el tiempo de inactividad para que retomes tu rutina de inmediato.",
      icon: (
        <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Resultados Visibles",
      description: "Cambios medibles y estéticos desde las primeras sesiones del tratamiento.",
      icon: (
        <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ];

  return (
    // CONTENEDOR DE SECCIÓN:
    // 'scroll-mt-24' es vital. Sin esto, al hacer clic en el Navbar, la pantalla bajaría
    // y el Navbar taparía el título de la sección.
    <section id="conocenos" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      
      {/* CAJA DE ALINEACIÓN: Limita el ancho y centra el contenido */}
      <div className="mx-auto max-w-7xl">
        
        {/* SISTEMA DE GRILLA (GRID): 
            Divide la pantalla en 1 columna en móviles (gap-16) y 2 columnas simétricas en escritorio (md:grid-cols-2) */}
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          
          {/* COLUMNA IZQUIERDA: Narrativa de la Marca */}
          <div className="flex flex-col justify-center">
            {/* Etiqueta superior sutil */}
            <span className="mb-4 font-mono text-sm font-bold tracking-widest text-sky-500 uppercase">
              La Filosofía Zoe
            </span>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Elevando el estándar de la <span className="text-gray-400">estética moderna.</span>
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-300">
              En <strong className="text-white">Zoe plasma Beauty</strong>, no creemos en soluciones genéricas. Nuestro enfoque combina la precisión de la aparatología electrónica con un profundo conocimiento de la anatomía facial y corporal.
            </p>
            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              La tecnología de plasma nos permite sublimar tejidos de forma controlada, ofreciendo alternativas reales a procedimientos quirúrgicos, con menor riesgo y resultados excepcionales.
            </p>
            
            {/* Contenedor del Contador Animado */}
            <div 
              ref={counterRef} 
              className="flex items-center gap-4 border-l-4 border-sky-500 pl-4"
            >
              <div className="text-3xl font-black text-white">
                +{count} {/* Aquí inyectamos el estado dinámico */}
              </div>
              <div className="text-sm font-medium leading-tight text-gray-400 uppercase">
                Pacientes <br /> Satisfechos
              </div>
            </div>
          </div>
          
          {/* COLUMNA DERECHA: Grilla de Beneficios (Features) */}
          <div className="grid gap-8 sm:grid-cols-2">
            {/* ITERACIÓN: Recorremos el diccionario 'coreValues' para generar las 4 cajas */}
            {coreValues.map((item, index) => (
              // Tarjeta individual de beneficio
              <div 
                key={index} 
                className="group relative rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-sky-500/50 hover:bg-gray-800/50"
              >
                {/* Contenedor del ícono con brillo dinámico al pasar el mouse (hover) */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 transition-colors group-hover:bg-sky-500/20">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}