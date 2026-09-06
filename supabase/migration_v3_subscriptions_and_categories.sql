-- ==============================================================================
-- HIJAB MARKET CI — Migration v3.0
-- Nouvelle Vision : Mode Pudique & Traditionnelle CI, Abonnements & Boutiques Fondatrices
-- ==============================================================================

-- 1. Table des Formules d'Abonnement (subscription_plans)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    duration TEXT NOT NULL DEFAULT 'mensuel',
    description TEXT,
    max_products INTEGER NOT NULL DEFAULT 10,
    featured_products INTEGER NOT NULL DEFAULT 0,
    analytics BOOLEAN DEFAULT FALSE,
    priority_visibility BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mise à jour de la table des Boutiques (shops)
ALTER TABLE public.shops 
    ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS free_trial_start TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS free_trial_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
    ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS opening_hours TEXT,
    ADD COLUMN IF NOT EXISTS social_instagram TEXT,
    ADD COLUMN IF NOT EXISTS social_facebook TEXT,
    ADD COLUMN IF NOT EXISTS social_tiktok TEXT;

-- 3. Table des Abonnements Effectifs (subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    is_founder BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insertion des Formules d'Abonnement Initiales (Prix modifiables par l'admin)
INSERT INTO public.subscription_plans (name, slug, price, duration, description, max_products, featured_products, analytics, priority_visibility, active)
VALUES 
(
    'Formule Découverte',
    'decouverte',
    0,
    'gratuit',
    'Idéale pour lancer sa boutique en ligne et tester la plateforme sans frais.',
    10,
    0,
    FALSE,
    FALSE,
    TRUE
),
(
    'Formule Business',
    'business',
    15000,
    'mensuel',
    'Pour les boutiques qui souhaitent accélérer leurs ventes et obtenir des statistiques.',
    50,
    5,
    TRUE,
    TRUE,
    TRUE
),
(
    'Formule Premium',
    'premium',
    30000,
    'mensuel',
    'Visibilité maximale, catalogue illimité, badge d''excellence et support prioritaire.',
    -1, -- illimité
    15,
    TRUE,
    TRUE,
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_products = EXCLUDED.max_products,
    featured_products = EXCLUDED.featured_products,
    analytics = EXCLUDED.analytics,
    priority_visibility = EXCLUDED.priority_visibility;

-- 5. Insertion Dynamique des 11 Catégories Officielles (Mode Pudique & Traditionnelle CI)
INSERT INTO public.categories (name, slug, description, emoji, icon, order_index, is_active)
VALUES 
('Hijabs & Voiles', 'hijabs-voiles', 'Soie de Médine, mousseline, jersey, plissés et voiles de cérémonie', '🧕', 'sparkles', 1, TRUE),
('Abayas & Robes', 'abayas-robes', 'Abayas Dubaï, kimonos chics, robes longues et caftans modernes', '👑', 'crown', 2, TRUE),
('Boubous Femme', 'boubous-femme', 'Boubous traditionnels ivoiriens, brodés, basin riche et tenues de fête', '✨', 'gem', 3, TRUE),
('Boubous Homme', 'boubous-homme', 'Grands boubous homme, ensembles trois pièces et tuniques élégantes', '👔', 'award', 4, TRUE),
('Ensembles', 'ensembles', 'Ensembles assortis jupe/pantalon, vestes longues et tenues modernes', '👗', 'layout', 5, TRUE),
('Vêtements Islamiques', 'vetements-islamiques', 'Jilbabs, khimars, bonnets sous-hijabs et tenues de prière', '🌸', 'heart', 6, TRUE),
('Mode Pudique', 'mode-pudique', 'Chemises amples, trenchs modestes et prêt-à-porter élégant', '🌟', 'star', 7, TRUE),
('Accessoires', 'accessoires', 'Épingles magnétiques, ceintures, turbans et pochettes assorties', '💎', 'package', 8, TRUE),
('Chaussures', 'chaussures', 'Babouches artisanales, escarpins sobres et mules confortables', '👡', 'check', 9, TRUE),
('Bijoux', 'bijoux', 'Parures raffinées, bracelets, colliers et montres pour parfaire vos tenues', '💍', 'gift', 10, TRUE),
('Autres Articles de Mode', 'autres-articles', 'Découvrez toutes les créations et nouveautés de nos ateliers', '🛍️', 'shopping-bag', 11, TRUE)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    emoji = EXCLUDED.emoji,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;

-- 6. Index de Performance
CREATE INDEX IF NOT EXISTS idx_shops_founder ON public.shops(is_founder);
CREATE INDEX IF NOT EXISTS idx_shops_subscription ON public.shops(subscription_status);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(order_index) WHERE is_active = TRUE;

-- 7. Politiques de Sécurité Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Lecture publique des formules d'abonnement actives
CREATE POLICY "Public read active subscription plans" ON public.subscription_plans
    FOR SELECT USING (active = TRUE);

-- Administration des formules
CREATE POLICY "Admin full access subscription plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Les vendeurs peuvent voir l'abonnement de leur boutique
CREATE POLICY "Sellers view own shop subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shops
            WHERE shops.id = subscriptions.store_id AND shops.owner_id = auth.uid()
        )
    );

-- Admin accès complet aux abonnements
CREATE POLICY "Admin manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
