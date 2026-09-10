'use client';

import { useState, useEffect } from 'react';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@/lib/supabase/types';
import {
  Package,
  Store,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  KeyRound,
  Filter,
  ArrowUpDown,
  Phone,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SellerOrdersPage() {
  const { user, shop } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ready' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : undefined);
    DBService.getSellerOrders(storeId).then((ords) => {
      setOrders(ords);
      setLoading(false);
    });
  }, [user, shop]);

  // Met à jour le statut réel dans la BD
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await DBService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      console.error('Erreur mise à jour statut:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrage
  const filteredOrders = orders.filter((o) => {
    // Mode de réception (retrait vs livraison)
    const isPickup = o.delivery_mode === 'pickup' || !o.delivery_address?.address;
    if (filterMode === 'pickup' && !isPickup) return false;
    if (filterMode === 'delivery' && isPickup) return false;

    // Statut
    if (statusFilter === 'pending' && (o.status === 'ready_for_shipment' || o.status === 'delivered')) return false;
    if (statusFilter === 'ready' && o.status !== 'ready_for_shipment') return false;
    if (statusFilter === 'delivered' && o.status !== 'delivered' && o.status !== 'receipt_confirmed') return false;

    // Recherche par N° de commande, nom client ou code retrait
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.order_number?.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q) || o.delivery_address?.full_name?.toLowerCase().includes(q);
      const matchCode = o.pickup_code?.toLowerCase().includes(q);
      if (!matchNumber && !matchName && !matchCode) return false;
    }

    return true;
  });

  const pickupCount = orders.filter((o) => o.delivery_mode === 'pickup' || !o.delivery_address?.address).length;
  const deliveryCount = orders.length - pickupCount;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
            📦 Commandes Reçues
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gérez les retraits en boutique et les expéditions de vos clientes.
          </p>
        </div>

        {/* Métriques rapides */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-emerald-100 rounded-2xl px-3.5 py-2 shadow-xs text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Retraits Boutique</span>
            <span className="text-base font-extrabold text-emerald-700">{pickupCount}</span>
          </div>
          <div className="bg-white border border-blue-100 rounded-2xl px-3.5 py-2 shadow-xs text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold">Livraisons</span>
            <span className="text-base font-extrabold text-blue-700">{deliveryCount}</span>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par N° commande, cliente, ou code retrait (HM-XXXX)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Filtre Type (Retrait vs Livraison) */}
          <div className="flex rounded-xl bg-gray-100 p-1 gap-1 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterMode === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Tous ({orders.length})
            </button>
            <button
              onClick={() => setFilterMode('pickup')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                filterMode === 'pickup' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 hover:text-emerald-700'
              }`}
            >
              🏪 Retraits ({pickupCount})
            </button>
            <button
              onClick={() => setFilterMode('delivery')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                filterMode === 'delivery' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:text-blue-700'
              }`}
            >
              🛵 Livraisons ({deliveryCount})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">
          Chargement des commandes reçues...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
          <p className="text-4xl">📦</p>
          <h3 className="font-bold text-gray-900 text-base">Aucune commande trouvée</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Aucune commande ne correspond à votre recherche.'
              : "Dès qu'une cliente passera commande pour votre boutique, elle s'affichera immédiatement ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPickup = order.delivery_mode === 'pickup' || !order.delivery_address?.address;
            const pickupCode = order.pickup_code || `HM-${order.order_number?.replace(/\D/g, '').slice(-4) || '2026'}`;
            const isReady = order.status === 'ready_for_shipment';
            const isDelivered = order.status === 'delivered' || order.status === 'receipt_confirmed';

            // Lien WhatsApp direct avec la cliente
            const customerPhone = order.customer_phone || order.delivery_address?.phone;
            const customerName = order.customer_name || order.delivery_address?.full_name || 'Chère cliente';
            const waPhoneClean = customerPhone ? customerPhone.replace(/\D/g, '') : '';
            const waCustomerMsg = `Bonjour ${customerName}, ici la boutique ${shop?.name || 'Hijab Market'}. Votre commande #${order.order_number} ${isPickup ? `est prête pour retrait en boutique avec le code ${pickupCode}` : 'est prête pour expédition'}.`;
            const waCustomerHref = waPhoneClean ? `https://wa.me/225${waPhoneClean.slice(-10)}?text=${encodeURIComponent(waCustomerMsg)}` : null;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border shadow-sm p-4 sm:p-6 space-y-4 transition ${
                  isPickup ? 'border-emerald-100' : 'border-gray-100'
                }`}
              >
                {/* En-tête de carte */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                      #{order.order_number}
                    </span>

                    {/* Badge Mode (Retrait vs Livraison) */}
                    {isPickup ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        <Store className="w-3 h-3 text-emerald-600" />
                        Retrait en Boutique
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        <Truck className="w-3 h-3 text-blue-600" />
                        Livraison
                      </span>
                    )}

                    <span className="text-[11px] text-gray-400">
                      • {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Badge Statut Actuel */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        isDelivered
                          ? 'bg-emerald-600 text-white'
                          : isReady
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isDelivered
                        ? '✅ Remis au client'
                        : isReady
                        ? isPickup ? '🟢 Prêt pour Retrait' : '📦 Prêt pour Livreur'
                        : '⏳ En Préparation'}
                    </span>
                  </div>
                </div>

                {/* Code de Retrait mis en valeur (si mode retrait) */}
                {isPickup && (
                  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-teal-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">
                          Code Secret de Retrait Client
                        </span>
                        <span className="font-mono text-lg font-black text-emerald-950 tracking-wider">
                          {pickupCode}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium sm:text-right">
                      Demandez ce code à la cliente lors de sa venue en boutique avant de lui remettre le colis.
                    </div>
                  </div>
                )}

                {/* Liste des articles */}
                <div className="space-y-2 bg-gray-50/60 rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Articles commandés</span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0">
                      <div className="pr-2">
                        <span className="font-bold text-gray-800">{item.quantity}x {item.product_name}</span>
                        {item.selected_color && (
                          <span className="text-gray-400 ml-1.5 text-[11px]">({item.selected_color})</span>
                        )}
                      </div>
                      <span className="font-extrabold text-gray-900 whitespace-nowrap">
                        {item.subtotal
                          ? item.subtotal.toLocaleString('fr-FR')
                          : (item.unit_price * item.quantity).toLocaleString('fr-FR')}{' '}
                        FCFA
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between items-center text-xs font-bold text-gray-900">
                    <span>Total Commande :</span>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      {order.total_amount?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Coordonnées Client & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {/* Info Client */}
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div>
                      Cliente : <strong className="text-gray-900">{customerName}</strong>
                      {customerPhone && (
                        <span className="font-mono text-gray-500 ml-1">({customerPhone})</span>
                      )}
                    </div>
                    {!isPickup && order.delivery_address && (
                      <div className="text-[11px] text-gray-500">
                        📍 Adresse : {order.delivery_address.commune}, {order.delivery_address.address}
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Contacter la cliente sur WhatsApp */}
                    {waCustomerHref && (
                      <a
                        href={waCustomerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        WhatsApp Cliente
                      </a>
                    )}

                    {/* Statut 1 : Marquer comme Prêt */}
                    {!isReady && !isDelivered && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready_for_shipment')}
                        disabled={updatingId === order.id}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isPickup ? 'Marquer Prêt pour Retrait' : 'Colis Prêt pour Livreur'}
                      </button>
                    )}

                    {/* Statut 2 : Valider Remise / Clôture */}
                    {isReady && !isDelivered && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        disabled={updatingId === order.id}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {isPickup ? 'Valider le Retrait en Boutique' : 'Marquer Livré'}
                      </button>
                    )}

                    {isDelivered && (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Commande Terminée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
