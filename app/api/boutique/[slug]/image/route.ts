import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';
const DEFAULT_STORE_FALLBACK = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.redirect(DEFAULT_STORE_FALLBACK, 307);
    }

    // Interroger Supabase pour récupérer le logo ou l'image de la boutique
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/shops?slug=eq.${encodeURIComponent(slug)}&select=id,name,logo_url&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: 'no-store',
      }
    );

    let logoUrl: string | null = null;
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].logo_url) {
        logoUrl = data[0].logo_url;
      }
    }

    if (!logoUrl) {
      return NextResponse.redirect(DEFAULT_STORE_FALLBACK, 307);
    }

    // 1. Si le logo est en Base64 (anciens logos uploadés avant le CDN)
    if (logoUrl.startsWith('data:image/')) {
      const parts = logoUrl.split(';base64,');
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

    // 2. Si c'est un chemin relatif local (ex: /logo.png ou /uploads/...)
    if (logoUrl.startsWith('/')) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hijabmarket-ci.com';
      return NextResponse.redirect(`${siteUrl}${logoUrl}`, 307);
    }

    // 3. Si c'est une URL HTTPS absolue
    if (logoUrl.startsWith('http')) {
      return NextResponse.redirect(logoUrl, 307);
    }

    return NextResponse.redirect(DEFAULT_STORE_FALLBACK, 307);
  } catch (err) {
    return NextResponse.redirect(DEFAULT_STORE_FALLBACK, 307);
  }
}
