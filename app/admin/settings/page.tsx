'use client';

import { useState } from 'react';
import { Settings, Save, Percent, Truck, Phone, Layers, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState('7');
  const [zone1Fee, setZone1Fee] = useState('1500');
  const [zone2Fee, setZone2Fee] = useState('2000');
  const [zone3Fee, setZone3Fee] = useState('2500');
  const [zone4Fee, setZone4Fee] = useState('3000');
  const [whatsappSupport, setWhatsappSupport] = useState('+225 01 52 18 28 40');
  const [minWithdrawal, setMinWithdrawal] = useState('5000');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Paramètres de la Marketplace</h1>
        <p className="text-xs text-slate-400 mt-1">Configurez les taux de commission, tarifs de livraison par zone et coordonnées officielles.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30 font-medium">
          ✅ Les paramètres de la plateforme ont été enregistrés avec succès !
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 md:p-8 space-y-8">
        {/* Section 1: Commission & Retraits */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4" /> 1. Modèle Financier Marketplace
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Taux de Commission Plateforme (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-sm font-bold"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Prélevé automatiquement sur le sous-total de chaque vente (actuel : 7%)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Seuil Minimum de Retrait Vendeur (FCFA)
              </label>
              <input
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-sm"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Montant minimum requis pour demander un virement Wave / OM</p>
            </div>
          </div>
        </div>

        {/* Section 2: Tarifs Logistiques des 4 Zones */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" /> 2. Tarifs de Livraison par Zone Logistique (Côte d'Ivoire)
            </h2>
            <span className="text-[11px] text-slate-400">100% reversé aux transporteurs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#141f27] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Zone 1 : Abidjan Centre (FCFA)
              </label>
              <input
                type="number"
                value={zone1Fee}
                onChange={(e) => setZone1Fee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0f171d] text-white focus:border-emerald-500 outline-none text-sm font-bold"
                required
              />
              <p className="text-[10px] text-slate-400">Cocody, Plateau, Marcory, Treichville, Adjamé, Koumassi (Moto 2h-4h)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f27] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Zone 2 : Abidjan Périphérie (FCFA)
              </label>
              <input
                type="number"
                value={zone2Fee}
                onChange={(e) => setZone2Fee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0f171d] text-white focus:border-emerald-500 outline-none text-sm font-bold"
                required
              />
              <p className="text-[10px] text-slate-400">Yopougon, Abobo, Port-Bouët, Attécoubé (Moto dans la journée)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f27] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Zone 3 : Grand Abidjan & Banlieue (FCFA)
              </label>
              <input
                type="number"
                value={zone3Fee}
                onChange={(e) => setZone3Fee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0f171d] text-white focus:border-emerald-500 outline-none text-sm font-bold"
                required
              />
              <p className="text-[10px] text-slate-400">Bingerville, Anyama, Songon, Grand-Bassam (Moto 24h-48h)</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f27] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Zone 4 : Intérieur du Pays (FCFA)
              </label>
              <input
                type="number"
                value={zone4Fee}
                onChange={(e) => setZone4Fee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0f171d] text-white focus:border-emerald-500 outline-none text-sm font-bold"
                required
              />
              <p className="text-[10px] text-slate-400">Bouaké, Yamoussoukro, Korhogo, San-Pédro... (Expédition Car 48h-72h)</p>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Officiel */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4" /> 3. Coordonnées Officielles de Contact
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Numéro WhatsApp & Wave Business Officiel
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={whatsappSupport}
                onChange={(e) => setWhatsappSupport(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-sm"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Numéro lié aux confirmations de commande Wave et support client</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Enregistrer les Paramètres
          </button>
        </div>
      </form>
    </div>
  );
}
