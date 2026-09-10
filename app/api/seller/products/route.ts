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

    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('seller_id', session.user.id)
      .single();

    if (!store) {
      return NextResponse.json({ message: 'Boutique introuvable. Veuillez configurer votre boutique en premier.' }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, price, stock, categoryName } = body;

    // Gestion de la catégorie
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let { data: category } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (!category) {
      const { data: newCategory, error: catError } = await supabaseAdmin
        .from('categories')
        .insert({ name: categoryName, slug: categorySlug })
        .select('id')
        .single();
      if (catError) throw catError;
      category = newCategory;
    }

    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        store_id: store.id,
        category_id: category!.id,
        name,
        slug: productSlug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Erreur Product API:', error);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
