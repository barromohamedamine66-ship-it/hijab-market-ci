'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, ShoppingBag, ShieldAlert } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely to console for debugging
    console.error('Erreur capturée par ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-center">
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
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Accueil
          </Link>
        </div>

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
