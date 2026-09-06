'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Category } from '@/lib/supabase/types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DBService.getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <section id="categories" className="py-16 bg-white/80 backdrop-blur-sm relative border-b border-gray-100">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Rayons Officiels de Mode Modeste & Traditionnelle
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 font-heading">
              Explorez par Catégorie
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Hijabs, abayas, boubous en Bazin, tenues de prière, prêt-à-porter mastour et accessoires
            </p>
          </div>
          <Link
            href="/products"
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto bg-white shadow-sm hover:border-emerald-500 hover:text-emerald-700"
          >
            Voir tout le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Dynamic Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 bg-gradient-to-b from-white to-gray-50/70 hover:from-emerald-50/50 hover:to-white hover:border-emerald-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl sm:text-4xl mb-2.5 group-hover:scale-110 transition-transform duration-300">
                    {cat.emoji || '✨'}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 font-heading leading-tight group-hover:text-emerald-700 transition">
                    {cat.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-emerald-600">
                  <span className="truncate">Découvrir</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
