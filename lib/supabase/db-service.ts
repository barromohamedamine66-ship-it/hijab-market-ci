import { supabase, isSupabaseConfigured } from './client';
import type { Product, Shop, Category, Order, OrderItem, SellerWallet, Address, PaymentMethod, SubscriptionPlan, StoreSubscription, PlatformSettings } from './types';

// 12 Catégories officielles de Mode Modeste & Traditionnelle en Côte d'Ivoire
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Hijabs & Voiles', slug: 'hijabs-voiles', emoji: '🧕', icon: 'sparkles', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80', description: 'Soie de Médine, mousseline, jersey, plissé, turbans', order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Abayas & Robes', slug: 'abayas-robes', emoji: '👑', icon: 'crown', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', description: 'Abayas Dubaï, robes longues, kimonos chics et tenues de fête', order_index: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000012', name: 'Pashminas', slug: 'pashminas', emoji: '🧣', icon: 'wind', image_url: 'https://images.unsplash.com/photo-1605335133611-e63db768e98f?w=800&auto=format&fit=crop&q=80', description: 'Châles luxueux, pashminas en cachemire et étoles élégantes', order_index: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Boubous Femme', slug: 'boubous-femme', emoji: '✨', icon: 'gem', image_url: 'https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=800&auto=format&fit=crop&q=80', description: 'Bazin riche, soie, broderies raffinées et coupes modernes', order_index: 4, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Boubous Homme', slug: 'boubous-homme', emoji: '👔', icon: 'shirt', image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80', description: 'Grands boubous 3 pièces, ensembles bazin et tenues de prière', order_index: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000005', name: 'Ensembles & Prêt-à-porter', slug: 'ensembles-pret-a-porter', emoji: '👗', icon: 'layout', image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&auto=format&fit=crop&q=80', description: 'Ensembles modestes, tailleurs amples, tuniques et pantalons', order_index: 6, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000006', name: 'Vêtements Islamiques', slug: 'vetements-islamiques', emoji: '🌙', icon: 'moon', image_url: 'https://images.unsplash.com/photo-1588614631317-0a442e97d404?w=800&auto=format&fit=crop&q=80', description: 'Jilbabs, qamis homme et enfant, tenues de prière complètes', order_index: 7, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000007', name: 'Mode Pudique & Mastour', slug: 'mode-pudique-mastour', emoji: '🌸', icon: 'heart', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', description: 'Cardigans longs, jupes évasées, trenchs amples et basiques', order_index: 8, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000008', name: 'Accessoires & Sous-hijabs', slug: 'accessoires-sous-hijabs', emoji: '💎', icon: 'sparkles', image_url: 'https://images.unsplash.com/photo-1611080313621-e946a36c4bba?w=800&auto=format&fit=crop&q=80', description: 'Épingles magnétiques, bonnets, cagoules et bandeaux', order_index: 9, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000009', name: 'Chaussures', slug: 'chaussures', emoji: '👠', icon: 'shopping-bag', image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80', description: 'Babouches artisanales, mules élégantes et sandales habillées', order_index: 10, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000010', name: 'Bijoux & Parfumerie', slug: 'bijoux-parfumerie', emoji: '📿', icon: 'star', image_url: 'https://images.unsplash.com/photo-1599643478524-fb66f70d00f0?w=800&auto=format&fit=crop&q=80', description: 'Chapelets (Tasbih), muscs, encens bakhour et parures discrètes', order_index: 11, is_active: true, created_at: new Date().toISOString() },
  { id: 'c1000000-0000-0000-0000-000000000011', name: 'Autres', slug: 'autres', emoji: '🏷️', icon: 'tag', image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80', description: 'Autres articles de mode modeste et artisanat', order_index: 12, is_active: true, created_at: new Date().toISOString() },
];

