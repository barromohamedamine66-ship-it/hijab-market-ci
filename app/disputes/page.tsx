'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldAlert, Plus, ArrowLeft, MessageSquare } from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([
    {
      id: 'disp-1',
      order_number: 'HM-2026-0798',
      shop_name: 'Modesty Style CI',
      reason: 'Taille non conforme reçue',
      status: 'resolved_refunded',
      created_at: '2026-08-25',
      resolution: 'Remboursement Wave effectué de 32 000 FCFA avec retour du produit.',
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [reason, setReason] = useState('Produit non conforme');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDisp = {
      id: `disp-${Date.now()}`,
      order_number: orderNum,
      shop_name: 'Boutique Partenaire',
      reason: reason,
      status: 'opened',
      created_at: new Date().toISOString().split('T')[0],
      resolution: 'En cours d\'examen par l\'équipe médiation HIJAB MARKET CI.',
    };
    setDisputes([newDisp, ...disputes]);
    setShowForm(false);
    setOrderNum('');
    setDescription('');
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
            <h1 className="text-2xl font-bold font-heading text-gray-900">Litiges & Réclamations</h1>
            <p className="text-xs text-gray-500 mt-1">Médiation et protection de vos achats par HIJAB MARKET CI</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Ouvrir une réclamation
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-md p-6 mb-8 animate-fade-in">
            <h3 className="font-bold text-gray-900 text-base mb-4">Déclarer un litige sur une commande</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Numéro de Commande</label>
                  <input
                    type="text"
                    value={orderNum}
                    onChange={(e) => setOrderNum(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 outline-none text-sm"
                    placeholder="ex: HM-2026-0842"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motif de la réclamation</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 outline-none text-sm bg-white"
                  >
                    <option value="Produit non conforme">Produit non conforme à la photo</option>
                    <option value="Colis non reçu">Colis non reçu après délai</option>
                    <option value="Article endommagé">Article endommagé / déchiré</option>
                    <option value="Erreur de couleur ou taille">Erreur de couleur ou taille</option>
                    <option value="Autre">Autre motif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Explications détaillées</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 outline-none text-sm resize-none"
                  placeholder="Décrivez précisément le problème rencontré..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600"
                >
                  Soumettre le litige
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="font-extrabold text-sm text-gray-900">Commande {d.order_number}</span>
                  <span className="text-xs text-gray-400 ml-2">• {d.shop_name}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  d.status === 'resolved_refunded' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {d.status === 'resolved_refunded' ? '✅ Résolu (Remboursé)' : '⏳ En cours d\'examen'}
                </span>
              </div>
              <div className="pt-3">
                <p className="text-xs font-bold text-gray-800">Motif : {d.reason}</p>
                <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <strong>Décision médiation :</strong> {d.resolution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
