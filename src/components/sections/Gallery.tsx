import Image from "next/image";

/**
 * src\components\sections\Gallery.tsx
 * * COMPONENTE: Gallery.tsx
 * 
 * ARQUITECTURA: Sección de Landing Page / Prueba Social Visual (Antes y Después)
 * * PROPÓSITO ESTRATÉGICO: 
 * Derribar el escepticismo del usuario. En la industria estética, la evidencia empírica 
 * visual pesa más que cualquier texto persuasivo. Esta sección materializa las promesas 
 * de la sección "Servicios".
 * * RESPONSABILIDADES:
 * 1. Comparación Directa: Renderiza un diseño de vista dividida (split-view) para 
 * contrastar el estado previo y el resultado final de forma inmediata.
 * 2. Carga Cognitiva Mínima: Implementa etiquetas de alto contraste ("ANTES" / "DESPUÉS") 
 * ancladas a las imágenes para evitar que el usuario tenga que adivinar.
 * 3. Enrutamiento: Utiliza el id="galeria" para conectar con el Navbar principal.
 */

export default function Gallery() {
  // DICCIONARIO DE EVIDENCIA VISUAL: Base de datos local de casos de éxito.
  // Nota Arquitectónica: Para mantener el rigor visual, las imágenes reales que subas
  // en el futuro DEBEN tener exactamente la misma proporción (aspect ratio) y la misma 
  // iluminación para que la comparación sea creíble y profesional.
  const galleryData = [
    {
      treatment: "Blefaroplastia No Invasiva",
      description: "Reducción severa de exceso de piel en párpado superior. 1 sesión.",
      // Marcadores de posición simulando imágenes antes/después
      beforeImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772214888/Antes_psqfk2.jpg",
      afterImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772214888/Despues_epa3zd.jpg",
    },
    {
      treatment: "Lifting Facial (Fibroblast)",
      description: "Retracción de tejido en zona peribucal (código de barras). 2 sesiones.",
      beforeImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215000/Lifting-antes_heebq6.jpg",
      afterImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215001/Lifting-despues_pzupz5.jpg",
    },
    {
      treatment: "Remoción de Léntigos Solares",
      description: "Eliminación de manchas solares en pómulos. Resultados a los 15 días.",
      beforeImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215099/Lentigos-antes_wtiubm.jpg",
      afterImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215098/Lentigo-despues_r9oioq.jpg",
    },
    {
      treatment: "Tratamiento de Estrías",
      description: "Regeneración de colágeno en estrías abdominales post-parto. 3 sesiones.",
      beforeImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215208/Estrias-antes_zifuop.jpg",
      afterImage: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772215209/Estrias-despues_pk1pbu.jpg",
    }
  ];

  return (
    // CONTENEDOR DE SECCIÓN
    // INVERSIÓN VISUAL: Removido 'bg-gray-950 text-white' para heredar el Clinical Light.
    // El borde separador ahora es un azul muy tenue.
    <section id="galeria" className="scroll-mt-24 px-6 py-24 border-t border-[var(--color-zoe-blue)]/10">
      
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
            Evidencia Clínica
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-5xl">
            Antes y <span className="text-[var(--color-zoe-blue)]">Después</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--color-zoe-blue)]"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-[var(--color-zoe-muted)]">
            Resultados reales en pacientes reales. La precisión de nuestros equipos 
            electrónicos se traduce en transformaciones visibles y estéticas.
          </p>
        </div>

        {/* GRILLA DE EVIDENCIA:
            - grid-cols-1: En móviles, se apilan verticalmente.
            - lg:grid-cols-2: En pantallas grandes, mostramos dos casos por fila. */}
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* ITERACIÓN DEL DICCIONARIO DE CASOS */}
          {galleryData.map((item, index) => (
            // TARJETA CONTENEDORA DEL CASO
            // INVERSIÓN VISUAL: De fondo negro puro a cristal blanco (bg-white/80).
            <div 
              key={index} 
              className="group overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-[var(--color-zoe-blue)]/30 hover:shadow-xl hover:-translate-y-1"
            >
              
              {/* ÁREA VISUAL: Comparativa Split-View */}
              {/* Usamos un grid interno de 2 columnas exactas (grid-cols-2) para forzar 
                  que la imagen de antes y la de después ocupen exactamente el 50% cada una. */}
              {/* INVERSIÓN VISUAL: Línea divisoria blanca en lugar de gris oscura */}
              <div className="grid grid-cols-2 divide-x divide-white">
                
                {/* CAJA IMAGEN 1: ANTES */}
                {/* Corrección Arquitectónica: Dimensiones ('h-64 w-full sm:h-80') trasladadas al div padre */}
                <div className="relative h-64 w-full overflow-hidden sm:h-80">
                  <Image 
                    src={item.beforeImage} 
                    alt={`Antes del tratamiento: ${item.treatment}`}
                    fill
                    // Las dimensiones ya no van aquí, solo el comportamiento de la imagen
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* ETIQUETA ABSOLUTA: Anclada arriba a la izquierda */}
                  {/* INVERSIÓN VISUAL: Etiqueta clara para no ensuciar la foto */}
                  <div className="absolute top-4 left-4 rounded bg-white/90 px-3 py-1 text-xs font-bold tracking-widest text-[var(--color-zoe-dark)] uppercase backdrop-blur-md shadow-sm">
                    Antes
                  </div>
                </div>

                {/* CAJA IMAGEN 2: DESPUÉS */}
                {/* Corrección Arquitectónica: Dimensiones ('h-64 w-full sm:h-80') trasladadas al div padre */}
                <div className="relative h-64 w-full overflow-hidden sm:h-80">
                  <Image 
                    src={item.afterImage} 
                    alt={`Después del tratamiento: ${item.treatment}`} 
                    fill
                    // Las dimensiones ya no van aquí, solo el comportamiento de la imagen
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* ETIQUETA ABSOLUTA: Anclada arriba a la derecha, color destacado */}
                  {/* INVERSIÓN VISUAL: Azul de marca sólido para destacar el resultado */}
                  <div className="absolute top-4 right-4 rounded bg-[var(--color-zoe-blue)]/90 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase backdrop-blur-md shadow-sm">
                    Después
                  </div>
                </div>

              </div>

              {/* ÁREA INFERIOR: Contexto Clínico */}
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-[var(--color-zoe-dark)] transition-colors group-hover:text-[var(--color-zoe-blue)]">
                  {item.treatment}
                </h3>
                <p className="text-sm font-medium text-[var(--color-zoe-muted)]">
                  {item.description}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}