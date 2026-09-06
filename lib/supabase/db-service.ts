import { supabase, isSupabaseConfigured } from './client';
import type { Product, Shop, Category, Order, OrderItem, SellerWallet, Address, PaymentMethod, SubscriptionPlan, StoreSubscription } from './types';

// 11 Catégories officielles de Mode Modeste & Traditionnelle en Côte d'Ivoire
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Hijabs & Voiles', slug: 'hijabs-voiles', emoji: '🧕', icon: 'sparkles', description: 'Soie de Médine, mousseline, jersey, plissé, turbans', order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Abayas & Robes', slug: 'abayas-robes', emoji: '👑', icon: 'crown', description: 'Abayas Dubaï, robes longues, kimonos chics et tenues de fête', order_index: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Boubous Femme', slug: 'boubous-femme', emoji: '✨', icon: 'gem', description: 'Bazin riche, soie, broderies raffinées et coupes modernes', order_index: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Boubous Homme', slug: 'boubous-homme', emoji: '👔', icon: 'shirt', description: 'Grands boubous 3 pièces, ensembles bazin et tenues de prière', order_index: 4, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Ensembles & Prêt-à-porter', slug: 'ensembles-pret-a-porter', emoji: '👗', icon: 'layout', description: 'Ensembles modestes, tailleurs amples, tuniques et pantalons', order_index: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'Vêtements Islamiques', slug: 'vetements-islamiques', emoji: '🌙', icon: 'moon', description: 'Jilbabs, qamis homme et enfant, tenues de prière complètes', order_index: 6, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Mode Pudique & Mastour', slug: 'mode-pudique-mastour', emoji: '🌸', icon: 'heart', description: 'Cardigans longs, jupes évasées, trenchs amples et basiques', order_index: 7, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Accessoires & Sous-hijabs', slug: 'accessoires-sous-hijabs', emoji: '💎', icon: 'sparkles', description: 'Épingles magnétiques, bonnets, cagoules et bandeaux', order_index: 8, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000009', name: 'Chaussures', slug: 'chaussures', emoji: '👠', icon: 'shopping-bag', description: 'Babouches artisanales, mules élégantes et sandales habillées', order_index: 9, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000010', name: 'Bijoux & Parfumerie', slug: 'bijoux-parfumerie', emoji: '📿', icon: 'star', description: 'Chapelets (Tasbih), muscs, encens bakhour et parures discrètes', order_index: 10, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000011', name: 'Autres', slug: 'autres', emoji: '🏷️', icon: 'tag', description: 'Autres articles de mode modeste et artisanat', order_index: 11, is_active: true, created_at: new Date().toISOString() },
];

// Plans d'abonnements officiels
const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-decouverte',
    code: 'decouverte',
    name: 'Formule Découverte',
    description: 'Idéal pour tester la marketplace sans aucun engagement',
    price_monthly: 0,
    price_yearly: 0,
    max_products: 5,
    features: [
      '5 produits en ligne',
      'Boutique personnalisée avec lien unique',
      'Bouton de commande direct WhatsApp',
      'Affichage dans les catégories',
      'Support par email standard'
    ],
    badge_name: 'Découverte',
    is_popular: false,
    order_index: 1,
    is_active: true,
  },
  {
    id: 'plan-business',
    code: 'business',
    name: 'Formule Business',
    description: 'La formule préférée des créatrices et boutiques régulières',
    price_monthly: 15000,
    price_yearly: 150000,
    max_products: -1,
    features: [
      'Produits illimités',
      'Badge Vendeur Vérifié officiel',
      'Commandes WhatsApp en direct sans commission',
      'Mise en avant dans les catégories phares',
      'Support prioritaire 7j/7 sur WhatsApp',
      'Statistiques des visites et clics clients'
    ],
    badge_name: 'Vérifié',
    is_popular: true,
    order_index: 2,
    is_active: true,
  },
  {
    id: 'plan-premium',
    code: 'premium',
    name: 'Formule Premium VIP',
    description: 'Visibilité maximale et accompagnement dédié pour les marques phares',
    price_monthly: 30000,
    price_yearly: 300000,
    max_products: -1,
    features: [
      'Tout ce qui est inclus dans Business',
      'Badge Boutique VIP en tête d’accueil',
      'Bannière publicitaire sur la page d’accueil',
      'Campagnes sponsorisées sur nos réseaux sociaux',
      'Accompagnement shooting photo & conseils vente',
      'Conseiller dédié joignable 24h/24'
    ],
    badge_name: 'VIP',
    is_popular: false,
    order_index: 3,
    is_active: true,
  },
];

