'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 font-bold border border-emerald-100 shadow-inner">
          🔒
        </div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Nouveau Mot de Passe</h1>
        <p className="text-xs text-gray-500 mt-1">
          Définissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs border border-emerald-200 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Votre mot de passe a été réinitialisé avec succès ! Redirection...
          </div>
          <Link href="/auth/login" className="btn btn-primary w-full inline-flex">
            Se connecter maintenant
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-2xl border border-rose-200 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nouveau Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Confirmer le Nouveau Mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transition text-xs"
            disabled={loading}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour mon mot de passe'}
          </button>

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-gray-500 hover:text-emerald-600">
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
