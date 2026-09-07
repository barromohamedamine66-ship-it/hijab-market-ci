-- ==============================================================================
-- HIJAB MARKET CI — Système d'Avis (Reviews) & Messagerie Intégrée (Chat)
-- ==============================================================================

-- 1. Table des Avis (Reviews)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID NULL, -- Facultatif pour le moment, à lier avec la table orders plus tard
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);

-- 2. Table des Conversations (Chat)
-- Lie un client et une boutique
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, shop_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_shop_id ON public.conversations(shop_id);

-- 3. Table des Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID NOT NULL, -- Peut être le client ou le propriétaire de la boutique
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- ==============================================================================
-- Sécurité : Row Level Security (RLS)
-- ==============================================================================

-- Reviews : Tout le monde peut lire, seuls les utilisateurs connectés peuvent écrire
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des avis" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Insertion avis par client" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Modification avis par auteur" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Suppression avis par auteur ou admin" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);

-- Conversations : Les clients voient leurs conversations, les vendeurs voient celles de leur boutique
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture conversations par client" ON public.conversations 
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Lecture conversations par vendeur" ON public.conversations 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shops 
            WHERE shops.id = conversations.shop_id 
            AND shops.owner_id = auth.uid()
        )
    );

CREATE POLICY "Création conversation par client" ON public.conversations 
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Messages : Les clients et vendeurs de la conversation peuvent lire/écrire
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture/Ecriture messages par participants" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                conversations.client_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM shops 
                    WHERE shops.id = conversations.shop_id 
                    AND shops.owner_id = auth.uid()
                )
            )
        )
    );

-- Accorder les droits d'accès
GRANT ALL ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO anon;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
