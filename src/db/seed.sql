-- ARCHIVO: src/db/seed.sql
-- ARQUITECTURA: Script de Sembrado Inicial (Operación de única ejecución)
-- PROPÓSITO: Poblar la tabla 'services' con el catálogo oficial de Zoe Plasma Beauty.
-- NOTA: Se utilizan IDs estáticos y legibles ('srv_01...') para facilitar la depuración 
-- y la vinculación manual durante la Fase 1.

INSERT OR REPLACE INTO services (id, name, duration_minutes, is_active) VALUES
('srv_01_lifting', 'Lifting Facial sin Cirugía (Fibroblast)', 60, 1),
('srv_02_blefaro', 'Blefaroplastia No Invasiva', 45, 1),
('srv_03_estrias', 'Eliminación de Estrías', 90, 1),
('srv_04_verrugas', 'Remoción de Verrugas y Manchas', 30, 1);