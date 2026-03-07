ALTER TABLE `patients` ADD `dni` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `patients_dni_unique` ON `patients` (`dni`);