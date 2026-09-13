import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Client admin avec service role key pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserIdFromReq(req: Request): Promise<string | null> {
  // 1. NextAuth session check
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch {}

  // 2. Supabase Bearer token check
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user?.id) return data.user.id;
    } catch {}
  }

  return null;
}

// GET /api/seller/stories — Récupérer les stories du vendeur
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    const { searchParams } = new URL(req.url);
    const requestedShopId = searchParams.get('shop_id');

    let shopId = requestedShopId;

    if (!shopId && userId) {
      const { data: shop } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

      if (shop?.id) {
        shopId = shop.id;
      }
    }

    if (!shopId) {
      return NextResponse.json({ stories: [] });
    }

    const { data: stories, error } = await supabaseAdmin
      .from('stories')
      .select('*, product:products(id, name, slug, price)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('GET /api/seller/stories query error:', error);
      return NextResponse.json({ stories: [] });
    }

    return NextResponse.json({ stories: stories || [] });
  } catch (err: any) {
    console.error('GET /api/seller/stories error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// POST /api/seller/stories — Créer une story
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shop_id, product_id, media_url, media_type } = body;

    if (!shop_id || !media_url) {
      return NextResponse.json({ error: 'shop_id et media_url requis' }, { status: 400 });
    }

    const userId = await getUserIdFromReq(req);

    // Vérifier l'existence de la boutique
    const { data: shop, error: shopErr } = await supabaseAdmin
      .from('shops')
      .select('id, owner_id')
      .eq('id', shop_id)
      .maybeSingle();

    if (shopErr || !shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
    }

    // Si authentifié, vérifier que l'utilisateur est bien le propriétaire
    if (userId && shop.owner_id && shop.owner_id !== userId) {
      return NextResponse.json({ error: 'Action non autorisée sur cette boutique' }, { status: 403 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .insert({
        shop_id,
        product_id: product_id || null,
        media_url,
        media_type: media_type || 'image',
        expires_at: expiresAt.toISOString(),
      })
      .select('*, product:products(id, name, slug, price)')
      .single();

    if (error) {
      console.error('createStory DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ story }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/seller/stories error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// DELETE /api/seller/stories?id=xxx — Supprimer une story
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('DELETE /api/seller/stories error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/seller/stories error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
