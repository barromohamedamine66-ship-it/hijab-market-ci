import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Client admin avec service role key pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/seller/stories — Récupérer les stories du vendeur connecté
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Trouver la boutique du vendeur
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (!shop) {
      return NextResponse.json({ stories: [] });
    }

    const { data: stories, error } = await supabaseAdmin
      .from('stories')
      .select('*, product:products(id, name, slug, price)')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ stories: stories || [] });
  } catch (err: any) {
    console.error('GET /api/seller/stories error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// POST /api/seller/stories — Créer une story
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { shop_id, product_id, media_url, media_type } = body;

    if (!shop_id || !media_url) {
      return NextResponse.json({ error: 'shop_id et media_url requis' }, { status: 400 });
    }

    // Vérifier que la boutique appartient bien au vendeur
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('id', shop_id)
      .eq('owner_id', session.user.id)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable ou non autorisée' }, { status: 403 });
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
      console.error('createStory error:', error);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    // Vérifier que la story appartient à ce vendeur
    const { data: story } = await supabaseAdmin
      .from('stories')
      .select('id, shop_id, shops!inner(owner_id)')
      .eq('id', id)
      .single();

    if (!story) {
      return NextResponse.json({ error: 'Story introuvable' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/seller/stories error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
