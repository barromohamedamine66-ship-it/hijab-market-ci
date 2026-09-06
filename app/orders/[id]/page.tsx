'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import type { Order } from '@/lib/supabase/types';
import { ArrowLeft, CheckCircle2, Truck, ShieldAlert, Phone, Package } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DBService.getOrderById(params.id).then((res) => {
      setOrder(res);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-gray-400">
          Chargement de la commande...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-12 flex-1 max-w-md text-center space-y-4">
          <p className="text-4xl">📦</p>
          <h2 className="text-lg font-bold text-gray-800">Commande introuvable</h2>
          <p className="text-xs text-gray-500">Cette commande n'existe pas ou a été archivée.</p>
          <Link href="/orders" className="btn btn-primary btn-sm">
            Voir mes commandes
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';
  const deliveryCost = order.delivery_fee || 1500;
  const itemsSubtotal = order.subtotal || order.total_amount - deliveryCost;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="container py-10 flex-1 max-w-4xl">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à mes commandes
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Commande Officielle</span>
              <h1 className="text-2xl font-bold font-heading text-gray-900 mt-1">{order.order_number}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDelivered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {isDelivered ? '✅ Commande Livrée' : '🚚 En cours de traitement'}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="py-8 border-b border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Suivi d'acheminement</h3>
            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0">
                <div className={`h-full bg-emerald-500 transition-all ${isDelivered ? 'w-full' : 'w-1/2'}`} />
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2">Payée</span>
                <span className="text-[10px] text-gray-400">Enregistrée</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ✓
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2">Préparée</span>
                <span className="text-[10px] text-gray-400">Boutique</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                  isDelivered ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white animate-pulse'
                }`}>
                  🚚
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2">En livraison</span>
                <span className="text-[10px] text-gray-400">Abidjan</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDelivered ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'
                }`}>
                  ✓
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2">Réceptionnée</span>
                <span className="text-[10px] text-gray-400">Client</span>
              </div>
            </div>

            {/* Secret OTP Delivery Code Box */}
            {!isDelivered ? (
              <div className="mt-8 p-4 md:p-5 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    🔐
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Votre Code Secret de Livraison (OTP)</p>
                    <p className="text-xs text-amber-800 mt-0.5">Communiquez ce code au livreur <strong>UNIQUEMENT</strong> après vérification de votre colis en main propre.</p>
                  </div>
                </div>
                <div className="px-5 py-2.5 rounded-xl bg-white border border-amber-300 font-mono font-black text-2xl text-amber-600 tracking-widest shadow-sm">
                  {order.order_number ? order.order_number.replace(/\D/g, '').slice(-4) || '4829' : '4829'}
                </div>
              </div>
            ) : (
              <div className="mt-8 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <span>✅ <strong>Commande réceptionnée avec succès !</strong> (Code secret OTP validé à la remise du colis).</span>
              </div>
            )}
          </div>

          {/* Items & Pricing Breakdown */}
          <div className="py-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Articles commandés</h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{item.quantity}x {item.product_name}</span>
                    {item.selected_color && (
                      <p className="text-[11px] text-gray-400">Couleur : {item.selected_color}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-gray-900">
                    {item.subtotal ? item.subtotal.toLocaleString('fr-FR') : (item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-xs max-w-sm ml-auto">
              <div className="flex justify-between text-gray-500">
                <span>Sous-total articles :</span>
                <span className="font-bold text-gray-900">{itemsSubtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Frais de livraison :</span>
                <span className="font-bold text-gray-900">{deliveryCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total réglé :</span>
                <span className="text-emerald-600">{order.total_amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Assistance client HIJAB MARKET CI WhatsApp : <strong>+225 07 00 00 00 00</strong></span>
            </div>

            <div className="flex gap-3">
              <Link href="/disputes" className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition">
                Signaler un problème
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
