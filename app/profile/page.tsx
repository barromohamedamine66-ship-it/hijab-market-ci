'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, MapPin, Mail, Save, ArrowLeft, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      const raw = profile.email || user?.email || '';
      setEmail(raw.endsWith('@client.hijabmarket.ci') ? '' : raw);
      setCity(profile.city || 'Abidjan');
      setCommune(profile.commune || '');
      setAddress(profile.address || '');
    } else if (user) {
      const raw = user.email || '';
      setEmail(raw.endsWith('@client.hijabmarket.ci') ? '' : raw);
      setFullName(user.user_metadata?.full_name || (raw.endsWith('@client.hijabmarket.ci') ? 'Cliente' : raw.split('@')[0]) || '');
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        commune: commune.trim(),
        address: address.trim(),
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-20 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="container py-20 flex-1 max-w-md mx-auto text-center">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gray-900">Accès Réservé</h1>
            <p className="text-xs text-gray-500">Connectez-vous pour accéder et modifier votre profil réel.</p>
            <Link href="/auth/login?redirect=/profile" className="btn btn-primary w-full text-xs font-bold py-3 block">
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HM';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />
      
      <main className="container py-10 flex-1 max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-2xl border border-emerald-200">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-gray-900">Mon Profil Personnel</h1>
              <p className="text-xs text-gray-400">Gérez vos informations réelles de livraison et de contact</p>
            </div>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 font-medium">
              ✅ Vos informations réelles ont été enregistrées avec succès !
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 text-sm border border-rose-200 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nom et Prénom *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Téléphone Principal (Wave / Appels) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07 XX XX XX XX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Adresse Email
                </label>
                {!email && (
                  <span className="text-[11px] text-gray-400 font-normal">
                    (Non renseignée • Connexion par téléphone)
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email || 'Aucune adresse email enregistrée'}
                  disabled
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm transition ${
                    email ? 'text-gray-700 font-medium' : 'text-gray-400 italic'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Ville (ex: Abidjan, Bouaké, Yamoussoukro) *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Abidjan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Commune / Quartier *
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="ex: Cocody Angré, Marcory, Yopougon..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Adresse de livraison exacte & Repères
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition resize-none"
                  placeholder="Ex : Rue L45, Villa 12, non loin du Terminus ou de la pharmacie..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer mon profil'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
