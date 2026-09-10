import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${cleanEmail},phone.eq.${phone.trim()}${cleanPhone ? `,phone.eq.${cleanPhone}` : ''}`)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'Cet email ou numéro de téléphone est déjà associé à un compte' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: cleanEmail,
        phone: phone.trim(),
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'VENDEUR',
        is_active: true
      })
      .select('id')
      .single();

    if (error || !user) {
      throw new Error(error?.message || 'Erreur lors de la création du compte');
    }

    return NextResponse.json({ message: 'Compte vendeuse créé avec succès', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Erreur inscription vendeuse:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
