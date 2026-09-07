'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import type { Product } from '@/lib/supabase/types';
import LikeButton from '@/components/ui/LikeButton';
import { Lock, Search, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA';
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [feed, setFeed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      DBService.getFeedProducts(user.id).then(products => {
        setFeed(products);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-20 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-20 flex-1 max-w-md mx-auto text-center">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gray-900">Accès Réservé</h1>
            <p className="text-xs text-gray-500">Connectez-vous pour voir le fil d'actualité des boutiques que vous suivez.</p>
            <Link href="/auth/login?redirect=/feed" className="btn btn-primary w-full text-xs font-bold py-3 block">
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />
      
      <main className="container py-10 flex-1 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-gray-900">Votre Fil d'Actualité</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Votre fil est vide</h2>
            <p className="text-sm text-gray-500 mb-6">Abonnez-vous à des boutiques pour voir leurs nouveautés apparaître ici !</p>
            <Link href="/stores" className="btn btn-primary px-8">
              Découvrir des boutiques
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {feed.map(product => (
              <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Header = Store Info */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                  <Link href={`/stores/${product.store?.slug}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                      {product.store?.logo_url ? (
                        <img src={product.store.logo_url} alt={product.store.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                      ) : (
                        <span className="text-xl">🏪</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600 transition">{product.store?.name}</h3>
                      <p className="text-[11px] text-gray-500">Nouveau produit ajouté</p>
                    </div>
                  </Link>
                </div>
                
                {/* Main Image */}
                <Link href={`/products/${product.slug}`} className="relative bg-gray-50 aspect-square sm:aspect-[4/3] block group">
                  {product.images?.[0]?.image_url ? (
                    <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🧕</div>
                  )}
                  {product.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-md">
                      {product.badge}
                    </span>
                  )}
                </Link>

                {/* Actions & Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <LikeButton productId={product.id} className="w-10 h-10 bg-gray-50 border border-gray-100" />
                  </div>
                  <Link href={`/products/${product.slug}`} className="block">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-emerald-600 font-extrabold text-lg mt-1">{formatPrice(product.price)}</p>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                    )}
                  </Link>
                  <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                    Il y a {(Math.random() * 24).toFixed(0)} heures
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
