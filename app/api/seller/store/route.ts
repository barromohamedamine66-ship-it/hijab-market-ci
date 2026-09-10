import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'VENDEUR') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { name, description, city } = await req.json();

    if (!name || !city) {
      return NextResponse.json({ message: 'Nom et ville requis' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Vérifier si la boutique existe déjà pour ce vendeur
    const { data: existingStore } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('seller_id', session.user.id)
      .single();

    let store;
    if (existingStore) {
      // Mettre à jour
      const { data, error } = await supabaseAdmin
        .from('stores')
        .update({ name, slug, description, city })
        .eq('seller_id', session.user.id)
        .select()
        .single();
      if (error) throw error;
      store = data;
    } else {
      // Créer
      const { data, error } = await supabaseAdmin
        .from('stores')
        .insert({ seller_id: session.user.id, name, slug, description, city })
        .select()
        .single();
      if (error) throw error;
      store = data;
    }

    return NextResponse.json(store, { status: 200 });
  } catch (error: any) {
    console.error('Erreur Store API:', error);
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Ce nom de boutique existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
