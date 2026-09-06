import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { 
  Store, Package, ShoppingCart, TrendingUp, Users, ArrowUpRight, 
  Clock, CheckCircle, AlertTriangle, ShieldCheck, Tag, Award, Sparkles
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const shops = await DBService.getAllAdminShops();
  const products = await DBService.getProducts();
  const categories = await DBService.getCategories(true);
  const plans = await DBService.getSubscriptionPlans();

  const founderShops = shops.filter(s => s.is_founder);
  const activeShops = shops.filter(s => s.status === 'active');
  const activeCategories = categories.filter(c => c.is_active);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-white">Tableau de Bord Général</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              Mode Modeste CI
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Supervision de la marketplace, des 11 catégories dynamiques et des boutiques fondatrices.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/categories"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Gérer Catégories ({activeCategories.length})
          </Link>
          <Link
            href="/admin/subscriptions"
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Boutiques Fondatrices ({founderShops.length}/30)
          </Link>
          <Link
            href="/admin/sellers"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            Boutiques ({shops.length})
          </Link>
        </div>
      </div>

      {/* KPI Stats Réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Boutiques Fondatrices */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Boutiques Fondatrices</span>
          <p className="text-2xl font-extrabold text-amber-400 font-heading">
            {founderCountText(founderShops.length)}
          </p>
          <p className="text-xs text-amber-300/80 font-semibold mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 90 jours d'accès offert
          </p>
        </div>

        {/* Catégories Actives */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Rayons Officiels</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-heading">
            {activeCategories.length} catégories
          </p>
          <p className="text-xs text-slate-400 mt-2">100% dynamiques Supabase</p>
        </div>

        {/* Boutiques Actives */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Boutiques Partenaires</span>
          <p className="text-2xl font-extrabold text-white font-heading">{activeShops.length} actives</p>
          <p className="text-xs text-emerald-400 font-semibold mt-2">Vendeuses certifiées</p>
        </div>

        {/* Articles au catalogue */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Articles en Vente</span>
          <p className="text-2xl font-extrabold text-white font-heading">{products.length} articles</p>
          <p className="text-xs text-slate-400 mt-2">Catalogue modeste & traditionnel</p>
        </div>
      </div>

      {/* Grid: Rayons Actifs & Boutiques Partenaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aperçu des 11 Catégories */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              Rayons de la Marketplace
            </h2>
            <Link href="/admin/categories" className="text-xs text-emerald-400 font-bold hover:underline">
              Gérer tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {activeCategories.slice(0, 9).map((cat) => (
              <div key={cat.id} className="p-3 bg-[#141f27] rounded-2xl border border-slate-800/80 flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-semibold text-slate-200 line-clamp-1">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Boutiques Récentes */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Boutiques Enregistrées
            </h2>
            <Link href="/admin/sellers" className="text-xs text-emerald-400 font-bold hover:underline">
              Voir tout ({shops.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {shops.slice(0, 4).map((s) => (
              <div key={s.id} className="p-3.5 rounded-2xl bg-[#141f27] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{s.name}</span>
                    {s.is_founder && (
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">
                        Fondatrice
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {s.commune || 'Abidjan'} • WhatsApp : {s.whatsapp || s.phone || 'Non renseigné'}
                  </p>
                </div>

                <Link
                  href={`/boutique/${s.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function founderCountText(count: number) {
  return `${count} / 30`;
}
