'use client';

import { useState, useEffect } from 'react';
import { Award, Sparkles, Check, Edit2, RefreshCw, Calendar, Store, ShieldCheck } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { SubscriptionPlan, Shop } from '@/lib/supabase/types';

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Plan state
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [features, setFeatures] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, shopsData] = await Promise.all([
        DBService.getSubscriptionPlans(),
        DBService.getAllAdminShops(),
      ]);
      setPlans(plansData);
      setShops(shopsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const featureList = features.split('\n').map(f => f.trim()).filter(Boolean);
    await DBService.updateSubscriptionPlan(editingPlan.id, {
      price_monthly: monthlyPrice,
      features: featureList,
    });

    setEditingPlan(null);
    loadData();
  };

  const handleToggleFounder = async (shop: Shop) => {
    const newStatus = !shop.is_founder;
    await DBService.toggleShopFounderStatus(shop.id, newStatus, 90);
    setShops(shops.map(s => s.id === shop.id ? { ...s, is_founder: newStatus } : s));
  };

  const handleExtendTrial = async (shopId: string, daysToAdd: number) => {
    const shop = shops.find(s => s.id === shopId);
    const currentEnd = shop?.free_trial_end ? new Date(shop.free_trial_end) : new Date();
    const newEnd = new Date(currentEnd.getTime() + daysToAdd * 86400000);

    await DBService.updateShopTrialEnd(shopId, newEnd.toISOString());
    setShops(shops.map(s => s.id === shopId ? { ...s, free_trial_end: newEnd.toISOString() } : s));
  };

  const founderCount = shops.filter(s => s.is_founder).length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            Monétisation & Boutiques Fondatrices
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Formules d'Abonnement & Pionnières</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les tarifs mensuels et le programme des 30 boutiques fondatrices de Côte d'Ivoire.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
          title="Actualiser"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Boutiques Fondatrices Stats Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-2 border-amber-300/40 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Programme Officiel Pionniers</span>
          <h3 className="text-xl font-bold font-heading text-white">
            {founderCount} / 30 Boutiques Fondatrices Inscrites
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Les boutiques fondatrices bénéficient de 90 jours d'accès complet offert, d'un badge exclusif à vie et d'une visibilité prioritaire sur le portail.
          </p>
        </div>

        <div className="w-full md:w-auto p-4 rounded-2xl bg-[#0a1014] border border-amber-400/30 text-center flex-shrink-0">
          <span className="text-xs font-bold text-slate-400 block">Places Disponibles</span>
          <span className="text-3xl font-extrabold text-amber-400 my-1 block">
            {Math.max(0, 30 - founderCount)}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">Sur 30 places initiales</span>
        </div>
      </div>

      {/* Grille des 3 Formules d'Abonnement */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
          <span>🏷️</span> Grille Tarifaire des Formules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl bg-[#0f171d] border flex flex-col justify-between space-y-6 ${
                plan.is_popular ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge_name}
                  </span>
                  {plan.is_popular && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ★ Recommandé
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white font-heading">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">
                    {plan.price_monthly.toLocaleString('fr-FR')} F
                  </span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>
                <p className="text-xs text-slate-400">{plan.description}</p>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setEditingPlan(plan);
                  setMonthlyPrice(plan.price_monthly);
                  setFeatures(plan.features?.join('\n') || '');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Modifier les Tarifs & Avantages
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Edition Plan */}
      {editingPlan && (
        <div className="bg-[#0f171d] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">
              Modifier la Formule : {editingPlan.name}
            </h3>
            <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prix mensuel (FCFA) *</label>
              <input
                type="number"
                min={0}
                step={500}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full sm:w-64 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Avantages inclus (une ligne par avantage) *
              </label>
              <textarea
                rows={5}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Sauvegarder la formule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attribution du Statut Fondateur aux Boutiques */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
          <span>🏪</span> Statut Fondateur & Période d'Essai par Boutique
        </h2>

        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Boutique</th>
                  <th className="py-4 px-6">WhatsApp</th>
                  <th className="py-4 px-6">Statut Fondatrice</th>
                  <th className="py-4 px-6">Fin Essai Gratuit</th>
                  <th className="py-4 px-6 text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{shop.name}</span>
                      <span className="text-[11px] text-slate-400">/{shop.slug}</span>
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-semibold">
                      {shop.whatsapp || shop.phone || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleFounder(shop)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1.5 ${
                          shop.is_founder
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                        title="Cliquer pour basculer le statut"
                      >
                        <Sparkles className="w-3 h-3" />
                        {shop.is_founder ? '🎖️ Fondatrice' : 'Standard'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {shop.free_trial_end ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(shop.free_trial_end).toLocaleDateString('fr-FR')}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleExtendTrial(shop.id, 30)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold"
                        title="Ajouter 30 jours"
                      >
                        +30 jours
                      </button>
                      <button
                        onClick={() => handleExtendTrial(shop.id, 90)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold"
                        title="Ajouter 90 jours"
                      >
                        +90 jours
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
