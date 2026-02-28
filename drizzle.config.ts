/**
 * ARCHIVO: drizzle.config.ts
 * ARQUITECTURA: Archivo de Configuración Global del ORM (Object-Relational Mapping)
 * * PROPÓSITO Y RESPONSABILIDADES:
 * 1. Mapeo de Infraestructura: Actúa como el "plano maestro" para la herramienta CLI de Drizzle, 
 * indicándole exactamente dónde leer nuestra estructura lógica (schema.ts).
 * 2. Generación de SQL: Define la ruta de salida ('out') donde el sistema traducirá 
 * nuestro código TypeScript a sentencias SQL puras (migraciones) listas para la base de datos.
 * 3. Compatibilidad de Motor: Declara estrictamente el dialecto 'sqlite' y el driver 'd1-http' 
 * para garantizar que todo el código generado sea 100% compatible con la arquitectura 
 * Serverless de Cloudflare D1.
 */

// INVERSIÓN SINTÁCTICA: Usamos importación de tipos (type { Config }) en lugar de 
// la función defineConfig para asegurar compatibilidad total con cualquier versión de Drizzle.
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts', // Ruta donde escribiremos nuestras tablas
  out: './drizzle', // Carpeta donde se guardará el historial de migraciones (SQL generado)
  dialect: 'sqlite', // OBLIGATORIO en versiones modernas: Especifica el motor SQLite
} satisfies Config; // El operador 'satisfies' obliga a TypeScript a validar la estructura sin requerir funciones extra.