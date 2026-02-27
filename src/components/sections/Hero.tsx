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
      
      {/* ELEMENTOS DE FONDO LUMINOSOS
          En un diseño claro, usamos desenfoques blancos y azules sutiles para dar profundidad 
          sin ensuciar el color menta base. */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-white/60 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-[var(--color-zoe-blue)]/10 blur-[120px] animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        
        {/* ETIQUETA SUPERIOR (Píldora) */}
        <span className="mb-4 inline-block rounded-full border border-[var(--color-zoe-blue)]/20 bg-[var(--color-zoe-blue)]/10 px-4 py-1.5 text-sm font-bold text-[var(--color-zoe-blue)] tracking-wider uppercase backdrop-blur-sm">
          Vanguardia en Estética Facial y Corporal
        </span>
        
        {/* H1: TÍTULO PRINCIPAL (Texto oscuro por defecto, resaltado en azul de marca) */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-7xl md:text-8xl">
          Redefine tu belleza con <span className="text-[var(--color-zoe-blue)] drop-shadow-sm">Tecnología Plasma</span>
        </h1>
        
        {/* DESCRIPCIÓN SECUNDARIA (Gris azulado para no competir con el título) */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--color-zoe-muted)] sm:text-xl font-medium">
          Tratamientos no invasivos con equipos electrónicos de última generación. Resultados visibles, recuperación rápida y máxima seguridad para tu piel.
        </p>
        
        {/* LLAMADOS A LA ACCIÓN (Botones) */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Botón Primario: Azul sólido, texto blanco. Máxima jerarquía visual. */}
          <a 
            href="#agendar" 
            className="w-full rounded-full bg-[var(--color-zoe-blue)] px-8 py-4 text-center font-bold text-white shadow-lg shadow-[var(--color-zoe-blue)]/20 transition-all hover:-translate-y-1 hover:bg-[#4375af] hover:shadow-xl sm:w-auto"
          >
            Agendar Turno
          </a>
          
          {/* Botón Secundario: Transparente con borde tenue para no robar protagonismo. */}
          <a 
            href="#servicios" 
            className="w-full rounded-full border border-[var(--color-zoe-muted)]/30 bg-white/40 px-8 py-4 text-center font-bold text-[var(--color-zoe-dark)] backdrop-blur-sm transition-all hover:bg-white hover:border-[var(--color-zoe-blue)]/50 sm:w-auto"
          >
            Ver Tratamientos
          </a>
        </div>
      </div>
    </section>
  );
}