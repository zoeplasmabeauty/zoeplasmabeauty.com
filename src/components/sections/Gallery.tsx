import Image from "next/image";

/**
 * src\components\sections\Gallery.tsx
 * 
 * COMPONENTE: Gallery.tsx
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
      beforeImage: "https://www.bogotalaser.com/wp-content/uploads/2022/05/enfermedades-de-los-parpados_1-mod.webp",
      afterImage: "https://beoneface.com/wp-content/uploads/2023/03/La-mejor-solucion-para-los-parpados-caidos-en-clinica-beOne-en-Madrid.jpg",
    },
    {
      treatment: "Lifting Facial (Fibroblast)",
      description: "Retracción de tejido en zona peribucal (código de barras). 2 sesiones.",
      beforeImage: "https://www.materialestetica.com/blog/wp-content/uploads/2023/09/Blog-ME.jpg",
      afterImage: "https://catalinajaramillo.com/cdn/shop/files/Lifting_de_pestanas_Catalina_Jaramillo_5.png?v=1730397186&width=2048",
    },
    {
      treatment: "Remoción de Léntigos Solares",
      description: "Eliminación de manchas solares en pómulos. Resultados a los 15 días.",
      beforeImage: "https://dbdermatologiabarcelona.com/wp-content/uploads/2013/01/LENTIGOS-SOLARES.png",
      afterImage: "https://www.bupasalud.com/sites/default/files/styles/640_x_400/public/articulos/2025-11/fotos/manchas-marrones-espalda-1.jpg?itok=mRMUvC7O",
    },
    {
      treatment: "Tratamiento de Estrías",
      description: "Regeneración de colágeno en estrías abdominales post-parto. 3 sesiones.",
      beforeImage: "https://imagenes2.eltiempo.com/files/og_thumbnail/uploads/2023/03/16/6413817c125b8.jpeg",
      afterImage: "https://d30gl8nkrjm6kp.cloudfront.net/articulos/articulos-407652.jpg",
    }
  ];

  return (
    // CONTENEDOR DE SECCIÓN
    // 'bg-gray-950' le da un tono ligeramente distinto al negro puro de las otras secciones
    // para crear una separación visual subconsciente al hacer scroll.
    <section id="galeria" className="scroll-mt-24 bg-gray-950 px-6 py-24 text-white border-t border-gray-900">
      
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-sky-500 uppercase">
            Evidencia Clínica
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Antes y <span className="text-gray-400">Después</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-sky-500"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
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
            <div 
              key={index} 
              className="group overflow-hidden rounded-3xl border border-gray-800 bg-black shadow-2xl transition-all duration-300 hover:border-sky-500/30"
            >
              
              {/* ÁREA VISUAL: Comparativa Split-View */}
              {/* Usamos un grid interno de 2 columnas exactas (grid-cols-2) para forzar 
                  que la imagen de antes y la de después ocupen exactamente el 50% cada una. */}
              <div className="grid grid-cols-2 divide-x divide-gray-800">
                
                {/* CAJA IMAGEN 1: ANTES */}
                <div className="relative overflow-hidden">
                  <Image 
                    src={item.beforeImage} 
                    alt={`Antes del tratamiento: ${item.treatment}`} 
                    className="h-64 w-full object-cover sm:h-80 transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* ETIQUETA ABSOLUTA: Anclada arriba a la izquierda */}
                  <div className="absolute top-4 left-4 rounded bg-black/80 px-3 py-1 text-xs font-bold tracking-widest text-gray-400 uppercase backdrop-blur-sm">
                    Antes
                  </div>
                </div>

                {/* CAJA IMAGEN 2: DESPUÉS */}
                <div className="relative overflow-hidden">
                  <Image 
                    src={item.afterImage} 
                    alt={`Después del tratamiento: ${item.treatment}`} 
                    className="h-64 w-full object-cover sm:h-80 transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* ETIQUETA ABSOLUTA: Anclada arriba a la derecha, color destacado */}
                  <div className="absolute top-4 right-4 rounded bg-sky-500/90 px-3 py-1 text-xs font-bold tracking-widest text-black uppercase backdrop-blur-sm">
                    Después
                  </div>
                </div>

              </div>

              {/* ÁREA INFERIOR: Contexto Clínico */}
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-white">
                  {item.treatment}
                </h3>
                <p className="text-sm text-gray-400">
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