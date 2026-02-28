/**
 * ARCHIVO: src/components/sections/BookingPlaceholder.tsx
 * COMPONENTE: BookingPlaceholder.tsx
 * * ARQUITECTURA: Sección de Landing Page / Puente de Conversión (Fase 1 y Fase 2)
 * * PROPÓSITO ESTRATÉGICO ACTUALIZADO: 
 * Capturar la intención de compra generada en las secciones anteriores.  
 * Es el contenedor oficial del motor de reservas interactivo (BookingForm),
 * conectando directamente al paciente con la base de datos D1.
 * * RESPONSABILIDADES:
 * 1. Anclaje de Navegación: Posee el id="agendar" que es el destino de todos los botones 
 * de "Call to Action" (Llamado a la acción) de la página.
 * 2. Reducción de Fricción: Ofrece un paso a paso claro de cómo funciona la reserva actual,
 * eliminando la ansiedad del cliente.
 * 3. Diseño Modular: La caja derecha aloja el componente de cliente <BookingForm />, 
 * aislando la lógica compleja de estado de la estructura visual de la página.
 */

// 1. INYECCIÓN DE DEPENDENCIAS
// Importamos el motor interactivo que construimos para que reemplace al widget de WhatsApp
import BookingForm from '@/components/BookingForm';

export default function BookingPlaceholder() {
  return (
    // CONTENEDOR PRINCIPAL DE LA SECCIÓN:
    // 'scroll-mt-24' garantiza que el Navbar no tape el título al hacer clic en los enlaces.
    // 'relative overflow-hidden' nos permite poner elementos decorativos de fondo sin deformar la página.
    <section id="agendar" className="relative scroll-mt-24 px-6 py-24 overflow-hidden">
      
      {/* ELEMENTO DECORATIVO DE FONDO: 
          Un brillo sutil azul en la esquina para mantener la coherencia con la "Tecnología Plasma". */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-white/40 blur-[150px]"></div>

      {/* CAJA CENTRAL DE ALINEACIÓN */}
      <div className="mx-auto max-w-7xl">
        
        {/* TARJETA CONTENEDORA PRINCIPAL (Estilo Clínico):
            Agrupa la información y el botón en un bloque visualmente sólido y destacado. */}
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
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Elige tu tratamiento</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Selecciona el servicio y la fecha en nuestro sistema integrado.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Ingresa tus datos</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Proporciona tu información básica para crear tu ficha clínica (DNI).</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-zoe-blue)]/10 text-sm font-bold text-[var(--color-zoe-blue)]">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-zoe-dark)]">Confirmación</h4>
                    <p className="text-sm font-medium text-[var(--color-zoe-muted)]">Registraremos tu turno en la base de datos y un especialista te contactará.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* MITAD DERECHA: El Motor de Reservas (BookingForm) */}
            <div className="flex items-center justify-center border-t border-gray-100 bg-[var(--color-zoe-mint)]/20 p-6 lg:border-t-0 lg:border-l lg:p-8">
              
              <div className="w-full">
                {/* 2. INYECCIÓN DEL COMPONENTE REACT */}
                <BookingForm />
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}