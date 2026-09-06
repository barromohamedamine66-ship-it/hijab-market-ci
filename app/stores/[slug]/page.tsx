'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import { useCart } from '@/contexts/CartContext';
import type { Shop, Product, Category } from '@/lib/supabase/types';
import {
  Store,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Search,
  ShoppingCart,
  Check,
  ArrowLeft,
  SlidersHorizontal,
  Package,
  Sparkles
} from 'lucide-react';

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA';
}

export default function StoreDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      DBService.getShopBySlug(params.slug),
      DBService.getCategories()
    ]).then(async ([foundShop, cats]) => {
      setShop(foundShop);
      setCategories(cats);

      if (foundShop) {
        const storeProducts = await DBService.getProducts({ storeId: foundShop.id });
        setProducts(storeProducts);
      }
      setLoading(false);
    });
  }, [params.slug]);

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
      store_name: shop?.name || p.store?.name || 'Boutique Partenaire',
    });

    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-gray-400">
          Chargement de la boutique...
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-12 flex-1 max-w-md text-center space-y-4">
          <p className="text-5xl">🏪</p>
          <h2 className="text-xl font-bold font-heading text-gray-900">Boutique introuvable</h2>
          <p className="text-xs text-gray-500">
            Cette boutique n'existe pas ou son adresse a été modifiée.
          </p>
          <Link href="/stores" className="btn btn-primary btn-sm">
            Voir toutes les boutiques
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.material && p.material.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategorySlug === 'all' || p.category?.slug === activeCategorySlug;
    return matchSearch && matchCat;
  });

  const whatsappUrl = shop.whatsapp
    ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour ${shop.name}, je vous contacte depuis la marketplace HIJAB MARKET CI.`
      )}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Store Banner & Profile Header */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 text-white border-b border-emerald-500/20 pt-8 pb-10">
          <div className="container max-w-6xl">
            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 font-semibold mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Toutes les boutiques
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                {/* Store Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden flex items-center justify-center flex-shrink-0 text-3xl">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    '🏪'
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">{shop.name}</h1>
                    {shop.is_founder && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/40 font-extrabold shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 🎖️ Boutique Fondatrice
                      </span>
                    )}
                    {shop.verified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Boutique Vérifiée
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {shop.commune || 'Abidjan'}, {shop.city}
                      {shop.address && ` • ${shop.address}`}
                    </span>

                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {shop.rating || 4.9} ({shop.total_reviews || 120} avis)
                    </span>

                    <span className="text-gray-400">
                      • {shop.views_count || 1200} vues
                    </span>
                  </div>

                  {shop.opening_hours && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 mt-2">
                      <span>🕒 Horaires : {shop.opening_hours}</span>
                    </div>
                  )}

                  {shop.description && (
                    <p className="text-xs text-gray-300 mt-2.5 max-w-2xl leading-relaxed">
                      {shop.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Boutique
                  </a>
                )}

                {shop.phone && (
                  <a
                    href={`tel:${shop.phone.replace(/\s+/g, '')}`}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
                  >
                    <Phone className="w-4 h-4" /> Appeler
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Catalog Content */}
        <div className="container max-w-6xl py-8">
          {/* Search & Categories Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Rechercher dans les articles de ${shop.name}...`}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:border-emerald-500 outline-none text-xs transition shadow-sm"
              />
            </div>
          </div>

          {/* Categories pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => setActiveCategorySlug('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategorySlug === 'all'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous les articles ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategorySlug === cat.slug
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
              <p className="text-4xl">🧕</p>
              <h3 className="font-bold text-gray-900 text-base">Aucun article ne correspond à votre recherche</h3>
              <p className="text-xs text-gray-500">
                Essayez d'autres mots-clés ou consultez l'ensemble du catalogue de la boutique.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategorySlug('all');
                }}
                className="btn btn-primary btn-sm"
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => {
                const coverImage = product.images?.[0]?.image_url;
                const isJustAdded = addedId === product.id;

                return (
                  <Link
                    href={`/products/${product.slug}`}
                    key={product.id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition group flex flex-col overflow-hidden"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-5xl group-hover:scale-110 transition duration-300">🧕</span>
                      )}

                      {product.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                          {product.badge}
                        </span>
                      )}

                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">
                            Épuisé
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold block truncate">
                          {shop.name}
                        </span>
                        <h3 className="font-bold text-gray-900 text-xs mt-0.5 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">{product.material || 'Tissu de qualité'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div>
                          <span className="font-extrabold text-gray-900 text-sm">{formatPrice(product.price)}</span>
                          {product.old_price && (
                            <span className="text-[10px] text-gray-400 line-through ml-1.5">
                              {formatPrice(product.old_price)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock <= 0}
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition shadow-sm ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title="Ajouter au panier"
                        >
                          {isJustAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
