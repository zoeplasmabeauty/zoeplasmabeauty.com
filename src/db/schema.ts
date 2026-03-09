/**
 * ARCHIVO: src/db/schema.ts
 * ARQUITECTURA: ORM (Object-Relational Mapping) / Esquema de Base de Datos
 * MOTOR: Drizzle ORM sobre Cloudflare D1 (SQLite)
 * * * PROPÓSITO ESTRATÉGICO:
 * Definir la estructura de datos fidedigna de la aplicación. Actúa como la "Única Fuente de Verdad" 
 * (Single Source of Truth), asegurando que las tablas de la base de datos reflejen con precisión 
 * las entidades de negocio.
 * Permite reprogramaciones con tiempos personalizados por paciente sin afectar el catálogo general de servicios.
 * * * RESPONSABILIDADES:
 * 1. Modelado de Entidades: Definir tablas (Pacientes, Servicios, Turnos) y sus tipos de datos.
 * 2. Integridad Referencial: Establecer relaciones (Foreign Keys) y reglas de borrado.
 * 3. Validación de Capa de Datos: Impedir mediante restricciones (notNull, unique) que 
 * entren datos corruptos o incompletos al sistema.
 * 4. Gestiona el costo total de los tratamientos vs la seña.
 * 5. Incorpora la Máquina de Estados de Aprobación y la Ficha Clínica (Triage).
 * 6. Gestiona los bloqueos temporales de agenda (Vacaciones/Cierres).
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

  // ====================================================================
  // EXPANSIÓN DE FICHA TÉCNICA (Sección 2)
  // Datos complementarios que se llenarán en el Paso 2 de la reserva.
  // ====================================================================
  dob: text("dob"), // Fecha de nacimiento
  instagram: text("instagram"),
  address: text("address"),
  howFoundUs: text("how_found_us"), // Ej: Google, Instagram, Recomendación
  
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
  
  // Precio completo del servicio. Permite guardar valor total.
  price: integer("price").notNull().default(0), 
  
  // INYECCIÓN DE PRECIOS DINÁMICOS:
  // Almacena el valor exacto de la seña que el paciente debe abonar por Mercado Pago 
  // para reservar este servicio en particular. Se establece un default de 30000.
  deposit: integer("deposit").notNull().default(30000),
  
  // Permite desactivar servicios sin borrarlos, manteniendo la integridad de turnos históricos.
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), 
});

// -----------------------------------------------------------------------------
// TABLA 3: TURNOS (Agenda y Máquina de Estados)
// Responsabilidad: La tabla transaccional crítica. Relaciona a un paciente 
// con un servicio en una fecha y hora específica, guiando el flujo de aprobación.
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
  
  // ====================================================================
  // CONTROL DE TIEMPO PERSONALIZADO
  // Permite al admin modificar la duración de un turno específico por 
  // complejidad del paciente sin alterar la tabla 'services'.
  // ====================================================================
  customDurationMinutes: integer("custom_duration_minutes"), 

  // ====================================================================
  // MOTOR DE ESTADOS (STATE MACHINE)
  // Controla en qué punto del embudo de aprobación y pago se encuentra el turno.
  // ====================================================================
  status: text("status", { enum: [
    "awaiting_triage", // 1. El paciente eligió hora pero no ha enviado su ficha clínica.
    "under_review",    // 2. Ficha recibida. El admin debe evaluar si es apto.
    "approved_unpaid", // 3. Admin aprobó. Esperando el pago de seña en Mercado Pago.
    "confirmed",       // 4. Pago recibido. Turno 100% oficial.
    "rejected",        // 5. Admin rechazó por contraindicaciones médicas.
    "completed",       // 6. El paciente asistió y se realizó el tratamiento.
    "cancelled"        // 7. El paciente canceló o el tiempo de pago expiró (O admin lo cancela manualmente).
  ] })
    .notNull()
    .default("awaiting_triage"),
  
  // Notas internas clínicas o mensajes dejados por el paciente durante la reserva
  notes: text("notes"),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// -----------------------------------------------------------------------------
// TABLA 4: FICHAS CLÍNICAS (Triage y Anamnesis)
// Responsabilidad: Almacenar las respuestas del formulario de salud para proteger 
// legal y médicamente a la clínica. Se vincula al turno específico.
// -----------------------------------------------------------------------------
export const medicalRecords = sqliteTable("medical_records", {
  id: text("id").primaryKey(),
  
  // Vínculo directo con el turno (1 Turno = 1 Ficha para evaluar su estado particular ese día)
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),

  // SECCIÓN 3: Antecedentes de Salud
  hasDisease: integer("has_disease", { mode: "boolean" }).notNull(),
  diseaseDetails: text("disease_details"),
  recentSurgery: text("recent_surgery"),
  coagulationDisorder: integer("coagulation_disorder", { mode: "boolean" }).notNull(),
  takesMedication: integer("takes_medication", { mode: "boolean" }).notNull(),
  medicationDetails: text("medication_details"),
  allergies: text("allergies"),

  // SECCIÓN 4: Evaluación Cutánea
  skinType: text("skin_type", { enum: ["Seca", "Mixta", "Grasa", "Sensible", "Reactiva"] }).notNull(),
  usesRetinoids: integer("uses_retinoids", { mode: "boolean" }).notNull(),
  retinoidsDetails: text("retinoids_details"),
  usesSunscreen: integer("uses_sunscreen", { mode: "boolean" }).notNull(),

  // SECCIÓN 5: Hábitos
  smokes: integer("smokes", { mode: "boolean" }).notNull(),
  drinksAlcohol: integer("drinks_alcohol", { mode: "boolean" }).notNull(),

  // SECCIÓN 6: Salud Hormonal
  pregnantNursing: integer("pregnant_nursing", { mode: "boolean" }).notNull(),
  lastMenstrualCycle: text("last_menstrual_cycle"),
  contraceptive: text("contraceptive"),

  // SECCIÓN 7: Antecedentes Estéticos y Contraindicaciones
  recentAestheticTreatments: integer("recent_aesthetic_treatments", { mode: "boolean" }).notNull(),
  treatmentDetails: text("treatment_details"),
  
  // Guardaremos las contraindicaciones seleccionadas como un string JSON (array). 
  // Ej: '["Uso de marcapasos", "Diabetes no controlada"]'
  contraindications: text("contraindications"), 
  
  // Firma digital / Checkbox de consentimiento (Protección legal)
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// -----------------------------------------------------------------------------
// TABLA 5: FECHAS BLOQUEADAS (Vacaciones / Cierres)
// Responsabilidad: Almacenar rangos de fechas donde la clínica no atenderá.
// El motor de disponibilidad leerá esta tabla para anular el calendario en el frontend.
// -----------------------------------------------------------------------------
export const blockedDates = sqliteTable("blocked_dates", {
  id: text("id").primaryKey(),
  
  // Fecha de inicio del bloqueo (Formato estricto YYYY-MM-DD)
  startDate: text("start_date").notNull(),
  
  // Fecha de fin del bloqueo (Formato estricto YYYY-MM-DD)
  endDate: text("end_date").notNull(),
  
  // Motivo del cierre (Ej: "Vacaciones de Verano", "Refacciones"). Útil para gestión interna.
  reason: text("reason"),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});