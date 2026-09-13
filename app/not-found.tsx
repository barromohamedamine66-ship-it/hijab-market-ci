import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Home, ShoppingBag, Store, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1 container py-16 max-w-md mx-auto text-center px-4 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-5xl shadow-inner animate-bounce">
          🧕
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            Erreur 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
            Page introuvable
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            La page ou l&apos;article que vous recherchez n&apos;existe pas ou a été déplacé vers une nouvelle adresse.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Accueil
          </Link>

          <Link
            href="/products"
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" /> Articles
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200/60 w-full flex items-center justify-center gap-4 text-xs font-semibold text-gray-600">
          <Link href="/stores" className="hover:text-emerald-600 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" /> Nos boutiques
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-emerald-600">
            À propos
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-emerald-600">
            Contact
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
