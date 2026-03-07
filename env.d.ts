/**
 * ARCHIVO: env.d.ts
 * PROPÓSITO: Extender las definiciones globales de Cloudflare para que 
 * TypeScript reconozca nuestra base de datos 'DB'.
 */

import { D1Database } from "@cloudflare/workers-types";

interface CloudflareEnv {
  DB: D1Database;
}

// Esto asegura que getRequestContext().env reconozca la propiedad DB
declare global {
  interface CloudflareEnv extends CloudflareEnv {}
}