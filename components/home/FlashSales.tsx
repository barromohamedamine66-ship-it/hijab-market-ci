'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ArrowRight, Zap, ShoppingCart } from 'lucide-react';

import { DBService } from '@/lib/supabase/db-service';
import type { Product } from '@/lib/supabase/types';

export default function FlashSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 59 });

  useEffect(() => {
    DBService.getFlashSales().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  if (loading || products.length === 0) {
    return null; // On cache la section si aucune vente flash en cours
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-rose-50 via-white to-orange-50 border-y border-rose-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm border border-rose-200">
              <Zap className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              Offres Exclusives
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading tracking-tight flex items-center gap-3">
              Ventes Flash
              <span className="flex gap-1 sm:gap-1.5 items-center bg-gray-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                <span className="text-base sm:text-lg tabular-nums tracking-widest">
                  {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </span>
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Les meilleures offres de nos boutiques partenaires, valables quelques heures seulement.
            </p>
          </div>
          
          <Link
            href="/products?tag=flash"
            className="group flex items-center gap-2 text-rose-600 font-bold hover:text-rose-700 transition self-start md:self-auto bg-white/60 hover:bg-white px-4 py-2 rounded-full shadow-sm border border-rose-100"
          >
            Voir toutes les offres <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => {
            const coverImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=400&h=400';
            const oldPrice = product.old_price || (product.price * 1.5); // Fallback promotionnel
            const discount = Math.round(((oldPrice - product.price) / oldPrice) * 100);
            const fakeSoldPercentage = 75 + Math.floor(Math.random() * 20); // Génère un taux aléatoire pour l'urgence

            return (
              <div key={product.id} className="bg-white rounded-3xl p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-gray-50">
                  <img src={coverImage} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  
                  {/* Badge Réduction */}
                  <div className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-lg rotate-[-3deg]">
                    -{discount}%
                  </div>
                  
                  {/* Overlay Add to cart (Desktop) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center backdrop-blur-[2px]">
                    <Link href={`/products/${product.slug}`} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                      <ShoppingCart className="w-4 h-4" /> Voir l'offre
                    </Link>
                  </div>
                </div>

                <div className="px-2">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {product.store?.name}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-3 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl sm:text-2xl font-extrabold text-rose-600">
                      {product.price.toLocaleString('fr-FR')} F
                    </span>
                    <span className="text-sm text-gray-400 line-through font-medium">
                      {oldPrice.toLocaleString('fr-FR')} F
                    </span>
                  </div>

                  {/* Progress Bar Stocks */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold">
                      <span className="text-rose-600">Déjà vendu à {fakeSoldPercentage}%</span>
                      <span className="text-gray-400">Restant : {100 - fakeSoldPercentage}%</span>
                    </div>
                    <div className="h-2 sm:h-2.5 w-full bg-rose-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full relative"
                        style={{ width: `${fakeSoldPercentage}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjBMMjAgMEwyMCAyMEgwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PC9zdmc+')] opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
