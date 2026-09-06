'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Phone, MessageCircle, CreditCard, ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { WAVE_CI_CONFIG } from '@/lib/payment/wave';

export default function AdminSettingsPage() {
  const [whatsappSupport, setWhatsappSupport] = useState('+225 01 52 18 28 40');
  const [wavePhone, setWavePhone] = useState(WAVE_CI_CONFIG.merchantPhone || '07 77 39 38 13');
  const [waveBusinessName, setWaveBusinessName] = useState(WAVE_CI_CONFIG.businessName || 'HIJABMARKET.CI');
  const [waveLink, setWaveLink] = useState(WAVE_CI_CONFIG.wavePaymentLink);
  const [supportEmail, setSupportEmail] = useState('support@hijabmarket.ci');
  const [founderTrialDays, setFounderTrialDays] = useState('90');
  const [founderMaxSeats, setFounderMaxSeats] = useState('30');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Charger d'éventuels réglages sauvegardés localement
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('hm_platform_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.whatsappSupport) setWhatsappSupport(parsed.whatsappSupport);
          if (parsed.wavePhone) setWavePhone(parsed.wavePhone);
          if (parsed.waveBusinessName) setWaveBusinessName(parsed.waveBusinessName);
          if (parsed.waveLink) setWaveLink(parsed.waveLink);
          if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
          if (parsed.founderTrialDays) setFounderTrialDays(parsed.founderTrialDays);
        } catch (e) {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('hm_platform_settings', JSON.stringify({
        whatsappSupport,
        wavePhone,
        waveBusinessName,
        waveLink,
        supportEmail,
        founderTrialDays,
        founderMaxSeats,
      }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6 select-none">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
          <Settings className="w-3.5 h-3.5" />
          Paramètres Généraux
        </div>
        <h1 className="text-2xl font-bold font-heading text-white">Paramètres de la Plateforme</h1>
        <p className="text-xs text-slate-400 mt-1">
          Coordonnées officielles, politique commerciale 0% commission et gestion des abonnements Wave.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>✅ Les coordonnées et paramètres de la plateforme ont été enregistrés avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Politique Commerciale (0% Commission, Pas de séquestre) */}
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 1. Modèle Commercial : Ventes Directes & 0% Commission
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              Actif
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#141f27] border border-slate-700/60 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>✅ Aucun séquestre bancaire & Aucune commission prélevée sur les articles</span>
            </p>
            <p className="text-slate-400 text-[11px]">
              Sur HIJAB MARKET CI, les clientes commandent et payent directement chaque boutique sur WhatsApp (Wave, Orange Money ou à la livraison). La plateforme n'encaisse pas l'argent des clientes pour le reverser aux vendeuses.
            </p>
            <p className="text-emerald-400 text-[11px] font-semibold">
              • Modèle de revenus de la plateforme : Abonnements mensuels des boutiques partenaires uniquement.
            </p>
          </div>
        </div>

        {/* Section 2: Compte Wave & Coordonnées Officielles pour les Abonnements */}
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 2. Compte Wave Officiel (Paiement des Abonnements)
            </h2>
            <span className="text-[11px] text-sky-300 font-semibold">Paiements Vendeuses</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Ces coordonnées sont affichées aux vendeuses lorsqu'elles souscrivent ou renouvellent leur formule (Business 15.000 FCFA ou Premium VIP 30.000 FCFA).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Numéro Wave Officiel Récepteur
              </label>
              <input
                type="text"
                value={wavePhone}
                onChange={(e) => setWavePhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-bold font-mono"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Exemple : 07 77 39 38 13</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nom du Compte Marchand Wave
              </label>
              <input
                type="text"
                value={waveBusinessName}
                onChange={(e) => setWaveBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-bold"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Nom affiché sur l'application Wave de la vendeuse</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Lien de Paiement Wave Business Direct
              </label>
              <input
                type="url"
                value={waveLink}
                onChange={(e) => setWaveLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-mono"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Lien Wave officiel généré par votre espace Wave Business</p>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Support & Assistance */}
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4" /> 3. Coordonnées Support & Direction
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                WhatsApp Support Marketplace
              </label>
              <input
                type="text"
                value={whatsappSupport}
                onChange={(e) => setWhatsappSupport(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-bold"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Utilisé par le bouton d'assistance flottant</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Officiel Support
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Programme Boutiques Fondatrices */}
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" /> 4. Paramètres Programme Boutiques Fondatrices
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Durée de l'Essai Offert (jours)
              </label>
              <input
                type="number"
                value={founderTrialDays}
                onChange={(e) => setFounderTrialDays(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-bold"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">90 jours d'accès complet offert aux 30 premières boutiques</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nombre de Places Disponibles
              </label>
              <input
                type="number"
                value={founderMaxSeats}
                onChange={(e) => setFounderMaxSeats(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#141f27] text-white focus:border-emerald-500 outline-none text-xs font-bold"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">Plafond officiel des boutiques pionnières</p>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
}
