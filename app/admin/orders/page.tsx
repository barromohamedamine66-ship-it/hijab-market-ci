import { DBService } from '@/lib/supabase/db-service';
import { ShoppingCart, Eye, Package } from 'lucide-react';

export default async function AdminOrdersPage() {
  const orders = await DBService.getAllOrders();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Toutes les Commandes Nationales</h1>
        <p className="text-xs text-slate-400 mt-1">
          Commandes réelles passées par les clientes sur toute la Côte d'Ivoire.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="font-bold text-white text-base font-heading">
            Aucune commande enregistrée pour le moment
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Dès qu'une cliente passera une commande sur la boutique en ligne, elle s'affichera immédiatement ici avec son numéro de commande et son reçu de paiement.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">N° Commande</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Destinataire</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6">Total Payé</th>
                  <th className="py-4 px-6">Moyen</th>
                  <th className="py-4 px-6">Statut Livraison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-extrabold text-white">
                      {o.order_number}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-slate-200 font-medium">
                      {o.customer_name || o.delivery_address?.full_name || 'Cliente'}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {o.delivery_address?.commune || o.delivery_address?.city || 'Côte d\'Ivoire'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-emerald-400">
                      {o.total_amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                        {o.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'delivered' || o.status === 'receipt_confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'shipped' || o.status === 'out_for_delivery'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {o.status === 'delivered' || o.status === 'receipt_confirmed'
                          ? 'Livrée'
                          : o.status === 'shipped' || o.status === 'out_for_delivery'
                          ? 'En cours'
                          : 'En préparation'}
                      </span>
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
