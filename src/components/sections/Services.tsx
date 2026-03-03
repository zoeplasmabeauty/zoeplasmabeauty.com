/**
 * ARCHIVO: src/components/sections/Services.tsx
 * * COMPONENTE: Services.tsx
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
 * 4. Implementación del modelo de datos y delegación de la UI al componente ServiceCardDynamic.
 */

import ServiceCardDynamic from '../ServiceCardDynamic';

export default function Services() {
  // DICCIONARIO DE SERVICIOS AMPLIADO: 
  // Centralizamos los datos del catálogo.
  // Nota: 'imageUrl' actualmente usa colores sólidos como marcadores de posición.
  // Deberás reemplazar estos colores por rutas de imágenes reales (.jpg o .webp).
  const servicesData = [
    {
      title: "Plasma Fibroblast",
      description: "Tratamiento avanzado para tratar arrugas y exceso de piel facial y corporal.",
      duration: "Aprox. 2-4 hrs", // Generalized for the card front
      tag: "Más Popular", 
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210583/lifting-facial2_wfvzkz.jpg",
      // Datos extendidos para el Modal (Drawer)
      extended: {
        fullDescription: "Tratamiento avanzado no quirúrgico que mejora la flacidez, arrugas y exceso de piel facial y corporal mediante retracción controlada y estimulación profunda de colágeno. Resultado: piel más firme, lisa y rejuvenecida de forma natural.",
        result: "Piel más firme, lisa y rejuvenecida de forma natural.",
        benefits: [
          "Area orbital",
          "Área frontal",
          "Area peribucal",
          "Flacidez facial y corporal"
        ],
        priceTable: [
          { type: "Full face | 4 horas", cost: "$350.000 ARS" },
          { type: "Por area Corporal | 4 horas.", cost: "$300.000 ARS" },
          { type: "Por area facial | 2 horas", cost: "$220.000 ARS" }
        ]
      }
    },
    {
      title: "Tratamiento de Estrías con Plasma Fibroblast",
      description: "Procedimiento regenerativo que mejora la textura, profundidad y color de las estrías.",
      duration: "Aprox. 4 hrs",
      tag: "Alta Demanda",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210636/blefaroplastia-inferior-cr1_lozbnd.jpg",
      extended: {
        fullDescription: "Procedimiento regenerativo que mejora visiblemente la textura, profundidad y color de las estrías estimulando la reparación cutánea. Resultado: piel más uniforme y regenerada.",
        result: "Piel más uniforme y regenerada",
        benefits: [
          "Estrías nacaradas y vasculares",
          "Abdomen",
          "Axilas",
          "Glúteos"
        ],
        priceTable: [
          { type: "4 horas", cost: "$350.000 ARS" }
        ]
      }
    },
    {
      title: "Eliminación de Lesiones Benignas",
      description: "Tratamiento preciso y seguro para remover imperfecciones cutáneas sin cirugía.",
      duration: "Aprox. 2 hrs",
      tag: "Rápido",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210861/eliminacion-de-estr_C3_ADas-con-l_C3_A1ser-1540_bwxpjk.jpg",
      extended: {
        fullDescription: "Tratamiento preciso y seguro para remover imperfecciones cutáneas sin cirugía. Resultado: piel más limpia y uniforme.",
        result: "Piel más limpia y uniforme",
        benefits: [
          "Acrocordones",
          "Lentigos",
          "Queratosis",
          "Manchas y lesiones benignas dérmicas"
        ],
        priceTable: [
          { type: "Por área corporal | 2 horas", cost: "$280.000 ARS" }
        ]
      }
    },
    {
      title: "Skin Regeneration y Tratamientos Complementarios",
      description: "Protocolos personalizados que preparan, regeneran y potencian la piel antes o después del Plasma Fibroblast.",
      duration: "Aprox. 1.5 hrs",
      tag: "Complementario",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210915/Tratamientos-20_zcedk8.jpg",
      extended: {
        fullDescription: "Protocolos personalizados que preparan, regeneran y potencian la piel antes o después del Plasma Fibroblast. Resultado: mejora de textura, luminosidad y calidad de piel.",
        result: "Mejora de textura, luminosidad y calidad de piel",
        benefits: [
          "Dermapen",
          "Dermaplaning",
          "Peeling de algas",
          "Exosomas regenerativos"
        ],
        priceTable: [
          { type: "1 hora y media", cost: "Precio previa evaluación" }
        ]
      }
    },
  ];

  return (
    // CONTENEDOR DE SECCIÓN
    <section id="servicios" className="scroll-mt-24 px-6 py-24">
      
      {/* CAJA CENTRAL */}
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN (Estilo mantenido) */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
            Catálogo de Tratamientos
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-5xl">
            Nuestros <span className="text-[var(--color-zoe-blue)]">Servicios</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--color-zoe-blue)]"></div>
        </div>

        {/* GRILLA DE SERVICIOS:
            - grid-cols-1: Mantenemos una tarjeta por fila incluso en escritorio, 
              pero expandimos el ancho de la tarjeta para acomodar la asimetría. */}
        <div className="grid gap-12 grid-cols-1">
          
          {/* ITERACIÓN DEL CATÁLOGO 
              Ahora delegamos el renderizado de la UI a nuestro componente de cliente */}
          {servicesData.map((service, index) => (
            <ServiceCardDynamic key={index} service={service} />
          ))}
          
        </div>
      </div>
    </section>
  );
}