'use client';

import { useState, useEffect } from 'react';
import { Bell, Sparkles, X, CheckCircle2 } from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  requestPushPermission,
} from '@/lib/push-notifications';

const PROMPT_DISMISSED_KEY = 'hm_notif_prompt_dismissed';

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      // Vérifier si le support existe et si la permission n'a pas encore été accordée/refusée
      if (!isPushNotificationSupported()) return;

      const state = getNotificationPermissionState();
      if (state !== 'default') return;

      // Vérifier si l'utilisateur a fermé la bannière récemment (3 jours)
      const dismissedAt = localStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < 3 * 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // Afficher après 4 secondes pour laisser le temps à l'utilisateur de voir le contenu
      const timer = setTimeout(() => {
        setShow(true);
      }, 4000);

      return () => clearTimeout(timer);
    } catch (_) {}
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestPushPermission();
    setLoading(false);

    if (granted) {
      setSuccess(true);
      setTimeout(() => {
        setShow(false);
      }, 2500);
    } else {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(PROMPT_DISMISSED_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Invitation aux alertes"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-gradient-to-r from-gray-950 via-emerald-950 to-gray-950 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-emerald-500/40 backdrop-blur-md relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-full transition"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="flex items-center gap-3 py-2 text-emerald-300">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-white">Alertes activées avec succès ! 🎉</h4>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Vous recevrez une notification lors des prochaines ventes flash et arrivages.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Bell className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div className="flex-1 pr-4">
              <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                <Sparkles className="w-3 h-3" /> Restez Toujours Informée
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Activer les alertes sur votre téléphone ?
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Recevez en avant-première les <strong>Ventes Flash</strong>, codes promos et nouveaux hijabs de vos boutiques préférées.
              </p>

              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={handleEnable}
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  {loading ? 'Activation...' : 'Activer les alertes 🔔'}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-gray-200 font-semibold px-2 py-1 transition"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
