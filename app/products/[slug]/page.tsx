import type { Metadata } from 'next';
import ProductDetailClient from './_client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';
const SITE_URL = 'https://hijabmarket.ci';

async function fetchProductMeta(slug: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=name,description,price,images,category_id,store_id&limit=1`,
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
  const product = await fetchProductMeta(params.slug);

  if (!product) {
    return {
      title: 'Article introuvable | HIJAB MARKET CI',
    };
  }

  // Récupérer la première image du produit
  let ogImage = DEFAULT_OG_IMAGE;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    ogImage = typeof firstImg === 'string' ? firstImg : (firstImg?.image_url || DEFAULT_OG_IMAGE);
  }

  const priceStr = product.price
    ? `${Number(product.price).toLocaleString('fr-FR')} FCFA`
    : '';

  const title = `${product.name}${priceStr ? ` — ${priceStr}` : ''} | HIJAB MARKET CI`;
  const description =
    product.description ||
    `Découvrez ${product.name} sur HIJAB MARKET CI, votre marketplace de mode modeste en Côte d'Ivoire.`;
  const pageUrl = `${SITE_URL}/products/${params.slug}`;

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
          width: 1200,
          height: 1200,
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
