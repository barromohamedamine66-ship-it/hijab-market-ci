import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/stories — Récupérer toutes les stories actives pour le feed / page d'accueil
export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data: stories, error } = await supabaseAdmin
      .from('stories')
      .select('*, store:shops(id, name, slug, logo_url, city, is_verified), product:products(id, name, slug, price, images:product_images(image_url))')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('API /api/stories query error:', error);
      // Fallback without complex joins if foreign keys differ
      const { data: rawStories, error: rawError } = await supabaseAdmin
        .from('stories')
        .select('*')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (rawError || !rawStories) {
        return NextResponse.json({ stories: [] });
      }

      // Enrich manually
      const enriched = await Promise.all(
        rawStories.map(async (st: any) => {
          let store = null;
          let product = null;
          if (st.shop_id) {
            const { data: s } = await supabaseAdmin
              .from('shops')
              .select('id, name, slug, logo_url, city, is_verified')
              .eq('id', st.shop_id)
              .single();
            store = s;
          }
          if (st.product_id) {
            const { data: p } = await supabaseAdmin
              .from('products')
              .select('id, name, slug, price')
              .eq('id', st.product_id)
              .single();
            product = p;
          }
          return { ...st, store, product };
        })
      );

      return NextResponse.json({ stories: enriched });
    }

    return NextResponse.json({ stories: stories || [] });
  } catch (err: any) {
    console.error('GET /api/stories unexpected error:', err);
    return NextResponse.json({ stories: [] });
  }
}
