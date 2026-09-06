'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/supabase/types';
import { Package, Heart, MapPin, ShieldAlert, ChevronRight, Lock, UserCheck } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      DBService.getCustomerOrders(user.id).then((ords) => {
        setOrders(ords);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  // État de chargement initial de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-20 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Chargement de votre espace personnel...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Non authentifié : écran de protection de l'espace client
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-16 flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading mb-2">Espace Personnel Sécurisé</h1>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Connectez-vous à votre compte pour suivre vos commandes en direct, gérer vos adresses de livraison et retrouver vos coups de cœur.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login?redirect=/dashboard"
                className="btn btn-primary w-full text-xs font-bold py-3 shadow-md"
              >
                Se connecter (Vendeuse / Admin)
              </Link>
              <Link
                href="/auth/register/vendor"
                className="btn btn-outline w-full text-xs font-bold py-2.5"
              >
                🏪 Créer une boutique vendeuse
              </Link>
              <Link href="/products" className="text-xs text-emerald-700 hover:text-emerald-800 mt-2 font-medium">
                🛒 Passer commande directement sans compte →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.full_name || (user.email && !user.email.endsWith('@client.hijabmarket.ci') ? user.email.split('@')[0] : 'Chère Cliente');

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="container py-10 flex-1">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-500/30 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-3xl overflow-hidden shadow-lg">
              🧕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-white">Bonjour, {displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Membre Vérifiée
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                {profile?.city || 'Abidjan'} • Bienvenue sur votre espace HIJAB MARKET CI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition"
            >
              Faire du shopping 🛍️
            </Link>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <Link href="/orders" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition group">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Mes Commandes</h3>
            <p className="text-xs text-gray-400 mt-1">{orders.length} enregistrée(s)</p>
          </Link>

          <Link href="/favorites" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition group">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Mes Favoris</h3>
            <p className="text-xs text-gray-400 mt-1">Vos coups de cœur</p>
          </Link>

          <Link href="/addresses" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition group">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Adresses</h3>
            <p className="text-xs text-gray-400 mt-1">Lieux de livraison CI</p>
          </Link>

          <Link href="/disputes" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition group">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Litiges & Support</h3>
            <p className="text-xs text-gray-400 mt-1">Assistance 7j/7</p>
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-heading">Commandes Récentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Suivez l'acheminement de vos colis en temps réel</p>
            </div>
            <Link href="/orders" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 py-6 text-center">Chargement de vos commandes...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-gray-500">Vous n'avez pas encore passé de commande.</p>
              <Link href="/products" className="inline-block text-xs font-bold text-emerald-600 hover:underline">
                Commencer mes achats sur la marketplace →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 transition bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-sm text-gray-900">{order.order_number}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status === 'delivered' ? '✅ Livrée' : '🚚 En cours de livraison'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.items?.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Commandée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-gray-900">
                        {order.total_amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-emerald-600 hover:border-emerald-500 transition shadow-sm"
                    >
                      Détails & Suivi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
