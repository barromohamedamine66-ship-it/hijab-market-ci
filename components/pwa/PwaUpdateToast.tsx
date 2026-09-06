'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

export default function PwaUpdateToast() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (e: CustomEvent<{ worker: ServiceWorker }>) => {
      setWaitingWorker(e.detail.worker);
      setShowToast(true);
    };

    window.addEventListener('sw-update-available' as any, handleUpdate);

    return () => {
      window.removeEventListener('sw-update-available' as any, handleUpdate);
    };
  }, []);

  const handleUpdateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ action: 'skipWaiting' });
    }
    setShowToast(false);
    window.location.reload();
  };

  if (!showToast) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 animate-fade-in select-none">
      <div className="bg-gray-950 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-500/50 flex items-center justify-between gap-3 max-w-sm ml-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Mise à jour disponible</p>
            <p className="text-[11px] text-gray-300">Nouvelles boutiques & hijabs</p>
          </div>
        </div>

        <button
          onClick={handleUpdateApp}
          className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition flex-shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  );
}
