'use client';

import Link from 'next/link';
import { Phone, MessageCircle, Shield, Store, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TopBanner() {
  const { user, role } = useAuth();

  return (
    <aside aria-label="Bannière d'annonces" className="w-full text-xs font-medium z-50">
      {/* Top Announcement Bar - 100% Client Friendly */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-950 to-emerald-950 text-emerald-100 py-1.5 px-3 border-b border-emerald-800/40">
        <div className="container flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Reassurances & Info Client */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <span>🚚</span> <strong>Livraison express</strong> à Abidjan & partout en Côte d'Ivoire
            </span>
            <span className="hidden lg:inline text-emerald-600">•</span>
            <span className="hidden lg:inline text-emerald-300/80">🌊 Wave & Orange Money acceptés</span>
          </div>

          {/* Quick Contact & Role Badge if Logged In */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+2250777393813"
              className="flex items-center gap-1 hover:text-white transition font-medium text-slate-300"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>07 77 39 38 13</span>
            </a>

            <a
              href="https://wa.me/2250152182840?text=Bonjour%20Service%20Client%20HIJAB%20MARKET%20CI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-bold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Direct</span>
            </a>

            <Link
              href="/stores"
              className="hidden sm:inline text-slate-300 hover:text-white transition font-medium"
            >
              🏬 Boutiques
            </Link>

            {/* If NOT logged in: Invite to become seller */}
            {!user && (
              <Link
                href="/auth/register/vendor"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition text-[10px]"
              >
                ✨ Devenir Vendeuse
              </Link>
            )}

            {/* ONLY visible when authenticated according to user's real role */}
            {user && role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold hover:bg-purple-500/30 transition text-[10px]"
              >
                <Shield className="w-3 h-3" /> Admin
              </Link>
            )}

            {user && role === 'seller' && (
              <Link
                href="/seller/dashboard"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 transition text-[10px]"
              >
                <Store className="w-3 h-3" /> Espace Vendeuse
              </Link>
            )}

            {user && role === 'customer' && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30 transition text-[10px]"
              >
                <User className="w-3 h-3" /> Mon Compte
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
