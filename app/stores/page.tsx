'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, Star, ShieldCheck, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import type { Shop } from '@/lib/supabase/types';

export default function StoresPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    DBService.getShops().then((res) => {
      setShops(res);
      setLoading(false);
    });
  }, []);

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.commune && s.commune.toLowerCase().includes(search.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Banner */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Boutiques de Mode Modeste & Traditionnelle
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Découvrez les créatrices et ateliers vérifiés de hijabs, abayas, boubous et tenues mastour en Côte d'Ivoire
            </p>
          </div>
        </div>

        <div className="container py-8">
          {/* Search Bar */}
          <div className="relative max-w-lg mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="stores-search"
              type="text"
              placeholder="Rechercher par nom de boutique, commune (Cocody, Treichville, Marcory)..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none text-xs transition shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid of Stores */}
          {loading ? (
            <div className="text-center py-24 text-xs text-gray-400">
              Chargement des boutiques...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <p className="text-5xl mb-3">🏪</p>
              <h3 className="text-base font-bold text-gray-900 font-heading">Aucune boutique trouvée</h3>
              <p className="text-xs text-gray-500 mt-1">Essayez une autre recherche ou réinitialisez le filtre.</p>
              <button
                onClick={() => setSearch('')}
                className="btn btn-primary btn-sm mt-4"
              >
                Voir toutes les boutiques
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((store) => (
                <Link
                  key={store.id}
                  href={`/boutique/${store.slug}`}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group flex flex-col overflow-hidden"
                >
                  {/* Banner & Logo */}
                  <div className="h-32 bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 relative flex items-center justify-center border-b border-emerald-500/20">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-emerald-500/40 shadow-md overflow-hidden flex items-center justify-center text-3xl">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        '🏪'
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {store.is_founder && (
                        <div className="bg-amber-400 text-gray-950 rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm flex items-center gap-1">
                          🎖️ Fondatrice
                        </div>
                      )}
                      {store.verified && (
                        <div
                          className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm"
                          title="Boutique certifiée"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Vérifiée
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition font-heading">
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{store.commune || 'Abidjan'}, {store.city}</span>
                      </div>

                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                        {store.description || 'Boutique spécialisée en hijabs, abayas et mode modeste de qualité.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{store.rating || 4.9}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({store.total_reviews || 120} avis)</span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 font-bold group-hover:translate-x-1 transition">
                        <span>Visiter la vitrine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Vendor Banner */}
          <div className="mt-16 bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 rounded-3xl p-8 md:p-12 text-center text-white border border-emerald-500/30 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2 text-white">
              Vous vendez des hijabs ou des abayas ?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mb-6 max-w-xl mx-auto">
              Ouvrez votre boutique officielle sur HIJAB MARKET CI et touchez des milliers de clientes actives à Abidjan et partout en Côte d'Ivoire.
            </p>
            <Link
              href="/auth/register/vendor"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg hover:shadow-xl transition"
            >
              Ouvrir ma boutique gratuitement 🚀
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
