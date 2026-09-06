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

    const { name, description, city } = await req.json();

    if (!name || !city) {
      return NextResponse.json({ message: 'Nom et ville requis' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Upsert la boutique (créer si n'existe pas, mettre à jour sinon)
    const store = await prisma.store.upsert({
      where: {
        sellerId: session.user.id
      },
      update: {
        name,
        slug,
        description,
        city
      },
      create: {
        sellerId: session.user.id,
        name,
        slug,
        description,
        city
      }
    });

    return NextResponse.json(store, { status: 200 });
  } catch (error: any) {
    console.error('Erreur Store API:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Ce nom de boutique existe déjà' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
