'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Sparkles } from 'lucide-react';

export default function RegisterVendorPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [customCity, setCustomCity] = useState('');
  const [commune, setCommune] = useState('Cocody');
  const [customCommune, setCustomCommune] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const CITIES_LIST = [
    'Abidjan',
    'Yamoussoukro',
    'Bouaké',
    'San-Pédro',
    'Korhogo',
    'Daloa',
    'Man',
    'Gagnoa',
    'Soubré',
    'Divo',
    'Abengourou',
    'Agboville',
    'Grand-Bassam',
    'Dabou',
    'Bingerville',
    'Anyama',
    'Songon',
    'Bondoukou',
    'Ferkessédougou',
    'Odienné',
    'Sinfra',
    'Daoukro',
    'Séguéla',
    'Guiglo',
    'Autre ville'
  ];

  const ABIDJAN_COMMUNES = [
    { value: 'Cocody', label: 'Cocody (Angré, Riviera, Deux-Plateaux...)' },
    { value: 'Marcory', label: 'Marcory (Zone 4, Biétry, Résidentiel...)' },
    { value: 'Plateau', label: 'Le Plateau (Centre des affaires)' },
    { value: 'Yopougon', label: 'Yopougon (Maroc, Niangon, Toits Rouges...)' },
    { value: 'Abobo', label: 'Abobo (Sogefiha, Samaké, PK18...)' },
    { value: 'Koumassi', label: 'Koumassi (Remblais, Prodomo...)' },
    { value: 'Treichville', label: 'Treichville (Arras, Avenue 16...)' },
    { value: 'Adjamé', label: 'Adjamé (220 Logements, Liberté...)' },
    { value: 'Port-Bouët', label: 'Port-Bouët (Aéroport, Vridi...)' },
    { value: 'Attécoubé', label: 'Attécoubé' },
    { value: 'Autre quartier', label: 'Autre quartier d\'Abidjan' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalCity = city === 'Autre ville' ? (customCity.trim() || 'Côte d\'Ivoire') : city;
      let finalCommune = '';
      if (city === 'Abidjan') {
        finalCommune = commune === 'Autre quartier' ? (customCommune.trim() || 'Abidjan') : commune;
      } else {
        finalCommune = customCommune.trim() || finalCity;
      }

      const res = await signUp({
        full_name: fullName.trim(),
        shop_name: shopName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        city: finalCity,
        commune: finalCommune,
        shop_description: shopDescription.trim(),
        role: 'seller',
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push('/seller/dashboard');
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement de la boutique");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 max-w-xl w-full mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-200 mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" /> Espace Vendeuses & Créatrices de Hijabs
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Ouvrir ma boutique officielle</h1>
          <p className="text-xs text-gray-500 mt-1">Vendez vos hijabs, abayas et accessoires à des milliers d'acheteuses en Côte d'Ivoire.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-2xl mb-5 border border-rose-200 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nom de la gérante
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: Mariam Kouamé"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nom de la Boutique
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: Les Voiles de Babi"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email professionnel
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="boutique@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Numéro WhatsApp Vente
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: 07 10 20 30 40"
                required
              />
            </div>
          </div>

          {/* Ville et Commune d'implantation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Ville d'implantation
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (e.target.value !== 'Abidjan') {
                    setCustomCommune('');
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition bg-white"
              >
                {CITIES_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {city === 'Abidjan' ? 'Commune' : 'Quartier / Marché / Zone'}
              </label>
              {city === 'Abidjan' ? (
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition bg-white"
                >
                  {ABIDJAN_COMMUNES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customCommune}
                  onChange={(e) => setCustomCommune(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                  placeholder="ex: Centre-ville, Grand Marché..."
                />
              )}
            </div>
          </div>

          {/* Précision si Autre ville */}
          {city === 'Autre ville' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Précisez le nom de votre ville
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: Tiassalé, Boundiali, Bonoua..."
                required
              />
            </div>
          )}

          {/* Précision si Autre quartier d'Abidjan */}
          {city === 'Abidjan' && commune === 'Autre quartier' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Précisez votre quartier
              </label>
              <input
                type="text"
                value={customCommune}
                onChange={(e) => setCustomCommune(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
                placeholder="ex: Abatta, Faya, Riviera Palmeraie..."
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mot de passe boutique
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description de la boutique & types de produits
            </label>
            <textarea
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition resize-none"
              placeholder="Ex : Vente de hijabs en Soie de Médine, abayas importées de Dubaï et accessoires..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Création de la boutique en cours...' : 'Ouvrir ma boutique maintenant 🚀'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Vous avez déjà une boutique enregistrée ?{' '}
            <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
              Connexion vendeuse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