// Plans d'abonnements officiels
const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-decouverte',
    code: 'decouverte',
    slug: 'decouverte',
    name: 'Formule Découverte',
    description: 'Idéal pour tester la marketplace sans aucun engagement',
    price: 0,
    price_monthly: 0,
    price_yearly: 0,
    duration: 'monthly',
    max_products: 5,
    featured_products: 0,
    analytics: false,
    priority_visibility: false,
    active: true,
    created_at: new Date().toISOString(),
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
    slug: 'business',
    name: 'Formule Business',
    description: 'La formule préférée des créatrices et boutiques régulières',
    price: 15000,
    price_monthly: 15000,
    price_yearly: 150000,
    duration: 'monthly',
    max_products: -1,
    featured_products: 5,
    analytics: true,
    priority_visibility: true,
    active: true,
    created_at: new Date().toISOString(),
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
    slug: 'premium',
    name: 'Formule Premium VIP',
    description: 'Visibilité maximale et accompagnement dédié pour les marques phares',
    price: 30000,
    price_monthly: 30000,
    price_yearly: 300000,
    duration: 'monthly',
    max_products: -1,
    featured_products: 15,
    analytics: true,
    priority_visibility: true,
    active: true,
    created_at: new Date().toISOString(),
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
    views_count: 0,
    opening_hours: 'Lun - Sam : 08h30 - 19h30',
    social_instagram: 'lesvoilesdebabi',
    commission_rate: 0,
    rating: 0,
    total_reviews: 0,
    total_sales: 0,
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
    views_count: 0,
    opening_hours: 'Lun - Dim : 09h00 - 20h00',
    social_instagram: 'modestyle_ci',
    commission_rate: 0,
    rating: 0,
    total_reviews: 0,
    total_sales: 0,
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
    views_count: 0,
    opening_hours: 'Lun - Sam : 08h00 - 18h30',
    social_instagram: 'khadija_couture_ci',
    commission_rate: 0,
    rating: 0,
    total_reviews: 0,
    total_sales: 0,
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[0],
    category: DEFAULT_CATEGORIES[0],
    images: [{ id: 'img1', product_id: 'p1000000-0000-0000-0000-000000000001', image_url: 'https://images.unsplash.com/photo-1585728748178-f75ca8578222?q=80&w=800&auto=format&fit=crop', position: 0, is_cover: true, created_at: new Date().toISOString() }]
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[1],
    category: DEFAULT_CATEGORIES[1],
    images: [{ id: 'img2', product_id: 'p1000000-0000-0000-0000-000000000002', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', position: 0, is_cover: true, created_at: new Date().toISOString() }]
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[2],
    category: DEFAULT_CATEGORIES[2],
    images: [{ id: 'img3', product_id: 'p1000000-0000-0000-0000-000000000003', image_url: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?w=800&auto=format&fit=crop&q=80', position: 0, is_cover: true, created_at: new Date().toISOString() }]
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[2],
    category: DEFAULT_CATEGORIES[3],
    images: [{ id: 'img4', product_id: 'p1000000-0000-0000-0000-000000000004', image_url: 'https://images.unsplash.com/photo-1596455119429-c5cce611a144?w=800&auto=format&fit=crop&q=80', position: 0, is_cover: true, created_at: new Date().toISOString() }]
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[1],
    category: DEFAULT_CATEGORIES[4],
    images: [{ id: 'img5', product_id: 'p1000000-0000-0000-0000-000000000005', image_url: 'https://images.unsplash.com/photo-1621570168340-e2b8344e1dcb?w=800&auto=format&fit=crop&q=80', position: 0, is_cover: true, created_at: new Date().toISOString() }]
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
    rating: 0,
    reviews_count: 0,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: DEFAULT_SHOPS[0],
    category: DEFAULT_CATEGORIES[7],
    images: [{ id: 'img6', product_id: 'p1000000-0000-0000-0000-000000000006', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', position: 0, is_cover: true, created_at: new Date().toISOString() }]
  }
];

const DEFAULT_ORDERS: Order[] = [];

// Helper pour stockage persistant local (client-side)
const STORAGE_KEYS = {
  SHOPS: 'hm_shops_v5',
  PRODUCTS: 'hm_products_v5',
  ORDERS: 'hm_orders_v5',
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

// Cache ultra-rapide en mémoire pour éliminer les latences réseau répétées
const memoryCache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return cached.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  memoryCache.set(key, { data, expiry: Date.now() + ttlMs });
}

function invalidateCachePrefix(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export const DBService = {
  // ==========================================
  // CATÉGORIES (11 Catégories Dynamiques)
  // ==========================================
  async getCategories(includeInactive = false): Promise<Category[]> {
    const cacheKey = `cats:${includeInactive}`;
    const cached = getCached<Category[]>(cacheKey);
    if (cached) return cached;

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
        if (!error && data && data.length > 0) {
          setCached(cacheKey, data as Category[], 300000); // 5 minutes
          return data as Category[];
        }
      } catch (err) {
        console.warn('Supabase getCategories error, fallback to defaults:', err);
      }
    }
    const local = getLocalData<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const result = includeInactive ? local : local.filter(c => c.is_active);
    setCached(cacheKey, result, 60000);
    return result;
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

        // Fallback: vérifier dans profiles si l'utilisateur est un vendeur enregistré
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', ownerId)
          .maybeSingle();

        if (prof && prof.role === 'seller') {
          const fallbackShop: Shop = {
            id: prof.id,
            owner_id: prof.id,
            name: prof.full_name ? `Boutique ${prof.full_name}` : 'Boutique Partenaire',
            slug: `boutique-${(prof.full_name || 'vendeur').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${prof.id.slice(0, 4)}`,
            description: `Boutique officielle de ${prof.full_name || 'la vendeuse'}`,
            phone: prof.phone || null,
            whatsapp: prof.phone || null,
            city: prof.city || 'Abidjan',
            commune: prof.commune || 'Cocody',
            address: prof.address || null,
            logo_url: prof.avatar_url || '/logo.png',
            banner_url: null,
            status: 'active',
            verified: true,
            is_founder: true,
            free_trial_start: prof.created_at,
            free_trial_end: new Date(new Date(prof.created_at).getTime() + 90 * 86400000).toISOString(),
            subscription_status: 'trial',
            commission_rate: 0,
            rating: 5.0,
            total_reviews: 0,
            total_sales: 0,
            views_count: 0,
            created_at: prof.created_at,
            updated_at: prof.updated_at,
          };
          return fallbackShop;
        }
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
    
    const settings = await this.getPlatformSettings();
    const now = new Date();
    const trialEnd = new Date(now.getTime() + settings.founder_trial_days * 86400000); // Essai gratuit dynamique

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .insert({
            id: (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shopData.owner_id)) ? shopData.owner_id : undefined,
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

    // Local fallback avec UUID valide si owner_id est un UUID
    const fallbackId = (shopData.owner_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shopData.owner_id))
      ? shopData.owner_id
      : `shop-${Date.now()}`;

    const newShop: Shop = {
      id: fallbackId,
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
        const { data: shopsData, error: shopsErr } = await supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Charger également les profils vendeurs réels enregistrés dans profiles
        const { data: sellerProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'seller')
          .order('created_at', { ascending: false });

        const realShops: Shop[] = [];
        const existingOwnerIds = new Set<string>();

        if (shopsData && shopsData.length > 0) {
          for (const s of shopsData) {
            realShops.push(s as Shop);
            existingOwnerIds.add(s.owner_id);
          }
        }

        // Si des profils vendeurs existent dans profiles mais n'ont pas encore de ligne dans la table shops
        if (sellerProfiles && sellerProfiles.length > 0) {
          for (const p of sellerProfiles) {
            if (!existingOwnerIds.has(p.id)) {
              const syntheticShop: Shop = {
                id: p.id,
                owner_id: p.id,
                name: p.full_name ? `Boutique ${p.full_name}` : 'Boutique Partenaire',
                slug: `boutique-${(p.full_name || 'vendeur').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.id.slice(0, 4)}`,
                description: `Boutique officielle de ${p.full_name || 'la vendeuse'} sur Hijab Market CI`,
                phone: p.phone || null,
                whatsapp: p.phone || null,
                city: p.city || 'Abidjan',
                commune: p.commune || 'Cocody',
                address: p.address || null,
                logo_url: p.avatar_url || '/logo.png',
                banner_url: null,
                status: 'active',
                verified: true,
                is_founder: true,
                free_trial_start: p.created_at,
                free_trial_end: new Date(new Date(p.created_at).getTime() + 90 * 86400000).toISOString(),
                subscription_status: 'trial',
                commission_rate: 0,
                rating: 5.0,
                total_reviews: 0,
                total_sales: 0,
                views_count: 0,
                created_at: p.created_at,
                updated_at: p.updated_at,
              };
              realShops.push(syntheticShop);
              existingOwnerIds.add(p.id);
            }
          }
        }

        if (realShops.length > 0) {
          return realShops;
        }
      } catch (err) {
        console.warn('Supabase getAllAdminShops error:', err);
      }
    }
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    return shops;
  },

  async getAdminAnalytics(): Promise<{ totalSales: number; totalViews: number; topShops: Shop[] }> {
    const shops = await this.getAllAdminShops();
    const activeShops = shops.filter(s => s.status === 'active');
    
    // Total sales across all shops
    const totalSales = activeShops.reduce((sum, shop) => sum + (shop.total_sales || 0), 0);
    
    // Total views across all shops
    const totalViews = activeShops.reduce((sum, shop) => sum + (shop.views_count || 0), 0);
    
    // Top 5 shops by sales (then views if tie)
    const topShops = [...activeShops].sort((a, b) => {
      if ((b.total_sales || 0) !== (a.total_sales || 0)) {
        return (b.total_sales || 0) - (a.total_sales || 0);
      }
      return (b.views_count || 0) - (a.views_count || 0);
    }).slice(0, 5);
    
    return {
      totalSales,
      totalViews,
      topShops
    };
  },

  async updateShopStatus(shopId: string, status: 'active' | 'pending' | 'suspended' | 'rejected'): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('shops').update({ status }).eq('id', shopId);
        await supabase.from('stores').update({ status }).eq('id', shopId);
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
  async getProducts(options?: { categorySlug?: string; limit?: number; storeId?: string; adminAll?: boolean }): Promise<Product[]> {
    const cacheKey = `prods:${JSON.stringify(options || {})}`;
    if (!options?.adminAll) {
      const cached = getCached<Product[]>(cacheKey);
      if (cached) return cached;
    }

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('products')
          .select('*, store:shops(*), category:categories(*), images:product_images(*)')
          .order('created_at', { ascending: false });

        if (options?.storeId) {
          query = query.eq('store_id', options.storeId);
        } else if (!options?.adminAll) {
          query = query.eq('status', 'approved');
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data as unknown as Product[];
          
          if (!options?.adminAll) {
            const now = new Date().getTime();
            const trialDays = 90; // Durée par défaut de l'essai gratuit
            list = list.filter(p => {
              const shop = p.store;
              if (shop && shop.subscription_status === 'trial' && shop.created_at) {
                const trialEnd = new Date(shop.created_at).getTime() + trialDays * 86400000;
                if (now > trialEnd) return false; // Masquer l'article si l'essai est terminé
              }
              return true;
            });
          }

          if (options?.categorySlug && options.categorySlug !== 'all' && options.categorySlug !== 'Tous') {
            list = list.filter(p => p.category?.slug === options.categorySlug);
          }
          setCached(cacheKey, list, 15000); // 15 secondes de cache réactif
          return list;
        }
      } catch (err) {
        console.warn('Supabase getProducts error, using local fallback:', err);
      }
    }

    let list = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    if (options?.storeId) {
      const targetId = options.storeId;
      const cleanTargetId = targetId.startsWith('shop-') ? targetId.replace('shop-', '') : targetId;
      list = list.filter(p => 
        p.store_id === targetId || 
        p.store_id === cleanTargetId || 
        p.store_id === `shop-${cleanTargetId}`
      );
    }
    if (options?.categorySlug && options.categorySlug !== 'all' && options.categorySlug !== 'Tous') {
      list = list.filter(p => p.category?.slug === options.categorySlug);
    }
    if (!options?.adminAll) {
      const now = new Date().getTime();
      const trialDays = 90;
      list = list.filter(p => {
        // En local, on doit retrouver le store s'il n'est pas déjà populé (ici on a p.store_id)
        // Mais pour simplifier on cherche dans DEFAULT_SHOPS
        const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
        const shop = shops.find(s => s.id === p.store_id || s.id === `shop-${p.store_id}`);
        if (shop && shop.subscription_status === 'trial' && shop.created_at) {
          const trialEnd = new Date(shop.created_at).getTime() + trialDays * 86400000;
          if (now > trialEnd) return false;
        }
        return true;
      });
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

    // Nettoyer et valider le store_id
    let cleanStoreId = productData.store_id;
    if (cleanStoreId.startsWith('shop-')) {
      const stripped = cleanStoreId.replace('shop-', '');
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stripped)) {
        cleanStoreId = stripped;
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanStoreId);

        // Si store_id est un UUID valide, s'assurer que la boutique existe dans shops pour respecter la clé étrangère
        if (isUuid) {
          try {
            const { data: existingShop } = await supabase
              .from('shops')
              .select('id')
              .eq('id', cleanStoreId)
              .maybeSingle();

            if (!existingShop) {
              await supabase.from('shops').upsert({
                id: cleanStoreId,
                owner_id: cleanStoreId,
                name: 'Boutique Partenaire',
                slug: `boutique-${cleanStoreId.slice(0, 6)}`,
                status: 'active',
                verified: true,
                is_founder: true,
                subscription_status: 'trial',
                commission_rate: 0,
              });
            }
          } catch (shopSyncErr) {
            console.warn('Vérification boutique avant produit:', shopSyncErr);
          }
        }

        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .insert({
            store_id: cleanStoreId,
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
          // Sauvegarder aussi en cache local
          const localProds = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
          setLocalData(STORAGE_KEYS.PRODUCTS, [prodData as unknown as Product, ...localProds]);
          invalidateCachePrefix('prods:');
          return prodData as unknown as Product;
        } else if (prodError) {
          console.warn('Supabase createProduct insert error:', prodError);
        }
      } catch (err) {
        console.warn('Supabase createProduct error, using local fallback:', err);
      }
    }

    // Local fallback
    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    const store = shops.find(s => s.id === cleanStoreId || s.id === productData.store_id) || DEFAULT_SHOPS[0];
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
    invalidateCachePrefix('prods:');
    return newProd;
  },

  async updateProduct(productId: string, updates: Partial<Product> & { imageUrl?: string }): Promise<Product | null> {
    invalidateCachePrefix('prods:');
    
    // Preparation des donnees pour Supabase
    const supabaseUpdates: any = { ...updates };
    const newImageUrl = supabaseUpdates.imageUrl;
    delete supabaseUpdates.imageUrl; // Ne pas envoyer imageUrl directement a la table products

    if (isSupabaseConfigured()) {
      try {
        const { data: prodData, error } = await supabase
          .from('products')
          .update(supabaseUpdates)
          .eq('id', productId)
          .select('*, store:shops(*), category:categories(*)')
          .single();
          
        if (!error && prodData) {
          if (newImageUrl) {
            // Check si l'image existe deja
            const { data: imgData } = await supabase.from('product_images').select('id').eq('product_id', productId).maybeSingle();
            if (imgData) {
              await supabase.from('product_images').update({ image_url: newImageUrl }).eq('id', imgData.id);
            } else {
              await supabase.from('product_images').insert({
                product_id: productId,
                image_url: newImageUrl,
                position: 0,
                is_cover: true,
              });
            }
          }
          const localProds = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
          const updatedLocal = localProds.map(p => p.id === productId ? { ...(prodData as unknown as Product), images: newImageUrl ? [{ id: 'img', product_id: productId, image_url: newImageUrl, position: 0, is_cover: true, created_at: '' }] : p.images } : p);
          setLocalData(STORAGE_KEYS.PRODUCTS, updatedLocal);
          return prodData as unknown as Product;
        }
      } catch (err) {
        console.warn('Supabase updateProduct error:', err);
      }
    }

    // Local fallback
    const currentProds = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    let updatedProd: Product | null = null;
    const updatedLocal = currentProds.map(p => {
      if (p.id === productId) {
        const newProd = { ...p, ...supabaseUpdates, updated_at: new Date().toISOString() };
        if (newImageUrl) {
          newProd.images = [{ id: `img-${Date.now()}`, product_id: productId, image_url: newImageUrl, position: 0, is_cover: true, created_at: new Date().toISOString() }];
        }
        updatedProd = newProd;
        return newProd;
      }
      return p;
    });
    setLocalData(STORAGE_KEYS.PRODUCTS, updatedLocal);
    return updatedProd;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    invalidateCachePrefix('prods:');
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

  async updateProductStatus(productId: string, status: 'approved' | 'rejected' | 'archived'): Promise<boolean> {
    invalidateCachePrefix('prods:');
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', productId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase updateProductStatus error:', err);
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    const updated = products.map(p => p.id === productId ? { ...p, status } : p);
    setLocalData(STORAGE_KEYS.PRODUCTS, updated);
    return true;
  },

  async purgeDemoProducts(): Promise<number> {
    const demoIds = ['p1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000004'];
    if (isSupabaseConfigured()) {
      try {
        for (const id of demoIds) {
          await supabase.from('products').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase purgeDemoProducts error:', err);
      }
    }
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    const realProducts = products.filter(p => !demoIds.includes(p.id) && !p.id.startsWith('p1000000'));
    setLocalData(STORAGE_KEYS.PRODUCTS, realProducts);
    return products.length - realProducts.length;
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
      store_id: shopId,
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

  async incrementShopViews(shopId: string): Promise<number> {
    let newCount = 0;
    if (isSupabaseConfigured()) {
      try {
        const { data: shop } = await supabase
          .from('shops')
          .select('views_count')
          .eq('id', shopId)
          .maybeSingle();

        if (shop !== null && shop !== undefined) {
          newCount = ((shop as any).views_count || 0) + 1;
          await supabase
            .from('shops')
            .update({ views_count: newCount })
            .eq('id', shopId);
        }
      } catch (err) {
        console.warn('Erreur incrementShopViews Supabase:', err);
      }
    }

    const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
    const shopIndex = shops.findIndex(s => s.id === shopId);
    if (shopIndex !== -1) {
      if (!newCount) {
        newCount = (shops[shopIndex].views_count || 0) + 1;
      }
      shops[shopIndex] = {
        ...shops[shopIndex],
        views_count: newCount,
      };
      setLocalData(STORAGE_KEYS.SHOPS, shops);
    }

    return newCount;
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
  // PARAMÈTRES GLOBAUX PLATEFORME
  // ==========================================
  async getPlatformSettings(): Promise<PlatformSettings> {
    const defaultSettings: PlatformSettings = {
      id: '11111111-1111-1111-1111-111111111111',
      whatsapp_support: '+225 01 52 18 28 40',
      wave_phone: '07 77 39 38 13',
      wave_business_name: 'HIJABMARKET.CI',
      wave_link: 'https://pay.wave.com/m/M_ci_YBdDvRRAwSih/c/ci/',
      support_email: 'support@hijabmarket.ci',
      founder_trial_days: 90,
      founder_max_seats: 30,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .single();
        
        if (!error && data) {
          return data as PlatformSettings;
        }
      } catch (err) {
        console.warn('Supabase getPlatformSettings error:', err);
      }
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('hm_platform_settings_db');
        if (local) {
          return { ...defaultSettings, ...JSON.parse(local) };
        }
      } catch (e) {}
    }

    return defaultSettings;
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = await this.getPlatformSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('platform_settings')
          .upsert(updated);
      } catch (err) {
        console.warn('Supabase updatePlatformSettings error:', err);
      }
    }

    // Fallback localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hm_platform_settings_db', JSON.stringify(updated));
    }

    return updated;
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
  },

  // ==========================================
  // STORIES & FLASH SALES
  // ==========================================
  async getStories(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`*, store:shops(*), product:products(*)`)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Si certaines stories ont un store manquant, enrichir
          const enriched = await Promise.all(
            data.map(async (st: any) => {
              let store = st.store || null;
              if (!store && st.shop_id) {
                try {
                  store = await DBService.getShopById(st.shop_id);
                } catch {}
              }
              return { ...st, store };
            })
          );
          return enriched;
        }

        // Si la requête avec alias store:shops a échoué, faire une requête robuste sans jointure complexe
        const { data: rawStories, error: rawError } = await supabase
          .from('stories')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (!rawError && rawStories && rawStories.length > 0) {
          const enriched = await Promise.all(
            rawStories.map(async (st: any) => {
              let store = null;
              if (st.shop_id) {
                try {
                  store = await DBService.getShopById(st.shop_id);
                } catch {}
              }
              let product = null;
              if (st.product_id) {
                try {
                  product = await DBService.getProductById(st.product_id);
                } catch {}
              }
              return { ...st, store, product };
            })
          );
          return enriched;
        }
      } catch (e) {
        console.warn('Supabase getStories error:', e);
      }
    }
    return [];
  },

  async uploadStoryMedia(file: File, shopId: string): Promise<string | null> {
    if (!file) return null;

    // 1. Pour une image : tentative stockage Supabase avec fallback DataURL compressé
    if (file.type.startsWith('image/')) {
      try {
        if (isSupabaseConfigured()) {
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `stories/${shopId}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, {
            contentType: file.type,
            upsert: true,
          });
          if (!upErr) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(path);
            if (data?.publicUrl) return data.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Storage image upload error, using local fallback:', e);
      }

      // Fallback DataURL compressé via canvas (haute qualité, taille réduite)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            const max = 1200;
            if (w > h && w > max) {
              h = Math.round((h * max) / w);
              w = max;
            } else if (h > max) {
              w = Math.round((w * max) / h);
              h = max;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = () => resolve(reader.result as string);
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }

    // 2. Pour une vidéo : téléversement direct vers Supabase Storage
    if (file.type.startsWith('video/')) {
      try {
        if (isSupabaseConfigured()) {
          const ext = file.name.split('.').pop() || 'mp4';
          const path = `stories/videos/${shopId}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, {
            contentType: file.type,
            upsert: true,
          });
          if (!upErr) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(path);
            if (data?.publicUrl) return data.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Storage video upload error:', e);
      }

      // Si la vidéo fait moins de 25 Mo, encoder en DataURL
      if (file.size <= 25 * 1024 * 1024) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    }

    return null;
  },

  async createStory(storyData: any): Promise<any | null> {
    if (!isSupabaseConfigured()) return null;
    
    // Durée de validité de 7 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (!error && data) return data;
      if (error) {
        console.error('Supabase createStory insert error:', error);
      }
    } catch (e) {
      console.warn('Supabase createStory error:', e);
    }
    return null;
  },

  async deleteStory(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getFlashSales(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, store:shops(*), images:product_images(*)')
          .eq('is_flash_sale', true)
          .gt('flash_sale_end', new Date().toISOString())
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          // Filter out products from locked/expired shops
          const activeShops = await this.getShops();
          const activeShopIds = new Set(activeShops.map(s => s.id));
          return data.filter((p: any) => p.store_id && activeShopIds.has(p.store_id));
        }
      } catch (e) {
        console.warn('Supabase getFlashSales error:', e);
      }
    }
    return [];
  },

  // ==========================================
  // SOCIAL (Likes & Abonnements)
  // ==========================================
  async toggleLike(productId: string, userId: string): Promise<boolean> {
    const isCurrentlyLiked = await this.hasLiked(productId, userId);
    const newLikedState = !isCurrentlyLiked;
    
    if (isSupabaseConfigured()) {
      try {
        if (newLikedState) {
          await supabase.from('product_likes').insert({ product_id: productId, user_id: userId });
        } else {
          await supabase.from('product_likes').delete().eq('product_id', productId).eq('user_id', userId);
        }
      } catch (e) {
        console.warn('toggleLike error:', e);
      }
    }

    const key = `likes_${userId}`;
    let likes = getLocalData<string[]>(key, []);
    if (newLikedState) {
      if (!likes.includes(productId)) {
        likes.push(productId);
        setLocalData(key, likes);
      }
    } else {
      likes = likes.filter(id => id !== productId);
      setLocalData(key, likes);
    }
    
    return newLikedState;
  },

  async hasLiked(productId: string, userId: string): Promise<boolean> {
    let isLiked = false;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('product_likes').select('id').eq('product_id', productId).eq('user_id', userId).maybeSingle();
        if (!error && data) isLiked = true;
      } catch {}
    }
    const localLiked = getLocalData<string[]>(`likes_${userId}`, []).includes(productId);
    return isLiked || localLiked;
  },

  async toggleFollow(shopId: string, userId: string): Promise<boolean> {
    const isCurrentlyFollowed = await this.hasFollowed(shopId, userId);
    const newFollowedState = !isCurrentlyFollowed;
    
    if (isSupabaseConfigured()) {
      try {
        if (newFollowedState) {
          await supabase.from('shop_followers').insert({ shop_id: shopId, user_id: userId });
        } else {
          await supabase.from('shop_followers').delete().eq('shop_id', shopId).eq('user_id', userId);
        }
      } catch (e) {
        console.warn('toggleFollow error:', e);
      }
    }

    const key = `follows_${userId}`;
    let follows = getLocalData<string[]>(key, []);
    if (newFollowedState) {
      if (!follows.includes(shopId)) {
        follows.push(shopId);
        setLocalData(key, follows);
      }
    } else {
      follows = follows.filter(id => id !== shopId);
      setLocalData(key, follows);
    }
    
    return newFollowedState;
  },

  async hasFollowed(shopId: string, userId: string): Promise<boolean> {
    let isFollowed = false;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('shop_followers').select('id').eq('shop_id', shopId).eq('user_id', userId).maybeSingle();
        if (!error && data) isFollowed = true;
      } catch {}
    }
    const localFollowed = getLocalData<string[]>(`follows_${userId}`, []).includes(shopId);
    return isFollowed || localFollowed;
  },

  async getLikedProducts(userId: string): Promise<Product[]> {
    let supabaseProducts: Product[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('product_likes')
          .select('product:products(*, store:shops(*))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          supabaseProducts = data.map(d => d.product).filter(Boolean) as unknown as Product[];
        }
      } catch {}
    }
    const localLikes = getLocalData<string[]>(`likes_${userId}`, []);
    if (localLikes.length === 0) return supabaseProducts;
    
    const allProducts = await this.getProducts();
    const localProducts = allProducts.filter(p => localLikes.includes(p.id));
    
    const combined = [...supabaseProducts];
    const existingIds = new Set(combined.map(p => p.id));
    for (const lp of localProducts) {
      if (!existingIds.has(lp.id)) combined.push(lp);
    }
    return combined;
  },

  async getFollowedShops(userId: string): Promise<Shop[]> {
    let supabaseShops: Shop[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('shop_followers')
          .select('shop:shops(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) {
          supabaseShops = data.map(d => d.shop).filter(Boolean) as unknown as Shop[];
        }
      } catch {}
    }
    const localFollows = getLocalData<string[]>(`follows_${userId}`, []);
    if (localFollows.length === 0) return supabaseShops;
    
    const allShops = await this.getShops();
    const localShops = allShops.filter(s => localFollows.includes(s.id));
    
    const combined = [...supabaseShops];
    const existingIds = new Set(combined.map(s => s.id));
    for (const ls of localShops) {
      if (!existingIds.has(ls.id)) combined.push(ls);
    }
    return combined;
  },

  async getFeedProducts(userId: string): Promise<Product[]> {
    const followedShops = await this.getFollowedShops(userId);
    if (followedShops.length === 0) return [];
    const shopIds = followedShops.map(s => s.id);
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, store:shops(*), category:categories(*), images:product_images(*)')
          .in('store_id', shopIds)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const enriched = data.map((p: any) => ({
            ...p,
            store: p.store || followedShops.find(s => s.id === p.store_id) || null
          }));
          return enriched as unknown as Product[];
        }
      } catch (err) {
        console.warn('Erreur getFeedProducts Supabase:', err);
      }
    }
    
    const allProducts = await this.getProducts();
    return allProducts.filter(p => p.store_id && shopIds.includes(p.store_id)).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  },

  async getComments(productId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('product_comments')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
        if (data) return data;
      } catch {}
    }
    return getLocalData<any[]>(`comments_${productId}`, []);
  },

  async addComment(productId: string, userId: string, userName: string, content: string): Promise<any> {
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: productId,
      user_id: userId,
      user_name: userName,
      content,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('product_comments')
          .insert({
            product_id: productId,
            user_id: userId,
            user_name: userName,
            content
          })
          .select()
          .single();
        if (data) return data;
      } catch {}
    }
    
    const comments = getLocalData<any[]>(`comments_${productId}`, []);
    const newComments = [comment, ...comments];
    setLocalData(`comments_${productId}`, newComments);
  },

  // --- Admin User Management ---
  async getAllClients(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .order('created_at', { ascending: false });
        if (data) return data;
      } catch (err) {
        console.warn('Erreur getAllClients:', err);
      }
    }
    return [];
  },

  async suspendUser(userId: string, isSuspended: boolean): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_suspended: isSuspended, is_active: !isSuspended })
          .eq('id', userId);
        return !error;
      } catch {
        return false;
      }
    }
    return true;
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId); // Require Service Role or RPC, simplified here
        if (error) {
           // Fallback to soft delete
           await supabase.from('profiles').update({ is_active: false, role: 'deleted' }).eq('id', userId);
        }
        return true;
      } catch {
        return false;
      }
    }
    return true;
  },

  // --- Notifications ---
  async getNotifications(userId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (data) return data;
      } catch {}
    }
    return getLocalData<any[]>(`notifs_${userId}`, []);
  },

  async markNotificationAsRead(notifId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notifId);
      } catch {}
    }
  },

  async sendNotification(userId: string, title: string, message: string, type: string = 'system'): Promise<void> {
    const notif = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').insert(notif);
        return;
      } catch {}
    }
    const notifs = getLocalData<any[]>(`notifs_${userId}`, []);
    setLocalData(`notifs_${userId}`, [notif, ...notifs]);
  },

  // --- Ratings & Reviews ---
  async getProductReviews(productId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('product_reviews')
          .select('*, user:profiles(id, full_name, avatar_url)')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
        if (data) return data;
      } catch {}
    }
    return getLocalData<any[]>(`reviews_${productId}`, []);
  },

  async getRecentReviews(limit: number = 6): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id, rating, comment, created_at, user:profiles(id, full_name, avatar_url), product:products(id, name, slug)')
          .not('comment', 'is', null)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Erreur getRecentReviews Supabase:', err);
      }
    }
    return [];
  },

  async addReview(productId: string, userId: string, rating: number, comment?: string): Promise<boolean> {
    const review = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: productId,
      user_id: userId,
      rating,
      comment,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('product_reviews').insert({
          product_id: productId,
          user_id: userId,
          rating,
          comment
        });
        if (!error) {
          // Recalculer la note moyenne et le nombre d'avis réels du produit dans Supabase
          const { data: allReviews } = await supabase
            .from('product_reviews')
            .select('rating')
            .eq('product_id', productId);

          if (allReviews && allReviews.length > 0) {
            const count = allReviews.length;
            const avg = Number((allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count).toFixed(2));
            await supabase
              .from('products')
              .update({ rating: avg, reviews_count: count })
              .eq('id', productId);

            // Mettre à jour aussi la note et le nombre d'avis de la boutique
            const { data: prod } = await supabase
              .from('products')
              .select('store_id')
              .eq('id', productId)
              .maybeSingle();

            if (prod?.store_id) {
              const { data: storeProds } = await supabase
                .from('products')
                .select('rating, reviews_count')
                .eq('store_id', prod.store_id);

              if (storeProds && storeProds.length > 0) {
                const totalRevs = storeProds.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
                const prodsWithRatings = storeProds.filter(p => (p.reviews_count || 0) > 0);
                const storeAvg = prodsWithRatings.length > 0
                  ? Number((prodsWithRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / prodsWithRatings.length).toFixed(2))
                  : 5.0;
                await supabase
                  .from('shops')
                  .update({ rating: storeAvg, total_reviews: totalRevs })
                  .eq('id', prod.store_id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Erreur addReview Supabase:', err);
      }
    }

    // Mise à jour locale
    const reviews = getLocalData<any[]>(`reviews_${productId}`, []);
    const updatedReviews = [review, ...reviews];
    setLocalData(`reviews_${productId}`, updatedReviews);

    // Mettre à jour les produits locaux
    const products = getLocalData<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    const pIndex = products.findIndex(p => p.id === productId);
    if (pIndex !== -1) {
      const count = updatedReviews.length;
      const avg = Number((updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count).toFixed(2));
      products[pIndex].rating = avg;
      products[pIndex].reviews_count = count;
      setLocalData(STORAGE_KEYS.PRODUCTS, products);

      // Mettre à jour la boutique locale
      const storeId = products[pIndex].store_id;
      const shops = getLocalData<Shop[]>(STORAGE_KEYS.SHOPS, DEFAULT_SHOPS);
      const sIndex = shops.findIndex(s => s.id === storeId);
      if (sIndex !== -1) {
        const storeProds = products.filter(p => p.store_id === storeId);
        const totalRevs = storeProds.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
        shops[sIndex].total_reviews = totalRevs;
        shops[sIndex].rating = avg;
        setLocalData(STORAGE_KEYS.SHOPS, shops);
      }
    }

    return true;
  },

  // --- Chat (Conversations & Messages) ---
  async getConversations(userId: string, isSeller: boolean = false): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('conversations').select('*, client:profiles(*), shop:shops(*)');
        if (isSeller) {
          // get shops for this seller
          const { data: shops } = await supabase.from('shops').select('id').eq('owner_id', userId);
          const shopIds = shops?.map(s => s.id) || [];
          if (shopIds.length > 0) {
            query = query.in('shop_id', shopIds);
          } else {
            return [];
          }
        } else {
          query = query.eq('client_id', userId);
        }
        const { data } = await query.order('last_message_at', { ascending: false });
        if (data) return data;
      } catch {}
    }
    return getLocalData<any[]>(`convs_${userId}`, []);
  },

  async getMessages(conversationId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (data) return data;
      } catch {}
    }
    return getLocalData<any[]>(`msgs_${conversationId}`, []);
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<any> {
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        }).select().single();
        if (!error && data) {
          await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
          return data;
        }
      } catch {}
    }
    const messages = getLocalData<any[]>(`msgs_${conversationId}`, []);
    setLocalData(`msgs_${conversationId}`, [...messages, message]);
    return message;
  },

  async getOrCreateConversation(clientId: string, shopId: string): Promise<any> {
    if (isSupabaseConfigured()) {
      try {
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('client_id', clientId)
          .eq('shop_id', shopId)
          .maybeSingle();
        if (existing) return existing;

        const { data: created, error } = await supabase
          .from('conversations')
          .insert({ client_id: clientId, shop_id: shopId })
          .select()
          .single();
        if (!error && created) return created;
      } catch {}
    }
    
    // local fallback
    const id = `${clientId}_${shopId}`;
    return {
      id,
      client_id: clientId,
      shop_id: shopId,
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    };
  }
};
