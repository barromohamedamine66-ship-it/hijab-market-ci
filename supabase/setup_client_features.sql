-- ==============================================================================
-- HIJAB MARKET CI — Enrichissement Profil Client & Notifications
-- ==============================================================================

-- 1. Ajouter les nouvelles colonnes à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE NULL,
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- 2. Créer la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'system', 'promotion', 'order', 'social'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS sur les notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Politiques pour les notifications
-- L'utilisateur peut lire ses propres notifications
CREATE POLICY "Les utilisateurs peuvent lire leurs notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- L'utilisateur peut mettre à jour (marquer comme lu) ses propres notifications
CREATE POLICY "Les utilisateurs peuvent modifier leurs notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- L'admin peut tout faire sur les notifications (insertion, etc.)
CREATE POLICY "Les admins ont un contrôle total sur les notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Accorder les droits
GRANT ALL ON public.notifications TO authenticated;

-- Index pour accélérer les requêtes de notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
