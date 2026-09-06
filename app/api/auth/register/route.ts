import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, phone, password, firstName, lastName, role } = await req.json();

    // La création de compte est désormais exclusivement réservée aux vendeuses / partenaires
    if (role !== 'VENDEUR') {
      return NextResponse.json(
        { 
          message: "L'inscription est réservée aux vendeuses partenaires. Les clientes n'ont pas besoin de compte pour commander sur HIJAB MARKET CI." 
        }, 
        { status: 400 }
      );
    }

    if (!email || !phone || !password) {
      return NextResponse.json({ message: 'Email, numéro de téléphone et mot de passe requis pour ouvrir une boutique' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanDigits = (phone || '').replace(/\D/g, '');
    const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    // Vérifier si un utilisateur existe déjà avec cet email ou téléphone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: phone.trim() },
          ...(cleanPhone ? [{ phone: cleanPhone }] : [])
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Cet email ou numéro de téléphone est déjà associé à un compte' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: phone.trim(),
        password: hashedPassword,
        firstName,
        lastName,
        role: 'VENDEUR'
      }
    });

    return NextResponse.json({ message: 'Compte vendeuse créé avec succès', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Erreur inscription vendeuse:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
