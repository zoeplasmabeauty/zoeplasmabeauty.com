DROP TABLE IF EXISTS medical_records;

CREATE TABLE `medical_records` (
	`id` text PRIMARY KEY NOT NULL,
	`appointment_id` text NOT NULL,
	`has_disease` integer NOT NULL,
	`disease_details` text,
	`recent_surgery` text,
	`coagulation_disorder` integer NOT NULL,
	`takes_medication` integer NOT NULL,
	`medication_details` text,
	`allergies` text,
	`skin_type` text NOT NULL,
	`uses_retinoids` integer NOT NULL,
	`retinoids_details` text,
	`uses_sunscreen` integer NOT NULL,
	`smokes` integer NOT NULL,
	`drinks_alcohol` integer NOT NULL,
	`pregnant_nursing` integer NOT NULL,
	`last_menstrual_cycle` text,
	`contraceptive` text,
	`recent_aesthetic_treatments` integer NOT NULL,
	`treatment_details` text,
	`contraindications` text,
	`consent_given` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`service_id` text NOT NULL,
	`appointment_date` text NOT NULL,
	`custom_duration_minutes` integer,
	`status` text DEFAULT 'awaiting_triage' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_appointments`("id", "patient_id", "service_id", "appointment_date", "custom_duration_minutes", "status", "notes", "created_at") SELECT "id", "patient_id", "service_id", "appointment_date", "custom_duration_minutes", "status", "notes", "created_at" FROM `appointments`;--> statement-breakpoint
DROP TABLE `appointments`;--> statement-breakpoint
ALTER TABLE `__new_appointments` RENAME TO `appointments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `patients` ADD `dob` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `instagram` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `address` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `how_found_us` text;--> statement-breakpoint
ALTER TABLE `services` ADD `price` integer DEFAULT 0 NOT NULL;