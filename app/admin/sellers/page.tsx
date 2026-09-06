'use client';

import { useState, useEffect } from 'react';
import { Store, CheckCircle2, XCircle, AlertCircle, Phone, MapPin, RefreshCw } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Shop } from '@/lib/supabase/types';

export default function AdminSellersPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Gestion des Boutiques & Vendeuses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Comptes réels des créatrices partenaires inscrites sur HIJAB MARKET CI.
          </p>
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
            Dès qu'une créatrice s'inscrira sur la marketplace via le formulaire d'ouverture de boutique, son compte et son dossier apparaîtront ici pour examen et activation.
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
                  <th className="py-4 px-6">Ventes</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Décision Admin</th>
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
                    <td className="py-4 px-6 font-bold text-white">
                      {shop.total_sales || 0} commandes
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
