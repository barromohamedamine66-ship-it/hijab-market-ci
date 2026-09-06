'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn(identifier.trim().toLowerCase(), password);

      if (res?.error) {
        setError(res.error === 'Invalid login credentials' 
          ? 'Identifiants invalides. Veuillez vérifier votre numéro / email et votre mot de passe.' 
          : res.error);
        setLoading(false);
        return;
      }

      if (res.role === 'admin') router.push('/admin');
      else if (res.role === 'seller') router.push('/seller/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-950 overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] mx-auto mb-3 flex items-center justify-center">
            <img src="/logo.png" alt="HIJAB MARKET CI" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Bon retour</h1>
          <p className="text-xs text-gray-500 mt-1">Espace réservé aux vendeuses, partenaires et administrateurs.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-2xl mb-5 border border-rose-200 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Numéro de téléphone ou Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
              placeholder="ex: 07 00 00 00 00 ou boutique@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mot de passe
              </label>
              <Link 
                href="/auth/forgot-password"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
          <p className="text-xs text-gray-700 font-medium">
            Vous êtes une créatrice ou vendeuse ?{' '}
            <Link href="/auth/register/vendor" className="text-emerald-600 font-bold hover:underline">
              Ouvrir une boutique vendeuse 🌟
            </Link>
          </p>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="text-xs text-emerald-800 font-medium">
              🛒 <strong>Chères Clientes :</strong> Aucun compte requis pour commander !
            </p>
            <Link href="/products" className="text-xs text-emerald-700 font-bold hover:underline inline-block mt-1">
              Explorer les articles et commander directement →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
