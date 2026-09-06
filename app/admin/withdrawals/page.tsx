'use client';

import { useState } from 'react';
import { ArrowDownCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  shop_name: string;
  amount: number;
  payment_method: 'wave' | 'orange_money' | 'mtn_momo';
  account_number: string;
  account_name: string;
  status: 'pending' | 'processed' | 'rejected';
  created_at: string;
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);

  const handleProcess = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'processed' } : r));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Demandes de Retrait des Vendeuses</h1>
        <p className="text-xs text-slate-400 mt-1">
          Validez et traitez les virements Mobile Money des gains nets vers les créatrices partenaires.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            💳
          </div>
          <h3 className="font-bold text-white text-base font-heading">
            Aucune demande de retrait en attente
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Dès qu'une vendeuse demandera le virement de son solde disponible (93% de ses ventes), sa demande apparaîtra ici avec son numéro Wave ou Orange Money pour exécution.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Boutique & Titulaire</th>
                  <th className="py-4 px-6">Montant</th>
                  <th className="py-4 px-6">Opérateur & Numéro</th>
                  <th className="py-4 px-6">Date Demande</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Action Virement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{r.shop_name}</span>
                      <span className="text-[11px] text-slate-400">{r.account_name}</span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-amber-400">
                      {r.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-slate-200 block">{r.account_number}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{r.payment_method}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {r.created_at}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'processed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {r.status === 'processed' ? 'Effectué' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {r.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(r.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition"
                        >
                          Marquer Envoyé
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
