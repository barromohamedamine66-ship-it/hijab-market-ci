'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Shop } from '@/lib/supabase/types';

export default function FeaturedStores() {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    DBService.getShops().then((res) => {
      setShops(res.slice(0, 4));
    });
  }, []);

  return (
    <section id="boutiques" className="py-20 bg-warm-canvas border-b border-gray-100/80 relative">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
              🎖️ Boutiques Fondatrices & Créatrices
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 font-heading">
              Boutiques Officielles de Mode Modeste & Traditionnelle
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Des ateliers de confection, marques de voiles et créatrices de boubous à Abidjan et en Côte d'Ivoire
            </p>
          </div>
          <Link
            href="/stores"
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto bg-white/90 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
          >
            Toutes les boutiques
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((store) => (
            <Link
              key={store.id}
              href={`/boutique/${store.slug}`}
              className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-100/70 shadow-sm hover:shadow-xl hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-300 group block overflow-hidden"
            >
              {/* Banner */}
              <div className="h-28 bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 flex items-center justify-center relative border-b border-emerald-500/20">
                <div className="w-14 h-14 rounded-2xl bg-black border border-emerald-500/40 shadow-sm overflow-hidden flex items-center justify-center text-2xl">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    '🏪'
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                  {store.is_founder && (
                    <div className="bg-amber-400 text-gray-950 rounded-full px-2 py-0.5 text-[9px] font-black shadow-xs flex items-center gap-1">
                      🎖️ Fondatrice
                    </div>
                  )}
                  {store.verified && (
                    <div
                      className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[9px] font-bold flex items-center gap-1"
                      title="Boutique vérifiée"
                    >
                      <ShieldCheck className="w-3 h-3" /> Vérifiée
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition font-heading truncate">
                  {store.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {store.description || 'Spécialiste de la mode modeste et hijabs de qualité.'}
                </p>

                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{store.commune || 'Abidjan'}, {store.city}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-700">{store.rating || 4.9}</span>
                    <span className="text-[10px] text-gray-400">({store.total_reviews || 95})</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold group-hover:translate-x-0.5 transition">
                    Voir la vitrine →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
