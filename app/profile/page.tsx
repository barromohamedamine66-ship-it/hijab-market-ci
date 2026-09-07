'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, MapPin, Mail, Save, ArrowLeft, Lock, LogOut, Store, Heart, UserCheck, Settings, Calendar, Bell } from 'lucide-react';
import { DBService } from '@/lib/supabase/db-service';
import type { Product, Shop } from '@/lib/supabase/types';
import LikeButton from '@/components/ui/LikeButton';

function formatPrice(p: number) {
  return p.toLocaleString('fr-FR') + ' FCFA';
}

export default function ProfilePage() {
  const { user, profile, updateProfile, loading: authLoading, signOut, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'infos' | 'likes' | 'follows'>('infos');
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [followedShops, setFollowedShops] = useState<Shop[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
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
      setBirthDate(profile.birth_date || '');
      setAvatarUrl(profile.avatar_url || '');
      setPushEnabled(profile.push_enabled || false);
    } else if (user) {
      const raw = user.email || '';
      setEmail(raw.endsWith('@client.hijabmarket.ci') ? '' : raw);
      setFullName(user.user_metadata?.full_name || (raw.endsWith('@client.hijabmarket.ci') ? 'Cliente' : raw.split('@')[0]) || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (user && activeTab !== 'infos') {
      setLoadingData(true);
      if (activeTab === 'likes') {
        DBService.getLikedProducts(user.id).then(setLikedProducts).finally(() => setLoadingData(false));
      } else if (activeTab === 'follows') {
        DBService.getFollowedShops(user.id).then(setFollowedShops).finally(() => setLoadingData(false));
      }
    }
  }, [user, activeTab]);

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
        birth_date: birthDate || null,
        avatar_url: avatarUrl || null,
        push_enabled: pushEnabled,
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
      
      <main className="container py-10 flex-1 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        {/* Tabs */}
        <div className="flex items-center overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('infos')}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'infos' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" /> Mes Informations
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'likes' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-500 border border-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" /> Mes Favoris
          </button>
          <button
            onClick={() => setActiveTab('follows')}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'follows' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Mes Abonnements
          </button>
        </div>

        {activeTab === 'infos' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="relative group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-2xl border border-emerald-200 overflow-hidden relative">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center leading-tight">Changer<br/>Avatar</span>
                </div>
                {/* Avatar selection dropdown overlay (simplified for now) */}
                <select 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                >
                  <option value="">Aucun avatar (Initiales)</option>
                  <option value="https://api.dicebear.com/7.x/adventurer/svg?seed=Awa">Avatar 1 (Awa)</option>
                  <option value="https://api.dicebear.com/7.x/adventurer/svg?seed=Binta">Avatar 2 (Binta)</option>
                  <option value="https://api.dicebear.com/7.x/adventurer/svg?seed=Mariam">Avatar 3 (Mariam)</option>
                  <option value="https://api.dicebear.com/7.x/adventurer/svg?seed=Fatou">Avatar 4 (Fatou)</option>
                </select>
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
                    Téléphone Principal *
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email || 'Aucune adresse email enregistrée'}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm transition italic text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Ville *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Commune *</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Adresse de livraison</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date de naissance</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">Notifications Push</h4>
                    <p className="text-[10px] text-gray-500">Recevoir des alertes pour vos commandes et favoris</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
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
        )}

        {activeTab === 'likes' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 min-h-[400px]">
            <h2 className="text-xl font-bold font-heading text-gray-900 mb-6 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Mes Favoris</h2>
            {loadingData ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : likedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Vous n'avez pas encore de coups de cœur.</p>
                <Link href="/products" className="btn btn-outline btn-sm mt-4 text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300">Explorer le catalogue</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {likedProducts.map(product => (
                  <div key={product.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group flex flex-col overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="block relative h-40 bg-gray-50">
                      {product.images?.[0]?.image_url ? (
                        <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🧕</div>
                      )}
                    </Link>
                    <div className="absolute top-2 right-2 z-10">
                      <LikeButton productId={product.id} className="w-8 h-8 shadow-sm bg-white" />
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-emerald-600 font-bold block truncate">{product.store?.name}</span>
                      <h3 className="font-bold text-gray-900 text-xs mt-0.5 truncate">{product.name}</h3>
                      <div className="font-extrabold text-gray-900 text-sm mt-1">{formatPrice(product.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'follows' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 min-h-[400px]">
            <h2 className="text-xl font-bold font-heading text-gray-900 mb-6 flex items-center gap-2"><UserCheck className="w-5 h-5 text-emerald-600" /> Mes Abonnements</h2>
            {loadingData ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : followedShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Vous ne suivez aucune boutique pour le moment.</p>
                <Link href="/stores" className="btn btn-outline btn-sm mt-4 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">Découvrir les boutiques</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followedShops.map(shop => (
                  <div key={shop.id} className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-emerald-200 transition">
                    <Link href={`/stores/${shop.slug}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-xl">
                        {shop.logo_url ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" /> : '🏪'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{shop.name}</h3>
                        <p className="text-[11px] text-gray-500">{shop.commune}</p>
                      </div>
                    </Link>
                    <Link href={`/stores/${shop.slug}`} className="text-emerald-600 text-xs font-bold hover:underline">
                      Visiter
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Account Actions */}
        <div className="mt-6 flex flex-col gap-3">
          {role !== 'seller' && (
            <Link
              href="/auth/register/vendor"
              className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-3xl border border-emerald-200 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition">Devenir Vendeuse</h3>
                  <p className="text-[11px] text-gray-500">Créez votre boutique et commencez à vendre</p>
                </div>
              </div>
              <span className="text-emerald-500 font-bold text-lg">→</span>
            </Link>
          )}

          <button
            onClick={signOut}
            className="w-full p-4 bg-rose-50 hover:bg-rose-100 rounded-3xl border border-rose-200 flex items-center gap-3 transition-all text-rose-600"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Se déconnecter</h3>
              <p className="text-[11px] text-rose-500/70">Fermer la session en cours</p>
            </div>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
