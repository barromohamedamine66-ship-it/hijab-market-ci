'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900">
            Une erreur critique est survenue
          </h1>
          <p className="text-xs text-gray-500">
            Veuillez recharger l&apos;application pour rétablir la connexion.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  );
}
