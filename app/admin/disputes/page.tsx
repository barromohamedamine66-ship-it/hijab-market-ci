'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Dispute {
  id: string;
  order_number: string;
  client_name: string;
  shop_name: string;
  reason: string;
  status: 'under_review' | 'resolved';
  solution: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const handleResolve = (id: string) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'resolved', solution: 'Litige clos après accord amiable avec les deux parties.' } : d));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Médiation & Résolution des Litiges</h1>
        <p className="text-xs text-slate-400 mt-1">
          Arbitrage des réclamations entre clientes et boutiques vendeuses.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <h3 className="font-bold text-white text-base font-heading">
            Aucun litige ouvert actuellement
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Toutes les transactions se déroulent dans d'excellentes conditions. Si une cliente signale un problème sur un article ou une livraison, le dossier s'affichera ici pour arbitrage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-[#0f171d] rounded-3xl border border-slate-800 p-6 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800/80 gap-2">
                <div>
                  <span className="font-extrabold text-sm text-white">Commande {d.order_number}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    Client : <strong className="text-slate-200">{d.client_name}</strong> vs Boutique : <strong className="text-emerald-400">{d.shop_name}</strong>
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  d.status === 'resolved' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {d.status === 'resolved' ? '✔ Résolu' : '⏳ Litige Ouvert'}
                </span>
              </div>

              <p className="text-xs font-bold text-amber-400">Motif : {d.reason}</p>
              <p className="text-xs text-slate-400 bg-[#141f27] p-3 rounded-xl border border-slate-800">
                <strong>Décision arbitrage :</strong> {d.solution}
              </p>

              {d.status === 'under_review' && (
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleResolve(d.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition"
                  >
                    Clôturer le litige à l'amiable
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
