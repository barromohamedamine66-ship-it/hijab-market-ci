import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DBService } from '@/lib/supabase/db-service';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export default async function FavoritesPage() {
  const products = await DBService.getProducts({ limit: 4 });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />
      
      <main className="container py-10 flex-1 max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Mes Favoris ❤️</h1>
            <p className="text-xs text-gray-500 mt-1">Vos hijabs, abayas et accessoires enregistrés</p>
          </div>
          <Link href="/products" className="btn btn-secondary btn-sm">
            Explorer le catalogue
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-emerald-200 transition">
              <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl relative">
                🧕
                <span className="absolute top-3 right-3 text-red-500 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                  ❤️
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    {p.store?.name || 'Boutique Vérifiée'}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{p.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <span className="font-extrabold text-sm text-gray-900">{p.price.toLocaleString('fr-FR')} FCFA</span>
                  <Link href={`/products/${p.slug}`} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition">
                    Voir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
