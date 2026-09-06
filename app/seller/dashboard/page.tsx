'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, Order } from '@/lib/supabase/types';
import {
  Package,
  MessageCircle,
  Eye,
  Plus,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Store,
  Calendar,
  Award,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, profile, shop } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : 's1000000-0000-0000-0000-000000000001');

    Promise.all([
      DBService.getProducts({ storeId, limit: 10 }),
      DBService.getSellerOrders(storeId),
    ]).then(([prods, ords]) => {
      setProducts(prods);
      setOrders(ords);
      setLoading(false);
    });
  }, [user, shop]);

  const shopName = shop?.name || `Boutique de ${profile?.full_name || 'Vendeuse'}`;
  const shopSlug = shop?.slug || 'ma-boutique';
  const boutiqueUrl = typeof window !== 'undefined' ? `${window.location.origin}/boutique/${shopSlug}` : `https://hijabmarket.ci/boutique/${shopSlug}`;

  const copyBoutiqueLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(boutiqueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calcul des jours restants d'essai gratuit
  const trialEnd = shop?.free_trial_end ? new Date(shop.free_trial_end) : new Date(Date.now() + 85 * 86400000);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Status Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 rounded-3xl p-6 md:p-8 text-white border border-emerald-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {shop?.is_founder && (
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-extrabold border border-amber-400/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                🎖️ Boutique Fondatrice
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Boutique Active & Vérifiée
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Tableau de Bord Vendeur
          </h1>

          <p className="text-gray-300 text-xs sm:text-sm">
            Boutique : <strong>{shopName}</strong> • {shop?.commune || 'Abidjan'}, {shop?.city || "Côte d'Ivoire"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <Link
            href="/seller/products/new"
            className="flex-1 md:flex-initial justify-center px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Ajouter un article
          </Link>

          <Link
            href={`/boutique/${shopSlug}`}
            target="_blank"
            className="flex-1 md:flex-initial justify-center px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
          >
            <Store className="w-4 h-4 text-emerald-400" /> Voir ma vitrine
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Boutique Fondatrice Special Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-2 border-amber-300/60 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-xs">
            🎖️
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              Programme Boutiques Fondatrices Actif
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                100% Gratuit
              </span>
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Il vous reste <strong>{daysRemaining} jours</strong> d'accès gratuit illimité. Aucun frais ni commission prélevés sur vos commandes WhatsApp.
            </p>
          </div>
        </div>

        <Link
          href="/devenir-vendeur#formules"
          className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-full transition shadow-xs whitespace-nowrap"
        >
          Voir les Formules 2026
        </Link>
      </div>

      {/* Share Shop URL Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lien public de votre boutique</span>
          <p className="text-xs text-gray-600">
            Partagez ce lien sur vos statuts WhatsApp, votre bio Instagram et vos publications TikTok pour drainer des clientes directement sur vos articles.
          </p>
          <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/80 inline-block truncate max-w-full">
            {boutiqueUrl}
          </div>
        </div>

        <button
          onClick={copyBoutiqueLink}
          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-2 flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Lien copié !' : 'Copier mon lien'}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Articles en ligne */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Catalogue</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 font-heading">
              {products.length} <span className="text-xs font-semibold text-gray-400">articles</span>
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Actifs en vitrine</p>
          </div>
        </div>

        {/* Vues de la boutique */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visites Vitrine</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 font-heading">
              {(shop?.views_count || 1280).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-gray-400">vues</span>
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-1">Clients potentiels</p>
          </div>
        </div>

        {/* Commandes WhatsApp */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commandes</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 font-heading">
              {orders.length > 0 ? orders.length : 'Direct WhatsApp'}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">0 F de commission</p>
          </div>
        </div>

        {/* Formule en cours */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formule</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-base sm:text-lg font-extrabold text-gray-900 font-heading">
              Pionnière 2026
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">Essai gratuit actif</p>
          </div>
        </div>
      </div>

      {/* Mes Articles Récents */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-heading">Articles Publiés Récemment</h2>
            <p className="text-xs text-gray-500">Gérez vos stocks, photos et descriptions</p>
          </div>
          <Link href="/seller/products" className="text-xs text-emerald-600 font-bold hover:underline">
            Voir tout le catalogue ({products.length}) →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-4xl">🛍️</p>
            <p className="text-xs text-gray-500">Vous n'avez pas encore ajouté d'articles.</p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow"
            >
              <Plus className="w-4 h-4" /> Publier mon premier article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {products.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 hover:border-emerald-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-xs overflow-hidden flex-shrink-0">
                    {p.images?.[0]?.image_url ? (
                      <img src={p.images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      '🧕'
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</span>
                    <p className="text-[11px] text-emerald-600 font-extrabold">
                      {p.price.toLocaleString('fr-FR')} FCFA
                    </p>
                    <span className="text-[10px] text-gray-400">Stock : {p.stock} unités</span>
                  </div>
                </div>

                <Link
                  href={`/products/${p.slug}`}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-emerald-600 transition"
                  title="Voir la fiche"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
