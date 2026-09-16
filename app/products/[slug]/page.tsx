import type { Metadata } from 'next';
import ProductDetailClient from './_client';
import { DBService } from '@/lib/supabase/db-service';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hijabmarket-ci.com';

async function fetchProductMeta(slug: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=name,description,price,images:product_images(*),category:categories(*),store:shops(*)&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) return data[0];
    }
  } catch {}
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let product: any = await fetchProductMeta(params.slug);

  if (!product) {
    try {
      product = await DBService.getProductBySlug(params.slug);
    } catch {}
  }

  if (!product) {
    return {
      title: 'Mode Modeste & Hijabs | HIJAB MARKET CI',
    };
  }

  // Récupérer la première image réelle du produit (URL absolue requise par WhatsApp)
  let ogImage = `${SITE_URL}/api/products/${params.slug}/image`;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    const candidate = typeof firstImg === 'string' ? firstImg : (firstImg?.image_url || '');
    if (candidate) {
      if (candidate.startsWith('data:')) {
        ogImage = `${SITE_URL}/api/products/${params.slug}/image`;
      } else if (candidate.startsWith('http')) {
        ogImage = candidate;
      } else {
        ogImage = `${SITE_URL}${candidate.startsWith('/') ? '' : '/'}${candidate}`;
      }
    }
  } else if (product.imageUrl && typeof product.imageUrl === 'string') {
    if (product.imageUrl.startsWith('data:')) {
      ogImage = `${SITE_URL}/api/products/${params.slug}/image`;
    } else if (product.imageUrl.startsWith('http')) {
      ogImage = product.imageUrl;
    } else {
      ogImage = `${SITE_URL}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`;
    }
  }

  const priceStr = product.price
    ? `${Number(product.price).toLocaleString('fr-FR')} FCFA`
    : '';

  const title = `${product.name}${priceStr ? ` — ${priceStr}` : ''} | HIJAB MARKET CI`;
  const description =
    product.description ||
    `Découvrez ${product.name} sur HIJAB MARKET CI, la marketplace de mode modeste en Côte d'Ivoire. Boutiques vérifiées et commande directe.`;
  const pageUrl = `${SITE_URL}/products/${params.slug}`;

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
          width: 1200,
          height: 1200,
          type: ogImage.endsWith('.png') ? 'image/png' : 'image/jpeg',
          alt: product.name,
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

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient params={params} />;
}
