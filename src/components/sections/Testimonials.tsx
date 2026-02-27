/**
 * src\components\sections\Testimonials.tsx
 * * COMPONENTE: Testimonials.tsx
 * ARQUITECTURA: Sección de Landing Page / Prueba Social de Alto Impacto (Video)
 * * PROPÓSITO ESTRATÉGICO: 
 * Apalancar la empatía humana y la evidencia visual mediante testimonios en formato 
 * de video corto (Shorts). Reduce drásticamente la fricción de compra al mostrar
 * pacientes reales narrando su experiencia y resultados.
 * * RESPONSABILIDADES:
 * 1. Integración Multimedia: Aloja iframes optimizados de YouTube Shorts sin 
 * romper la estética premium de la página.
 * 2. Diseño Vertical: Utiliza una grilla adaptada a proporciones 9:16, ideal para 
 * consumo móvil y para la naturaleza del contenido de redes sociales.
 * 3. Prevención de Fugas: Mantiene al usuario en la página, pero ofrece una 
 * vía hacia el canal principal si desean consumir más contenido de autoridad.
 */

export default function Testimonials() {
  // DICCIONARIO DE VIDEOS: Base de datos local de tus Shorts.
  // IMPORTANTE: Para que un Short se reproduzca incrustado en una web, 
  // la URL debe tener el formato "/embed/ID_DEL_VIDEO", NO el formato estándar de YouTube.
  const videoTestimonials = [
    {
      patientName: "María F.",
      treatment: "Blefaroplastia",
      // Marcador de posición. Reemplaza "TU_ID_AQUI_1" por el ID real de tu Short (ej. "aBcDeFgHiJ")
      youtubeEmbedUrl: "https://www.youtube.com/embed/y4IZ7EdjUWg?rel=0&modestbranding=1",
    },
    {
      patientName: "Laura G.",
      treatment: "Lifting Facial",
      youtubeEmbedUrl: "https://www.youtube.com/embed/SsMGhDh_ykk?rel=0&modestbranding=1",
    },
    {
      patientName: "Sofía M.",
      treatment: "Remoción de Manchas",
      youtubeEmbedUrl: "https://www.youtube.com/embed/gat4apmaEmM?rel=0&modestbranding=1",
    }
  ];

  return (
    // CONTENEDOR DE SECCIÓN
    // INVERSIÓN VISUAL: Removido 'bg-black text-white' para heredar el entorno Clinical Light.
    <section id="testimonios" className="scroll-mt-24 px-6 py-24">
      
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
            Experiencias Reales
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-5xl">
            Lo que dicen <span className="text-[var(--color-zoe-blue)]">nuestros pacientes</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--color-zoe-blue)]"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-[var(--color-zoe-muted)]">
            No te quedes con nuestra palabra. Escucha las historias de quienes ya han 
            transformado su piel con la tecnología Zoe Plasma.
          </p>
        </div>

        {/* GRILLA DE VIDEOS (SHORTS):
            - grid-cols-1: Móvil (una columna centralizada).
            - md:grid-cols-3: Escritorio (3 videos uno al lado del otro). 
            Centramos el contenido en caso de que haya menos de 3 videos. */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 justify-center">
          
          {/* ITERACIÓN DEL CATÁLOGO DE VIDEOS */}
          {videoTestimonials.map((video, index) => (
            // TARJETA CONTENEDORA DEL VIDEO
            // Manteniendo el glassmorphism y bordes sutiles para enmarcar el iframe
            // INVERSIÓN VISUAL: Pasamos de tarjeta oscura a cristal blanco translúcido
            <div 
              key={index} 
              className="group mx-auto flex w-full max-w-[350px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-zoe-blue)]/30 hover:shadow-xl hover:shadow-[var(--color-zoe-blue)]/10"
            >
              
              {/* CONTENEDOR DEL IFRAME (Proporción 9:16 estricta)
                  El padding-bottom de 177.77% fuerza al div a mantener la relación de aspecto 
                  vertical de un teléfono, evitando bandas negras. 
                  NOTA ARQUITECTÓNICA: Mantenemos el 'bg-black' aquí dentro porque los reproductores 
                  de YouTube tienen bordes oscuros; esto evita marcos blancos disonantes. */}
              <div className="relative w-full pt-[177.77%] bg-black">
                <iframe 
                  className="absolute top-0 left-0 h-full w-full border-0"
                  src={video.youtubeEmbedUrl} 
                  title={`Testimonio de ${video.patientName} sobre ${video.treatment}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  loading="lazy" // Carga diferida obligatoria para no hundir el rendimiento inicial
                ></iframe>
              </div>

              {/* ÁREA INFERIOR: Contexto del Video */}
              {/* INVERSIÓN VISUAL: Borde sutil azul y textos oscuros */}
              <div className="border-t border-[var(--color-zoe-blue)]/10 p-5 text-center">
                <h3 className="mb-1 text-lg font-bold text-[var(--color-zoe-dark)]">
                  {video.patientName}
                </h3>
                <p className="text-xs font-bold text-[var(--color-zoe-blue)] uppercase tracking-wider">
                  {video.treatment}
                </p>
              </div>

            </div>
          ))}

        </div>

        {/* BOTÓN DE AUTORIDAD EXTERNA (Call to Action Secundario) */}
        <div className="mt-16 text-center">
          {/* INVERSIÓN VISUAL: Botón translúcido blanco que se vuelve sólido en el hover */}
          <a 
            href="https://youtube.com/@zoeplasmabeauty" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-[var(--color-zoe-blue)]/20 bg-white/50 backdrop-blur-sm px-8 py-4 text-sm font-bold text-[var(--color-zoe-dark)] shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:border-[var(--color-zoe-blue)]/50 hover:shadow-md"
          >
            {/* Ícono de Play (Mantenemos el rojo original de YouTube para reconocimiento cognitivo rápido) */}
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
               <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Ver más casos en nuestro canal de YouTube
          </a>
        </div>

      </div>
    </section>
  );
}