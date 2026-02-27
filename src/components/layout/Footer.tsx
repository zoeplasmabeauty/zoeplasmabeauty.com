/**
 * COMPONENTE: Footer.tsx
 * ARQUITECTURA: Layout / Ancla de Navegación y Cumplimiento Legal
 * * PROPÓSITO ESTRATÉGICO: 
 * Cerrar la estructura de la página ofreciendo una red de seguridad navegacional. 
 * En el nicho estético/médico, su función principal es mitigar riesgos legales 
 * mediante "disclaimers" visibles y consolidar la autoridad de marca.
 * * RESPONSABILIDADES:
 * 1. Navegación Secundaria: Replicar los enlaces del Navbar para evitar que el usuario 
 * tenga que hacer scroll hacia arriba (reducción de fricción).
 * 2. Cumplimiento Legal: Alojar el aviso de exención de responsabilidad sobre 
 * los resultados médicos/estéticos.
 * 3. Persistencia de Marca: Mostrar el copyright actualizado dinámicamente y las redes sociales.
 */

export default function Footer() {
  // Motor dinámico para el año del Copyright. 
  // Evita que tu página se vea desactualizada ("© 2023") en el futuro.
  const currentYear = new Date().getFullYear();

  return (
    // CONTENEDOR PRINCIPAL DEL FOOTER
    // INVERSIÓN VISUAL: Pasamos de 'bg-black text-white' a un blanco puro ('bg-white').
    // Esto crea una base sólida y pulcra que "aterriza" la página.
    <footer className="border-t border-[var(--color-zoe-blue)]/20 bg-white pt-16 pb-8 text-[var(--color-zoe-dark)]">
      
      <div className="mx-auto max-w-7xl px-6">
        
        {/* GRILLA SUPERIOR: Divide la información en 3 columnas en pantallas grandes */}
        <div className="grid gap-12 md:grid-cols-3 lg:gap-24">
          
          {/* COLUMNA 1: Identidad de Marca y Propuesta */}
          <div className="flex flex-col">
            {/* Logo textual interactivo que lleva al inicio */}
            <a href="#inicio" className="group mb-6 inline-block">
              <span className="text-2xl font-extrabold tracking-tighter text-[var(--color-zoe-dark)] transition-colors group-hover:text-[var(--color-zoe-blue)]">
                Zoe <span className="text-[var(--color-zoe-blue)]">plasma</span>
              </span>
            </a>
            <p className="mb-6 text-sm font-medium leading-relaxed text-[var(--color-zoe-muted)]">
              Vanguardia en tratamientos estéticos no invasivos. 
              Elevamos tu belleza natural con tecnología electrónica de precisión y un enfoque seguro.
            </p>
            {/* Redes Sociales en versión minimalista */}
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/zoeplasmabeauty" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--color-zoe-muted)] transition-colors hover:text-[var(--color-zoe-blue)]"
                aria-label="Instagram de Zoe Plasma Beauty"
              >
                {/* Ícono de Instagram SVG puro */}
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: Enlaces Rápidos (Navegación) */}
          <div>
            <h3 className="mb-6 font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
              Navegación
            </h3>
            <ul className="space-y-4 text-sm font-medium text-[var(--color-zoe-muted)]">
              <li>
                <a href="#conocenos" className="transition-colors hover:text-[var(--color-zoe-blue)]">La Filosofía Zoe</a>
              </li>
              <li>
                <a href="#servicios" className="transition-colors hover:text-[var(--color-zoe-blue)]">Tratamientos</a>
              </li>
              <li>
                <a href="#galeria" className="transition-colors hover:text-[var(--color-zoe-blue)]">Antes y Después</a>
              </li>
              <li>
                <a href="#testimonios" className="transition-colors hover:text-[var(--color-zoe-blue)]">Testimonios</a>
              </li>
              <li>
                <a href="#agendar" className="font-bold text-[var(--color-zoe-blue)] transition-colors hover:text-[#4375af]">Agendar Turno</a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: Contacto Legal/Soporte */}
          <div>
            <h3 className="mb-6 font-mono text-sm font-bold tracking-widest text-[var(--color-zoe-blue)] uppercase">
              Soporte
            </h3>
            <ul className="space-y-4 text-sm font-medium text-[var(--color-zoe-muted)]">
              <li>Buenos Aires, Argentina</li>
              <li>
                <a href="mailto:contacto@zoeplasmabeauty.com" className="transition-colors hover:text-[var(--color-zoe-blue)]">contacto@zoeplasmabeauty.com</a>
              </li>
              {/* Enlace simulado a futuras políticas de privacidad */}
              <li>
                <a href="#" className="transition-colors hover:text-[var(--color-zoe-blue)]">Políticas de Privacidad</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[var(--color-zoe-blue)]">Términos y Condiciones</a>
              </li>
            </ul>
          </div>

        </div>

        {/* ÁREA INFERIOR: Disclaimer Médico y Copyright */}
        <div className="mt-16 border-t border-[var(--color-zoe-blue)]/10 pt-8">
          
          {/* DISCLAIMER MÉDICO (Innegociable en tu nicho) */}
          {/* INVERSIÓN VISUAL: Caja con el tono menta de la marca pero atenuado para no competir */}
          <div className="mb-8 rounded-xl border border-[var(--color-zoe-blue)]/10 bg-[var(--color-zoe-mint)]/30 p-6 text-center md:text-left">
            <p className="text-xs font-medium leading-relaxed text-[var(--color-zoe-muted)]">
              <strong className="font-bold text-[var(--color-zoe-dark)]">Aviso Legal:</strong> Los resultados de los tratamientos con tecnología plasma (Fibroblast) pueden variar significativamente según el tipo de piel, la edad, el historial médico y el cumplimiento de los cuidados posteriores de cada paciente. Las imágenes de &quot;Antes y Después&quot; publicadas en este sitio representan casos reales, pero no garantizan resultados idénticos. La información proporcionada en este sitio web tiene fines exclusivamente educativos y no reemplaza la consulta, el diagnóstico o el consejo médico profesional.
            </p>
          </div>

          {/* COPYRIGHT Y CRÉDITOS */}
          <div className="flex flex-col items-center justify-between gap-4 text-xs font-medium text-[var(--color-zoe-muted)]/80 md:flex-row">
            <p>
              &copy; {currentYear} Zoe Plasma Beauty. Todos los derechos reservados.
            </p>
            <p>
              Diseñado y desarrollado para el alto rendimiento.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}