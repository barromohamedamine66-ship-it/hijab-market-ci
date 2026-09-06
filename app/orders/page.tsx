'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/supabase/types';
import { ArrowLeft, Truck, Package, Clock, CheckCircle2 } from 'lucide-react';

export default function OrdersListPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DBService.getCustomerOrders(user?.id).then((ordList) => {
      setOrders(ordList);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="container py-10 flex-1 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Mes Commandes</h1>
            <p className="text-xs text-gray-500 mt-1">Consultez l'historique et le statut de vos commandes en temps réel</p>
          </div>
          <Link href="/products" className="btn btn-primary btn-sm">
            Commander à nouveau 🛍️
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Chargement de vos commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              📦
            </div>
            <h3 className="font-bold text-gray-900 text-base">Aucune commande pour le moment</h3>
            <p className="text-xs text-gray-500">
              Lorsque vous passerez commande, vous pourrez suivre ici sa préparation et sa livraison en temps réel.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition"
            >
              Découvrir les hijabs ✨
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-emerald-200 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-sm">{order.order_number}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status === 'delivered' ? '✅ Colis Livré' : '🚚 En cours de traitement'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-emerald-600">
                      {order.total_amount.toLocaleString('fr-FR')} FCFA
                    </span>
                    <p className="text-[11px] text-gray-400">Paiement {order.payment_status === 'success' ? 'Confirmé' : 'En attente'}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-bold text-gray-900">{item.quantity}x</span>
                        <span>{item.product_name}</span>
                        {item.selected_color && (
                          <span className="text-gray-400">({item.selected_color})</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {item.subtotal ? item.subtotal.toLocaleString('fr-FR') : (item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    Livraison Abidjan (+{(order.delivery_fee || 1500).toLocaleString('fr-FR')} FCFA)
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-gray-700 border border-gray-200 transition"
                    >
                      Détails de la commande →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
