/**
 * ARCHIVO: next.config.mjs
 * ARQUITECTURA: Configuración Maestra de Next.js (ES Module)
 * * PROPÓSITO ESTRATÉGICO:
 * Al usar la extensión .mjs, desbloqueamos el uso nativo de 'await' en el nivel 
 * superior, permitiendo que Cloudflare inyecte la base de datos local directamente 
 * en el motor de Next.js antes de que la página termine de cargar.
 */

import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// INYECCIÓN DE INFRAESTRUCTURA LOCAL:
// Esto lee tu wrangler.toml y conecta la base de datos SQLite física a la variable env.DB
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;