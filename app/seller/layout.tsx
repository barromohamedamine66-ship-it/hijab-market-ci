'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart,
  DollarSign, ArrowDownCircle, Store, Bell, LogOut, ShieldAlert, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/seller/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/seller/shop', icon: Store, label: 'Ma Boutique' },
  { href: '/seller/products', icon: Package, label: 'Mes Produits' },
  { href: '/seller/orders', icon: ShoppingCart, label: 'Commandes' },
  { href: '/seller/earnings', icon: DollarSign, label: 'Revenus & Portefeuille' },
  { href: '/seller/withdrawals', icon: ArrowDownCircle, label: 'Demandes de Retrait' },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, shop, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/seller/dashboard')}`);
    }
  }, [user, loading, router, pathname]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-bold tracking-wider uppercase">
            Vérification des accès boutique...
          </p>
        </div>
      </div>
    );
  }

  // Non authentifié
  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-heading mb-2">Espace Vendeuse Réservé</h1>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Vous devez être connectée à votre compte boutique pour accéder à la gestion de vos produits et commandes.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(pathname || '/seller/dashboard')}`}
              className="btn btn-primary w-full text-xs font-bold py-3"
            >
              Se connecter à ma boutique
            </Link>
            <Link
              href="/auth/register/vendor"
              className="btn btn-outline w-full text-xs font-bold py-2.5"
            >
              Créer un compte vendeuse ✨
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 mt-2 font-medium">
              Retourner à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Connecté mais NI vendeuse NI administrateur
  if (role !== 'seller' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-4 text-3xl">
            🛍️
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-heading mb-2">Ouvrez votre Boutique Vendeuse</h1>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Votre compte actuel (<strong>{user.email}</strong>) est un profil cliente. Pour commencer à vendre vos hijabs, abayas et accessoires sur la marketplace, enregistrez votre boutique officielle.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/auth/register/vendor"
              className="btn btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Devenir Vendeuse Partenaire
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-outline w-full text-xs font-bold py-2.5"
            >
              Aller à mon espace cliente
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 mt-1 font-medium">
              Retourner à la marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shopDisplayName = shop?.name || profile?.full_name || 'Ma Boutique';

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col fixed h-full z-40">
        {/* Brand with Official Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-950 overflow-hidden border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 font-heading leading-tight">HIJAB MARKET CI</p>
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Espace Vendeur</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-base overflow-hidden border border-emerald-200 shadow-xs flex-shrink-0">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt={shopDisplayName} className="w-full h-full object-cover" />
              ) : (
                '🧕'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{shopDisplayName}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Boutique Active ✔</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-emerald-600 transition">
              🏬 Voir la boutique
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-rose-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-3.5 py-3 sm:px-6 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-950 overflow-hidden border border-emerald-500/40 flex-shrink-0 shadow-xs">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt={shopDisplayName} className="w-full h-full object-cover" />
              ) : (
                <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="truncate max-w-[150px]">
              <span className="text-xs font-extrabold text-gray-900 block truncate">{shopDisplayName}</span>
              <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">Vendeuse CI</span>
            </div>
          </div>

          <div className="hidden md:block">
            <span className="text-xs text-gray-500 font-semibold">
              Portail Commerçantes & Créatrices — <strong className="text-gray-800">{shopDisplayName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Boutique en ligne
            </div>
            <Link
              href="/"
              className="text-[11px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 transition whitespace-nowrap"
            >
              Marketplace →
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Strip - Horizontally scrollable & touch friendly */}
        <nav className="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-100 px-2.5 py-2 flex gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Page Children - Optimized padding for Mobile Portrait */}
        <div className="p-3.5 sm:p-5 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
