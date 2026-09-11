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
    <section id="categories" className="py-16 bg-white/90 backdrop-blur-sm relative border-b border-amber-100/50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-amber-50 text-emerald-900 px-3.5 py-1 rounded-full text-xs font-bold mb-2 border border-amber-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Rayons Officiels & Univers Islamiques</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-heading tracking-tight">
              Explorez par Catégorie
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Hijabs, abayas, bazins nobles, qamis, gourdes isothermes, muscs de Dubaï, soins Sunnah et coffrets cadeaux.
            </p>
          </div>
          <Link
            href="/products"
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto bg-white shadow-xs hover:border-emerald-500 hover:text-emerald-700"
          >
            Voir tout le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-44 sm:h-52 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end border border-gray-100 hover:border-amber-400/50"
              >
                {/* Background Image */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-900 to-emerald-950" />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative p-3.5 sm:p-4 z-10 w-full">
                  <div className="flex items-center gap-1.5 mb-1.5 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-amber-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Explorer
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-white font-heading leading-tight flex flex-col gap-1">
                    <span className="text-xl sm:text-2xl drop-shadow-md">{cat.emoji}</span>
                    <span className="drop-shadow-md line-clamp-2 text-slate-100 group-hover:text-amber-200 transition-colors">{cat.name}</span>
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
