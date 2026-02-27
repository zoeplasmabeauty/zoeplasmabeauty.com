"use client"; 
// ^ DIRECTIVA CRÍTICA: Le indica a Next.js que este componente debe ejecutarse 
// en el navegador del usuario (cliente) para permitir interactividad (clics, menús móviles).

/**
 * src\components\layout\Navbar.tsx
 * 
 * COMPONENTE: Navbar.tsx
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

export default function Navbar() {
  // ESTADO DE REACT: Controla si el menú móvil está abierto (true) o cerrado (false).
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DICCIONARIO DE NAVEGACIÓN: Mantenemos los enlaces en un arreglo. 
  // Esto es un estándar de alto rendimiento. Si en el futuro agregas una sección, 
  // solo modificas esta lista y el menú se actualiza solo, evitando código espagueti.
  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Conócenos", href: "#conocenos" },
    { name: "Servicios", href: "#servicios" },
    { name: "Antes y Después", href: "#galeria" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    // CONTENEDOR PRINCIPAL (NAV): 
    // 'fixed z-50': Lo ancla al techo de la pantalla y asegura que esté por encima de todo.
    // 'bg-black/80 backdrop-blur-md': Aplica el efecto premium de vidrio esmerilado oscuro.
    // 'border-b': Agrega una línea sutil inferior para separar la barra del contenido.
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-900 bg-black/80 backdrop-blur-md transition-all duration-300">
      
      {/* CAJA DE ALINEACIÓN: Limita el ancho máximo para pantallas gigantes y centra el contenido */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* BLOQUE DE MARCA (LOGO): 
            Al hacer clic, el usuario siempre vuelve arriba. */}
        <a href="#inicio" className="group flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tighter text-white transition-colors group-hover:text-sky-400">
            Zoe <span className="text-sky-500">plasma</span>
          </span>
        </a>

        {/* NAVEGACIÓN DE ESCRITORIO (Oculta en móviles 'hidden md:flex') */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex gap-6 text-sm font-medium text-gray-300">
            {/* ITERACIÓN DINÁMICA: Mapea el diccionario de enlaces y crea un <li> por cada uno */}
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="transition-colors hover:text-sky-400"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          
          {/* BOTÓN DE CONVERSIÓN PRIMARIO (CTA): 
              Separado de la lista estándar para darle peso visual jerárquico. */}
          <a 
            href="#agendar" 
            className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 hover:bg-sky-400"
          >
            Agendar Turno
          </a>
        </div>

        {/* BOTÓN HAMBURGUESA PARA MÓVILES (Oculto en escritorio 'md:hidden') */}
        <button 
          className="p-2 text-gray-400 md:hidden"
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
      {isMobileMenuOpen && (
        <div className="border-t border-gray-900 bg-black md:hidden">
          <ul className="flex flex-col px-6 py-4 text-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="block py-3 text-sm font-medium text-gray-300 hover:text-sky-400"
                  // Cierra el menú automáticamente después de elegir una sección
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li className="mt-4">
              <a 
                href="#agendar" 
                className="block w-full rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-black hover:bg-sky-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agendar Turno
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}