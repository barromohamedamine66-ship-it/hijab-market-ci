'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/lib/supabase/types';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function SellerProductsPage() {
  const { user, shop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const storeId = shop?.id || (user ? `shop-${user.id}` : undefined);
    const list = await DBService.getProducts({ storeId });
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [shop, user]);

  const handleDelete = async (productId: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de "${name}" ?`)) {
      await DBService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Mes Produits</h1>
          <p className="text-xs text-gray-500 mt-1">Gérez vos articles, prix, stocks et disponibilités sur HIJAB MARKET CI.</p>
        </div>

        <Link
          href="/seller/products/new"
          className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nouveau Produit
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Chargement de vos articles...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-4xl">🧕</p>
            <h3 className="font-bold text-gray-800 text-base">Aucun article enregistré pour le moment</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Commencez dès maintenant en publiant votre premier hijab, abaya ou accessoire.
            </p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md hover:bg-emerald-600 transition"
            >
              <Plus className="w-4 h-4" /> Publier mon premier article
            </Link>
          </div>
        ) : (
          <div>
            {/* VUE MOBILE PORTRAIT: Fiches produits verticales adaptées aux smartphones */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {products.map((product) => {
                const coverImage = product.images?.[0]?.image_url;
                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                        {coverImage ? (
                          <img src={coverImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          '🧕'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 text-xs block line-clamp-2 leading-snug">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                            {product.category?.name || 'Général'}
                          </span>
                          <span className={`text-[11px] font-bold ${product.stock > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {product.stock} en stock
                          </span>
                        </div>
                        <p className="font-extrabold text-gray-950 text-sm mt-1">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Actif en vente
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 font-bold text-[11px] transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Voir
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VUE TABLETTE & DESKTOP: Tableau complet à 6 colonnes */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Produit</th>
                    <th className="py-4 px-6">Catégorie</th>
                    <th className="py-4 px-6">Prix Vente</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6">Statut</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {products.map((product) => {
                    const coverImage = product.images?.[0]?.image_url;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center text-xl flex-shrink-0">
                              {coverImage ? (
                                <img src={coverImage} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                '🧕'
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{product.name}</span>
                              <span className="text-[11px] text-gray-400">{product.material || 'Non spécifié'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                            {product.category?.name || 'Général'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-gray-900">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-bold ${product.stock > 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {product.stock} en stock
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Actif & En Vente
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 text-gray-500 transition"
                              title="Voir sur la marketplace"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 rounded-lg bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-400 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
