/**
 * src\components\sections\Contact.tsx
 * 
 * COMPONENTE: Contact.tsx
 * ARQUITECTURA: Sección de Landing Page / Cierre del Embudo y Soporte
 * * PROPÓSITO ESTRATÉGICO: 
 * Capturar a los usuarios que llegaron al final de la página pero aún tienen dudas. 
 * En la Fase 1, evitamos formularios de contacto complejos que reducen la conversión; 
 * en su lugar, canalizamos el tráfico directamente hacia canales de comunicación 
 * instantánea (WhatsApp) y mostramos transparencia operativa (ubicación y horarios).
 * * RESPONSABILIDADES:
 * 1. Anclaje: Responde al id="contacto" del Navbar global.
 * 2. Accesibilidad: Proveer enlaces directos de un solo clic ('mailto:', 'https://wa.me/')
 * para que el teléfono del usuario abra las aplicaciones nativas instantáneamente.
 * 3. Transparencia: Mostrar información física y horarios para reducir la incertidumbre 
 * del cliente potencial antes de agendar.
 */

export default function Contact() {
  return (
    // CONTENEDOR DE SECCIÓN
    // 'border-t border-gray-900' crea una separación visual clara con la sección anterior.
    <section id="contacto" className="scroll-mt-24 bg-black px-6 py-24 text-white border-t border-gray-900">
      
      <div className="mx-auto max-w-7xl">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-sm font-bold tracking-widest text-sky-500 uppercase">
            Atención Personalizada
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ponte en <span className="text-gray-400">Contacto</span>
          </h2>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-sky-500"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            ¿Tienes dudas sobre qué tratamiento de plasma es ideal para ti? 
            Nuestro equipo de especialistas está listo para asesorarte sin compromiso.
          </p>
        </div>

        {/* GRILLA DE CONTACTO Y HORARIOS
            Divide la pantalla en dos grandes bloques en escritorio. */}
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* COLUMNA IZQUIERDA: Tarjetas de Contacto Directo */}
          <div className="flex flex-col gap-6">
            
            {/* Tarjeta 1: WhatsApp (Prioridad #1 de conversión) */}
            <a 
              href="https://wa.me/5491136439152" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 transition-all hover:border-sky-500/50 hover:bg-gray-800/60"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-300">
                {/* Ícono de Teléfono/Mensaje */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">WhatsApp Directo</h3>
                <p className="mt-1 text-sm text-gray-400">Respuestas rápidas para agendar tu cita.</p>
                <span className="mt-2 inline-block font-mono text-sm text-sky-400 group-hover:underline">
                  +54 9 11 3643-9152
                </span>
              </div>
            </a>

            {/* Tarjeta 2: Instagram */}
            <a 
              href="https://instagram.com/zoe.plasmabeauty" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 transition-all hover:border-sky-500/50 hover:bg-gray-800/60"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-300">
                {/* Ícono de Cámara/Instagram */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mensaje Directo (DM)</h3>
                <p className="mt-1 text-sm text-gray-400">Síguenos y escríbenos por Instagram.</p>
                <span className="mt-2 inline-block font-mono text-sm text-sky-400 group-hover:underline">
                  @zoe.plasmabeauty
                </span>
              </div>
            </a>

            {/* Tarjeta 3: Correo Electrónico */}
            <a 
              href="mailto:contacto@zoeplasmabeauty.com" 
              className="group flex items-center gap-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 transition-all hover:border-sky-500/50 hover:bg-gray-800/60"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/20 group-hover:text-sky-300">
                {/* Ícono de Email */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Correo Electrónico</h3>
                <p className="mt-1 text-sm text-gray-400">Para consultas detalladas o alianzas.</p>
                <span className="mt-2 inline-block font-mono text-sm text-sky-400 group-hover:underline">
                  contacto@zoeplasmabeauty.com
                </span>
              </div>
            </a>

          </div>

          {/* COLUMNA DERECHA: Ubicación y Horarios */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/30 backdrop-blur-md">
            
            {/* Bloque de Información Física */}
            <div className="p-8 md:p-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Nuestra Clínica</h3>
                  <p className="text-gray-400">Buenos Aires, Argentina</p>
                </div>
              </div>
              
              <p className="mb-8 text-sm leading-relaxed text-gray-400">
                Operamos en un entorno estéril y acondicionado con equipos de vanguardia 
                para garantizar tu seguridad y confort durante cada sesión de plasma.
              </p>

              {/* Tabla de Horarios */}
              <div className="space-y-3 border-t border-gray-800 pt-8">
                <h4 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
                  Horarios de Atención
                </h4>
                
                <div className="flex justify-between border-b border-gray-800/50 pb-2 text-sm">
                  <span className="text-gray-400">Lunes a Viernes</span>
                  <span className="font-medium text-white">10:00 - 19:00</span>
                </div>
                <div className="flex justify-between border-b border-gray-800/50 pb-2 text-sm">
                  <span className="text-gray-400">Sábados</span>
                  <span className="font-medium text-white">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between pb-2 text-sm">
                  <span className="text-gray-400">Domingos</span>
                  <span className="font-medium text-sky-500">Cerrado</span>
                </div>
              </div>
            </div>

            {/* Mapa Interactivo (Google Maps) 
                Reemplazado con el iframe real y botón de conversión anclado al final. */}
            <div className="relative h-64 w-full bg-gray-800">
              {/* Iframe de Google Maps */}
              <iframe 
                src="https://maps.app.goo.gl/qDqv1uGubJ2h1hnq8" 
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {/* Capa de degradado oscuro (pointer-events-none asegura que el mapa sea interactivo) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
              
              {/* Textos y Botón superpuestos al final */}
              <div className="absolute bottom-6 flex w-full flex-col items-center gap-4 px-4">
                <div className="text-center text-xs font-bold tracking-widest text-gray-300 uppercase drop-shadow-md">
                  Atención Exclusiva con Cita Previa
                </div>
                <a 
                  href="#agendar"
                  className="rounded-full bg-sky-500 px-8 py-2.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:scale-105 hover:bg-sky-400"
                >
                  Agendar Turno
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}