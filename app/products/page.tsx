'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, SlidersHorizontal, X, Star, Heart, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { useCart } from '@/contexts/CartContext';
import type { Product, Category } from '@/lib/supabase/types';

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA';
}

export default function ProductsPage() {
  const { addItem, isInCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([DBService.getProducts(), DBService.getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
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

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.store?.name && p.store.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.material && p.material.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategorySlug === 'all' || p.category?.slug === activeCategorySlug;
      const matchPrice = p.price <= maxPrice;
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Banner */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Mode Modeste & Traditionnelle en Côte d'Ivoire</h1>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} articles disponibles : hijabs, abayas, boubous femme & homme, ensembles et accessoires</p>
          </div>
        </div>

        <div className="container py-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="products-search"
                type="text"
                placeholder="Rechercher un article (boubou, abaya, hijab, qamis, soie, boutique)..."
                className="input pl-12 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                id="filters-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-outline gap-2 bg-white ${showFilters ? 'border-emerald-500 text-emerald-600' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>

              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input appearance-none pr-10 cursor-pointer bg-white"
              >
                <option value="popular">Nouveautés</option>
                <option value="rating">Meilleures notes</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Categories bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            <button
              onClick={() => setActiveCategorySlug('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeCategorySlug === 'all'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tous les articles
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

          {/* Filters drawer */}
          {showFilters && (
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Prix maximum</h4>
                <span className="text-sm font-extrabold text-emerald-600">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
              <p className="text-5xl mb-3">🔍</p>
              <h3 className="text-base font-bold text-gray-900">Aucun produit ne correspond à votre recherche</h3>
              <p className="text-xs text-gray-500 mt-1">Essayez d'ajuster les filtres ou de changer de mot-clé.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategorySlug('all'); setMaxPrice(50000); }}
                className="btn btn-primary btn-sm mt-4"
              >
                Réinitialiser les filtres
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
                          <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">Épuisé</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] text-emerald-600 font-bold block truncate">
                          {product.store?.name || 'Boutique Partenaire'}
                        </span>
                        <h3 className="font-bold text-gray-900 text-xs mt-0.5 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">{product.material || 'Tissu sélectionné'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div>
                          <span className="font-extrabold text-gray-900 text-sm">{formatPrice(product.price)}</span>
                          {product.old_price && (
                            <span className="text-[10px] text-gray-400 line-through ml-1.5">{formatPrice(product.old_price)}</span>
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
