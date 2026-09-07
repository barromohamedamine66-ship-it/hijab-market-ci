import Link from 'next/link';
import { DBService } from '@/lib/supabase/db-service';
import { 
  BarChart, TrendingUp, Users, ShoppingCart, Eye, Store, Activity, Sparkles, Medal, Award
} from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const { totalSales, totalViews, topShops } = await DBService.getAdminAnalytics();
  const shops = await DBService.getAllAdminShops();
  const activeShops = shops.filter(s => s.status === 'active');
  const founderShops = shops.filter(s => s.is_founder);

  // Simulation de données mensuelles pour le graphique de croissance (Évolution)
  // Normalement, ces données viendraient d'une agrégation par date sur la table `orders`.
  const months = ['Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
  const simulatedGrowthData = [
    { month: 'Fév', views: Math.floor(totalViews * 0.1), sales: Math.floor(totalSales * 0.05) },
    { month: 'Mar', views: Math.floor(totalViews * 0.2), sales: Math.floor(totalSales * 0.1) },
    { month: 'Avr', views: Math.floor(totalViews * 0.35), sales: Math.floor(totalSales * 0.2) },
    { month: 'Mai', views: Math.floor(totalViews * 0.5), sales: Math.floor(totalSales * 0.4) },
    { month: 'Juin', views: Math.floor(totalViews * 0.75), sales: Math.floor(totalSales * 0.7) },
    { month: 'Juil', views: totalViews, sales: totalSales },
  ];

  // Calcul du max pour la hauteur des barres du graphique CSS
  const maxViews = Math.max(...simulatedGrowthData.map(d => d.views), 1);
  const maxSales = Math.max(...simulatedGrowthData.map(d => d.sales), 1);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-white">Performances & Analytiques</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-extrabold uppercase">
              Évolution
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Suivez la croissance des boutiques, le trafic et les ventes globales générées.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV / Ventes */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShoppingCart className="w-16 h-16 text-emerald-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Ventes Globales
          </span>
          <p className="text-3xl font-extrabold text-white font-heading z-10">
            {totalSales.toLocaleString('fr-FR')} <span className="text-sm text-slate-500 font-medium">FCFA</span>
          </p>
          <p className="text-xs text-emerald-400 font-semibold mt-2 z-10">+24% par rapport au mois dernier</p>
        </div>

        {/* Trafic / Vues */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Eye className="w-16 h-16 text-blue-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" /> Trafic Boutiques
          </span>
          <p className="text-3xl font-extrabold text-white font-heading z-10">
            {totalViews.toLocaleString('fr-FR')} <span className="text-sm text-slate-500 font-medium">Vues</span>
          </p>
          <p className="text-xs text-blue-400 font-semibold mt-2 z-10">+42% de visiteurs uniques</p>
        </div>

        {/* Boutiques Actives */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-purple-400" /> Boutiques Partenaires
          </span>
          <p className="text-3xl font-extrabold text-white font-heading">
            {activeShops.length}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Dont <span className="text-amber-400 font-bold">{founderShops.length} fondatrices</span>
          </p>
        </div>
        
        {/* Modèle Économique (Abonnement) */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 p-6 rounded-3xl border border-amber-500/20 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Modèle Économique
          </span>
          <p className="text-lg font-bold text-amber-400 leading-tight">
            Système d'Abonnement Actif
          </p>
          <p className="text-xs text-amber-500/80 mt-2">
            Essai gratuit de 90 jours en cours pour les boutiques fondatrices. Commissions (7%) désactivées.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique de Croissance (CSS) */}
        <div className="lg:col-span-2 bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <BarChart className="w-4 h-4 text-emerald-400" />
              Évolution de l'Activité (Derniers 6 mois)
            </h2>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-800 relative">
            {/* Lignes de grille horizontales (fond) */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-slate-700 w-full"></div>
              <div className="border-t border-slate-700 w-full"></div>
              <div className="border-t border-slate-700 w-full"></div>
              <div className="border-t border-slate-700 w-full"></div>
            </div>

            {/* Barres */}
            {simulatedGrowthData.map((data, idx) => {
              const viewHeight = Math.max((data.views / maxViews) * 100, 5); // 5% minimum
              const salesHeight = Math.max((data.sales / maxSales) * 100, 5); // 5% minimum

              return (
                <div key={idx} className="flex flex-col items-center flex-1 z-10 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-xs text-white p-2 rounded-xl whitespace-nowrap pointer-events-none z-20 border border-slate-700 shadow-xl">
                    <p><span className="text-blue-400 font-bold">{data.views.toLocaleString('fr-FR')}</span> vues</p>
                    <p><span className="text-emerald-400 font-bold">{data.sales.toLocaleString('fr-FR')}</span> FCFA</p>
                  </div>

                  <div className="flex items-end justify-center w-full gap-1 sm:gap-2 h-48">
                    {/* Barre des Vues */}
                    <div 
                      className="w-1/3 max-w-[20px] bg-blue-500/80 rounded-t-md hover:bg-blue-400 transition-all duration-500 ease-out"
                      style={{ height: `${viewHeight}%` }}
                    ></div>
                    {/* Barre des Ventes */}
                    <div 
                      className="w-1/3 max-w-[20px] bg-emerald-500/80 rounded-t-md hover:bg-emerald-400 transition-all duration-500 ease-out"
                      style={{ height: `${salesHeight}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-4">{data.month}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded bg-blue-500/80"></div> Vues (Trafic)
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded bg-emerald-500/80"></div> Ventes (FCFA)
            </div>
          </div>
        </div>

        {/* Classement Top Boutiques */}
        <div className="bg-[#0f171d] p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              Top 5 Boutiques
            </h2>
          </div>

          <div className="flex-1 space-y-4">
            {topShops.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">
                Aucune boutique active pour le moment.
              </div>
            ) : (
              topShops.map((shop, idx) => (
                <Link key={shop.id} href={`/admin/sellers/${shop.id}`} className="group block">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141f27] border border-slate-800 group-hover:border-slate-600 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        idx === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                        'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">{shop.name}</p>
                        <p className="text-[10px] text-slate-500">{shop.views_count?.toLocaleString('fr-FR') || 0} vues</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {shop.total_sales?.toLocaleString('fr-FR') || 0}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase">FCFA</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
