'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, MapPin, Lock } from 'lucide-react';

export default function ClientRegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: 'Abidjan',
    commune: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await signUp({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'client',
        city: formData.city,
        commune: formData.commune
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || "Une erreur s'est produite lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50 max-w-lg w-full mx-auto">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-950 overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] mx-auto mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
            Créer un compte client
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Rejoignez la communauté pour enregistrer vos articles favoris, suivre des boutiques et commenter !
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-2xl mb-6 border border-rose-100 font-medium flex items-start gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Nom complet <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="Ex: Awa Koné"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Numéro de téléphone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="Ex: 0700000000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ville
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition appearance-none bg-white"
                >
                  <option value="Abidjan">Abidjan</option>
                  <option value="Bouaké">Bouaké</option>
                  <option value="Yamoussoukro">Yamoussoukro</option>
                  <option value="San-Pédro">San-Pédro</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Commune / Quartier
              </label>
              <input
                type="text"
                name="commune"
                value={formData.commune}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="Ex: Cocody Angré"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mot de passe <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Confirmer
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full shadow-md hover:shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création en cours...
              </span>
            ) : (
              'Créer mon compte client'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
              Connectez-vous ici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
