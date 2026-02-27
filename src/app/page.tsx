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
    // INVERSIÓN ARQUITECTÓNICA: 
    // Pasamos de 'bg-black text-white' a las variables dinámicas de tu nueva marca.
    // 'selection:bg-zoe-blue' hará que cuando el usuario subraye un texto, se vea en tu azul de acento.
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