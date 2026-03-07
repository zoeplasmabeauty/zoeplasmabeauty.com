/**
 * ARCHIVO: src/app/layout.tsx
 * ARQUITECTURA: Root Layout (Envoltura global de la aplicación)
 * * PROPÓSITO ESTRATÉGICO:
 * Definir la estructura HTML base y centralizar la configuración SEO estática.
 * Este archivo inyecta automáticamente las etiquetas <meta> en el <head> de cada página.
 * * ACTUALIZACIÓN SEO:
 * Se reemplazó la configuración por defecto ("Create Next App") por una estructura
 * robusta de Open Graph y Metadatos. Esto asegura que al compartir enlaces por 
 * WhatsApp o redes sociales, se genere una tarjeta visual elegante y profesional.
 * También se cambió el idioma de "en" a "es" para indexación correcta en Google.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================================
// MOTOR DE METADATOS Y SEO GLOBAL
// ============================================================================
export const metadata: Metadata = {
  // metadataBase es vital para que las imágenes Open Graph usen rutas relativas correctamente
  metadataBase: new URL("https://www.zoeplasmabeauty.com"), 
  
  title: {
    default: "Zoe Plasma Beauty | Centro de Estética Avanzada",
    // El 'template' se aplica a páginas secundarias. Ej: Si estás en /sobre-mi, 
    // el título será automáticamente "Sobre Mí | Zoe Plasma Beauty"
    template: "%s | Zoe Plasma Beauty" 
  },
  description: "Centro especializado en regeneración cutánea, Plasma Fibroblast y rejuvenecimiento consciente. Evaluaciones personalizadas y resultados armónicos.",
  keywords: [
    "Plasma Fibroblast", 
    "Estética Avanzada", 
    "Regeneración Cutánea", 
    "Rejuvenecimiento", 
    "Cosmiatría", 
    "Zoe Pérez", 
    "Cuidado de la piel"
  ],
  authors: [{ name: "Zoe Pérez" }],
  
  // CONFIGURACIÓN OPEN GRAPH (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "es_AR", // Define la región y el idioma principal para los algoritmos
    url: "https://www.zoeplasmabeauty.com",
    siteName: "Zoe Plasma Beauty",
    title: "Zoe Plasma Beauty | Centro de Estética",
    description: "Especialistas en regeneración cutánea y Plasma Fibroblast. Agenda tu evaluación.",
    images: [
      {
        url: "/og-image.jpg", // La ruta a tu imagen de 1200x630px
        width: 1200,
        height: 630,
        alt: "Zoe Plasma Beauty - Rejuvenecimiento Consciente",
      },
    ],
  },
  
  // CONFIGURACIÓN TWITTER CARDS (Twitter / X)
  twitter: {
    card: "summary_large_image",
    title: "Zoe Plasma Beauty | Estética Avanzada",
    description: "Especialistas en regeneración cutánea y Plasma Fibroblast.",
    images: ["/og-image.jpg"],
  },
  
  // INSTRUCCIONES PARA LOS MOTORES DE BÚSQUEDA
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // CAMBIO CRÍTICO DE ACCESIBILIDAD: De "en" a "es"
    <html lang="es" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}