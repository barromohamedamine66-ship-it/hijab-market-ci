-- ==============================================================================
-- HIJAB MARKET CI — Seed Data v2.0
-- ==============================================================================
-- NOTE: Ce seed crée des données de démo pour tester sans compte réel.
-- Exécuter APRÈS schema.sql.
-- ==============================================================================

-- Catégories
INSERT INTO public.categories (id, name, slug, emoji, description, order_index, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hijabs', 'hijabs', '🧕', 'Voiles, foulards et hijabs de toutes matières', 1, TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Abayas', 'abayas', '👗', 'Abayas modernes et traditionnelles', 2, TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Tuniques', 'tuniques', '👚', 'Tuniques longues et courtes', 3, TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Ensembles', 'ensembles', '👘', 'Sets coordonnés prêt-à-porter', 4, TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'Jilbabs', 'jilbabs', '🕌', 'Jilbabs et vêtements de sortie', 5, TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'Accessoires', 'accessoires', '💍', 'Broches, épingles, bijoux et sacs', 6, TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'Sous-hijabs', 'sous-hijabs', '🎀', 'Bonnets, bandeaux et sous-hijabs', 7, TRUE),
  ('c1000000-0000-0000-0000-000000000008', 'Sport Modest', 'sport-modest', '🏃‍♀️', 'Tenues sportives modestes', 8, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- NOTE: Les boutiques et produits de démo nécessitent des UUIDs d'utilisateurs
-- existants dans auth.users. Pour le développement, créez d'abord des comptes
-- test via l'interface Supabase, puis référencez leurs UUIDs ici.
-- ==============================================================================
