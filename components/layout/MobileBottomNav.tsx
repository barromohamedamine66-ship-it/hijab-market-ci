'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Store, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user, role } = useAuth();

  // Déterminer la destination de l'onglet Profil / Compte
  const accountHref = user
    ? role === 'seller'
      ? '/seller/dashboard'
      : role === 'admin'
      ? '/admin'
      : '/dashboard'
    : '/auth/login';

  const navItems = [
    {
      label: 'Accueil',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Explorer',
      href: '/products',
      icon: Search,
      isActive: pathname.startsWith('/products'),
    },
    {
      label: 'Boutiques',
      href: '/stores',
      icon: Store,
      isActive: pathname.startsWith('/stores'),
    },
    {
      label: 'Panier',
      href: '/cart',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/cart'),
      badge: count,
    },
    {
      label: user ? 'Compte' : 'Connexion',
      href: accountHref,
      icon: User,
      isActive:
        pathname.startsWith('/profile') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/seller') ||
        pathname.startsWith('/auth'),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <nav className="flex items-center justify-around px-2 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-90 relative ${
                active ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {/* Conteneur de l'icône avec badge éventuel */}
              <div className="relative">
                <div
                  className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active ? 'bg-emerald-100/70 text-emerald-700' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                {/* Badge dynamique du panier */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Libellé de l'onglet */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-all ${
                  active ? 'font-bold text-emerald-800' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>

              {/* Point lumineux actif */}
              {active && (
                <span className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
