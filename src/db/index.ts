/**
 * ARCHIVO: src/db/index.ts
 * ARQUITECTURA: Patrón de Fábrica (Factory Pattern) para Conexión D1
 * * PROPÓSITO ESTRATÉGICO:
 * Cloudflare D1 no usa URLs de conexión estáticas por seguridad. En su lugar, inyecta 
 * la base de datos a través de las variables de entorno (env) en cada petición web. 
 * Esta función recibe ese entorno dinámico y arranca el motor Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { D1Database } from '@cloudflare/workers-types'; 

// Definición estricta (TypeScript) de las variables de entorno de Cloudflare
export interface Env {
  DB: D1Database;
}

// Función maestra de conexión. 
// La llamaremos desde nuestra API cada vez que un paciente intente agendar.
export function createDbConnection(env: Env) {
  // Inicializa Drizzle pasándole la base de datos segura y nuestro mapa de tablas
  return drizzle(env.DB, { schema });
}