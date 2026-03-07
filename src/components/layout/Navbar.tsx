"use client"; 
// ^ DIRECTIVA CRÍTICA: Le indica a Next.js que este componente debe ejecutarse 
// en el navegador del usuario (cliente) para permitir interactividad (clics, menús móviles).

/**
 * src\components\layout\Navbar.tsx
 * * COMPONENTE: Navbar.tsx
 * ARQUITECTURA: Layout / Navegación Global (Persistente)
 * * PROPÓSITO ESTRATÉGICO: 
 * Mantener la identidad de marca siempre visible y proporcionar una vía de escape rápida 
 * hacia el punto de conversión principal ("Agendar") desde cualquier coordenada del sitio.
 * * RESPONSABILIDADES:
 * 1. Enrutamiento: Proveer enlaces ancla fluidos a las 7 macro-secciones del negocio.
 * 2. Persistencia (Sticky): Flotar sobre el contenido sin robar espacio de lectura.
 * 3. Adaptabilidad (Responsive): Colapsar en un menú de hamburguesa en pantallas pequeñas.
 */

import { useState } from "react";
// Importamos el enrutador optimizado de Next.js para navegación interna
import Link from "next/link"; 

export default function Navbar() {
  // ESTADO DE REACT: Controla si el menú móvil está abierto (true) o cerrado (false).
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DICCIONARIO DE NAVEGACIÓN: Mantenemos los enlaces en un arreglo. 
  // Esto es un estándar de alto rendimiento. Si en el futuro agregas una sección, 
  // solo modificas esta lista y el menú se actualiza solo, evitando código espagueti.
  const navLinks = [
    { name: "Inicio", href: "/#inicio" }, // Se añadió la '/' por si el usuario está en otra página
    { name: "Sobre Mí", href: "/sobre-mi" }, 
    { name: "Conócenos", href: "/#conocenos" },
    { name: "Servicios", href: "/#servicios" },
    { name: "FAQ", href: "/#preguntas-frecuentes" }, 
    { name: "Antes y Después", href: "/#galeria" },
    { name: "Testimonios", href: "/#testimonios" },
    { name: "Contacto", href: "/#contacto" },
  ];

  return (
    // CONTENEDOR PRINCIPAL (NAV): 
    // INVERSIÓN VISUAL: Pasamos a un cristal blanco (bg-white/90) y un borde azul sutil.
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-[var(--color-zoe-blue)]/20 bg-white/90 backdrop-blur-md transition-all duration-300">
      
      {/* CAJA DE ALINEACIÓN: Limita el ancho máximo para pantallas gigantes y centra el contenido */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* BLOQUE DE MARCA (LOGO): 
            Al hacer clic, el usuario siempre vuelve arriba. */}
        <Link href="/#inicio" className="group flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tighter text-[var(--color-zoe-dark)] transition-colors group-hover:text-[var(--color-zoe-blue)]">
            Zoe <span className="text-[var(--color-zoe-blue)]">plasma</span> Beauty
          </span>
        </Link>

        {/* NAVEGACIÓN DE ESCRITORIO (Oculta en móviles 'hidden md:flex') */}
        <div className="hidden items-center gap-8 xl:flex">
          {/* Se cambió md:flex por xl:flex para evitar que el menú colapse los elementos al ser muy largo */}
          <ul className="flex gap-6 text-sm font-medium text-[var(--color-zoe-muted)]">
            {/* ITERACIÓN DINÁMICA: Mapea el diccionario de enlaces y crea un <li> por cada uno */}
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className="transition-colors hover:text-[var(--color-zoe-blue)]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* BOTÓN DE CONVERSIÓN PRIMARIO (CTA): 
              Separado de la lista estándar para darle peso visual jerárquico. */}
          <Link 
            href="/#agendar" 
            className="rounded-full bg-[var(--color-zoe-blue)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--color-zoe-blue)]/20 transition-all hover:scale-105 hover:bg-[#4375af]"
          >
            Agendar Turno
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA PARA MÓVILES Y TABLETS (Oculto en escritorio 'xl:hidden') */}
        <button 
          className="p-2 text-[var(--color-zoe-dark)] xl:hidden transition-colors hover:text-[var(--color-zoe-blue)]"
          // Al hacer clic, invierte el estado actual (si estaba abierto, lo cierra).
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Alternar menú"
        >
          {/* Renderizado Condicional: Muestra una "X" si está abierto, o las 3 rayas si está cerrado */}
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL: Solo se renderiza si 'isMobileMenuOpen' es true */}
      {/* INVERSIÓN VISUAL: Fondo blanco sólido para garantizar legibilidad en móviles */}
      {isMobileMenuOpen && (
        <div className="border-t border-[var(--color-zoe-blue)]/20 bg-white xl:hidden shadow-lg absolute w-full">
          <ul className="flex flex-col px-6 py-4 text-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className="block py-3 text-sm font-medium text-[var(--color-zoe-muted)] transition-colors hover:text-[var(--color-zoe-blue)]"
                  // Cierra el menú automáticamente después de elegir una sección
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="mt-4 pb-2">
              <Link 
                href="/#agendar" 
                className="block w-full rounded-full bg-[var(--color-zoe-blue)] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[var(--color-zoe-blue)]/20 transition-colors hover:bg-[#4375af]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agendar Turno
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}