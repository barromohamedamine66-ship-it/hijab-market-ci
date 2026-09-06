'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Plus, ArrowLeft, Trash2, CheckCircle2, Lock } from 'lucide-react';

interface UserAddress {
  id: string;
  recipient_name: string;
  phone: string;
  city: string;
  commune: string;
  details: string;
  is_default: boolean;
}

const STORAGE_KEY = 'hm_user_addresses';

export default function AddressesPage() {
  const { user, profile } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('Abidjan');
  const [newCommune, setNewCommune] = useState('');
  const [newDetails, setNewDetails] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else if (profile?.address) {
        // Pré-remplir avec l'adresse du profil si existante
        const initialAddr: UserAddress = {
          id: `addr-${Date.now()}`,
          recipient_name: profile.full_name || 'Moi',
          phone: profile.phone || '',
          city: profile.city || 'Abidjan',
          commune: profile.commune || '',
          details: profile.address,
          is_default: true,
        };
        setAddresses([initialAddr]);
      }
    } catch {}
    setLoaded(true);
  }, [profile]);

  const saveAddresses = (newAddrs: UserAddress[]) => {
    setAddresses(newAddrs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddrs));
    } catch {}
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      recipient_name: newRecipient.trim(),
      phone: newPhone.trim(),
      city: newCity.trim(),
      commune: newCommune.trim(),
      details: newDetails.trim(),
      is_default: addresses.length === 0,
    };
    saveAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    setNewRecipient('');
    setNewPhone('');
    setNewCommune('');
    setNewDetails('');
  };

  const handleDelete = (id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />
      
      <main className="container py-10 flex-1 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Mes Adresses de Livraison</h1>
            <p className="text-xs text-gray-500 mt-1">Vos points de livraison réels enregistrés en Côte d'Ivoire</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nouvelle adresse
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-md p-6 mb-8 animate-fade-in">
            <h3 className="font-bold text-gray-900 text-base mb-4">Ajouter une adresse de livraison</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du destinataire *</label>
                  <input
                    type="text"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="Votre nom ou le destinataire"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Téléphone de livraison *</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="07 XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ville *</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="Abidjan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Commune / Quartier *</label>
                  <input
                    type="text"
                    value={newCommune}
                    onChange={(e) => setNewCommune(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="ex: Cocody Angré, Marcory..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Détails précis & Repères connus *</label>
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm resize-none"
                  placeholder="Ex: Face à la pharmacie, portail blanc, 2e étage..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm hover:bg-emerald-600"
                >
                  Enregistrer l'adresse
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              📍
            </div>
            <h3 className="font-bold text-gray-900 text-base font-heading">
              Aucune adresse enregistrée
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Ajoutez votre adresse de domicile ou de bureau pour faciliter vos livraisons rapides à Abidjan ou partout en Côte d'Ivoire.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Ajouter ma première adresse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900 text-sm">{addr.recipient_name}</span>
                    {addr.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">📞 {addr.phone}</p>
                  <p className="text-xs font-semibold text-gray-800">📍 {addr.commune}, {addr.city}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">{addr.details}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
