'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, ShoppingCart, User, LogOut, Package, Store, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const navLinks = [
  { href: '/#categories', label: 'Catégories' },
  { href: '/products', label: 'Produits' },
  { href: '/stores', label: 'Boutiques' },
  { href: '/devenir-vendeur', label: 'Devenir Vendeur' },
];

export default function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const { count } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
          }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gray-950 overflow-hidden border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:border-emerald-400 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.5)] transition duration-300 flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="HIJAB MARKET CI Logo officiel"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-extrabold text-gray-900 font-heading tracking-tight leading-tight">
                  HIJAB MARKET <span className="text-emerald-500">CI</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase hidden sm:block">
                  Mode Modeste & Traditionnelle
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                id="search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition hidden sm:flex"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart button */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                aria-label="Panier"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {count}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Section */}
              {user ? (
                <div className="relative hidden sm:block pl-2 border-l border-gray-200">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                      {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                      {profile?.full_name || (user.email?.endsWith('@client.hijabmarket.ci') ? (profile?.phone || 'Mon Compte') : user.email?.split('@')[0])}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {userDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                      onClick={() => setUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{profile?.full_name || 'Mon Compte'}</p>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${role === 'seller' ? 'bg-amber-100 text-amber-800' :
                          role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                          {role === 'seller' ? '🌟 Vendeuse Officielle' : role === 'admin' ? '🛡️ Administrateur' : '🧕 Cliente'}
                        </span>
                      </div>

                      {role === 'seller' && (
                        <>
                          <Link href="/seller/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold">
                            <Store className="w-4 h-4 text-amber-500" /> Espace Vendeur
                          </Link>
                          <Link href="/seller/products/new" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold">
                            ➕ Ajouter un Produit
                          </Link>
                          <Link href="/seller/orders" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold">
                            <Package className="w-4 h-4 text-blue-500" /> Commandes Reçues
                          </Link>
                        </>
                      )}

                      {role === 'customer' && (
                        <>
                          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold">
                            <User className="w-4 h-4 text-emerald-500" /> Mon Espace Client
                          </Link>
                          <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold">
                            <Package className="w-4 h-4 text-emerald-500" /> Mes Commandes
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-xs text-purple-700 hover:bg-purple-50 font-bold">
                          🛡️ Tableau de Bord Admin
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold transition"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register/vendor"
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <span>🏪 Devenir Vendeuse</span>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                aria-label="Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-3 px-4 bg-white">
            <div className="container">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Rechercher un produit, une boutique..."
                  className="input pl-12 bg-gray-50"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white py-4 shadow-lg">
            <div className="container space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition font-medium"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-gray-100 mt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-900">
                        {profile?.full_name || (user.email?.endsWith('@client.hijabmarket.ci') ? (profile?.phone || 'Compte Cliente') : user.email)}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">{role}</p>
                    </div>
                    {role === 'admin' ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="btn w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold"
                      >
                        🛡️ Administration
                      </Link>
                    ) : role === 'seller' ? (
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary w-full text-center"
                      >
                        🌟 Espace Vendeuse
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary w-full text-center"
                      >
                        🧕 Mon Espace Client
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="btn btn-outline text-rose-600 border-rose-200 w-full"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="btn btn-outline w-full"
                    >
                      Connexion Espace Pro / Vendeuse
                    </Link>
                    <Link
                      href="/auth/register/vendor"
                      onClick={() => setIsOpen(false)}
                      className="btn btn-primary w-full"
                    >
                      🏪 Devenir Vendeuse Partenaire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
