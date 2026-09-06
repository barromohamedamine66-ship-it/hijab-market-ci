'use client';

import { useState, useEffect } from 'react';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/supabase/types';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function SellerOrdersPage() {
  const { user, shop } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedReady, setMarkedReady] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : undefined);
    DBService.getSellerOrders(storeId).then((ords) => {
      setOrders(ords);
      setLoading(false);
    });
  }, [user, shop]);

  const toggleReady = (orderId: string) => {
    setMarkedReady((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Commandes Clients Reçues</h1>
        <p className="text-xs text-gray-500 mt-1">
          Traitez les commandes passées par les clientes pour votre boutique et préparez les colis pour le livreur.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">
          Chargement des commandes reçues...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3 shadow-sm">
          <p className="text-4xl">📦</p>
          <h3 className="font-bold text-gray-900 text-base">Aucune commande pour votre boutique actuellement</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Dès qu'une cliente achètera l'un de vos articles sur la marketplace, sa commande apparaîtra directement ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isReady = markedReady[order.id];

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">{order.order_number}</span>
                    <span className="text-[11px] text-gray-400 ml-2">
                      • {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                      isReady
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isReady ? '✅ Colis Prêt pour expédition' : '⏳ En attente de préparation'}
                  </span>
                </div>

                {/* Item list */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1">
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
                </div>

                {/* Footer with customer info & action */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-gray-500">
                    {order.delivery_address ? (
                      <span className="text-[11px] sm:text-xs">
                        Destinataire : <strong>{order.delivery_address.full_name}</strong> • {order.delivery_address.phone} ({order.delivery_address.commune})
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs">Commande client validée</span>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    <button
                      onClick={() => toggleReady(order.id)}
                      className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        isReady
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-200'
                      }`}
                    >
                      {isReady ? 'Prêt pour le livreur ✓' : 'Marquer comme prêt 📦'}
                    </button>
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
