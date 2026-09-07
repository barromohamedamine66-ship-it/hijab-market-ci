-- Script pour ajouter les Pashminas et les images des catégories

BEGIN;

-- S'assurer que la colonne image_url existe (au cas où elle n'existerait pas)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- 1. Insérer la nouvelle catégorie Pashminas
INSERT INTO public.categories (name, slug, description, emoji, icon, order_index, is_active)
VALUES (
    'Pashminas & Châles', 
    'pashminas', 
    'Pashminas luxueux, châles brodés et étoles pour parfaire vos tenues avec élégance.', 
    '🧣', 
    'sparkles', 
    1.5, -- Pour le placer en haut
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. Mettre à jour les images des catégories existantes
UPDATE public.categories SET image_url = '/images/categories/cat_hijabs.jpg' WHERE slug = 'hijabs-voiles';
UPDATE public.categories SET image_url = '/images/categories/cat_abayas.jpg' WHERE slug = 'abayas-robes';
UPDATE public.categories SET image_url = '/images/categories/cat_boubous_femme.jpg' WHERE slug = 'boubous-femme';
UPDATE public.categories SET image_url = '/images/categories/cat_boubous_homme.jpg' WHERE slug = 'boubous-homme';
UPDATE public.categories SET image_url = '/images/categories/cat_ensembles.jpg' WHERE slug = 'ensembles';
UPDATE public.categories SET image_url = '/images/categories/cat_pashminas.jpg' WHERE slug = 'pashminas';

COMMIT;
