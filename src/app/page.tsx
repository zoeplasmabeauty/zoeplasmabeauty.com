/**
 * ARCHIVO: src/app/page.tsx
 * ARQUITECTURA: Orquestador Principal (Server Component)
 * PROPÓSITO: Ensamblar la estructura maestra de la landing page.
 * Actúa como el esqueleto visual de la aplicación, importando y apilando de forma 
 * secuencial y semántica todas las secciones de la interfaz para renderizarlas 
 * en el navegador, manteniendo una estricta separación de responsabilidades.
 */

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import BookingPlaceholder from "@/components/sections/BookingPlaceholder";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-zoe-mint)] text-[var(--color-zoe-dark)] selection:bg-[var(--color-zoe-blue)] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <BookingPlaceholder />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}