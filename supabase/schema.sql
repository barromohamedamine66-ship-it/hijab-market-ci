-- ==============================================================================
-- HIJAB MARKET CI — Schéma PostgreSQL Supabase Complet v2.0
-- Marketplace Multi-Vendeurs — Côte d'Ivoire
-- ==============================================================================
-- Instructions: Exécuter dans Supabase SQL Editor dans cet ordre exact.
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Types Énumérés
-- ==============================================================================

DO $$ BEGIN CREATE TYPE user_role_type AS ENUM ('customer', 'seller', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE shop_status_type AS ENUM ('pending', 'active', 'suspended', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE product_status_type AS ENUM ('draft', 'pending', 'approved', 'rejected', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status_type AS ENUM (
  'pending', 'payment_pending', 'paid', 'confirmed', 'processing',
  'ready_for_shipment', 'shipped', 'out_for_delivery', 'delivered',
  'receipt_confirmed', 'cancelled', 'refunded'
); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_method_type AS ENUM ('wave', 'orange_money', 'mtn_momo', 'moov_money', 'card', 'cash_on_delivery'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status_type AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE dispute_status_type AS ENUM ('opened', 'under_review', 'resolved_refunded', 'resolved_rejected', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE withdrawal_status_type AS ENUM ('pending', 'approved', 'rejected', 'processed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_type_enum AS ENUM ('order', 'payment', 'review', 'dispute', 'system', 'promotion'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. Tables Principales
-- ==============================================================================

-- Profils utilisateurs (liés à auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    city TEXT DEFAULT 'Abidjan',
    commune TEXT,
    address TEXT,
    role user_role_type NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '🧕',
    icon TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boutiques / Stores
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    city TEXT DEFAULT 'Abidjan',
    commune TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    logo_url TEXT,
    banner_url TEXT,
    status shop_status_type NOT NULL DEFAULT 'pending',
    verified BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 7.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produits
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    old_price DECIMAL(12,2),
    stock INTEGER NOT NULL DEFAULT 0,
    status product_status_type NOT NULL DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    badge TEXT,
    material TEXT,
    colors TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images Produits
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Panier (items persistants)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_color TEXT,
    selected_size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, selected_color, selected_size)
);

-- Adresses de Livraison
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Abidjan',
    commune TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT NOT NULL,
    landmark TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_number TEXT UNIQUE NOT NULL,
    status order_status_type NOT NULL DEFAULT 'pending',
    payment_status payment_status_type NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 1500,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    delivery_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    customer_notes TEXT,
    receipt_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles de Commande
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    store_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_color TEXT,
    selected_size TEXT,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paiements
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider payment_method_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status payment_status_type NOT NULL DEFAULT 'pending',
    transaction_reference TEXT,
    provider_response JSONB,
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avis Clients
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    store_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum DEFAULT 'system',
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Litiges
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    store_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status dispute_status_type NOT NULL DEFAULT 'opened',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portefeuilles Vendeurs
CREATE TABLE IF NOT EXISTS public.seller_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID UNIQUE NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    available_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_earned DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions du Portefeuille
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.seller_wallets(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('credit_sale', 'debit_withdrawal', 'debit_fee', 'credit_refund')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demandes de Retrait
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.seller_wallets(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method payment_method_type NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    status withdrawal_status_type NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confirmation de Livraison OTP (architecture prête)
CREATE TABLE IF NOT EXISTS public.delivery_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    otp_code TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Index de Performance
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store ON public.order_items(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON public.shops(status);

-- ==============================================================================
-- 5. Fonctions & Triggers Automatiques
-- ==============================================================================

-- Fonction: Mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM public, anon, authenticated;

-- Triggers updated_at
DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Fonction: Créer profil automatiquement après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role_type, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Fonction: Générer numéro de commande unique
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  seq_part := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
  new_number := 'HM-' || year_part || '-' || seq_part;
  NEW.order_number := new_number;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM public, anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Fonction: Créer portefeuille vendeur automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_shop()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.seller_wallets (store_id) VALUES (NEW.id) ON CONFLICT (store_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_shop() FROM public, anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER on_shop_created AFTER INSERT ON public.shops FOR EACH ROW EXECUTE FUNCTION public.handle_new_shop();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Fonction: Mettre à jour le rating produit après un avis
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE product_id = NEW.product_id),
    reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_product_rating() FROM public, anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER after_review_insert AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 6. Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_otps ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are visible" ON public.profiles;
CREATE POLICY "Public profiles are visible" ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CATEGORIES (lecture publique, écriture admin)
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Only admin can manage categories" ON public.categories;
CREATE POLICY "Only admin can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SHOPS (lecture publique boutiques actives)
DROP POLICY IF EXISTS "Active shops are public" ON public.shops;
CREATE POLICY "Active shops are public" ON public.shops FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Sellers can manage their own shop" ON public.shops;
CREATE POLICY "Sellers can manage their own shop" ON public.shops FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all shops" ON public.shops;
CREATE POLICY "Admins manage all shops" ON public.shops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCTS (lecture publique produits approuvés)
DROP POLICY IF EXISTS "Approved products are public" ON public.products;
CREATE POLICY "Approved products are public" ON public.products FOR SELECT USING (
  status = 'approved' OR 
  EXISTS (SELECT 1 FROM public.shops WHERE id = products.store_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Sellers manage their own products" ON public.products;
CREATE POLICY "Sellers manage their own products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = products.store_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all products" ON public.products;
CREATE POLICY "Admins manage all products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "Product images are public" ON public.product_images;
CREATE POLICY "Product images are public" ON public.product_images FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Sellers manage their product images" ON public.product_images;
CREATE POLICY "Sellers manage their product images" ON public.product_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.shops s ON s.id = p.store_id 
    WHERE p.id = product_images.product_id AND s.owner_id = auth.uid()
  )
);

-- FAVORITES
DROP POLICY IF EXISTS "Users manage their own favorites" ON public.favorites;
CREATE POLICY "Users manage their own favorites" ON public.favorites FOR ALL USING (user_id = auth.uid());

-- CART ITEMS
DROP POLICY IF EXISTS "Users manage their own cart" ON public.cart_items;
CREATE POLICY "Users manage their own cart" ON public.cart_items FOR ALL USING (user_id = auth.uid());

-- ADDRESSES
DROP POLICY IF EXISTS "Users manage their own addresses" ON public.addresses;
CREATE POLICY "Users manage their own addresses" ON public.addresses FOR ALL USING (user_id = auth.uid());

-- ORDERS
DROP POLICY IF EXISTS "Customers see their own orders" ON public.orders;
CREATE POLICY "Customers see their own orders" ON public.orders FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update their orders" ON public.orders;
CREATE POLICY "Customers can update their orders" ON public.orders FOR UPDATE USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Sellers see orders with their products" ON public.orders;
CREATE POLICY "Sellers see orders with their products" ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.shops s ON s.id = oi.store_id 
    WHERE oi.order_id = orders.id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins see all orders" ON public.orders;
CREATE POLICY "Admins see all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users see their order items" ON public.order_items;
CREATE POLICY "Users see their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND customer_id = auth.uid())
);

DROP POLICY IF EXISTS "Sellers see their order items" ON public.order_items;
CREATE POLICY "Sellers see their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = order_items.store_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins see all order items" ON public.order_items;
CREATE POLICY "Admins see all order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "System can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Customers can insert order items for their orders" ON public.order_items;
CREATE POLICY "Customers can insert order items for their orders" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- REVIEWS
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update their reviews" ON public.reviews;
CREATE POLICY "Customers can update their reviews" ON public.reviews FOR UPDATE USING (customer_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users see their own notifications" ON public.notifications;
CREATE POLICY "Users see their own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- DISPUTES
DROP POLICY IF EXISTS "Customers see their disputes" ON public.disputes;
CREATE POLICY "Customers see their disputes" ON public.disputes FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create disputes" ON public.disputes;
CREATE POLICY "Customers can create disputes" ON public.disputes FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Sellers see disputes about their shop" ON public.disputes;
CREATE POLICY "Sellers see disputes about their shop" ON public.disputes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = disputes.store_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all disputes" ON public.disputes;
CREATE POLICY "Admins manage all disputes" ON public.disputes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SELLER WALLETS
DROP POLICY IF EXISTS "Sellers see their own wallet" ON public.seller_wallets;
CREATE POLICY "Sellers see their own wallet" ON public.seller_wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = seller_wallets.store_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins see all wallets" ON public.seller_wallets;
CREATE POLICY "Admins see all wallets" ON public.seller_wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- WALLET TRANSACTIONS
DROP POLICY IF EXISTS "Sellers see their wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Sellers see their wallet transactions" ON public.wallet_transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.seller_wallets sw 
    JOIN public.shops s ON s.id = sw.store_id 
    WHERE sw.id = wallet_transactions.wallet_id AND s.owner_id = auth.uid()
  )
);

-- WITHDRAWAL REQUESTS
DROP POLICY IF EXISTS "Sellers manage their withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Sellers manage their withdrawal requests" ON public.withdrawal_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = withdrawal_requests.store_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admins manage all withdrawal requests" ON public.withdrawal_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PAYMENTS
DROP POLICY IF EXISTS "Customers see their payments" ON public.payments;
CREATE POLICY "Customers see their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND customer_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins see all payments" ON public.payments;
CREATE POLICY "Admins see all payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- DELIVERY OTPS
DROP POLICY IF EXISTS "Customers see their delivery OTP" ON public.delivery_otps;
CREATE POLICY "Customers see their delivery OTP" ON public.delivery_otps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = delivery_otps.order_id AND customer_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all delivery OTPs" ON public.delivery_otps;
CREATE POLICY "Admins manage all delivery OTPs" ON public.delivery_otps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "System can insert delivery OTPs" ON public.delivery_otps;
DROP POLICY IF EXISTS "Customers and admins can insert delivery OTPs" ON public.delivery_otps;
CREATE POLICY "Customers and admins can insert delivery OTPs" ON public.delivery_otps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = delivery_otps.order_id AND customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==============================================================================
-- 7. Storage Buckets
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('store-logos', 'store-logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Store logos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their product images" ON storage.objects;
CREATE POLICY "Users can delete their product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Sellers can upload store logos" ON storage.objects;
CREATE POLICY "Sellers can upload store logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage their avatar" ON storage.objects;
CREATE POLICY "Users can manage their avatar" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
