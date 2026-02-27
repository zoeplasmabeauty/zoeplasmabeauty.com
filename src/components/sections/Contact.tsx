/**
 * src\components\sections\Contact.tsx
 * * COMPONENTE: Contact.tsx
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
          
          {/* COLUMNA IZQUIERDA: Tarjetas de Contacto Directo y Redes */}
          <div className="flex flex-col gap-6">
            
            {/* Tarjeta 1: WhatsApp (Prioridad #1 de conversión) */}
            <a 
              href="https://wa.me/5491133850211" 
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
                  +54 9 11 3385-0211
                </span>
              </div>
            </a>

            {/* Tarjeta 2: Instagram */}
            <a 
              href="https://instagram.com/making.beauty.estetica" 
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
                  @making.beauty.estetica
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

            {/* --- NUEVO BLOQUE: REDES SOCIALES --- */}
            {/* Se agrega un separador visual para estructurar el contenido */}
            <div className="mt-4 border-t border-gray-800/80 pt-8">
              <h3 className="mb-6 font-mono text-sm font-bold tracking-widest text-white uppercase">
                Únete a nuestra comunidad
              </h3>
              
              {/* Grilla minimalista para Redes Sociales */}
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Instagram Oficial */}
                <a 
                  href="https://www.instagram.com/zoeplasmabeauty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3 transition-all hover:-translate-y-1 hover:border-sky-500/40 hover:bg-gray-800/50"
                >
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    Instagram Oficial
                  </span>
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/ZoePlasmaBeauty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3 transition-all hover:-translate-y-1 hover:border-sky-500/40 hover:bg-gray-800/50"
                >
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    Facebook
                  </span>
                </a>

                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@zoe.plasmabeauty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3 transition-all hover:-translate-y-1 hover:border-sky-500/40 hover:bg-gray-800/50"
                >
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    TikTok
                  </span>
                </a>

                {/* Instagram Academy */}
                <a 
                  href="https://www.instagram.com/zoeplasmabeauty.academy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/30 px-4 py-3 transition-all hover:-translate-y-1 hover:border-sky-500/40 hover:bg-gray-800/50"
                >
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                    Zoe Academy
                  </span>
                </a>

              </div>
            </div>

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
                Reemplazado con el iframe real. */}
            <div className="relative h-64 w-full bg-gray-800 border-b border-gray-800">
              {/* Iframe de Google Maps */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.3689892243806!2d-58.519818023544545!3d-34.6201145729485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb7efedb1ecb1%3A0xdb7f4e040ff55be4!2sMAKING BEAUTY PLASMA FIBROBLAST!5e0!3m2!1ses!2sar!4v1772217036703!5m2!1ses!2sar" 
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {/* Capa de degradado oscuro (pointer-events-none asegura que el mapa sea interactivo) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
              
              {/* Textos superpuestos al final del mapa */}
              <div className="absolute bottom-4 flex w-full flex-col items-center px-4">
                <div className="text-center text-xs font-bold tracking-widest text-gray-300 uppercase drop-shadow-md">
                  Atención Exclusiva con Cita Previa
                </div>
              </div>
            </div>

            {/* CONTENEDOR DEL BOTÓN DE CONVERSIÓN (Centrado debajo del mapa) */}
            <div className="flex w-full justify-center bg-gray-900/20 p-6">
              <a 
                href="#agendar"
                className="inline-flex rounded-full bg-sky-500 px-8 py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:scale-105 hover:bg-sky-400"
              >
                Agendar Turno
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}