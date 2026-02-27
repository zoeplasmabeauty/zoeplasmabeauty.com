/**
 * src\components\sections\BookingPlaceholder.tsx
 * COMPONENTE: BookingPlaceholder.tsx
 * 
 * ARQUITECTURA: Sección de Landing Page / Puente de Conversión (Fase 1)
 * * PROPÓSITO ESTRATÉGICO: 
 * Capturar la intención de compra generada en las secciones anteriores. 
 * Actúa como un marcador de posición (placeholder) visual para el futuro calendario 
 * interactivo (Fase 2), pero mantiene el embudo de ventas activo redirigiendo al usuario 
 * hacia una reserva manual asistida (WhatsApp).
 * * RESPONSABILIDADES:
 * 1. Anclaje de Navegación: Posee el id="agendar" que es el destino de todos los botones 
 * de "Call to Action" (Llamado a la acción) de la página.
 * 2. Reducción de Fricción: Ofrece un paso a paso claro de cómo funciona la reserva actual,
 * eliminando la ansiedad del cliente.
 * 3. Diseño Modular: La caja derecha ("El Widget") está diseñada para ser reemplazada 
 * directamente por el componente del calendario de base de datos en el futuro, sin romper 
 * el resto del diseño.
 */

export default function BookingPlaceholder() {
  return (
    // CONTENEDOR PRINCIPAL DE LA SECCIÓN:
    // 'scroll-mt-24' garantiza que el Navbar no tape el título al hacer clic en los enlaces.
    // 'relative overflow-hidden' nos permite poner elementos decorativos de fondo sin deformar la página.
    // INVERSIÓN VISUAL: Removido 'bg-black text-white' para heredar el fondo menta y texto oscuro.
    <section id="agendar" className="relative scroll-mt-24 px-6 py-24 overflow-hidden">
      
      {/* ELEMENTO DECORATIVO DE FONDO: 
          Un brillo sutil azul en la esquina para mantener la coherencia con la "Tecnología Plasma". 
          INVERSIÓN VISUAL: El brillo pasa a ser blanco suave para no oscurecer el menta. */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-white/40 blur-[150px]"></div>

      {/* CAJA CENTRAL DE ALINEACIÓN */}
      <div className="mx-auto max-w-7xl">
        
        {/* TARJETA CONTENEDORA PRINCIPAL (Estilo Clínico):
            Agrupa la información y el botón en un bloque visualmente sólido y destacado.
            INVERSIÓN VISUAL: De gris oscuro a blanco puro ('bg-white') con borde sutil. */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-xl backdrop-blur-md transition-shadow hover:shadow-[var(--color-zoe-blue)]/10">
          
          {/* GRILLA INTERNA: Divide la tarjeta en dos mitades en pantallas grandes (lg:grid-cols-2) */}
          <div className="grid lg:grid-cols-2">
            
            {/* MITAD IZQUIERDA: Información y Propuesta de Valor */}
            <div className="flex flex-col justify-center p-10 md:p-16">
              <span className="mb-4 font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
                Da el primer paso
              </span>
              <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--color-zoe-dark)] sm:text-5xl">
                Reserva tu <span className="text-[var(--color-zoe-blue)]">Evaluación</span>
              </h2>
              <p className="mb-10 text-lg font-medium leading-relaxed text-[var(--color-zoe-muted)]">
                Cada rostro y cuerpo es único. En esta etapa inicial, gestionamos nuestras citas de forma personalizada para garantizar que el tratamiento de plasma elegido sea el adecuado para tus objetivos.
              </p>

              {/* LISTA DE PASOS (Cómo funciona la reserva actualmente) */}
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  {/* Círculo con número */}
                  {/* INVERSIÓN VISUAL: Fondo azul tenue y número azul oscuro */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Contáctanos</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Haz clic en el botón para abrir un chat directo con nuestro especialista.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Asesoramiento</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Cuéntanos qué área deseas tratar y resolveremos tus dudas al instante.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Confirmación</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Bloquearemos tu horario en nuestra agenda y te enviaremos las indicaciones previas.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* MITAD DERECHA: El "Widget" de Reserva (Call To Action directo) 
                NOTA ARQUITECTÓNICA: En la Fase 2, todo este bloque div se borrará 
                y se insertará el componente <CalendarIntegration /> */}
            {/* INVERSIÓN VISUAL: Un fondo gris muy claro o menta tenue para separar visualmente el widget */}
            <div className="flex items-center justify-center border-t border-gray-100 bg-[var(--color-zoe-mint)]/20 p-10 lg:border-t-0 lg:border-l lg:p-16">
              
              <div className="w-full max-w-md text-center">
                {/* Ícono de Calendario/Reloj decorativo */}
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm border border-[var(--color-zoe-blue)]/10">
                  <svg className="h-10 w-10 text-[var(--color-zoe-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="mb-4 text-2xl font-bold text-[var(--color-zoe-dark)]">
                  Agenda Abierta
                </h3>
                <p className="mb-10 font-medium text-[var(--color-zoe-muted)]">
                  Próximamente lanzaremos nuestro sistema de reservas automatizado. Por ahora, asegura tu lugar de forma directa y rápida.
                </p>
                
                {/* BOTÓN DE CONVERSIÓN CRÍTICO (WhatsApp)
                    No olvides cambiar "NUMERO_DE_TELEFONO" por tu número real en formato internacional sin el '+' */}
                {/* INVERSIÓN VISUAL: Botón azul corporativo con texto blanco puro */}
                <a 
                  href="https://wa.me/5491133850211?text=Hola,%20vengo%20de%20la%20página%20web%20y%20deseo%20agendar%20una%20evaluación." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-zoe-blue)] px-8 py-4 font-bold text-white shadow-lg shadow-[var(--color-zoe-blue)]/20 transition-all duration-300 hover:scale-105 hover:bg-[#4375af]"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
                
                <p className="mt-4 text-xs font-bold text-[var(--color-zoe-muted)]">
                  Respuesta habitual en menos de 15 minutos.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}