const DEFAULT_SHOPS: Shop[] = [
  {
    id: 's1000000-0000-0000-0000-000000000001',
    owner_id: 'u-seller-1',
    name: 'Les Voiles de Babi',
    slug: 'les-voiles-de-babi',
    description: 'Spécialiste de la soie de Médine haute qualité, voiles jersey et sous-hijabs premium à Abidjan.',
    logo_url: '/logo.png',
    banner_url: null,
    phone: '+225 07 10 20 30 40',
    whatsapp: '+2250710203040',
    city: 'Abidjan',
    commune: 'Cocody',
    address: 'Angré 8e Tranche, Carrefour Duncan',
    status: 'active',
    verified: true,
    is_founder: true,
    free_trial_start: new Date(Date.now() - 15 * 86400000).toISOString(),
    free_trial_end: new Date(Date.now() + 75 * 86400000).toISOString(),
    subscription_status: 'trial',
    views_count: 1480,
    opening_hours: 'Lun - Sam : 08h30 - 19h30',
    social_instagram: 'lesvoilesdebabi',
    commission_rate: 0,
    rating: 4.9,
    total_reviews: 128,
    total_sales: 540,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000002',
    owner_id: 'u-seller-2',
    name: 'Modesty Style CI',
    slug: 'modesty-style-ci',
    description: 'Abayas Dubaï haut de gamme, kimonos chics et robes de fête pour vos événements et le quotidien.',
    logo_url: '/logo.png',
    banner_url: null,
    phone: '+225 05 50 60 70 80',
    whatsapp: '+2250550607080',
    city: 'Abidjan',
    commune: 'Marcory',
    address: 'Zone 4, Rue du 7 Décembre',
    status: 'active',
    verified: true,
    is_founder: true,
    free_trial_start: new Date(Date.now() - 10 * 86400000).toISOString(),
    free_trial_end: new Date(Date.now() + 80 * 86400000).toISOString(),
    subscription_status: 'trial',
    views_count: 1120,
    opening_hours: 'Lun - Dim : 09h00 - 20h00',
    social_instagram: 'modestyle_ci',
    commission_rate: 0,
    rating: 4.8,
    total_reviews: 94,
    total_sales: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000003',
    owner_id: 'u-seller-3',
    name: 'Khadija Bazin & Couture',
    slug: 'khadija-bazin-couture',
    description: 'Atelier de création artisanale de boubous femme & homme en Bazin riche Getzner et broderie fine.',
    logo_url: '/logo.png',
    banner_url: null,
    phone: '+225 07 77 12 34 56',
    whatsapp: '+2250777123456',
    city: 'Abidjan',
    commune: 'Treichville',
    address: 'Avenue 21, Rue 12',
    status: 'active',
    verified: true,
    is_founder: true,
    free_trial_start: new Date(Date.now() - 5 * 86400000).toISOString(),
    free_trial_end: new Date(Date.now() + 85 * 86400000).toISOString(),
    subscription_status: 'trial',
    views_count: 890,
    opening_hours: 'Lun - Sam : 08h00 - 18h30',
    social_instagram: 'khadija_couture_ci',
    commission_rate: 0,
    rating: 5.0,
    total_reviews: 62,
    total_sales: 215,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    store_id: 's1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Hijab Soie de Médine — Vert Émeraude',
    slug: 'hijab-soie-de-medine-vert-emeraude',
    description: 'Soie de Médine premium avec retombée élégante et opaque. Ne glisse pas, idéal pour toutes vos occasions.',
    price: 5500,
    old_price: 7000,
    stock: 45,
    status: 'approved',
    featured: true,
    badge: 'Top Vente',
    material: 'Soie de Médine',
    colors: ['Vert Émeraude', 'Noir', 'Beige', 'Bleu Nuit'],
    sizes: ['Standard 190x75cm'],
    rating: 4.9,
    reviews_count: 42,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[0],
    category: DEFAULT_CATEGORIES[0]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    store_id: 's1000000-0000-0000-0000-000000000002',
    category_id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Abaya Kimono Dubaï Broderie Or',
    slug: 'abaya-kimono-dubai-broderie-or',
    description: 'Magnifique abaya kimono de Dubaï ornée de broderies dorées délicates et de finitions haute couture.',
    price: 35000,
    old_price: 42000,
    stock: 15,
    status: 'approved',
    featured: true,
    badge: 'Coup de Cœur',
    material: 'Nida Royal Dubaï',
    colors: ['Noir & Or', 'Vert Sapin & Or', 'Bleu Roi & Or'],
    sizes: ['54 (S/M)', '56 (L)', '58 (XL)'],
    rating: 4.9,
    reviews_count: 28,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[1],
    category: DEFAULT_CATEGORIES[1]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    store_id: 's1000000-0000-0000-0000-000000000003',
    category_id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Grand Boubou Bazin Riche Brodé — Bleu Ciel',
    slug: 'grand-boubou-bazin-riche-brode-bleu-ciel',
    description: 'Boubou traditionnel d’exception en Bazin riche Getzner teinté main, broderies fil d’or et col festonné.',
    price: 48000,
    old_price: 55000,
    stock: 8,
    status: 'approved',
    featured: true,
    badge: 'Artisanal',
    material: 'Bazin Riche Getzner 100% Coton',
    colors: ['Bleu Ciel & Or', 'Jaune Impérial', 'Blanc Pur'],
    sizes: ['Taille Unique (Ample)'],
    rating: 5.0,
    reviews_count: 19,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[2],
    category: DEFAULT_CATEGORIES[2]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000004',
    store_id: 's1000000-0000-0000-0000-000000000003',
    category_id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Boubou Homme 3 Pièces Bazin Blanc Prestige',
    slug: 'boubou-homme-3-pieces-bazin-blanc-prestige',
    description: 'Ensemble masculin traditionnel composé d’un grand boubou, sous-tunique et pantalon à pinces.',
    price: 52000,
    old_price: 60000,
    stock: 12,
    status: 'approved',
    featured: true,
    badge: 'Prestige',
    material: 'Bazin Supérieur Brillant',
    colors: ['Blanc Pur Brodé Ton sur Ton', 'Beige Doré'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviews_count: 14,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[2],
    category: DEFAULT_CATEGORIES[3]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000005',
    store_id: 's1000000-0000-0000-0000-000000000002',
    category_id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Ensemble Mastour Tunique Longue & Pantalon Ample',
    slug: 'ensemble-mastour-tunique-pantalon-ample',
    description: 'Tenue mastour chic et moderne parfaite pour le travail ou les réceptions.',
    price: 24000,
    old_price: 28000,
    stock: 20,
    status: 'approved',
    featured: false,
    badge: 'Nouveau',
    material: 'Crêpe Premium Léger',
    colors: ['Kaki', 'Chocolat', 'Beige Sable'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    reviews_count: 11,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[1],
    category: DEFAULT_CATEGORIES[4]
  },
  {
    id: 'p1000000-0000-0000-0000-000000000006',
    store_id: 's1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000008',
    name: 'Pack 4 Épingles Magnétiques Anti-Trous & 2 Bonnets',
    slug: 'pack-epingles-magnetiques-bonnets',
    description: 'Les indispensables pour fixer votre voile sans l’abîmer ni trouer la soie.',
    price: 4500,
    old_price: 6000,
    stock: 60,
    status: 'approved',
    featured: false,
    badge: 'Essentiel',
    material: 'Aimant néodyme & Coton stretch',
    colors: ['Pack Nude & Métallisé'],
    sizes: ['Standard'],
    rating: 5.0,
    reviews_count: 53,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[0],
    category: DEFAULT_CATEGORIES[7]
  }
];

const DEFAULT_ORDERS: Order[] = [];


// Helper pour stockage persistant local (client-side)
const STORAGE_KEYS = {
  SHOPS: 'hm_shops',
  PRODUCTS: 'hm_products',
  ORDERS: 'hm_orders',
  CATEGORIES: 'hm_categories',
  PLANS: 'hm_subscription_plans',
  FAVORITES: 'hm_favorites',
};

function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export const DBService = {
  // ==========================================
  // CATÉGORIES (11 Catégories Dynamiques)
  // ==========================================
  async getCategories(includeInactive = false): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('categories')
          .select('*')
          .order('order_index');

        if (!includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Category[];
      } catch (err) {
        console.warn('Supabase getCategories error, fallback to defaults:', err);
      }
    }
    const local = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return includeInactive ? local : local.filter(c => c.is_active);
  },

  async createCategory(categoryData: {
    name: string;
    slug?: string;
    emoji?: string;
    icon?: string;
    description?: string;
    image_url?: string;
    order_index?: number;
  }): Promise<Category> {
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const categories = await this.getCategories(true);
    const orderIndex = categoryData.order_index ?? (categories.length + 1);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: categoryData.name,
            slug,
            emoji: categoryData.emoji || '✨',
            icon: categoryData.icon || 'sparkles',
            description: categoryData.description || null,
            image_url: categoryData.image_url || null,
            order_index: orderIndex,
            is_active: true,
          })
          .select()
          .single();
        if (!error && data) {
          return data as Category;
        }
      } catch (err) {
        console.warn('Supabase createCategory error:', err);
      }
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name,
      slug,
      emoji: categoryData.emoji || '✨',
      icon: categoryData.icon || 'sparkles',
      description: categoryData.description || null,
      image_url: categoryData.image_url || null,
      order_index: orderIndex,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    setLocalData(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  },

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update(updates)
          .eq('id', categoryId)
          .select()
          .maybeSingle();
        if (!error && data) return data as Category;
      } catch (err) {
        console.warn('Supabase updateCategory error:', err);
      }
    }

    const categories = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const updated = categories.map(c => c.id === categoryId ? { ...c, ...updates } : c);
    setLocalData(STORAGE_KEYS.CATEGORIES, updated);
    return updated.find(c => c.id === categoryId) || null;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('categories')
          .update({ is_active: false })
          .eq('id', categoryId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteCategory error:', err);
      }
    }

    const categories = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const updated = categories.map(c => c.id === categoryId ? { ...c, is_active: false } : c);
    setLocalData(STORAGE_KEYS.CATEGORIES, updated);
    return true;
  },

  // ==========================================
  // BOUTIQUES / SHOPS
  // ==========================================
  async getShops(): Promise<Shop[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Shop[];
      } catch (err) {
        console.warn('Supabase getShops error, fallback to local:', err);
      }
    }
    return getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
  },

  async getShopByOwnerId(ownerId: string): Promise<Shop | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', ownerId)
          .maybeSingle();
        if (!error && data) return data as Shop;
      } catch (err) {
        console.warn('Supabase getShopByOwnerId error:', err);
      }
    }
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    return shops.find(s => s.owner_id === ownerId) || null;
  },

  async getShopBySlug(slug: string): Promise<Shop | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (!error && data) return data as Shop;
      } catch (err) {
        console.warn('Supabase getShopBySlug error:', err);
      }
    }
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    return shops.find(s => s.slug === slug) || null;
  },

  async createShop(shopData: {
    owner_id: string;
    name: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    commune?: string;
  }): Promise<Shop> {
    const slug = `${shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;
    
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 90 * 86400000); // 90 jours offerts pour le lancement officiel

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .insert({
            owner_id: shopData.owner_id,
            name: shopData.name,
            slug: slug,
            description: shopData.description || null,
            phone: shopData.phone || null,
            whatsapp: shopData.whatsapp || shopData.phone || null,
            city: shopData.city || 'Abidjan',
            commune: shopData.commune || 'Cocody',
            status: 'active',
            verified: true,
            is_founder: true,
            free_trial_start: now.toISOString(),
            free_trial_end: trialEnd.toISOString(),
            subscription_status: 'trial',
            commission_rate: 0,
            views_count: 0,
          })
          .select()
          .single();
        if (!error && data) {
          return data as Shop;
        }
      } catch (err) {
        console.warn('Supabase createShop error:', err);
      }
    }

    // Local fallback
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      owner_id: shopData.owner_id,
      name: shopData.name,
      slug: slug,
      description: shopData.description || null,
      phone: shopData.phone || null,
      whatsapp: shopData.whatsapp || shopData.phone || null,
      city: shopData.city || 'Abidjan',
      commune: shopData.commune || 'Cocody',
      address: null,
      logo_url: '/logo.png',
      banner_url: null,
      status: 'active',
      verified: true,
      is_founder: true,
      free_trial_start: now.toISOString(),
      free_trial_end: trialEnd.toISOString(),
      subscription_status: 'trial',
      commission_rate: 0,
      views_count: 0,
      rating: 5.0,
      total_reviews: 0,
      total_sales: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    setLocalData(STORAGE_KEYS.SHOPS, [newShop, ...shops]);
    return newShop;
  },

  async getAllAdminShops(): Promise<Shop[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Shop[];
      } catch (err) {
        console.warn('Supabase getAllAdminShops on shops error:', err);
      }
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Shop[];
      } catch (err) {}
    }
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    return shops;
  },

  async updateShopStatus(shopId: string, status: 'active' | 'pending' | 'suspended' | 'rejected'): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('stores')
          .update({ status })
          .eq('id', shopId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase updateShopStatus error:', err);
      }
    }
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, []);
    const updated = shops.map(s => s.id === shopId ? { ...s, status } : s);
    setLocalData(STORAGE_KEYS.SHOPS, updated);
    return true;
  },

  async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop | null> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        // Tenter sur la table 'shops'
        const { data, error } = await supabase
          .from('shops')
          .update(updatedData)
          .eq('id', shopId)
          .select()
          .maybeSingle();
        if (!error && data) {
          const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
          const updatedShops = shops.map(s => s.id === shopId ? { ...s, ...(data as Shop) } : s);
          setLocalData(STORAGE_KEYS.SHOPS, updatedShops);
          return data as Shop;
        }
      } catch (err) {
        console.warn('Supabase updateShop error on shops table:', err);
      }

      try {
        // Fallback sur la table 'stores'
        const { data, error } = await supabase
          .from('stores')
          .update(updatedData)
          .eq('id', shopId)
          .select()
          .maybeSingle();
        if (!error && data) {
          const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
          const updatedShops = shops.map(s => s.id === shopId ? { ...s, ...(data as Shop) } : s);
          setLocalData(STORAGE_KEYS.SHOPS, updatedShops);
          return data as Shop;
        }
      } catch (err) {
        console.warn('Supabase updateShop error on stores table:', err);
      }
    }

    // Fallback stockage local
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    let found = false;
    const updatedShops = shops.map(s => {
      if (s.id === shopId) {
        found = true;
        return { ...s, ...updatedData };
      }
      return s;
    });

    if (found) {
      setLocalData(STORAGE_KEYS.SHOPS, updatedShops);
      return updatedShops.find(s => s.id === shopId) || null;
    } else {
      const newShop: Shop = {
        id: shopId,
        owner_id: '',
        name: updates.name || 'Ma Boutique',
        slug: `shop-${Date.now()}`,
        description: updates.description || null,
        phone: updates.phone || null,
        whatsapp: updates.whatsapp || null,
        city: updates.city || 'Abidjan',
        commune: updates.commune || 'Cocody',
        address: null,
        logo_url: updates.logo_url || '/logo.png',
        banner_url: null,
        status: 'active',
        verified: true,
        commission_rate: 7,
        rating: 5.0,
        total_reviews: 0,
        total_sales: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      setLocalData(STORAGE_KEYS.SHOPS, [newShop, ...shops]);
      return newShop;
    }
  },


  // ==========================================
  // PRODUITS
  // ==========================================
  async getProducts(options?: { categorySlug?: string; limit?: number; storeId?: string }): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('products')
          .select('*, store:shops(*), category:categories(*), images:product_images(*)')
          .order('created_at', { ascending: false });

        if (options?.storeId) {
          query = query.eq('store_id', options.storeId);
        } else {
          query = query.eq('status', 'approved');
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data as unknown as Product[];
          if (options?.categorySlug && options.categorySlug !== 'all' && options.categorySlug !== 'Tous') {
            list = list.filter(p => p.category?.slug === options.categorySlug);
          }
          return list;
        }
      } catch (err) {
        console.warn('Supabase getProducts error, using local fallback:', err);
      }
    }

    let list = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    if (options?.storeId) {
      list = list.filter(p => p.store_id === options.storeId);
    }
    if (options?.categorySlug && options.categorySlug !== 'all' && options.categorySlug !== 'Tous') {
      list = list.filter(p => p.category?.slug === options.categorySlug);
    }
    if (options?.limit) {
      list = list.slice(0, options.limit);
    }
    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, store:shops(*), category:categories(*), images:product_images(*)')
          .eq('slug', slug)
          .maybeSingle();
        if (!error && data) return data as unknown as Product;
      } catch (err) {
        console.warn('Supabase getProductBySlug error:', err);
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return products.find(p => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, store:shops(*), category:categories(*), images:product_images(*)')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data as unknown as Product;
      } catch (err) {
        console.warn('Supabase getProductById error:', err);
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return products.find(p => p.id === id) || null;
  },

  async createProduct(productData: {
    store_id: string;
    category_id?: string | null;
    name: string;
    description: string;
    price: number;
    old_price?: number | null;
    stock: number;
    material?: string;
    colors?: string[];
    sizes?: string[];
    badge?: string;
    imageUrl?: string;
  }): Promise<Product> {
    const slug = `${productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;

    if (isSupabaseConfigured()) {
      try {
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .insert({
            store_id: productData.store_id,
            category_id: productData.category_id || null,
            name: productData.name,
            slug: slug,
            description: productData.description,
            price: productData.price,
            old_price: productData.old_price || null,
            stock: productData.stock,
            status: 'approved',
            material: productData.material || null,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            badge: productData.badge || null,
            featured: false,
          })
          .select('*, store:shops(*), category:categories(*)')
          .single();

        if (!prodError && prodData) {
          if (productData.imageUrl) {
            await supabase.from('product_images').insert({
              product_id: prodData.id,
              image_url: productData.imageUrl,
              position: 0,
              is_cover: true,
            });
          }
          return prodData as unknown as Product;
        }
      } catch (err) {
        console.warn('Supabase createProduct error, using local fallback:', err);
      }
    }

    // Local fallback
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    const store = shops.find(s => s.id === productData.store_id) || DEFAULT_SHOPS[0];
    const category = DEFAULT_CATEGORIES.find(c => c.id === productData.category_id) || DEFAULT_CATEGORIES[0];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      store_id: productData.store_id,
      category_id: productData.category_id || null,
      name: productData.name,
      slug: slug,
      description: productData.description,
      price: productData.price,
      old_price: productData.old_price || null,
      stock: productData.stock,
      status: 'approved',
      featured: false,
      badge: productData.badge || null,
      material: productData.material || null,
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      rating: 5.0,
      reviews_count: 0,
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      store: store,
      category: category,
      images: productData.imageUrl
        ? [{
            id: `img-${Date.now()}`,
            product_id: `prod-${Date.now()}`,
            image_url: productData.imageUrl,
            position: 0,
            is_cover: true,
            created_at: new Date().toISOString(),
          }]
        : []
    };

    const currentProds = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    setLocalData(STORAGE_KEYS.PRODUCTS, [newProd, ...currentProds]);
    return newProd;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    setLocalData(STORAGE_KEYS.PRODUCTS, products.filter(p => p.id !== productId));
    return true;
  },

  // ==========================================
  // COMMANDES / ORDERS
  // ==========================================
  async createOrder(params: {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    city: string;
    commune: string;
    neighborhood?: string;
    address: string;
    customer_notes?: string;
    payment_method: PaymentMethod;
    items: {
      product_id: string;
      product_name: string;
      product_image?: string | null;
      unit_price: number;
      quantity: number;
      selected_color?: string;
      selected_size?: string;
      store_id: string;
    }[];
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
  }): Promise<Order> {
    const orderNumber = `HM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (isSupabaseConfigured()) {
      try {
        // 1. Sauvegarder l'adresse de livraison
        const { data: addressData } = await supabase
          .from('addresses')
          .insert({
            user_id: params.customer_id,
            full_name: params.customer_name,
            phone: params.customer_phone,
            city: params.city || 'Abidjan',
            commune: params.commune,
            neighborhood: params.neighborhood || null,
            address: params.address,
            is_default: true,
          })
          .select()
          .maybeSingle();

        // 2. Insérer la commande
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: params.customer_id,
            order_number: orderNumber,
            status: 'pending',
            payment_status: params.payment_method === 'cash_on_delivery' ? 'pending' : 'success',
            subtotal: params.subtotal,
            delivery_fee: params.delivery_fee,
            total_amount: params.total_amount,
            delivery_address_id: addressData?.id || null,
            customer_notes: params.customer_notes || null,
          })
          .select()
          .single();

        if (!orderError && orderData) {
          // 3. Insérer les articles de la commande
          const orderItems = params.items.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            store_id: item.store_id,
            product_name: item.product_name,
            product_image_url: item.product_image || null,
            unit_price: item.unit_price,
            quantity: item.quantity,
            selected_color: item.selected_color || null,
            selected_size: item.selected_size || null,
          }));

          await supabase.from('order_items').insert(orderItems);

          // 4. Insérer le paiement
          await supabase.from('payments').insert({
            order_id: orderData.id,
            provider: params.payment_method,
            amount: params.total_amount,
            status: params.payment_method === 'cash_on_delivery' ? 'pending' : 'success',
            transaction_reference: `TRX-${Date.now()}`,
          });

          return orderData as Order;
        }
      } catch (err) {
        console.warn('Supabase createOrder error, using local fallback:', err);
      }
    }

    // Fallback Local
    const orderId = `ord-${Date.now()}`;
    const newItems: OrderItem[] = params.items.map((it, idx) => ({
      id: `item-${orderId}-${idx}`,
      order_id: orderId,
      product_id: it.product_id,
      store_id: it.store_id,
      product_name: it.product_name,
      product_image_url: it.product_image || null,
      unit_price: it.unit_price,
      quantity: it.quantity,
      selected_color: it.selected_color || null,
      selected_size: it.selected_size || null,
      subtotal: it.unit_price * it.quantity,
    }));

    const newOrder: Order = {
      id: orderId,
      customer_id: params.customer_id,
      order_number: orderNumber,
      status: 'pending',
      payment_status: params.payment_method === 'cash_on_delivery' ? 'pending' : 'success',
      subtotal: params.subtotal,
      delivery_fee: params.delivery_fee,
      total_amount: params.total_amount,
      delivery_address_id: `addr-${Date.now()}`,
      customer_notes: params.customer_notes || null,
      receipt_confirmed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: newItems,
      delivery_address: {
        id: `addr-${Date.now()}`,
        user_id: params.customer_id,
        full_name: params.customer_name,
        phone: params.customer_phone,
        city: params.city,
        commune: params.commune,
        neighborhood: params.neighborhood || null,
        address: params.address,
        landmark: null,
        is_default: true,
        created_at: new Date().toISOString(),
      }
    };

    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    setLocalData(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
    return newOrder;
  },

  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), delivery_address:addresses(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as unknown as Order[];
      } catch (err) {
        console.warn('Supabase getAllOrders error:', err);
      }
    }
    return getLocalData<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  },

  async getSampleOrders(): Promise<Order[]> {
    return this.getAllOrders();
  },

  async getCustomerOrders(customerId?: string): Promise<Order[]> {
    if (isSupabaseConfigured() && customerId) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), delivery_address:addresses(*)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as unknown as Order[];
      } catch (err) {
        console.warn('Supabase getCustomerOrders error:', err);
      }
    }

    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    if (customerId) {
      return orders.filter(o => o.customer_id === customerId);
    }
    return orders;
  },

  async getSellerOrders(storeId?: string): Promise<Order[]> {
    if (isSupabaseConfigured() && storeId) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), delivery_address:addresses(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          // Filtrer les commandes qui contiennent au moins un item de ce store
          const filtered = data.filter((o: any) => o.items?.some((it: any) => it.store_id === storeId));
          if (filtered.length > 0) return filtered as unknown as Order[];
        }
      } catch (err) {
        console.warn('Supabase getSellerOrders error:', err);
      }
    }

    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    if (storeId) {
      return orders.filter(o => o.items?.some(it => it.store_id === storeId));
    }
    return orders;
  },

  async getOrders(): Promise<Order[]> {
    return this.getAllOrders();
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), delivery_address:addresses(*)')
          .eq('id', orderId)
          .maybeSingle();
        if (!error && data) return data as unknown as Order;
      } catch (err) {
        console.warn('Supabase getOrderById error:', err);
      }
    }
    const orders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    return orders.find(o => o.id === orderId || o.order_number === orderId) || null;
  },

  // ==========================================
  // PORTEFEUILLE VENDEUR
  // ==========================================
  async getSellerWallet(shopId: string): Promise<SellerWallet> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('seller_wallets')
          .select('*')
          .eq('store_id', shopId)
          .maybeSingle();
        if (!error && data) return data as SellerWallet;
      } catch (err) {
        console.warn('Supabase getSellerWallet error:', err);
      }
    }

    // Calculer à partir des commandes locales de ce shop
    const orders = await this.getSellerOrders(shopId);
    const totalEarned = orders.reduce((sum, o) => {
      const itemsSum = o.items?.filter(i => i.store_id === shopId).reduce((s, it) => s + it.subtotal, 0) || 0;
      return sum + itemsSum;
    }, 0);

    return {
      id: `w-${shopId}`,
      shop_id: shopId,
      available_balance: totalEarned > 0 ? Math.round(totalEarned * 0.93) : 0, // Moins commission marketplace 7%
      pending_balance: 0,
      total_earned: totalEarned,
      total_withdrawn: 0,
      updated_at: new Date().toISOString()
    };
  },

  // ==========================================
  // ABONNEMENTS ET FORMULES
  // ==========================================
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('order_index');
        if (!error && data && data.length > 0) return data as SubscriptionPlan[];
      } catch (err) {
        console.warn('Supabase getSubscriptionPlans error, using defaults:', err);
      }
    }
    return getLocalData<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_SUBSCRIPTION_PLANS);
  },

  async updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .update(updates)
          .eq('id', planId)
          .select()
          .maybeSingle();
        if (!error && data) return data as SubscriptionPlan;
      } catch (err) {
        console.warn('Supabase updateSubscriptionPlan error:', err);
      }
    }
    const plans = getLocalData<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_SUBSCRIPTION_PLANS);
    const updated = plans.map(p => p.id === planId ? { ...p, ...updates } : p);
    setLocalData(STORAGE_KEYS.PLANS, updated);
    return updated.find(p => p.id === planId) || null;
  },

  // ==========================================
  // BOUTIQUES FONDATRICES & STATUT D'ESSAI
  // ==========================================
  async getFounderShops(): Promise<Shop[]> {
    const allShops = await this.getShops();
    return allShops.filter(s => s.is_founder === true);
  },

  async toggleShopFounderStatus(shopId: string, isFounder: boolean, trialDays = 90): Promise<Shop | null> {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 86400000);
    const updates: Partial<Shop> = {
      is_founder: isFounder,
      free_trial_start: isFounder ? now.toISOString() : null,
      free_trial_end: isFounder ? trialEnd.toISOString() : null,
      subscription_status: isFounder ? 'trial' : 'active',
    };
    return this.updateShop(shopId, updates);
  },

  async updateShopTrialEnd(shopId: string, trialEndIso: string): Promise<Shop | null> {
    return this.updateShop(shopId, { free_trial_end: trialEndIso });
  },

  async incrementShopViews(shopId: string): Promise<void> {
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      const newCount = (shop.views_count || 0) + 1;
      this.updateShop(shopId, { views_count: newCount });
    }
  },

  // ==========================================
  // FAVORIS CLIENT
  // ==========================================
  async getUserFavorites(userId: string): Promise<string[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', userId);
        if (!error && data) {
          return data.map((f: any) => f.product_id);
        }
      } catch (err) {
        console.warn('Supabase getUserFavorites error, fallback to local:', err);
      }
    }
    const allFavs = getLocalData<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
    return allFavs[userId] || [];
  },

  async toggleFavorite(userId: string, productId: string): Promise<{ isFavorited: boolean }> {
    const currentFavs = await this.getUserFavorites(userId);
    const isCurrentlyFavorited = currentFavs.includes(productId);

    if (isSupabaseConfigured()) {
      try {
        if (isCurrentlyFavorited) {
          await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        } else {
          await supabase
            .from('user_favorites')
            .insert({ user_id: userId, product_id: productId });
        }
      } catch (err) {
        console.warn('Supabase toggleFavorite error:', err);
      }
    }

    const allFavs = getLocalData<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
    let userFavs = allFavs[userId] || [];
    if (isCurrentlyFavorited) {
      userFavs = userFavs.filter(id => id !== productId);
    } else {
      userFavs = [productId, ...userFavs];
    }
    allFavs[userId] = userFavs;
    setLocalData(STORAGE_KEYS.FAVORITES, allFavs);

    return { isFavorited: !isCurrentlyFavorited };
  },

  async isProductFavorite(userId: string, productId: string): Promise<boolean> {
    const favs = await this.getUserFavorites(userId);
    return favs.includes(productId);
  },

  // ==========================================
  // STATISTIQUES GLOBALES MARKETPLACE
  // ==========================================
  async getPlatformStats(): Promise<{
    totalShops: number;
    founderShops: number;
    totalProducts: number;
    totalCategories: number;
    totalViews: number;
  }> {
    const [shops, products, categories] = await Promise.all([
      this.getShops(),
      this.getProducts({ limit: 1000 }),
      this.getCategories(true),
    ]);

    const founderShops = shops.filter(s => s.is_founder).length;
    const totalViews = shops.reduce((sum, s) => sum + (s.views_count || 0), 0);

    return {
      totalShops: shops.length,
      founderShops,
      totalProducts: products.length,
      totalCategories: categories.length,
      totalViews,
    };
  }
};
