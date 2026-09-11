-- ==============================================================================
-- HIJAB MARKET CI — Seed Data v2.6 (Images Réelles Locales HD & Muslim Design)
-- ==============================================================================
-- NOTE: Exécuter dans le SQL Editor de Supabase.
-- ==============================================================================

-- 1. S'assurer que la colonne image_url existe
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Insertion / Mise à jour des Catégories Officielles avec Vraies Images HD
INSERT INTO public.categories (name, slug, emoji, icon, description, image_url, order_index, is_active) VALUES
  ('Hijabs & Voiles', 'hijabs-voiles', '🧕', 'sparkles', 'Soie de Médine, mousseline, jersey premium, plissés et turbans chics', '/images/categories/cat_hijabs.jpg', 1, TRUE),
  ('Abayas & Robes', 'abayas-robes', '👑', 'crown', 'Abayas Dubaï brodées, kimonos luxe, robes longues et tenues de fête', '/images/categories/cat_abayas.jpg', 2, TRUE),
  ('Bazins & Tissus', 'bazins-tissus', '🪡', 'layers', 'Bazin riche Getzner authentique damassé, bazin brodé, soies et pagnes nobles', '/images/categories/cat_bazins.jpg', 3, TRUE),
  ('Boubous Femme', 'boubous-femme', '🌸', 'gem', 'Grands boubous ivoiriens et sénégalais, broderies dorées et coupes nobles', '/images/categories/cat_boubous_femme.jpg', 4, TRUE),
  ('Ensembles & Prêt-à-porter', 'ensembles-pret-a-porter', '👗', 'layout', 'Ensembles modestes coordonnés, tailleurs amples et tuniques élégantes', '/images/categories/cat_ensembles.jpg', 5, TRUE),
  ('Qamis & Homme', 'tenues-homme', '👔', 'shirt', 'Grands boubous homme 3 pièces brodés en bazin blanc, qamis et chéchias', '/images/categories/cat_boubous_homme.jpg', 6, TRUE),
  ('Gourdes & Thermos', 'gourdes-thermos', '🍼', 'coffee', 'Gourdes isothermes Bismillah inox double paroi, thermos infuseur & lifestyle', '/images/categories/cat_gourdes.jpg', 7, TRUE),
  ('Mode Enfants', 'mode-enfants', '👶', 'heart', 'Hijabs fillettes, mini abayas, qamis garçons et ensembles Aïd', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80', 8, TRUE),
  ('Bonnets & Accessoires Hijab', 'bonnets-accessoires-hijab', '💎', 'sparkles', 'Bonnets croisés satin, épingles magnétiques, cagoules et bandeaux', 'https://images.unsplash.com/photo-1611080313621-e946a36c4bba?w=800&auto=format&fit=crop&q=80', 9, TRUE),
  ('Sacs & Maroquinerie', 'sacs-chaussures', '👜', 'shopping-bag', 'Sacs à main modestes, pochettes d''apparat et cabas élégants', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80', 10, TRUE),
  ('Bijoux & Parures', 'bijoux-accessoires', '✨', 'gem', 'Parures dorées orientales, pendentifs calligraphie Allah, bagues et bracelets', '/images/categories/cat_bijoux.jpg', 11, TRUE),
  ('Parfums, Muscs & Sunnah', 'beaute-cosmetiques', '🌿', 'heart', 'Musc Tahara blanc crémeux authentique, huiles d’Oud royal, bakhoor et siwak', '/images/categories/cat_muscs.jpg', 12, TRUE),
  ('Coffrets & Cadeaux', 'cadeaux-coffrets', '🎁', 'gift', 'Coffrets Coran avec Tasbih, trousseaux de mariage, coffrets Aïd et dot', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80', 13, TRUE),
  ('Tapis de Prière & Déco', 'tapis-deco', '🕌', 'compass', 'Tapis de prière en velours émeraude & or avec mihrab, tasbih en perles', '/images/categories/cat_tapis_priere.jpg', 14, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;
