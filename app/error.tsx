'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, ShoppingBag, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error securely to console for debugging
    console.error('Erreur capturée par ErrorBoundary:', error);
  }, [error]);

  const handleReload = () => {
    try {
      reset();
    } catch (_) {}
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
            Une interruption temporaire est survenue
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Pas d&apos;inquiétude, vos données et vos commandes sont en sécurité. Vous pouvez recharger la page pour reprendre votre navigation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleReload}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Recharger la page
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Accueil
          </Link>
        </div>

        {error?.message && (
          <div className="pt-2 border-t border-gray-100 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center justify-between w-full py-1"
            >
              <span>Détails de l&apos;erreur</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-700 font-mono break-all max-h-32 overflow-y-auto">
                <p className="font-semibold text-red-600">{error.name}: {error.message}</p>
                {error.digest && <p className="text-[10px] text-gray-400 mt-1">Digest: {error.digest}</p>}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/products"
            className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Parcourir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
