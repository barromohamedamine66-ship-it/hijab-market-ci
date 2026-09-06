'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Détecter si déjà installé en mode standalone
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    if (isInStandaloneMode) return;

    // 2. Détection iOS / iPadOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Gestion de l'événement natif avant installation (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Vérifier si l'utilisateur a fermé la bannière récemment (7 jours)
      const dismissedUntil = localStorage.getItem('hm_pwa_dismissed_until');
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        // Afficher avec un léger délai pour ne pas interrompre l'arrivée sur la page
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Écouteur pour déclenchement manuel (bouton dans Navbar / Footer / Profil)
    const handleManualTrigger = () => {
      if (isIosDevice) {
        setShowIOSGuide(true);
      } else if (deferredPrompt) {
        setShowPrompt(true);
      } else {
        // Si deferredPrompt n'est pas dispo (ex: navigateur sans support direct)
        setShowIOSGuide(true);
      }
    };

    window.addEventListener('open-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }

    setShowPrompt(false);
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('HIJAB MARKET CI PWA a été installée avec succès !');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    // Mémorise le refus pendant 7 jours
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('hm_pwa_dismissed_until', nextWeek.toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* ---------------------------------------------------------------------- */}
      {/* Bannière Android / Chromium / Desktop                                   */}
      {/* ---------------------------------------------------------------------- */}
      {showPrompt && !showIOSGuide && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-up select-none">
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-4 shadow-2xl shadow-emerald-950/20 flex flex-col gap-3 relative overflow-hidden">
            {/* Décoration d'accentuation */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-950 p-1 flex-shrink-0 border border-emerald-500/40 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-gray-900 font-heading">HIJAB MARKET CI</h3>
                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                      APP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                    Commandez plus vite, sans connexion lente
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avantages clés */}
            <div className="flex items-center gap-4 text-[10px] text-gray-600 font-medium px-1">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Gratuit
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Écran d'accueil
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ultra rapide
              </span>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Plus tard
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-[2] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'application</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* Guide Visuel pour iPhone / iOS Safari                                 */}
      {/* ---------------------------------------------------------------------- */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-950 p-1 mx-auto mb-3 border border-emerald-500/40 shadow-md flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover rounded-xl" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900 font-heading">
                Installer HIJAB MARKET sur iPhone
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Profitez de toute l'expérience application sur votre iPhone en 3 étapes simples :
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Étape 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  Appuyez sur le bouton <span className="font-bold text-gray-900">Partager</span>{' '}
                  <span className="inline-flex items-center justify-center p-1 bg-white border border-gray-200 rounded-md text-blue-600 mx-1 align-middle">
                    <Share className="w-3.5 h-3.5" />
                  </span>{' '}
                  situé dans la barre en bas de Safari.
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  Faites défiler vers le bas puis sélectionnez{' '}
                  <span className="font-bold text-gray-900">« Sur l'écran d'accueil »</span>{' '}
                  <span className="inline-flex items-center justify-center p-1 bg-white border border-gray-200 rounded-md text-gray-700 mx-1 align-middle">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </span>
                  .
                </div>
              </div>

              {/* Étape 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  Touchez <span className="font-bold text-emerald-700">« Ajouter »</span> en haut à droite pour finaliser l'installation.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
