-- ======================================================================
-- PASO 1: RECONSTRUCCIÓN ESTRUCTURAL COMPLETA (Tear Down)
-- Destruimos en orden inverso de dependencias para no violar Foreign Keys.
-- ======================================================================
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS patients;

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

-- Tabla de Fichas Clínicas
CREATE TABLE medical_records (
  id TEXT PRIMARY KEY NOT NULL,
  appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Sección 3: Antecedentes
  has_disease INTEGER NOT NULL,
  disease_details TEXT,
  recent_surgery TEXT,
  coagulation_disorder INTEGER NOT NULL,
  takes_medication INTEGER NOT NULL,
  medication_details TEXT,
  allergies TEXT,
  
  -- Sección 4: Evaluación Cutánea
  skin_type TEXT NOT NULL,
  uses_retinoids INTEGER NOT NULL,
  retinoids_details TEXT,
  uses_sunscreen INTEGER NOT NULL,
  
  -- Sección 5: Hábitos
  smokes INTEGER NOT NULL,
  drinks_alcohol INTEGER NOT NULL,
  
  -- Sección 6: Salud Hormonal
  pregnant_nursing INTEGER NOT NULL,
  last_menstrual_cycle TEXT,
  contraceptive TEXT,
  
  -- Sección 7: Estética y Riesgos
  recent_aesthetic_treatments INTEGER NOT NULL,
  treatment_details TEXT,
  contraindications TEXT,
  consent_given INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ======================================================================
-- PASO 3: INSERCIÓN DEL CATÁLOGO DE SERVICIOS
-- ======================================================================
INSERT INTO services (id, name, duration_minutes, price, is_active) VALUES 
('fibro-fullface-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Full face', 240, 350000, true),
('fibro-corporal-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area corporal', 240, 350000, true),
('fibro-facial-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area facial', 120, 220000, true),
('estrias-unica-uuid', 'Tratamiento de estrias con plasma fibroblast', 240, 350000, true),
('lesiones-unica-uuid', 'Eliminacion de lesiones benignas', 120, 280000, true),
('skin-unica-uuid', 'Skin regeneration y tratamientos complementarios', 90, 0, true);