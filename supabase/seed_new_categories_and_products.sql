-- ==============================================================================
-- SCRIPT DE MISE À JOUR OFFICIEL : NOUVELLES CATÉGORIES ET RAYONS
-- Marketplace Élégance, Modestie & Art de Vivre Islamique
-- ==============================================================================

BEGIN;

-- 1. S'assurer que la colonne image_url existe sur categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Insérer / Mettre à jour toutes les 12 catégories principales
INSERT INTO public.categories (id, name, slug, emoji, icon, description, image_url, order_index, is_active)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Hijabs & Voiles',
    'hijabs-voiles',
    '🧕',
    'sparkles',
    'Soie de Médine, mousseline, jersey, plissé, turbans',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    1,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Abayas & Robes',
    'abayas-robes',
    '👑',
    'crown',
    'Abayas Dubaï, robes longues, kimonos chics et tenues de fête',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    2,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000013',
    'Lunettes & Montures',
    'lunettes-montures',
    '👓',
    'eye',
    'Montures tendance hijabi, lunettes anti-lumière bleue et solaires UV400',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    3,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000010',
    'Parfums & Muscs',
    'parfumerie-muscs',
    '✨',
    'sparkles',
    'Musc Tahara pur, Oud de Dubaï, huiles précieuses et encens Bakhour',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    4,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000014',
    'Chapelets & Tapis',
    'spiritualite-tapis',
    '📿',
    'moon',
    'Tapis de prière orthopédiques, chapelets Tasbih en cristal et Corans de luxe',
    'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
    5,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000015',
    'Soins Sunnah',
    'soins-sunnah',
    '🌿',
    'heart',
    'Huile et savons de Nigelle pure, bâtons de Siwak frais et Henné naturel',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    6,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000016',
    'Coffrets Cadeaux',
    'coffrets-cadeaux',
    '🎁',
    'gift',
    'Coffrets mariage, dot, Aïd, coffrets prestige Coran, tapis & muscs',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80',
    7,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'Qamis & Homme',
    'boubous-homme',
    '👔',
    'shirt',
    'Qamis émiratis, grands boubous 3 pièces et chéchias brodées',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80',
    8,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'Boubous Femme',
    'boubous-femme',
    '🌸',
    'gem',
    'Bazin riche Getzner, soie, broderies raffinées et coupes modernes',
    'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=800&auto=format&fit=crop&q=80',
    9,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    'Ensembles & Prêt-à-porter',
    'ensembles-pret-a-porter',
    '👗',
    'layout',
    'Ensembles modestes, tailleurs amples, tuniques et pantalons',
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&auto=format&fit=crop&q=80',
    10,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000008',
    'Accessoires & Sous-hijabs',
    'accessoires-sous-hijabs',
    '💎',
    'sparkles',
    'Épingles magnétiques, bonnets croisés, cagoules et bandeaux',
    'https://images.unsplash.com/photo-1611080313621-e946a36c4bba?w=800&auto=format&fit=crop&q=80',
    11,
    TRUE
  ),
  (
    'c1000000-0000-0000-0000-000000000011',
    'Autres & Artisanat',
    'autres',
    '🏷️',
    'tag',
    'Autres articles de mode modeste et lifestyle islamique',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
    12,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

COMMIT;
