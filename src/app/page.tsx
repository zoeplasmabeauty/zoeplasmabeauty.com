import type { Metadata } from "next";

// Configuración de metadatos para SEO básico de la página de espera
export const metadata: Metadata = {
  title: "Zoe plasma Beauty - Vanguardia en Estética",
  description: "Sitio web en construcción. Próximamente revelaremos una nueva experiencia en tratamientos de belleza con plasma y equipos electrónicos.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white antialiased selection:bg-sky-800">
      {/* Fondo con gradiente sutil y efecto de plasma eléctrico de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -inset-[100px] opacity-30">
          <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-sky-950 blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-950 blur-[120px] animation-delay-2000"></div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Identidad de Marca */}
        <header className="mb-16">
          <h1 className="text-sm font-mono tracking-[0.3em] text-gray-500 uppercase">
            Estética de Vanguardia
          </h1>
        </header>

        {/* Mensaje Central */}
        <div className="max-w-4xl">
          <h2 className="mb-6 text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl">
            Zoe <span className="text-sky-400">plasma</span> Beauty
          </h2>
          
          <div className="mx-auto mb-10 h-1 w-24 rounded-full bg-white"></div>

          <p className="mx-auto mb-16 max-w-2xl text-xl font-light leading-relaxed text-gray-300 md:text-2xl">
            Estamos esculpiendo una experiencia digital revolucionaria para reflejar la excelencia de nuestros tratamientos electrónicos. Algo hermoso está llegando.
          </p>
        </div>

        {/* Tarjeta de Estado */}
        <div className="rounded-3xl border border-gray-800 bg-gray-950/50 p-10 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Sitio en Construcción
            </h3>
          </div>
          <p className="mb-10 max-w-md text-gray-400">
            Próximamente podrás agendar tus turnos online y descubrir el poder de la tecnología plasma.
          </p>
          
          {/* Botones de Acción Activos */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a 
              href="https://instagram.com/making.beauty.estetica" 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full bg-sky-500 px-8 py-3.5 text-center font-bold text-black transition-colors duration-200 hover:bg-sky-400"
            >
              Síguenos en Instagram
            </a>
            <a 
              href="https://wa.me/5491133850211"
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full bg-white px-8 py-3.5 text-center font-bold text-black transition-colors duration-200 hover:bg-gray-200"
            >
              Contacto WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Footer sutil */}
      <footer className="absolute bottom-6 z-10 text-xs font-mono tracking-wider text-gray-700 uppercase">
        &copy; 2026 Zoe plasma Beauty. Todos los derechos reservados.
      </footer>
    </main>
  );
}