import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDEUR') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ message: 'Boutique introuvable. Veuillez configurer votre boutique en premier.' }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, price, stock, categoryName } = body;

    // Gestion très basique de la catégorie pour l'exemple (si la catégorie n'existe pas, on la crée)
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, slug: categorySlug }
      });
    }

    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: category.id,
        name,
        slug: productSlug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Erreur Product API:', error);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
