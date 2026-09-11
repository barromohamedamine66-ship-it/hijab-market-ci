import type { Metadata } from 'next';
import StoreDetailClient from './_client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';
const SITE_URL = 'https://hijabmarket.ci';

async function fetchShopMeta(slug: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shops?slug=eq.${encodeURIComponent(slug)}&select=name,description,logo_url,city,commune&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 }, // cache 1h
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const shop = await fetchShopMeta(params.slug);

  if (!shop) {
    return {
      title: 'Boutique introuvable | HIJAB MARKET CI',
    };
  }

  const title = `${shop.name} — Boutique sur HIJAB MARKET CI`;
  const description =
    shop.description ||
    `Découvrez la boutique ${shop.name} à ${shop.commune || shop.city || 'Côte d\'Ivoire'} sur HIJAB MARKET CI. Hijabs, abayas, tenues modestes et bien plus.`;
  const ogImage = shop.logo_url || DEFAULT_OG_IMAGE;
  const pageUrl = `${SITE_URL}/boutique/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'HIJAB MARKET CI',
      type: 'website',
      locale: 'fr_CI',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: `Logo de la boutique ${shop.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function StoreDetailPage({ params }: { params: { slug: string } }) {
  return <StoreDetailClient params={params} />;
}
