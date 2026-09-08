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
              Rayons Officiels & Univers Islamiques
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 font-heading">
              Explorez par Catégorie
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Hijabs, abayas, parfumerie & muscs, lunettes chic, tapis de prière, soins Sunnah et coffrets
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
              <div key={i} className="h-32 rounded-3xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end"
              >
                {/* Background Image */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50" />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative p-4 sm:p-5 z-10 w-full">
                  <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      Découvrir
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white font-heading leading-tight flex flex-col gap-1">
                    <span className="text-xl sm:text-2xl drop-shadow-md">{cat.emoji}</span>
                    <span className="drop-shadow-md line-clamp-2">{cat.name}</span>
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
