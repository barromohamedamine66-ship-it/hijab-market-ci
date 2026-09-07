-- Table: product_likes
CREATE TABLE IF NOT EXISTS product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Table: shop_followers
CREATE TABLE IF NOT EXISTS shop_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, shop_id)
);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS product_likes_user_id_idx ON product_likes(user_id);
CREATE INDEX IF NOT EXISTS product_likes_product_id_idx ON product_likes(product_id);

CREATE INDEX IF NOT EXISTS shop_followers_user_id_idx ON shop_followers(user_id);
CREATE INDEX IF NOT EXISTS shop_followers_shop_id_idx ON shop_followers(shop_id);

-- RLS Policies
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_followers ENABLE ROW LEVEL SECURITY;

-- Product likes: anyone can read, only authenticated users can insert/delete their own
CREATE POLICY "Les likes sont publics" ON product_likes FOR SELECT USING (true);
CREATE POLICY "Un utilisateur peut liker un produit" ON product_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Un utilisateur peut retirer son like" ON product_likes FOR DELETE USING (auth.uid() = user_id);

-- Shop followers: anyone can read, only authenticated users can insert/delete their own
CREATE POLICY "Les abonnements sont publics" ON shop_followers FOR SELECT USING (true);
CREATE POLICY "Un utilisateur peut s'abonner" ON shop_followers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Un utilisateur peut se désabonner" ON shop_followers FOR DELETE USING (auth.uid() = user_id);
