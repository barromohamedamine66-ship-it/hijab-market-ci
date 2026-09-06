'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { SellerWallet, Order } from '@/lib/supabase/types';
import { DollarSign, TrendingUp, ArrowDownCircle, CheckCircle, PackageOpen } from 'lucide-react';

export default function SellerEarningsPage() {
  const { user, shop } = useAuth();

  const [wallet, setWallet] = useState<SellerWallet>({
    id: 'wallet',
    shop_id: '',
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
    updated_at: new Date().toISOString(),
  });
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : null);

    if (!storeId) {
      setLoading(false);
      return;
    }

    Promise.all([
      DBService.getSellerWallet(storeId),
      DBService.getSellerOrders(storeId),
    ]).then(([w, ords]) => {
      setWallet(w || {
        id: `wallet-${storeId}`,
        shop_id: storeId,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        updated_at: new Date().toISOString(),
      });
      setSellerOrders(ords || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [user, shop]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">Revenus & Portefeuille Vendeuse</h1>
          <p className="text-xs text-gray-500 mt-1">Suivez vos gains nets réels après commission marketplace (7%).</p>
        </div>

        <Link
          href="/seller/withdrawals"
          className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 text-center"
        >
          <ArrowDownCircle className="w-4 h-4" /> Demander un retrait Wave
        </Link>
      </div>

      {/* Wallet Cards - 100% Réel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 sm:p-6 rounded-3xl shadow-lg">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-100 uppercase tracking-wider block mb-1 sm:mb-2">Solde Disponible Réel</span>
          <p className="text-2xl sm:text-3xl font-extrabold font-heading">{(wallet.available_balance || 0).toLocaleString('fr-FR')} FCFA</p>
          <p className="text-[11px] sm:text-xs text-emerald-100 mt-1 sm:mt-2">Prêt pour virement Wave CI</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1 sm:mb-2">En Attente (Commandes en cours)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">{(wallet.pending_balance || 0).toLocaleString('fr-FR')} FCFA</p>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 sm:mt-2">Débloqué dès confirmation de livraison par la cliente</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1 sm:mb-2">Total Déjà Retiré</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">{(wallet.total_withdrawn || 0).toLocaleString('fr-FR')} FCFA</p>
          <p className="text-[11px] sm:text-xs text-emerald-600 font-semibold mt-1 sm:mt-2">✔ Virements confirmés sur votre mobile</p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 font-heading mb-4 sm:mb-6">Historique des Opérations Récentes</h2>

        {loading ? (
          <div className="py-10 text-center text-xs text-gray-400">Chargement de votre solde réel...</div>
        ) : sellerOrders.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              <PackageOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">Aucune vente enregistrée pour le moment</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Dès qu'une cliente achètera un de vos hijabs ou abayas, le détail de la vente et vos 93% nets apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {sellerOrders.map((order) => {
              const subtotal = order.subtotal || order.total_amount;
              const commission = Math.round(subtotal * 0.07);
              const net = subtotal - commission;

              return (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                  <div>
                    <p className="font-bold text-gray-900">Vente Commande {order.order_number}</p>
                    <p className="text-gray-400 text-[11px]">
                      Commission plateforme (7%) : -{commission.toLocaleString('fr-FR')} FCFA • {order.customer_name || 'Cliente'}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-600 sm:text-right">+{net.toLocaleString('fr-FR')} FCFA</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
