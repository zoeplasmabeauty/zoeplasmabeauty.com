/**
 * src\components\sections\Hero.tsx
 * 
 * COMPONENTE: Hero.tsx
 * ARQUITECTURA: Presentacional / Sección de Landing Page
 * * PROPÓSITO ESTRATÉGICO: 
 * Gestiona el espacio visual más crítico del producto (Above-the-fold). 
 * Su única métrica de éxito es retener la atención del usuario en los primeros 3 segundos.
 * * RESPONSABILIDADES:
 * 1. Hook visual: Renderizar la propuesta de valor principal (H1) con alto impacto.
 * 2. Conversión inicial: Proveer los llamados a la acción (CTAs) primarios de negocio 
 * ("Agendar Turno", "Ver Tratamientos") para inyectar tráfico al embudo de ventas.
 * 3. Rendimiento: Debe ser extremadamente ligero para asegurar un "First Contentful Paint" (FCP)
 * casi instantáneo. No debe incluir lógica pesada ni llamadas bloqueantes a bases de datos.
 */

export default function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
      {/* Elementos de fondo eléctrico/plasma */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-sky-900/20 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-900/20 blur-[120px] animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <span className="mb-4 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-300 tracking-wider uppercase">
          Vanguardia en Estética Facial y Corporal
        </span>
        
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          Redefine tu belleza con <span className="text-sky-400">Tecnología Plasma</span>
        </h1>
        
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
          Tratamientos no invasivos con equipos electrónicos de última generación. Resultados visibles, recuperación rápida y máxima seguridad para tu piel.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#agendar" className="w-full rounded-full bg-sky-500 px-8 py-4 text-center font-bold text-black transition-all hover:bg-sky-400 hover:scale-105 sm:w-auto">
            Agendar Turno
          </a>
          <a href="#servicios" className="w-full rounded-full border border-gray-700 bg-transparent px-8 py-4 text-center font-bold text-white transition-all hover:bg-gray-800 sm:w-auto">
            Ver Tratamientos
          </a>
        </div>
      </div>
    </section>
  );
}