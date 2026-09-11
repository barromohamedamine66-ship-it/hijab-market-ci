-- ==============================================================================
-- HIJAB MARKET CI — Seed Data v2.5 (Élégance Modeste & Lifestyle Islamique)
-- ==============================================================================
-- NOTE: Exécuter APRÈS schema.sql.
-- ==============================================================================

-- Catégories Officielles avec Vraies Images HD
INSERT INTO public.categories (id, name, slug, emoji, icon, description, image_url, order_index, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hijabs & Voiles', 'hijabs-voiles', '🧕', 'sparkles', 'Soie de Médine, mousseline, jersey premium, plissés et turbans chics', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80', 1, TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Abayas & Robes', 'abayas-robes', '👑', 'crown', 'Abayas Dubaï brodées, kimonos luxe, robes longues et tenues de fête', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', 2, TRUE),
  ('c1000000-0000-0000-0000-000000000020', 'Bazins & Tissus', 'bazins-tissus', '🪡', 'layers', 'Bazin riche Getzner, bazin brodé, soies, pagnes et dentelles raffinées', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80', 3, TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Boubous Femme', 'boubous-femme', '🌸', 'gem', 'Grands boubous ivoiriens et sénégalais, broderies dorées et coupes nobles', 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=800&auto=format&fit=crop&q=80', 4, TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Ensembles & Prêt-à-porter', 'ensembles-pret-a-porter', '👗', 'layout', 'Ensembles modestes coordonnés, tailleurs amples et tuniques élégantes', 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&auto=format&fit=crop&q=80', 5, TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Qamis & Homme', 'tenues-homme', '👔', 'shirt', 'Qamis émiratis et saoudiens, grands boubous 3 pièces et chéchias', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80', 6, TRUE),
  ('c1000000-0000-0000-0000-000000000024', 'Gourdes & Thermos', 'gourdes-thermos', '🍼', 'coffee', 'Gourdes isothermes Bismillah, thermos inox, bouteilles infuseur & lifestyle', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80', 7, TRUE),
  ('c1000000-0000-0000-0000-000000000021', 'Mode Enfants', 'mode-enfants', '👶', 'heart', 'Hijabs fillettes, mini abayas, qamis garçons et ensembles Aïd', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80', 8, TRUE),
  ('c1000000-0000-0000-0000-000000000008', 'Bonnets & Accessoires Hijab', 'bonnets-accessoires-hijab', '💎', 'sparkles', 'Bonnets croisés satin, épingles magnétiques, cagoules et bandeaux', 'https://images.unsplash.com/photo-1611080313621-e946a36c4bba?w=800&auto=format&fit=crop&q=80', 9, TRUE),
  ('c1000000-0000-0000-0000-000000000022', 'Sacs & Maroquinerie', 'sacs-chaussures', '👜', 'shopping-bag', 'Sacs à main modestes, pochettes d''apparat et cabas élégants', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80', 10, TRUE),
  ('c1000000-0000-0000-0000-000000000023', 'Bijoux & Parures', 'bijoux-accessoires', '✨', 'gem', 'Parures dorées, bagues fines, colliers calligraphie et bracelets d''Orient', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80', 11, TRUE),
  ('c1000000-0000-0000-0000-000000000010', 'Parfums, Muscs & Sunnah', 'beaute-cosmetiques', '🌿', 'heart', 'Musc Tahara blanc, huiles de parfum de Dubaï, encens Bakhoor et siwak', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80', 12, TRUE),
  ('c1000000-0000-0000-0000-000000000016', 'Coffrets & Cadeaux', 'cadeaux-coffrets', '🎁', 'gift', 'Coffrets Coran avec Tasbih, trousseaux de mariage, coffrets Aïd et dot', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80', 13, TRUE),
  ('c1000000-0000-0000-0000-000000000011', 'Tapis de Prière & Déco', 'tapis-deco', '🕌', 'compass', 'Tapis de prière rembourrés en velours, cadres calligraphie islamique', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop&q=80', 14, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  emoji = EXCLUDED.emoji,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;
