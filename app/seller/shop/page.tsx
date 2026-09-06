'use client';

import { useState, useEffect, useRef } from 'react';
import { Store, Save, Upload, Phone, MapPin, Globe, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Logos élégants prêts à l'emploi si la créatrice n'a pas encore de fichier
const PRESET_LOGOS = [
  {
    name: 'Émeraude & Or',
    desc: 'Luxe Moderne',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80',
    badge: 'Populaire',
  },
  {
    name: 'Soie Rose Poudrée',
    desc: 'Douceur & Voiles',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80',
    badge: 'Chic',
  },
  {
    name: 'Noir Royal & Abaya',
    desc: 'Haute Couture',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80',
    badge: 'Prestige',
  },
  {
    name: 'Logo Officiel HM CI',
    desc: 'Identité Standard',
    url: '/logo.png',
    badge: 'Par défaut',
  },
];

export default function SellerShopSettingsPage() {
  const { user, shop, updateShop } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Synchronisation avec les données réelles de la boutique
  useEffect(() => {
    if (shop) {
      setName(shop.name || '');
      setDescription(shop.description || '');
      setWhatsapp(shop.whatsapp || shop.phone || '');
      setPhone(shop.phone || '');
      setCommune(shop.commune || 'Cocody, Abidjan');
      if (shop.logo_url) {
        setLogoUrl(shop.logo_url);
      }
    } else {
      setName('Boutique Vendeuse');
      setDescription('Spécialiste de la soie de Médine, abayas et accessoires modest fashion en Côte d\'Ivoire.');
      setCommune('Cocody, Abidjan');
    }
  }, [shop]);

  // Gestion de l'import de fichier image depuis l'appareil / smartphone
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La photo est trop volumineuse (maximum 5 Mo).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoUrl(result);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  // Enregistrement des modifications
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await updateShop({
        name: name.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        phone: phone.trim(),
        commune: commune.trim(),
        logo_url: logoUrl,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">Ma Boutique Vendeur</h1>
        <p className="text-xs text-gray-500 mt-1">
          Personnalisez le logo et les coordonnées de votre vitrine officielle sur HIJAB MARKET CI.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm border border-emerald-200 font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          Le logo et les informations de votre boutique ont été mis à jour avec succès !
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200 font-bold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
        {/* =========================================================================
            SECTION LOGO DE LA BOUTIQUE (Téléchargement, Aperçu & Modèles)
           ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-gray-50/50 to-emerald-50/40 border border-amber-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
              Logo Officiel de votre Boutique
            </label>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Visible par toutes les clientes
            </span>
          </div>

          {/* Input fichier caché déclenché au clic */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleLogoFileChange}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Aperçu du Logo avec interaction tactile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gray-950 overflow-hidden border-2 border-emerald-500/50 shadow-lg flex items-center justify-center flex-shrink-0 cursor-pointer group hover:border-emerald-400 transition"
              title="Cliquez pour changer la photo"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Boutique" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <Store className="w-10 h-10 text-emerald-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                <Upload className="w-4 h-4 mb-1" />
                <span>Modifier</span>
              </div>
            </div>

            {/* Boutons d'action pour le logo */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" /> Choisir une photo sur mon appareil
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
                >
                  {showUrlInput ? 'Masquer URL' : 'Coller un lien web (URL)'}
                </button>
              </div>

              <p className="text-[11px] text-gray-500">
                Formats acceptés : PNG, JPG, JPEG, WebP. Format carré recommandé pour un rendu parfait sur les fiches produits.
              </p>

              {/* Champ optionnel pour coller une URL d'image */}
              {showUrlInput && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://mon-site.com/mon-logo.jpg"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modèles de logos rapides prêts à l'emploi */}
          <div className="pt-3 border-t border-amber-200/50">
            <span className="text-[11px] font-bold text-gray-700 block mb-2">
              Ou choisissez un modèle de logo prédéfini pour votre boutique :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_LOGOS.map((preset) => {
                const isSelected = logoUrl === preset.url;
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => {
                      setLogoUrl(preset.url);
                      setSaved(false);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 border border-black/10">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate block">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate">{preset.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coordonnées de la boutique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nom Officiel de la Boutique
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: Les Voiles de Babi"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Commune / Emplacement
            </label>
            <input
              type="text"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: Cocody, Angré 8e Tranche"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Numéro WhatsApp Direct
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: 07 10 20 30 40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Téléphone Appels
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
              placeholder="ex: 07 10 20 30 40"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Bio & Présentation de la Boutique
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition resize-none"
            placeholder="Décrivez vos articles phares (soie de Médine, abayas, sous-hijabs...) et vos valeurs..."
            required
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition flex items-center gap-2 text-xs sm:text-sm active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement en cours...' : 'Mettre à jour la boutique 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
