import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // Ruta donde escribiremos nuestras tablas
  out: './drizzle', // Carpeta donde se guardará el historial de migraciones (SQL generado)
  dialect: 'sqlite', // Cloudflare D1 funciona sobre SQLite
  driver: 'd1-http',
});