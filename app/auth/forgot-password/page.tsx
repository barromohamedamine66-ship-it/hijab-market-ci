'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MessageCircle, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let email = identifier.trim().toLowerCase();

      // Si l'utilisateur a entré un numéro de téléphone
      if (!email.includes('@')) {
        const cleanPhone = email.replace(/[\s\-\.]/g, '');
        if (isSupabaseConfigured()) {
          const { data: matchedProfile } = await supabase
            .from('profiles')
            .select('email')
            .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
            .maybeSingle();

          if (matchedProfile?.email) {
            email = matchedProfile.email;
          } else {
            email = `${cleanPhone}@client.hijabmarket.ci`;
          }
        } else {
          email = `${cleanPhone}@client.hijabmarket.ci`;
        }
      }

      if (isSupabaseConfigured()) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (resetError) {
          setError(resetError.message);
          setLoading(false);
          return;
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 font-bold shadow-inner">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Récupération de Compte</h1>
          <p className="text-xs text-gray-500 mt-1">
            Entrez votre adresse email ou numéro de téléphone pour recevoir le lien de réinitialisation.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs border border-emerald-200 font-semibold leading-relaxed">
              ✅ Les instructions de réinitialisation ont été envoyées ! Veuillez vérifier votre boîte de réception ou vos spams.
            </div>
            <Link href="/auth/login" className="btn btn-primary w-full text-xs font-bold py-3 block text-center">
              Retour à la connexion
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
                Email ou Numéro de téléphone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: 07 00 00 00 00 ou fatou@gmail.com"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition duration-200 text-xs"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
            </button>

            {/* Assistance directe WhatsApp pour clientes en CI */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <p className="text-[11px] text-gray-500 mb-2">
                Vous n'avez pas accès à votre email ?
              </p>
              <a
                href="https://wa.me/2250152182840?text=Bonjour%2C%20j%27ai%20perdu%20mon%20mot%20de%20passe%20HIJAB%20MARKET%20CI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Débloquer mon compte via WhatsApp
              </a>
            </div>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
