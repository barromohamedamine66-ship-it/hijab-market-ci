'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  ShieldCheck, Users, Store, Package, ShoppingCart,
  Percent, ArrowDownCircle, AlertTriangle, Settings, LogOut, Truck, Tag, Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  { href: '/admin', icon: ShieldCheck, label: 'Vue d\'ensemble' },
  { href: '/admin/categories', icon: Tag, label: 'Gestion Catégories' },
  { href: '/admin/sellers', icon: Store, label: 'Boutiques & Vendeurs' },
  { href: '/admin/subscriptions', icon: Award, label: 'Abonnements & Formules' },
  { href: '/admin/products', icon: Package, label: 'Modération Produits' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Commandes Globales' },
  { href: '/admin/settings', icon: Settings, label: 'Paramètres Plateforme' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/admin')}`);
    }
  }, [user, loading, router, pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b0e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Vérification des accès administrateur...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b0e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a1014] border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h1 className="text-xl font-bold text-white font-heading mb-2">Connexion Requise</h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Vous devez être connecté avec un compte administrateur pour accéder à ce panneau.
          </p>
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(pathname || '/admin')}`}
            className="btn btn-primary w-full text-xs font-bold py-3"
          >
            Se connecter à l'administration
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated BUT not admin
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070b0e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a1014] border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-3xl">
            🛡️
          </div>
          <h1 className="text-xl font-bold text-white font-heading mb-2">Accès Administrateur Restreint</h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Cette section est strictement réservée à la direction de HIJAB MARKET CI. Votre compte actuel n'a pas les privilèges requis.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link href="/" className="btn btn-primary w-full text-xs font-bold py-2.5">
              Retourner à la Marketplace
            </Link>
            <button
              onClick={signOut}
              className="btn btn-outline text-xs font-bold py-2.5 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-[#0a1014] border-r border-slate-800/80 flex-col fixed h-full z-40">
        {/* Brand with Official Logo */}
        <div className="p-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black overflow-hidden border border-emerald-500/60 shadow-[0_0_15px_rgba(0,230,153,0.35)] flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-heading leading-tight">HIJAB MARKET CI</p>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Administration Générale</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-emerald-400'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Directrice Plateforme</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Super Admin</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition">
            <LogOut className="w-3.5 h-3.5" />
            Quitter l'administration
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-[#0a1014] border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black overflow-hidden border border-emerald-500/50">
              <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-extrabold text-white">Administration CI</span>
          </div>

          <div className="hidden md:block">
            <span className="text-xs text-slate-400 font-medium">Panneau de Contrôle & Supervision de la Marketplace</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              ● Système en Ligne
            </span>
            <Link href="/" className="text-xs font-bold text-slate-300 hover:text-emerald-400 transition">
              Voir la boutique →
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Strip */}
        <nav className="md:hidden bg-[#0a1014] border-b border-slate-800 px-3 py-2 flex gap-1 overflow-x-auto">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                pathname === item.href
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Main Content */}
        <div className="p-6 md:p-8 flex-1 bg-[#070b0e]">{children}</div>
      </div>
    </div>
  );
}
