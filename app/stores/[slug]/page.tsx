import type { Metadata } from 'next';
import StoreDetailClient from './_client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

import { DBService } from '@/lib/supabase/db-service';

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';
const SITE_URL = 'https://hijabmarket.ci';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const shop = await DBService.getShopBySlug(params.slug);

  if (!shop) {
    return {
      title: 'Boutique introuvable | HIJAB MARKET CI',
    };
  }

  const title = `${shop.name} — Boutique sur HIJAB MARKET CI`;
  const description =
    shop.description ||
    `Découvrez la boutique ${shop.name} à ${shop.commune || shop.city || 'Côte d\'Ivoire'} sur HIJAB MARKET CI. Hijabs, abayas, tenues modestes et bien plus.`;
  let ogImage = shop.logo_url || DEFAULT_OG_IMAGE;
  if (ogImage && !ogImage.startsWith('http')) {
    ogImage = `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  }
  const pageUrl = `${SITE_URL}/boutique/${params.slug}`;

  return {
    metadataBase: new URL(SITE_URL),
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
          secureUrl: ogImage,
          width: 800,
          height: 800,
          type: ogImage.endsWith('.png') ? 'image/png' : 'image/jpeg',
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
