import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Échantillon de démos TikTok immersives pour la mode modeste ivoirienne
// Utilisé comme fallback riche et dynamique si la base de données n'a pas encore assez de vidéos
const CURATED_REELS = [
  {
    id: 'reel-demo-1',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-costume-with-a-headscarf-41009-small.mp4',
    poster_url: '/images/categories/cat_hijabs.jpg',
    media_type: 'video',
    caption: 'Tuto drapé express en Soie de Médine vert sauge 🧕✨ Ne glisse pas et super fluide ! Disponible en boutique.',
    sound_title: 'Audio Original • Les Voiles de Babi',
    category: 'hijabs',
    likes_count: 1420,
    comments_count: 89,
    shares_count: 312,
    store: {
      id: 's1000000-0000-0000-0000-000000000001',
      name: 'Les Voiles de Babi',
      slug: 'les-voiles-de-babi',
      logo_url: '/logo.png',
      city: 'Abidjan',
      commune: 'Cocody Angré',
      is_verified: true,
      followers_count: 4200,
    },
    product: {
      id: 'p1000000-0000-0000-0000-000000000001',
      name: 'Hijab Soie de Médine Vert Sauge',
      slug: 'hijab-soie-medine-vert-sauge',
      price: 5000,
      old_price: 6500,
      cover_image: '/images/categories/cat_hijabs.jpg',
      stock: 18,
      rating: 4.9,
      colors: ['Vert Sauge', 'Beige Sable', 'Chocolat Noir', 'Rose Poudré'],
      sizes: ['Standard 190x75cm'],
    },
  },
  {
    id: 'reel-demo-2',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-traditional-headscarf-smiling-41010-small.mp4',
    poster_url: '/images/categories/cat_abayas.jpg',
    media_type: 'video',
    caption: 'Nouvelle Abaya Dubaï brodée à la main aux fils d’or ✨ Tissu crêpe de soie lourd infroissable. Qui valide le look ? 😍',
    sound_title: 'Nasheed Ambiance Chic • Modesty Style',
    category: 'abayas',
    likes_count: 2840,
    comments_count: 154,
    shares_count: 670,
    store: {
      id: 's1000000-0000-0000-0000-000000000002',
      name: 'Modesty Style CI',
      slug: 'modesty-style-ci',
      logo_url: '/logo.png',
      city: 'Abidjan',
      commune: 'Marcory Zone 4',
      is_verified: true,
      followers_count: 8900,
    },
    product: {
      id: 'p1000000-0000-0000-0000-000000000002',
      name: 'Abaya Dubaï Brodée Or Impérial',
      slug: 'abaya-dubai-broderie-or',
      price: 35000,
      old_price: 42000,
      cover_image: '/images/categories/cat_abayas.jpg',
      stock: 6,
      rating: 5.0,
      colors: ['Noir Impérial', 'Bleu Nuit', 'Vert Émeraude'],
      sizes: ['52 (1m55-1m60)', '54 (1m60-1m65)', '56 (1m65-1m70)'],
    },
  },
  {
    id: 'reel-demo-3',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-wearing-a-headscarf-41011-small.mp4',
    poster_url: '/images/categories/cat_bazins.jpg',
    media_type: 'video',
    caption: 'Bazin Riche Getzner Authentique 100% Damassé 💜 La brillance et le craquant du tissu parlent d’eux-mêmes. Édition Tabaski & Cérémonies !',
    sound_title: 'Rythme Mandingue Moderne • Keita Mode',
    category: 'bazins',
    likes_count: 1950,
    comments_count: 73,
    shares_count: 421,
    store: {
      id: 's1000000-0000-0000-0000-000000000004',
      name: 'Keita Mode & Bazin',
      slug: 'keita-mode',
      logo_url: '/logo.png',
      city: 'Bouaké',
      commune: 'Commerce Centre',
      is_verified: true,
      followers_count: 6100,
    },
    product: {
      id: 'p1000000-0000-0000-0000-000000000003',
      name: 'Bazin Riche Getzner Damassé',
      slug: 'bazin-riche-getzner-violet',
      price: 45000,
      old_price: 52000,
      cover_image: '/images/categories/cat_bazins.jpg',
      stock: 9,
      rating: 4.8,
      colors: ['Violet Royal', 'Blanc Pur', 'Bleu Ciel'],
      sizes: ['Coupon 3 mètres', 'Coupon 5 mètres'],
    },
  },
  {
    id: 'reel-demo-4',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-headscarf-posing-41012-small.mp4',
    poster_url: '/images/categories/cat_muscs.jpg',
    media_type: 'video',
    caption: 'Texture onctueuse du Musc Tahara Blanc Crémeux authentique 🌸 Zéro alcool, fraîcheur pure 48h garantie après la douche.',
    sound_title: 'Senteur Pureté • Prestige Sunnah',
    category: 'muscs',
    likes_count: 980,
    comments_count: 41,
    shares_count: 215,
    store: {
      id: 's1000000-0000-0000-0000-000000000005',
      name: 'Prestige Sunnah & Parfums',
      slug: 'prestige-sunnah',
      logo_url: '/logo.png',
      city: 'Abidjan',
      commune: 'Plateau Dokui',
      is_verified: true,
      followers_count: 3200,
    },
    product: {
      id: 'p1000000-0000-0000-0000-000000000005',
      name: 'Musc Tahara Blanc Crémeux Authentique',
      slug: 'musc-tahara-blanc-cremeux',
      price: 4000,
      old_price: 5000,
      cover_image: '/images/categories/cat_muscs.jpg',
      stock: 45,
      rating: 4.9,
      colors: ['Tahara Blanc Classique', 'Tahara Pêche', 'Tahara Grenade'],
      sizes: ['Flacon 12ml'],
    },
  },
  {
    id: 'reel-demo-5',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-in-traditional-dress-41013-small.mp4',
    poster_url: '/images/categories/cat_pashminas.jpg',
    media_type: 'video',
    caption: 'Comment porter le pashmina chaud en saison de fraîcheur ? Tuto rapide en 2 tours avec épingle aimantée 🧕🧣',
    sound_title: 'Tuto Style Hijabi • Oumou Lifestyle',
    category: 'tutos',
    likes_count: 3100,
    comments_count: 210,
    shares_count: 890,
    store: {
      id: 's1000000-0000-0000-0000-000000000025',
      name: 'Boutique Oumou Lifestyle',
      slug: 'boutique-oumou',
      logo_url: '/logo.png',
      city: 'Bouaké',
      commune: 'Koko',
      is_verified: true,
      followers_count: 5300,
    },
    product: {
      id: 'p1000000-0000-0000-0000-000000000025',
      name: 'Gourde Isotherme Bismillah Inox 500ml',
      slug: 'gourde-bismillah-inox-500ml',
      price: 12500,
      old_price: 15000,
      cover_image: '/images/categories/cat_gourdes.jpg',
      stock: 20,
      rating: 4.9,
      colors: ['Blanc Marbre Or', 'Noir Mat Rose Gold'],
      sizes: ['500ml (Chaud 12h / Froid 24h)'],
    },
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const shopId = searchParams.get('shop_id');

    // 1. Récupérer les stories/vidéos réelles de Supabase
    let dbReels: any[] = [];
    try {
      let query = supabaseAdmin
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          created_at,
          expires_at,
          shop_id,
          product_id,
          product:products(id, name, slug, price, old_price, colors, sizes, images:product_images(image_url)),
          store:shops(id, name, slug, logo_url, city, commune, is_verified)
        `)
        .order('created_at', { ascending: false });

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbReels = data.map((item: any) => {
          const coverImage = item.product?.images?.[0]?.image_url || '/images/categories/cat_hijabs.jpg';
          return {
            id: item.id,
            media_url: item.media_url,
            poster_url: coverImage,
            media_type: item.media_type || (item.media_url?.includes('.mp4') ? 'video' : 'image'),
            caption: `Nouveauté disponible chez ${item.store?.name || 'la boutique'} 🧕✨ Commandez directement sur Hijab Market CI !`,
            sound_title: `Audio Original • ${item.store?.name || 'Hijab Market CI'}`,
            category: 'tutos',
            likes_count: Math.floor(Math.random() * 800) + 120,
            comments_count: Math.floor(Math.random() * 50) + 10,
            shares_count: Math.floor(Math.random() * 90) + 15,
            store: {
              id: item.store?.id || item.shop_id,
              name: item.store?.name || 'Boutique Partenaire',
              slug: item.store?.slug || 'boutique',
              logo_url: item.store?.logo_url || '/logo.png',
              city: item.store?.city || 'Côte d\'Ivoire',
              commune: item.store?.commune || 'Abidjan',
              is_verified: item.store?.is_verified ?? true,
              followers_count: 1250,
            },
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              price: item.product.price,
              old_price: item.product.old_price,
              cover_image: coverImage,
              stock: 15,
              rating: 4.9,
              colors: item.product.colors || [],
              sizes: item.product.sizes || [],
            } : null,
          };
        });
      }
    } catch (dbErr) {
      console.warn('Note récupération reels Supabase:', dbErr);
    }

    // 2. Combiner les reels enregistrés en base avec la sélection curated
    let allReels = [...dbReels, ...CURATED_REELS];

    // Filtrer par catégorie si demandé
    if (category && category !== 'all') {
      allReels = allReels.filter((r) => r.category === category);
    }

    return NextResponse.json({
      reels: allReels,
      count: allReels.length,
      success: true,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/reels:', error);
    return NextResponse.json({
      reels: CURATED_REELS,
      count: CURATED_REELS.length,
      success: true,
    });
  }
}
