import Image from "next/image";

/**
 * src\components\sections\Services.tsx
 * 
 * COMPONENTE: Services.tsx
 * ARQUITECTURA: Sección de Landing Page / Catálogo de Conversión
 * * PROPÓSITO ESTRATÉGICO: 
 * Presentar la oferta comercial de "Zoe Plasma Beauty" de forma clara, premium y accionable.
 * Transforma la curiosidad del usuario en una intención de compra directa.
 * * RESPONSABILIDADES:
 * 1. Organización Cognitiva: Utiliza una cuadrícula (CSS Grid) para evitar la fatiga visual, 
 * permitiendo al usuario comparar tratamientos rápidamente.
 * 2. Enrutamiento Interno: Cada servicio tiene un botón que redirige al ancla '#agendar',
 * inyectando tráfico directo a tu embudo de ventas.
 * 3. Mantenibilidad: Los datos de los servicios están aislados en un arreglo (Array), 
 * lo que permite actualizar precios o descripciones sin tocar el código visual (HTML).
 */

export default function Services() {
  // DICCIONARIO DE SERVICIOS: Centralizamos los datos del catálogo.
  // Nota: 'imageUrl' actualmente usa colores sólidos como marcadores de posición.
  // Deberás reemplazar estos colores por rutas de imágenes reales (.jpg o .webp).
  const servicesData = [
    {
      title: "Lifting Facial sin Cirugía",
      // Esta descripción coincide con la de la imagen de ejemplo.
      description: "RETRACCIÓN DE LA PIEL MEDIANTE TECNOLOGÍA PLASMA (FIBROBLAST). IDEAL PARA FLACIDEZ EN MEJILLAS, CUELLO Y ÓVALO FACIAL.",
      // La duración también coincide con el ejemplo visual.
      duration: "60 min",
      // Tag visual, como se ve en el ejemplo ("MÁS POPULAR").
      tag: "Más Popular", 
      // Marcador de posición de imagen (usando un color sólido azul oscuro).
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210583/lifting-facial2_wfvzkz.jpg", // Reemplazar con imagen real del procedimiento.
    },
    {
      title: "Blefaroplastia No Invasiva",
      description: "Levantamiento de párpados caídos y reducción de bolsas u ojeras sin cortes ni suturas. Mirada rejuvenecida.",
      duration: "45 min",
      tag: "Alta Demanda",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210636/blefaroplastia-inferior-cr1_lozbnd.jpg", // Reemplazar con imagen real.
    },
    {
      title: "Eliminación de Estrías",
      description: "Tratamiento focalizado para regenerar el colágeno en estrías blancas y rojas, mejorando drásticamente la textura de la piel.",
      duration: "90 min",
      tag: null,
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210861/eliminacion-de-estr_C3_ADas-con-l_C3_A1ser-1540_bwxpjk.jpg", // Reemplazar con imagen real.
    },
    {
      title: "Remoción de Verrugas y Manchas",
      description: "Sublimación precisa de lesiones benignas de la piel, verrugas, léntigos solares y acrocordones en una sola sesión.",
      duration: "30 min",
      tag: "Rápido",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210915/Tratamientos-20_zcedk8.jpg", // Reemplazar con imagen real.
    },
  ];

  return (
    // CONTENEDOR DE SECCIÓN
    <section id="servicios" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      
      {/* CAJA CENTRAL */}
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN (Estilo mantenido) */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-sky-500 uppercase">
            Catálogo de Tratamientos
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Nuestros <span className="text-gray-400">Servicios</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-sky-500"></div>
        </div>

        {/* GRILLA DE SERVICIOS:
            - grid-cols-1: Móviles (una tarjeta por fila).
            - lg:grid-cols-1: En este diseño avanzado, mantenemos una tarjeta por fila 
              incluso en escritorio, pero expandimos el ancho de la tarjeta. */}
        <div className="grid gap-12 grid-cols-1">
          
          {/* ITERACIÓN DEL CATÁLOGO */}
          {servicesData.map((service, index) => (
            // TARJETA DE SERVICIO PREMIUM (Layout Asimétrico):
            // Divide la tarjeta en dos columnas: 40% imagen, 60% texto.
            <div 
              key={index} 
              className="group relative flex flex-col items-stretch overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:bg-gray-800/60 hover:shadow-2xl hover:shadow-sky-500/10 md:flex-row"
            >
              
              {/* COLUMNA 1: CONTENEDOR DE IMAGEN (Replicando image_3.png) */}
              <div className="relative w-full overflow-hidden md:w-2/5">
                {/* La Imagen Real */}
                <Image 
                  src={service.imageUrl} 
                  alt={`Imagen ilustrativa del tratamiento: ${service.title}`} 
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* EL "DIFUMINADO" (Gradient Fade):
                    Esta capa negra absoluta se superpone a la imagen y crea el degradado 
                    que se funde con el fondo de la tarjeta.
                    - En móvil: Difumina de abajo hacia arriba.
                    - En escritorio (md): Difumina de izquierda a derecha. */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-950"></div>
              </div>

              {/* COLUMNA 2: CONTENIDO DE TEXTO (A la derecha, como en el ejemplo) */}
              <div className="relative z-10 flex w-full flex-col justify-between p-8 md:w-3/5">
                
                {/* ÁREA SUPERIOR: Etiqueta (Tag) "Más Popular" (o similar) */}
                <div className="mb-6 flex justify-end">
                  {service.tag && (
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold tracking-wider text-sky-400 uppercase">
                      {service.tag}
                    </span>
                  )}
                </div>

                {/* ÁREA CENTRAL: Información del servicio */}
                <div className="mb-10 flex-grow">
                  <h3 className="mb-4 text-3xl font-bold text-white transition-colors group-hover:text-sky-300">
                    {service.title}
                  </h3>
                  {/* Descripción técnica, en mayúsculas como en el ejemplo */}
                  <p className="mb-6 text-base font-normal leading-relaxed text-gray-300 uppercase">
                    {service.description}
                  </p>
                  
                  {/* Ficha técnica mínima (Duración), alineada a la derecha */}
                  <div className="flex items-center justify-end gap-2 text-sm font-medium text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duración aprox: {service.duration}
                  </div>
                </div>

                {/* ÁREA INFERIOR: Call To Action (Botón de Agendar) */}
                {/* Separador sutil */}
                <div className="mt-auto border-t border-gray-800/80 pt-6">
                  <a 
                    href="#agendar" 
                    className="flex items-center justify-end gap-3 text-base font-bold text-white transition-colors hover:text-sky-400"
                  >
                    {/* El texto del botón coincide con el ejemplo */}
                    Agendar este tratamiento
                    {/* Flecha indicadora de acción */}
                    <svg className="h-6 w-6 transform transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>

              </div>
            </div>
          ))}
          
        </div>
      </div>
    </section>
  );
}