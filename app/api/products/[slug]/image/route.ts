import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';
const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.redirect(DEFAULT_IMAGE_FALLBACK, 307);
    }

    let imageUrl: string | null = null;

    // 1. Tenter la requête directe Supabase avec jointure
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=id,images:product_images(image_url)&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          if (data[0].images && Array.isArray(data[0].images) && data[0].images.length > 0) {
            imageUrl = data[0].images[0].image_url;
          }
          // 2. Si pas d'image dans la jointure, interroger directement product_images par product_id
          if (!imageUrl && data[0].id) {
            const imgRes = await fetch(
              `${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${data[0].id}&select=image_url&order=position.asc&limit=1`,
              {
                headers: {
                  apikey: SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                },
                cache: 'no-store',
              }
            );
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              if (imgData && imgData[0]?.image_url) {
                imageUrl = imgData[0].image_url;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Erreur fetch image Supabase:', err);
    }

    if (!imageUrl) {
      return NextResponse.redirect(DEFAULT_IMAGE_FALLBACK, 307);
    }

    // A. Si l'image est stockée en Base64 (photos importées depuis le téléphone)
    if (imageUrl.startsWith('data:image/')) {
      const parts = imageUrl.split(';base64,');
      const mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      const base64Data = parts[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // B. Si c'est une URL relative (ex: /uploads/...)
    if (imageUrl.startsWith('/')) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hijabmarket-ci.com';
      return NextResponse.redirect(`${siteUrl}${imageUrl}`, 307);
    }

    // C. Si c'est une URL HTTPS absolue (CDN Supabase ou Unsplash)
    if (imageUrl.startsWith('http')) {
      return NextResponse.redirect(imageUrl, 307);
    }

    return NextResponse.redirect(DEFAULT_IMAGE_FALLBACK, 307);
  } catch (err) {
    return NextResponse.redirect(DEFAULT_IMAGE_FALLBACK, 307);
  }
}
