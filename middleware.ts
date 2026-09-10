import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Emails admin officiels (doit rester en sync avec AuthContext.tsx)
const ADMIN_EMAILS = [
  'barromohamedamine66@gmail.com',
  'admin@hijabmarket.ci',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Routes publiques : pas de vérification
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/seller')
  ) {
    return response;
  }

  // Créer le client Supabase avec SSR (lecture des cookies de session)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hdiykdodruimphunpwjf.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YP1b16EVjZ7rKoj80PjEjA_DHZeX5nP';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        response.cookies.set({ name, value, ...(options as any) });
      },
      remove(name: string, options: Record<string, unknown>) {
        response.cookies.set({ name, value: '', ...(options as any) });
      },
    },
  });

  // Récupérer l'utilisateur authentifié
  const { data: { user } } = await supabase.auth.getUser();

  // Non authentifié → redirection vers login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Routes /admin/* → vérification du rôle admin
  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const email = user.email || profile?.email || '';
    const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(email.toLowerCase());

    if (!isAdmin) {
      // Authentifié mais pas admin : redirection vers la page d'accueil
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Routes /seller/* → vérification du rôle seller ou admin
  if (pathname.startsWith('/seller')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const email = user.email || profile?.email || '';
    const isAdminOrSeller =
      profile?.role === 'seller' ||
      profile?.role === 'admin' ||
      ADMIN_EMAILS.includes(email.toLowerCase());

    if (!isAdminOrSeller) {
      // Authentifié mais pas vendeur : redirection vers la page d'accueil
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
