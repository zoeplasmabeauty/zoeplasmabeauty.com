DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS patients;
--> statement-breakpoint
CREATE TABLE patients (
  id TEXT PRIMARY KEY NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);