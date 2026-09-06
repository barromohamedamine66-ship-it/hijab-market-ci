'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/supabase/types';

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA';
}

export default function FeaturedProducts() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    DBService.getProducts({ limit: 8 }).then((prods) => {
      setProducts(prods);
    });
  }, []);

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      product_id: p.id,
      product_name: p.name,
      product_image: p.images?.[0]?.image_url || null,
      price: p.price,
      quantity: 1,
      selected_color: p.colors?.[0] || undefined,
      selected_size: p.sizes?.[0] || undefined,
      store_id: p.store_id,
      store_name: p.store?.name || 'Boutique Partenaire',
    });

    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="relative py-20 bg-african-pattern overflow-hidden border-y border-amber-900/5">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 text-emerald-800 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 shadow-sm">
              <span>🇨🇮</span>
              <span>Sélection Étoilée & Créations Abidjan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-950 font-heading tracking-tight">
              Produits Populaires du Moment
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-xl leading-relaxed">
              Hijabs en soie de Médine, abayas Dubaï, boubous en Bazin riche brodé et ensembles mastour les plus plébiscités en Côte d'Ivoire.
            </p>
          </div>
          <Link
            href="/products"
            className="btn btn-outline btn-sm gap-2 self-start sm:self-auto bg-white/80 backdrop-blur-sm border-gray-200 hover:border-emerald-500 hover:text-emerald-700 shadow-sm"
          >
            Voir tout le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const coverImage = product.images?.[0]?.image_url;
            const isJustAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.12)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col overflow-hidden"
              >
                {/* Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-52 bg-gradient-to-br from-amber-50/40 via-white to-emerald-50/40 flex items-center justify-center overflow-hidden block"
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <span className="text-5xl group-hover:scale-110 transition duration-300">
                      🧕
                    </span>
                  )}

                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                      <span>✨</span> {product.badge}
                    </span>
                  )}

                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="badge badge-gray text-xs font-bold">Épuisé</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-emerald-600 font-bold block truncate">
                      {product.store?.name || 'Boutique Partenaire'}
                    </span>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm mt-1 line-clamp-2 hover:text-emerald-600 transition leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{product.rating || 5.0}</span>
                      <span className="text-[11px] text-gray-400">({product.reviews_count || 14} avis)</span>
                    </div>
                  </div>

                  {/* Price & Add to cart */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                    <div>
                      <span className="font-extrabold text-gray-950 text-sm sm:text-base tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      {product.old_price && (
                        <span className="text-[10px] text-gray-400 line-through block mt-0.5">
                          {formatPrice(product.old_price)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white scale-95 shadow-emerald-500/30'
                          : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white hover:scale-105 active:scale-95'
                      }`}
                      title="Ajouter au panier"
                    >
                      {isJustAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
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
