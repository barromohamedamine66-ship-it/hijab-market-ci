import { DBService } from '@/lib/supabase/db-service';
import { Package, CheckCircle2, Ban } from 'lucide-react';

export default async function AdminProductsPage() {
  const products = await DBService.getProducts();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Modération des Produits</h1>
        <p className="text-xs text-slate-400 mt-1">Supervisez l'ensemble des articles proposés à la vente sur la marketplace.</p>
      </div>

      <div className="bg-[#0f171d] rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141f27] border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Produit</th>
                <th className="py-4 px-6">Boutique</th>
                <th className="py-4 px-6">Prix</th>
                <th className="py-4 px-6">Catégorie</th>
                <th className="py-4 px-6">Statut Modération</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-6">
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[11px] text-slate-400">{p.material}</span>
                  </td>
                  <td className="py-4 px-6 text-emerald-400 font-semibold">
                    {p.store?.name || 'Boutique Partenaire'}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-white">
                    {p.price.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {p.category?.name || 'Soie de Médine'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      Conforme & En Ligne
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-bold transition">
                      Désactiver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
