-- 1. Création de la table 'stories'
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Le produit mis en avant
    media_url TEXT NOT NULL, -- L'URL de la vidéo ou photo
    media_type TEXT DEFAULT 'image', -- 'image' ou 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- Date de suppression/fin de la story
);

-- Index pour la recherche rapide des stories actives
CREATE INDEX IF NOT EXISTS stories_active_idx ON stories (expires_at) WHERE expires_at > now();

-- 2. Ajout des colonnes Flash Sale à la table 'products'
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price DECIMAL(10, 2);

-- 3. Sécurité RLS pour les Stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Les clients peuvent voir toutes les stories actives
CREATE POLICY "Les stories sont publiques" ON stories
    FOR SELECT USING (true);

-- Les vendeurs peuvent créer/modifier/supprimer leurs propres stories
CREATE POLICY "Les vendeurs gèrent leurs stories" ON stories
    FOR ALL USING (
        shop_id IN (
            SELECT id FROM shops WHERE owner_id = auth.uid()
        )
    );

-- 4. Nettoyage des anciennes stories (Fonction Optionnelle pour nettoyer l'espace)
-- Cette fonction supprime les stories vieilles de plus de 7 jours après expiration
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM stories WHERE expires_at < (now() - interval '7 days');
END;
$$;
