-- ==============================================================================
-- HIJAB MARKET CI — Correctif Automatique Boutiques & Vendeuses
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Confirmer immédiatement les emails de tous les utilisateurs existants
-- Cela évite le blocage "Email not confirmed"
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Créer ou synchroniser les boutiques officielles pour toutes les vendeuses enregistrées
INSERT INTO public.shops (
  id,
  owner_id,
  name,
  slug,
  status,
  verified,
  is_founder,
  subscription_status,
  commission_rate,
  free_trial_start,
  free_trial_end,
  city,
  commune
)
SELECT 
  p.id,
  p.id,
  COALESCE(NULLIF(p.full_name, ''), 'Boutique Partenaire'),
  LOWER(REGEXP_REPLACE(COALESCE(NULLIF(p.full_name, ''), 'boutique'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(p.id::text FROM 1 FOR 4),
  'active',
  true,
  true,
  'trial',
  0,
  NOW(),
  NOW() + INTERVAL '90 days',
  COALESCE(p.city, 'Abidjan'),
  COALESCE(p.commune, 'Cocody')
FROM public.profiles p
WHERE p.role = 'seller'
ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  verified = true,
  is_founder = true,
  commission_rate = 0;

-- 3. Déclencheur automatique (Trigger) pour toute nouvelle vendeuse
CREATE OR REPLACE FUNCTION public.handle_seller_shop_creation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'seller' THEN
    INSERT INTO public.shops (
      id,
      owner_id,
      name,
      slug,
      status,
      verified,
      is_founder,
      subscription_status,
      commission_rate,
      free_trial_start,
      free_trial_end,
      city,
      commune
    )
    VALUES (
      NEW.id,
      NEW.id,
      COALESCE(NULLIF(NEW.full_name, ''), 'Boutique Partenaire'),
      LOWER(REGEXP_REPLACE(COALESCE(NULLIF(NEW.full_name, ''), 'boutique'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 4),
      'active',
      true,
      true,
      'trial',
      0,
      NOW(),
      NOW() + INTERVAL '90 days',
      COALESCE(NEW.city, 'Abidjan'),
      COALESCE(NEW.commune, 'Cocody')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_shop ON public.profiles;
CREATE TRIGGER trg_auto_create_shop
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_seller_shop_creation();

-- 4. Assouplir les politiques RLS pour empêcher tout rejet silencieux d'articles
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public shops are readable" ON public.shops;
CREATE POLICY "Public shops are readable" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert shops" ON public.shops;
CREATE POLICY "Allow insert shops" ON public.shops FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update shops" ON public.shops;
CREATE POLICY "Allow update shops" ON public.shops FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public products are readable" ON public.products;
CREATE POLICY "Public products are readable" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete products" ON public.products;
CREATE POLICY "Allow delete products" ON public.products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public product images are readable" ON public.product_images;
CREATE POLICY "Public product images are readable" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert product images" ON public.product_images;
CREATE POLICY "Allow insert product images" ON public.product_images FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update product images" ON public.product_images;
CREATE POLICY "Allow update product images" ON public.product_images FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete product images" ON public.product_images;
CREATE POLICY "Allow delete product images" ON public.product_images FOR DELETE USING (true);
