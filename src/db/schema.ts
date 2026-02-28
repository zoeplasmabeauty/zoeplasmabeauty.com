/**
 * ARCHIVO: src/db/schema.ts
 * ARQUITECTURA: ORM (Object-Relational Mapping) / Esquema de Base de Datos
 * MOTOR: Drizzle ORM sobre Cloudflare D1 (SQLite)
 * * * PROPÓSITO ESTRATÉGICO:
 * Definir la estructura de datos fidedigna de la aplicación. Actúa como la "Única Fuente de Verdad" 
 * (Single Source of Truth), asegurando que las tablas de la base de datos reflejen con precisión 
 * las entidades de negocio.
 * * * RESPONSABILIDADES:
 * 1. Modelado de Entidades: Definir tablas (Pacientes, Servicios, Turnos) y sus tipos de datos.
 * 2. Integridad Referencial: Establecer relaciones (Foreign Keys) y reglas de borrado.
 * 3. Validación de Capa de Datos: Impedir mediante restricciones (notNull, unique) que 
 * entren datos corruptos o incompletos al sistema.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// -----------------------------------------------------------------------------
// TABLA 1: PACIENTES (Clientes)
// Responsabilidad: Almacenar los datos de contacto para confirmaciones y marketing.
// -----------------------------------------------------------------------------
export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  
  // DNI como identificador único humano para evitar duplicidad de fichas clínicas.
  dni: text("dni").notNull().unique(), // <- NUEVA COLUMNA CRÍTICA Y ÚNICA
  
  fullName: text("full_name").notNull(),
  
  phone: text("phone").notNull(),
  
  // INYECCIÓN DE INTEGRIDAD: Se define como .notNull() para obligar al registro 
  // de una vía de comunicación digital para el envío de instrucciones post-turno.
  email: text("email").notNull(), 
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`), 
});

// -----------------------------------------------------------------------------
// TABLA 2: SERVICIOS (Tratamientos Ofrecidos)
// Responsabilidad: Catálogo interno. Separar esto permite cambiar precios 
// o duraciones en el futuro sin alterar el historial de turnos pasados.
// -----------------------------------------------------------------------------
export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  
  name: text("name").notNull(), // Ej: "Blefaroplastia No Invasiva"
  
  durationMinutes: integer("duration_minutes").notNull(), // Ej: 45
  
  // Permite desactivar servicios sin borrarlos, manteniendo la integridad de turnos históricos.
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), 
});

// -----------------------------------------------------------------------------
// TABLA 3: TURNOS (Agenda)
// Responsabilidad: La tabla transaccional crítica. Relaciona a un paciente 
// con un servicio en una fecha y hora específica.
// -----------------------------------------------------------------------------
export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  
  // Relaciones (Foreign Keys): Conectan el turno con el paciente y el servicio
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // Si se borra el paciente, se borran sus turnos
    
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }), // No permite borrar un servicio si tiene turnos asignados
  
  // Fecha y Hora del turno en formato ISO 8601 de texto (Estándar seguro para SQLite)
  appointmentDate: text("appointment_date").notNull(), 
  
  // Estado del embudo del turno (Control de flujo operativo)
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] })
    .notNull()
    .default("pending"),
  
  // Notas internas clínicas o mensajes dejados por el paciente durante la reserva
  notes: text("notes"),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});