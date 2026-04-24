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
  const servicesData = [
    {
      title: "Plasma Fibroblast",
      description: "Tratamiento avanzado para tratar arrugas y exceso de piel facial y corporal.",
      duration: "Aprox. 2-4 hrs", // Generalized for the card front
      tag: "Más Popular", 
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210583/lifting-facial2_wfvzkz.jpg",
      // Array con los IDs exactos de la base de datos que le pertenecen a esta tarjeta
      dbIds: ["fibro-fullface-uuid", "fibro-corporal-uuid", "fibro-facial-uuid", "fibro-individual-uuid"],
      // Datos extendidos para el Modal (Drawer)
      extended: {
        fullDescription: "Tratamiento avanzado no quirúrgico que mejora la flacidez, arrugas y exceso de piel facial y corporal mediante retracción controlada y estimulación profunda de colágeno.",
        result: "Piel más firme, lisa y rejuvenecida de forma natural.",
        
        // ====================================================================
        // INYECCIÓN DE COPYWRITING ESTRUCTURADO:
        // Convertimos 'benefits' de un simple arreglo de strings a un arreglo de 
        // objetos para poder soportar el efecto desplegable con subzonas.
        // ====================================================================
        benefits: [
          {
            title: "Área frontal",
            items: ["Frente", "Foxy", "Entre cejo", "Nariz"]
          },
          {
            title: "Área Orbital",
            items: ["Párpados superiores", "Párpados Inferiores", "Patas de gallo"]
          },
          {
            title: "Área peribucal",
            items: ["Código de barra", "Nasogeniano | Jowls", "Mentón"]
          },
          {
            // Cuando no hay sub-ítems, simplemente no pasamos el array 'items'
            title: "Otras Zonas",
            items: ["Contorno mandibular", "Pomulos", "Lobulo de oreja"]
          }
        ],
        // INYECCIÓN VISUAL: Enlace al mapa de zonas faciales para el "Acordeón Nativo"
        zonesMapUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1773538217/Zonas-faciales_midjpq.jpg",
        // INYECCIÓN DE COPYWRITING (Diccionario de Variantes):
        // Este objeto conecta el ID exacto de la base de datos con su texto descriptivo visual.
        variantDetails: {
          "fibro-fullface-uuid": {
            subtitle: "Tratamiento en todas las áreas del rostro"
          },
          "fibro-corporal-uuid": {
            subtitle: "Tratamiento en 1 zona corporal a eleccion (desde la papada hacia abajo)"
          },
          "fibro-facial-uuid": {
            subtitle: "Tratamiento en 3 áreas del rostro, opciones a elegir:",
            subOptions: [
              "Área frontal",
              "Área Orbital",
              "Área peribucal"
            ]
          },
          "fibro-individual-uuid": {
            subtitle: "Tratamiento en 1 zona a elección, del rostro"
          }
        },
        // Esta priceTable ya no se usa como fuente de verdad, es solo un fallback de emergencia si falla la API
        priceTable: [
          { type: "4 horas Full face", cost: "$350.000 ARS" },
          { type: "4 horas cada zona Corporal", cost: "$350.000 ARS" },
          { type: "2 horas por area facial", cost: "$220.000 ARS" },
          { type: "Individual", cost: "$100.000 ARS"}
        ]
      }
    },
    {
      title: "Tratamiento de Estrías con Plasma Fibroblast",
      description: "Procedimiento regenerativo que mejora la textura, profundidad y color de las estrías.",
      duration: "Aprox. 4 hrs",
      tag: "Alta Demanda",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210861/eliminacion-de-estr_C3_ADas-con-l_C3_A1ser-1540_bwxpjk.jpg",
      // INYECCIÓN CRÍTICA: ID exacto en D1
      dbIds: ["estrias-unica-uuid"],
      extended: {
        fullDescription: "Procedimiento regenerativo que mejora visiblemente la textura, profundidad y color de las estrías estimulando la reparación cutánea.",
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
      title: "Skin Regeneration y Tratamientos Complementarios",
      description: "Tratamientos diseñados para potenciar los resultados del Plasma Fibroblast.",
      duration: "Aprox. 2 hrs", // Duración sincronizada con la base de datos
      tag: "Complementario",
      imageUrl: "https://res.cloudinary.com/dkbpcepmt/image/upload/v1772210636/blefaroplastia-inferior-cr1_lozbnd.jpg",
      // INYECCIÓN CRÍTICA: ID exacto en D1
      dbIds: ["skin-unica-uuid"],
      extended: {
        fullDescription: "Tratamientos diseñados para potenciar los resultados del Plasma Fibroblast y favorecer una regeneración cutánea más completa",
        result: "Mejora de textura, luminosidad y calidad de piel",
        // INYECCIÓN DE PROPIEDAD ESPECIAL: 
        // Cambia el título "Zonas a mejorar" por "Tratamientos complementarios" en el Modal
        benefitsTitle: "Opciones de tratamientos", 
        benefits: [
          "Dermapen",
          "Peelings químicos y biológicos",
          "Exosomas",
          "PDRN"
        ],
        priceTable: [
          { type: "2 horas", cost: "Precio previa evaluación" }
        ],
        // INYECCIÓN DE NOTA ACLARATORIA
        specialNote: "El tratamiento complementario específico se decidirá junto a la profesional tras una evaluación presencial en el consultorio. La reserva del turno por evaluación tiene un valor de $30.000, los cuales se descontarán íntegramente del valor final del tratamiento a realizar."
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