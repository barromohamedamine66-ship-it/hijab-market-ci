'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/supabase/types';
import { DollarSign, ShieldCheck, CheckCircle2, MessageCircle, PackageOpen, ArrowRight, ShoppingCart } from 'lucide-react';

export default function SellerEarningsPage() {
  const { user, shop } = useAuth();
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : null);
    if (!storeId) {
      setLoading(false);
      return;
    }

    DBService.getSellerOrders(storeId).then((ords) => {
      setSellerOrders(ords || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [user, shop]);

  const totalSalesAmount = sellerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            0% Commission & Aucun Séquestre
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
            Ventes & Encaissements Directs
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vos clientes vous payent directement via Wave, Orange Money ou à la livraison.
          </p>
        </div>

        <Link
          href="/seller/orders"
          className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 text-center"
        >
          <ShoppingCart className="w-4 h-4" /> Voir toutes les commandes
        </Link>
      </div>

      {/* Bannière modèle direct */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-950 text-white border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Paiement 100% Direct à votre Boutique
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
          Aucun intermédiaire sur vos encaissements
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
          Sur HIJAB MARKET CI, la plateforme ne retient pas votre argent en séquestre. Chaque cliente finalise sa commande et règle directement le montant total sur votre propre compte marchand Wave, Orange Money ou en espèces à la livraison.
        </p>
      </div>

      {/* Statistiques des ventes directes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Volume des Commandes</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
            {totalSalesAmount.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">100% encaissé par vous</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Taux de Commission</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading">
            0%
          </p>
          <p className="text-[11px] text-gray-500">Aucun prélèvement par vente</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Commandes Reçues</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
            {sellerOrders.length}
          </p>
          <p className="text-[11px] text-gray-500">Clients et WhatsApp directs</p>
        </div>
      </div>

      {/* Commandes Récentes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 font-heading">
          Historique Récent des Commandes
        </h2>

        {loading ? (
          <div className="py-10 text-center text-xs text-gray-400">Chargement de vos commandes...</div>
        ) : sellerOrders.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <PackageOpen className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500 font-semibold">Aucune commande enregistrée pour l'instant.</p>
            <p className="text-[11px] text-gray-400">Les commandes passées sur votre vitrine apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sellerOrders.slice(0, 10).map((o) => (
              <div key={o.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                  <p className="font-bold text-gray-900">Commande {o.order_number}</p>
                  <p className="text-[11px] text-gray-500">
                    Cliente : {o.customer_name} • {o.customer_phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600">
                    {o.total_amount.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="block text-[10px] text-gray-400 uppercase font-bold">
                    Paiement direct à la boutique
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
