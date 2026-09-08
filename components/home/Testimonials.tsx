'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DBService.getRecentReviews(3)
      .then((data) => {
        setReviews(data || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Ne rien afficher si aucun avis client réel n'a encore été posté
  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-african-pattern relative border-b border-gray-100">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            💬 Avis Vérifiés
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 font-heading">
            Ce qu'elles disent de nos articles
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Les derniers retours d'expérience authentiques laissés par nos clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => {
            const authorName = rev.user?.full_name || 'Cliente vérifiée';
            const initial = authorName[0]?.toUpperCase() || 'C';
            const dateStr = rev.created_at
              ? new Date(rev.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Récemment';

            return (
              <div
                key={rev.id}
                className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-100/70 p-6 relative shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-8 h-8 text-amber-200/60 absolute top-5 right-5" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-emerald-100 rounded-full flex items-center justify-center text-lg font-bold text-emerald-800 shadow-inner overflow-hidden">
                      {rev.user?.avatar_url ? (
                        <img
                          src={rev.user.avatar_url}
                          alt={authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-950 text-sm">{authorName}</p>
                      {rev.product?.name && (
                        <Link
                          href={`/products/${rev.product.slug}`}
                          className="text-xs text-emerald-700 font-semibold hover:underline block truncate max-w-[200px]"
                        >
                          Sur : {rev.product.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 italic">
                    « {rev.comment} »
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
