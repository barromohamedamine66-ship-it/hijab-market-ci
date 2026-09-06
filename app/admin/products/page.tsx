'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Trash2, CheckCircle2, EyeOff, RefreshCw, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Product } from '@/lib/supabase/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'archived'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await DBService.getProducts({ adminAll: true });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'approved' ? 'archived' : 'approved';
    setActionLoading(product.id);
    try {
      await DBService.updateProductStatus(product.id, newStatus);
      setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      setMessage(`Article "${product.name}" ${newStatus === 'approved' ? 'activé et visible' : 'désactivé et masqué'} avec succès.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${productName}" ?`)) {
      return;
    }

    setActionLoading(productId);
    try {
      await DBService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setMessage(`Article "${productName}" supprimé définitivement.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurgeDemo = async () => {
    if (!confirm("Voulez-vous supprimer tous les articles de démonstration (Soie de Médine, Abaya Dubaï, etc.) ? Seuls les articles créés par vos vraies boutiques resteront.")) {
      return;
    }
    setLoading(true);
    try {
      const count = await DBService.purgeDemoProducts();
      setMessage(`${count} articles de démonstration supprimés. Votre catalogue est maintenant nettoyé.`);
      await loadProducts();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.store?.name && p.store.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.material && p.material.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && p.status === 'approved') ||
      (statusFilter === 'archived' && (p.status === 'archived' || p.status === 'rejected'));

    return matchesSearch && matchesStatus;
  });

  const demoCount = products.filter(p => p.id.startsWith('p1000000')).length;

  return (
    <div className="space-y-6 max-w-6xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            Modération des Produits ({products.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez la visibilité des articles de toutes les boutiques en ligne.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {demoCount > 0 && (
            <button
              onClick={handlePurgeDemo}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
              title="Supprimer les articles d'exemple"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer les articles fictifs ({demoCount})
            </button>
          )}

          <button
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Message de succès */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Barre de recherche & Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit, boutique, matière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f171d] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-[#0f171d] border border-slate-800 text-white text-xs outline-none focus:border-emerald-500"
        >
          <option value="all">Tous les statuts ({products.length})</option>
          <option value="approved">En Ligne / Actifs</option>
          <option value="archived">Désactivés / Masqués</option>
        </select>
      </div>

      {/* Tableau des produits */}
      <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Chargement des articles...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Produit</th>
                  <th className="py-4 px-6">Boutique</th>
                  <th className="py-4 px-6">Prix</th>
                  <th className="py-4 px-6">Rayon</th>
                  <th className="py-4 px-6">Visibilité</th>
                  <th className="py-4 px-6 text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredProducts.map((p) => {
                  const isDemo = p.id.startsWith('p1000000');
                  const isLive = p.status === 'approved';
                  const isProcessing = actionLoading === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white block">{p.name}</span>
                          {isDemo && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold uppercase">
                              Démo
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{p.material || 'Matière standard'}</span>
                      </td>

                      <td className="py-4 px-6 text-emerald-400 font-semibold">
                        {p.store?.name || 'Boutique Partenaire'}
                      </td>

                      <td className="py-4 px-6 font-extrabold text-white">
                        {p.price.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        {p.category?.name || 'Mode Modeste'}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {isLive ? 'Visible en ligne' : 'Masqué / Désactivé'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            disabled={isProcessing}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isLive
                                ? 'bg-slate-800 hover:bg-amber-900/60 text-slate-300 hover:text-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            }`}
                          >
                            {isLive ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Désactiver</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Activer</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
