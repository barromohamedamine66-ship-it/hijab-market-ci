'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DBService } from '@/lib/supabase/db-service';
import type { SellerWallet } from '@/lib/supabase/types';

export default function SellerWithdrawalsPage() {
  const { user, shop } = useAuth();
  const [wallet, setWallet] = useState<SellerWallet>({
    id: 'wallet',
    shop_id: '',
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
    updated_at: new Date().toISOString(),
  });
  const [amount, setAmount] = useState('5000');
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storeId = shop?.id || (user ? `shop-${user.id}` : null);
    if (storeId) {
      DBService.getSellerWallet(storeId).then((w) => {
        setWallet(w);
        if (w.available_balance > 0) {
          setAmount(Math.min(50000, w.available_balance).toString());
        }
      });
    }
  }, [user, shop]);

  const [withdrawals, setWithdrawals] = useState([
    {
      id: 'w-1',
      amount: 150000,
      payment_method: 'wave',
      account_number: '07 10 20 30 40',
      status: 'processed',
      created_at: '2026-08-28',
    },
    {
      id: 'w-2',
      amount: 80000,
      payment_method: 'orange_money',
      account_number: '07 10 20 30 40',
      status: 'processed',
      created_at: '2026-08-15',
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: `w-${Date.now()}`,
      amount: parseInt(amount, 10),
      payment_method: paymentMethod,
      account_number: accountNumber,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
    };
    setWithdrawals([newReq, ...withdrawals]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      <Link href="/seller/earnings" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Retour aux revenus & portefeuille
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">Demandes de Retrait</h1>
        <p className="text-xs text-gray-500 mt-1">Transférez votre solde disponible directement vers votre compte Wave ou Mobile Money.</p>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm border border-emerald-200 font-medium animate-fade-in">
          ✅ Votre demande de retrait de <strong>{parseInt(amount, 10).toLocaleString('fr-FR')} FCFA</strong> a été enregistrée. Elle sera traitée sous 2h à 24h ouvrées.
        </div>
      )}

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Solde Disponible Retirable</span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-600">
            {wallet.available_balance.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Montant du Retrait (FCFA, Min 5 000)
            </label>
            <input
              type="number"
              min={5000}
              max={Math.max(5000, wallet.available_balance)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Moyen de Réception
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm bg-white"
            >
              <option value="wave">🌊 Wave CI</option>
              <option value="orange_money">🟠 Orange Money CI</option>
              <option value="mtn_momo">🟡 MTN MoMo CI</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nom du Titulaire du Compte
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="ex: Aminata Koné"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Numéro Mobile Money
            </label>
            <input
              type="tel"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
              placeholder="07 10 20 30 40"
              required
            />
          </div>
        </div>

        <div className="pt-3 sm:pt-4 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto justify-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
          >
            <ArrowDownCircle className="w-4 h-4" /> Demander le virement
          </button>
        </div>
      </form>

      {/* Withdrawals History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 font-heading mb-4">Historique des Demandes</h2>
        <div className="divide-y divide-gray-100 text-xs">
          {withdrawals.map((w) => (
            <div key={w.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="font-extrabold text-gray-900">{w.amount.toLocaleString('fr-FR')} FCFA</span>
                <p className="text-gray-400 mt-0.5 text-[11px]">{w.payment_method.toUpperCase()} • {w.account_number} • {w.created_at}</p>
              </div>
              <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                w.status === 'processed' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {w.status === 'processed' ? '✔ Virement Effectué' : '⏳ En attente validation'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
