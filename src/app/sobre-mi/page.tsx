/**
 * ARCHIVO: src/app/sobre-mi/page.tsx
 * ARQUITECTURA: Server Component (App Router)
 * * PROPÓSITO ESTRATÉGICO:
 * Página de perfil profesional de la especialista (Zoe Pérez).
 * Construye autoridad, confianza y empatía con el paciente antes de la reserva.
 * * UX/UI:
 * Diseño "Clinical-light" con lectura fluida (storytelling), citas destacadas, 
 * integración de video de YouTube y un llamado a la acción claro al final.
 */

// Importamos los componentes del Layout Global para mantener coherencia visual y funcional
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from 'next/link';

export const metadata = {
  title: 'Sobre Mí | Zoe Plasma Beauty',
  description: 'Conoce a Zoe Pérez, cosmiatra superior especializada en regeneración cutánea y rejuvenecimiento consciente.',
};

export default function SobreMiPage() {
  // REEMPLAZA ESTE ID CON EL ID REAL DE TU VIDEO DE YOUTUBE
  // Ej: Si tu link es https://www.youtube.com/watch?v=dQw4w9WgXcQ, el ID es "dQw4w9WgXcQ"
  const YOUTUBE_VIDEO_ID = "TU_ID_DE_YOUTUBE_AQUI"; 

  return (
    <div className="min-h-screen bg-[var(--color-zoe-light)]">
      
      {/* =========================================================
          INYECCIÓN DEL COMPONENTE DE NAVEGACIÓN (Navbar)
          ========================================================= */}
      <Navbar />
      
      {/* Etiqueta semántica 'main' para aislar el contenido de la página */}
      <main>
        {/* =========================================================
            1. SECCIÓN HERO (Presentación)
            ========================================================= */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-light text-[var(--color-zoe-dark)] mb-4 tracking-tight">
              Regeneración cutánea y <br />
              <span className="font-bold text-[var(--color-zoe-blue)]">rejuvenecimiento consciente.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-zoe-muted)] max-w-2xl mx-auto leading-relaxed mt-6">
              Mi nombre es <strong className="text-[var(--color-zoe-dark)]">Zoe Pérez</strong>, Especialista en regeneración cutánea y rejuvenecimiento consciente. Recibida como cosmiatra superior con diplomado en Ciencias Estéticas, especializada en <strong className="text-[var(--color-zoe-dark)]">Plasma Fibroblast</strong> y tratamientos para el cuidado de la piel.
            </p>
          </div>
        </section>

        {/* =========================================================
            2. SECCIÓN VIDEO (YouTube)
            ========================================================= */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="bg-white p-3 md:p-4 rounded-3xl shadow-xl border border-[var(--color-zoe-blue)]/10 transform hover:scale-[1.01] transition-transform duration-500">
            {/* Contenedor responsivo 16:9 para el iframe */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[var(--color-zoe-light)]">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/xTRNpzc4qgQ?rel=0`}
                title="Conoce mi historia - Zoe Plasma Beauty"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. HISTORIA Y TRAYECTORIA (Storytelling)
            ========================================================= */}
        <section className="max-w-3xl mx-auto px-6 mb-24 space-y-16 text-[var(--color-zoe-muted)] leading-relaxed text-lg">
          
          {/* Bloque: Inicios */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-zoe-dark)] mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-[var(--color-zoe-blue)] rounded-full"></span>
              Mi camino en la estética
            </h2>
            <p className="mb-4">
              Comenzó desde muy joven, impulsado por el deseo genuino de ayudar a personas cercanas a sentirse mejor con su piel. En ese entonces, y de manera inocente para mi edad, el maquillaje fue mi primera herramienta: una forma de disimular aquello que generaba inseguridad y devolver confianza a través de la apariencia.
            </p>
            
            <blockquote className="my-10 pl-6 border-l-4 border-[var(--color-zoe-blue)] italic text-xl text-[var(--color-zoe-dark)] font-medium">
              "Con el tiempo comprendí que cubrir no transformaba realmente la piel. Esa inquietud despertó en mí la necesidad de entenderla en profundidad."
            </blockquote>
            
            <p>
              Quería conocer sus procesos biológicos, sus tiempos y las razones detrás de cada cambio. Fue allí donde comenzó una búsqueda más consciente, orientada no a ocultar, sino a <strong className="text-[var(--color-zoe-dark)]">mejorar la piel desde su origen</strong>.
            </p>
          </div>

          {/* Bloque: Profesionalización */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-zoe-dark)] mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-[var(--color-zoe-blue)] rounded-full"></span>
              Evolución profesional
            </h2>
            <p className="mb-4">
              A través de formación profesional y capacitación constante, me especialicé en tratamientos regenerativos y tecnologías avanzadas enfocadas en estimular los procesos naturales de reparación cutánea. 
            </p>
            <p className="mb-4">
              Fui una de las primeras profesionales en incorporar la tecnología <strong className="text-[var(--color-zoe-dark)]">Plasma Fibroblast</strong> en Argentina, desarrollando mi práctica desde los inicios de esta técnica. Encontré en ella una combinación de precisión, ciencia y resultados progresivos que reflejan mi filosofía: acompañar la piel respetando su biología sin recurrir a cirugías.
            </p>
            <p>
              Así nació <strong className="text-[var(--color-zoe-dark)]">Zoe Plasma Beauty</strong> (como evolución de mi primer espacio, <em>Making Beauty Estética</em>), consolidando un enfoque de trabajo basado en la observación clínica, la personalización absoluta y el respeto por los procesos naturales de tu rostro.
            </p>
          </div>

        </section>

        {/* =========================================================
            4. EL MÉTODO (Grid de Valor)
            ========================================================= */}
        <section className="bg-[var(--color-zoe-dark)] text-white/80 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
                Mi <span className="font-bold text-[var(--color-zoe-blue)]">Enfoque</span> Profesional
              </h2>
              <p className="max-w-2xl mx-auto text-white/70 text-lg">
                No busco cambios artificiales ni transformaciones forzadas, sino mejoras armónicas que potencien tu mejor versión de manera sostenible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Tarjeta 1 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div className="text-3xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-white mb-3">Evaluación Personalizada</h3>
                <p className="text-sm leading-relaxed">
                  Cada piel cuenta una historia única. Todo tratamiento comienza con un análisis profundo para diseñar un protocolo adaptado a tus necesidades reales.
                </p>
              </div>
              
              {/* Tarjeta 2 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-white mb-3">Resultados Progresivos</h3>
                <p className="text-sm leading-relaxed">
                  El método Zoe Plasma Fibroblast estimula la producción natural de colágeno. Integramos Dermapen, Peelings y Exosomas para fortalecer la salud funcional de tu piel.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-3">Abordaje Seguro</h3>
                <p className="text-sm leading-relaxed">
                  Priorizamos técnicas no invasivas que respetan la biología de la piel, ayudando a mejorar la flacidez, la textura y la apariencia de arrugas, sin alterar la identidad natural de tu rostro.
                </p>
              </div>

              {/* Tarjeta 4 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-3">Acompañamiento Continuo</h3>
                <p className="text-sm leading-relaxed">
                  Mi trabajo no termina al salir del consultorio. Te acompaño antes, durante y después del tratamiento con protocolos de recuperación y post skin care.
                </p>
              </div>
            </div>
            <div className="text-center mb-2">
            <p className="max-w-2xl mx-auto text-white/70 text-lg">
                Mi <span className="font-bold text-[var(--color-zoe-blue)]">objetivo</span> es potenciar la mejor versión de cada piel, logrando resultados visibles, equilibrados y sostenibles en el tiempo..
              </p>
            </div>  
          </div>
        </section>

        {/* =========================================================
            5. CTA (Call to Action)
            ========================================================= */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--color-zoe-dark)] mb-6">Tu piel puede mejorar.</h2>
            <p className="text-lg text-[var(--color-zoe-muted)] mb-10">
              Acompañamos a cada persona a reconectar con su piel, fortaleciendo la confianza desde un enfoque personalizado. El primer paso siempre comienza con una evaluación.
            </p>
            <Link 
              href="/#agendar" 
              className="inline-block bg-[var(--color-zoe-blue)] hover:bg-[#4375af] text-white font-bold text-lg py-4 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-[var(--color-zoe-blue)]/20"
            >
              Agendar Evaluación
            </Link>
          </div>
        </section>

      </main>

      {/* =========================================================
          INYECCIÓN DEL COMPONENTE DE PIE DE PÁGINA (Footer)
          ========================================================= */}
      <Footer />

    </div>
  );
}