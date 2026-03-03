-- Insertamos los nuevos registros maestros.
INSERT INTO services (id, name, duration_minutes, price, is_active) VALUES 
-- CATEGORÍA 1: Plasma Fibroblast
('fibro-fullface-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Full face', 240, 350000, true),
('fibro-corporal-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area corporal', 240, 300000, true),
('fibro-facial-uuid', 'Plasma Fibroblast Rejuvenecimiento sin cirugía - Por area facial', 120, 220000, true),

-- CATEGORÍA 2: Estrías
('estrias-unica-uuid', 'Tratamiento de estrias con plasma fibroblast', 240, 350000, true),

-- CATEGORÍA 3: Lesiones
('lesiones-unica-uuid', 'Eliminacion de lesiones benignas', 120, 280000, true),

-- CATEGORÍA 4: Skin
('skin-unica-uuid', 'Skin regeneration y tratamientos complementarios', 90, 0, true);