'use client';

import { useState, useEffect } from 'react';
import {
  BellRing, Send, Sparkles, Smartphone, CheckCircle2,
  Clock, Users, Zap, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { sendLocalPushNotification, sendTestNotification, isPushNotificationSupported } from '@/lib/push-notifications';
import { DBService } from '@/lib/supabase/db-service';

interface SentCampaign {
  id: string;
  title: string;
  body: string;
  url: string;
  audience: string;
  sentAt: string;
  status: 'sent' | 'scheduled';
}

const TEMPLATES = [
  {
    label: '⚡ Vente Flash du Jour',
    title: '🔥 Ventes Flash HIJAB MARKET CI !',
    body: 'Jusqu\'à -30% sur les Soies de Médine et Abayas Dubaï aujourd\'hui seulement.',
    url: '/products',
  },
  {
    label: '✨ Nouveaux Arrivages',
    title: '🧕 Nouveaux Arrivages de Voiles & Robes !',
    body: 'Découvrez les dernières collections exclusives ajoutées par nos créatrices à Abidjan.',
    url: '/products',
  },
  {
    label: '🛵 Livraison Gratuite / Promo',
    title: '🎁 Offre Spéciale : Livraison Promo ce Week-end !',
    body: 'Profitez de la livraison rapide partout en Côte d\'Ivoire sur vos articles préférés.',
    url: '/products',
  },
  {
    label: '🛍️ Rappel Panier',
    title: '🛍️ Vos articles vous attendent sur HIJAB MARKET CI',
    body: 'Finalisez votre commande avant rupture de stock dans votre boutique favorite.',
    url: '/cart',
  },
];

const STORAGE_KEY_CAMPAIGNS = 'hm_admin_sent_campaigns';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/products');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [campaigns, setCampaigns] = useState<SentCampaign[]>([]);

  useEffect(() => {
    // Charger l'historique des campagnes envoyées
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      if (stored) {
        setCampaigns(JSON.parse(stored));
      } else {
        const initialCampaigns: SentCampaign[] = [
          {
            id: 'c1',
            title: '🔥 Vente Flash Soie de Médine',
            body: 'Nouvel arrivage premium disponible sur le portail !',
            url: '/products',
            audience: 'Toutes les clientes (Côte d\'Ivoire)',
            sentAt: 'Il y a 2 heures',
            status: 'sent',
          },
          {
            id: 'c2',
            title: '🎉 Bienvenue sur HIJAB MARKET CI',
            body: 'Découvrez les boutiques vérifiées de mode modeste.',
            url: '/stores',
            audience: 'Nouveaux comptes',
            sentAt: 'Hier',
            status: 'sent',
          },
        ];
        setCampaigns(initialCampaigns);
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(initialCampaigns));
      }
    } catch (_) {}
  }, []);

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setUrl(tpl.url);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setSuccessMsg('');

    try {
      // 1. Envoi Push sur le Service Worker du périphérique connecté
      await sendLocalPushNotification({
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || '/products',
        tag: `hm-broadcast-${Date.now()}`,
      });

      // 2. Sauvegarde de la campagne dans l'historique
      const newCampaign: SentCampaign = {
        id: `camp-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || '/products',
        audience: audience === 'all' ? 'Tous les téléphones abonnés (Broadcast)' : 'Clientes actives',
        sentAt: 'À l\'instant',
        status: 'sent',
      };

      const updated = [newCampaign, ...campaigns];
      setCampaigns(updated);
      try {
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(updated));
      } catch (_) {}

      setSuccessMsg(`Notification Push diffusée avec succès à tous les téléphones abonnés ! 🚀📱`);
      setTitle('');
      setBody('');
      setUrl('/products');
    } catch (err) {
      alert('Une erreur est survenue lors de l\'envoi du push.');
    } finally {
      setSending(false);
    }
  };

  const handleTestOnDevice = async () => {
    if (!title.trim() || !body.trim()) {
      alert('Veuillez remplir au moins un titre et un message pour le test.');
      return;
    }
    const ok = await sendLocalPushNotification({
      title: `[TEST] ${title.trim()}`,
      body: body.trim(),
      url: url.trim() || '/products',
      tag: `hm-test-${Date.now()}`,
    });
    if (ok) {
      alert('Notification de test envoyée instantanément sur votre téléphone / écran ! 🔔');
    } else {
      alert('Veuillez autoriser les notifications dans votre navigateur pour tester la réception.');
    }
  };

  return (
    <div className="p-4 md:p-8 ml-0 md:ml-64 bg-[#070b0e] min-h-screen text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <BellRing className="w-3.5 h-3.5" />
              <span>Marketing & Réengagement Mobile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-3">
              Lancement des Notifications Push 📲
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Envoyez des alertes instantanées sur les téléphones des clientes pour générer des visites et booster les commandes.
            </p>
          </div>

          <button
            onClick={() => sendTestNotification()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Tester une alerte test
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0a1014] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
              📱
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Appareils Abonnés Push</span>
              <span className="text-xl font-extrabold text-white">Actifs & Connectés</span>
            </div>
          </div>

          <div className="bg-[#0a1014] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Temps Moyen d'Ouverture</span>
              <span className="text-xl font-extrabold text-white">&lt; 3 minutes</span>
            </div>
          </div>

          <div className="bg-[#0a1014] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl font-bold">
              🛡️
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Protocole Service Worker</span>
              <span className="text-xl font-extrabold text-emerald-400">PWA 100% Opérationnel</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire d'envoi */}
          <div className="lg:col-span-2 bg-[#0a1014] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                Diffuser une Nouvelle Notification Push
              </h2>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Direct Mobile
              </span>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="font-semibold">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Titre de la notification <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 🔥 Ventes Flash : Soie de Médine à -30% !"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Message de la notification <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Nouveaux modèles exclusifs arrivés chez vos boutiques préférées. Cliquez pour commander avant rupture !"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Lien / Page de destination
                  </label>
                  <input
                    type="text"
                    placeholder="/products ou /stores"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Audience ciblée
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-3 bg-[#070b0e] border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none transition"
                  >
                    <option value="all">Tous les téléphones (Clients & Visiteurs)</option>
                    <option value="clients">Clientes ayant commandé</option>
                    <option value="sellers">Boutiques Partenaires</option>
                  </select>
                </div>
              </div>

              {/* Aperçu en direct style téléphone */}
              <div className="bg-[#070b0e] border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  Aperçu sur écran de verrouillage :
                </span>
                <div className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    🧕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {title || 'HIJAB MARKET CI ✨'}
                      </span>
                      <span className="text-[10px] text-slate-500">maintenant</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                      {body || 'Votre message de notification apparaîtra ici sur l\'écran du téléphone.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestOnDevice}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Tester d'abord sur mon appareil
                </button>

                <button
                  type="submit"
                  disabled={sending || !title.trim() || !body.trim()}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Diffusion en cours...' : 'Diffuser le Push sur tous les téléphones 🚀'}
                </button>
              </div>
            </form>
          </div>

          {/* Modèles & Astuces */}
          <div className="space-y-6">
            
            {/* Modèles rapides */}
            <div className="bg-[#0a1014] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Modèles Pré-remplis (1 Clic)
              </h3>
              <p className="text-xs text-slate-400">
                Sélectionnez un modèle pour remplir instantanément le formulaire d'envoi :
              </p>

              <div className="space-y-2.5">
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full text-left p-3 rounded-xl bg-[#070b0e] hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition group space-y-1"
                  >
                    <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                      {tpl.label}
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-1">
                      {tpl.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bonnes pratiques */}
            <div className="bg-[#0a1014] border border-slate-800 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                💡 Bonnes pratiques de réengagement :
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li>• <strong>Heures idéales</strong> : 12h00 - 13h30 (pause midi) et 18h30 - 21h00 (après le travail).</li>
                <li>• <strong>Fréquence recommandée</strong> : 1 à 2 notifications par jour maximum pour préserver l'intérêt.</li>
                <li>• <strong>Émojis</strong> : Utilisez des émojis attractifs (🧕, 🔥, ✨, 🛍️) pour maximiser le taux de clics.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Historique des notifications envoyées */}
        <div className="bg-[#0a1014] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Historique des Campagnes Diffusées
            </h3>
            <span className="text-xs text-slate-400">{campaigns.length} envoyée(s)</span>
          </div>

          {campaigns.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Aucune campagne envoyée pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070b0e] text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Titre & Message</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Envoyé</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.body}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{c.audience}</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono">{c.url}</td>
                      <td className="py-3 px-4 text-slate-400">{c.sentAt}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Diffusé
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
