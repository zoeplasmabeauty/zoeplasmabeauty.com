-- ======================================================================
-- PASO 1: RECONSTRUCCIÓN ESTRUCTURAL COMPLETA (Tear Down)
-- Destruimos en orden inverso de dependencias para no violar Foreign Keys.
-- ======================================================================
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS blocked_dates;

-- ======================================================================
-- PASO 2: CREACIÓN DE TABLAS (Stand Up)
-- Mapeo exacto de Drizzle ORM a SQLite puro.
-- ======================================================================
CREATE TABLE patients (
  id TEXT PRIMARY KEY NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  dob TEXT,
  instagram TEXT,
  address TEXT,
  how_found_us TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE services (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  deposit INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT true
);

CREATE TABLE appointments (
  id TEXT PRIMARY KEY NOT NULL,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON UPDATE no action ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON UPDATE no action ON DELETE RESTRICT,
  appointment_date TEXT NOT NULL,
  custom_duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'awaiting_triage',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE blocked_dates (
	id text PRIMARY KEY NOT NULL,
	start_date text NOT NULL,
	end_date text NOT NULL,
	reason text,
	created_at integer DEFAULT (unixepoch()) NOT NULL
);

-- Tabla de Fichas Esteticas
CREATE TABLE medical_records (
  id TEXT PRIMARY KEY NOT NULL,
  appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Sección: Anamnesis | Declaración
  under_medical_treatment INTEGER NOT NULL, -- 0: No, 1: Si
  medical_treatment_details TEXT,
  takes_medication INTEGER NOT NULL,
  medication_details TEXT,
  recent_surgery INTEGER NOT NULL,
  surgery_details TEXT,
  allergies INTEGER NOT NULL,
  allergies_details TEXT,
  uses_retinoids INTEGER NOT NULL,
  retinoids_details TEXT,
  uses_sunscreen INTEGER NOT NULL,
  
  -- Sección: Hábitos y Condiciones
  smokes INTEGER NOT NULL,
  drinks_alcohol INTEGER NOT NULL,
  conditions TEXT, -- Guardaremos el array de checkboxes (Embarazo, Diabetes, etc.) como JSON string
  observations TEXT,
  
  -- Sección: Evaluación Estética (No Médica)
  skin_type TEXT NOT NULL, -- Normal, Seca, Mixta, Grasa, Deshidratada
  skin_status TEXT, -- Guardaremos el array (Sensible, Manchas, etc.) como JSON string
  recent_aesthetic_treatments INTEGER NOT NULL,
  treatment_details TEXT,
  
  -- Sección: Declaración y Firma
  signature TEXT NOT NULL, -- Nombre completo del paciente que actúa como firma
  consent_given INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ======================================================================
-- PASO 3: INSERCIÓN DEL CATÁLOGO DE SERVICIOS
-- ======================================================================
INSERT INTO services (id, name, duration_minutes, price, deposit, is_active) VALUES 
('fibro-fullface-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Full face', 240, 350000, 50000,true),
('fibro-corporal-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area corporal', 240, 350000, 50000, true),
('fibro-facial-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area facial', 120, 220000, 50000, true),
('estrias-unica-uuid', 'Tratamiento de estrias con plasma fibroblast', 240, 350000, 50000, true),
('lesiones-unica-uuid', 'Eliminacion de lesiones benignas', 120, 280000, 50000, true),
('skin-unica-uuid', 'Skin regeneration y tratamientos complementarios', 120, 30000, 30000, true);