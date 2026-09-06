'use client';

import { useState, useEffect } from 'react';
import { Store, CheckCircle2, XCircle, AlertCircle, Phone, MapPin, RefreshCw, Sparkles, Award, Star } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Shop } from '@/lib/supabase/types';

export default function AdminSellersPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await DBService.getAllAdminShops();
      setShops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const toggleStatus = async (id: string, newStatus: 'active' | 'suspended' | 'pending') => {
    await DBService.updateShopStatus(id, newStatus);
    setShops(shops.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleToggleFounder = async (shop: Shop) => {
    const newFounderStatus = !shop.is_founder;
    try {
      await DBService.toggleShopFounderStatus(shop.id, newFounderStatus, 90);
      setShops(shops.map(s => s.id === shop.id ? { 
        ...s, 
        is_founder: newFounderStatus,
        subscription_status: newFounderStatus ? 'trial' : s.subscription_status,
      } : s));
      
      setFeedback(
        newFounderStatus 
          ? `Boutique "${shop.name}" définie comme BOUTIQUE FONDATRICE (90 jours d'accès offert activés).`
          : `Statut Boutique Fondatrice retiré pour "${shop.name}".`
      );
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const founderCount = shops.filter(s => s.is_founder).length;

  return (
    <div className="space-y-6 max-w-6xl select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
            <Store className="w-3.5 h-3.5" />
            Gestion des Partenaires Vendeuses
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Boutiques & Vendeuses ({shops.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Activez les boutiques, gérez les créatrices et attribuez le statut officiel de Boutique Fondatrice.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fondatrices : {founderCount} / 30</span>
          </div>

          <button
            onClick={loadShops}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Message feedback */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Guide explication pour l'admin */}
      <div className="p-4 rounded-2xl bg-[#0f171d] border border-amber-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Award className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <p className="font-bold text-white mb-0.5">Comment désigner une Boutique Fondatrice ?</p>
          <p className="text-slate-400">
            Cliquez sur le bouton doré <strong className="text-amber-300">« ⭐ Définir Fondatrice »</strong> sur n'importe quelle boutique ci-dessous. Elle recevra automatiquement le badge officiel sur sa vitrine et bénéficiera des 90 jours d'essai offerts sans frais.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Chargement des boutiques inscrites...
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            🏪
          </div>
          <h3 className="font-bold text-white text-base font-heading">
            Aucune boutique vendeuse pour le moment
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Dès qu'une créatrice s'inscrira sur la marketplace via le formulaire d'ouverture de boutique, son compte et son dossier apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Boutique</th>
                  <th className="py-4 px-6">Emplacement</th>
                  <th className="py-4 px-6">Contact WhatsApp</th>
                  <th className="py-4 px-6">Statut Boutique</th>
                  <th className="py-4 px-6">Statut Fondatrice</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{shop.name}</span>
                      <span className="text-[11px] text-slate-400">ID: {shop.id.slice(0, 8)}...</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      📍 {shop.commune || 'Abidjan'}, {shop.city || 'Abidjan'}
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-semibold">
                      {shop.whatsapp || shop.phone || 'Non renseigné'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        shop.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : shop.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {shop.status === 'active' ? 'Active' : shop.status === 'pending' ? 'En attente' : 'Suspendue'}
                      </span>
                    </td>

                    {/* Statut & Toggle Boutique Fondatrice */}
                    <td className="py-4 px-6">
                      {shop.is_founder ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Fondatrice (90j)
                          </span>
                          <button
                            onClick={() => handleToggleFounder(shop)}
                            className="text-[10px] text-slate-400 hover:text-rose-400 underline transition"
                            title="Retirer le statut fondatrice"
                          >
                            Retirer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleFounder(shop)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>Définir Fondatrice</span>
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {shop.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(shop.id, 'active')}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
                            title="Approuver la boutique"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(shop.id, 'suspended')}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : shop.status === 'active' ? (
                        <button
                          onClick={() => toggleStatus(shop.id, 'suspended')}
                          className="text-[11px] font-semibold text-rose-400 hover:underline"
                        >
                          Suspendre
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(shop.id, 'active')}
                          className="text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
