'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, ShoppingBag, PhoneCall } from 'lucide-react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfaf6] px-4 py-12 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-emerald-950/5 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo and Icon Badge */}
        <div className="relative mx-auto mb-6 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/80 flex items-center justify-center shadow-inner relative">
            <WifiOff className="w-10 h-10 text-emerald-700 animate-pulse" />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full shadow-sm">
              CI
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-950 font-heading mb-2">
          Connexion Interrompue
        </h1>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Il semble que vous soyez actuellement hors ligne. Vérifiez l'activation de vos données mobiles (Orange, MTN, Moov CI) ou de votre connexion Wi-Fi.
        </p>

        {/* Quick status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 mb-6">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{isOnline ? 'Connexion rétablie — rechargement...' : 'En attente du réseau mobile...'}</span>
        </div>

        {/* Action button */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Vérification en cours...' : 'Réessayer la connexion'}</span>
          </button>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs border border-gray-200/70 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Retour à l'accueil (si disponible en cache)</span>
          </Link>
        </div>

        {/* Support Help */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">Service Client HIJAB MARKET CI</p>
          <p>Assistance téléphonique & WhatsApp :</p>
          <a
            href="tel:+2250152182840"
            className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline mt-1"
          >
            <PhoneCall className="w-3.5 h-3.5" /> +225 01 52 18 28 40
          </a>
        </div>
      </div>
    </div>
  );
}
