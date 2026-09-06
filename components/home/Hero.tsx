import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Produits disponibles' },
  { value: '50+', label: 'Boutiques vérifiées' },
  { value: '10K+', label: 'Clientes satisfaites' },
];

const badges = [
  { icon: ShieldCheck, label: 'Boutiques vérifiées' },
  { icon: Star, label: 'Avis authentiques' },
  { icon: Truck, label: 'Livraison rapide' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-beige-100 via-white to-emerald-50 pt-8 pb-20 md:pt-16 md:pb-32">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-beige-200 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-7 animate-fade-in">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              ✨ Le 1<sup>er</sup> Portail de Mode Modeste & Traditionnelle en Côte d'Ivoire
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 font-heading leading-tight tracking-tight">
                HIJAB MARKET <span className="text-emerald-600">CI</span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-gray-800 mt-1">
                La Marketplace de Référence du Modest Wear Ivoirien
              </p>
            </div>

            {/* Slogan */}
            <p className="text-base md:text-xl text-gray-600 font-medium italic border-l-4 border-emerald-500 pl-4">
              « Hijabs, Abayas, Boubous & Tenues Traditionnelles,<br />toutes les boutiques réunies en un seul endroit. »
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg">
              Soie de Médine, mousseline, abayas Dubaï, boubous en Bazin riche Getzner brodé, ensembles mastour et accessoires. Commandez directement auprès des créatrices sur WhatsApp, sans intermédiaire !
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" id="hero-discover-btn" className="btn btn-primary btn-lg group">
                Explorer le Catalogue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link href="/devenir-vendeur" id="hero-vendor-btn" className="btn btn-secondary btn-lg">
                Ouvrir ma Boutique (90j Offerts)
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Boutiques Vérifiées
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Contact Direct WhatsApp
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-emerald-600" />
                Livraison Abidjan & Intérieur
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px]">
            {/* Main card */}
            <div className="relative w-84 h-[410px] bg-gradient-to-b from-gray-950 via-gray-900 to-emerald-950 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(16,185,129,0.25)] border border-emerald-500/30 overflow-hidden rotate-2 hover:rotate-0 transition-all duration-500 flex flex-col items-center justify-between p-6">
              <div className="w-full flex justify-between items-center z-10">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide">
                  ✨ Identité Officielle
                </span>
                <span className="text-xs text-amber-400 font-bold">100% Vérifié</span>
              </div>
              
              <div className="relative my-auto flex flex-col items-center z-10">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <img
                    src="/logo.png"
                    alt="HIJAB MARKET CI Logo officiel"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <p className="text-xl font-bold font-heading text-white mt-4 tracking-tight">HIJAB MARKET CI</p>
                <p className="text-emerald-400 text-xs font-medium tracking-wider uppercase">Toutes les boutiques en un seul endroit</p>
              </div>

              {/* Decorative glows */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Floating product cards */}
            <div className="absolute top-4 -left-8 card p-3 shadow-lg -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-beige-100 flex items-center justify-center text-2xl">🌸</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Hijab Soie</p>
                  <p className="text-emerald-600 font-bold text-sm">5 500 XOF</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 -right-4 card p-3 shadow-lg rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">⭐</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Top vendeur</p>
                  <p className="text-gray-500 text-xs">Boutique Fatou</p>
                </div>
              </div>
            </div>

            {/* Stats pill */}
            <div className="absolute -bottom-2 left-0 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Aujourd'hui</p>
              <div className="flex gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-emerald-600 font-heading">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 lg:hidden">
          {stats.map((s) => (
            <div key={s.label} className="text-center card p-4">
              <p className="text-2xl font-bold text-emerald-600 font-heading">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
