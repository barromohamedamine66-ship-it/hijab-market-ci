'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, MessageCircle, Store, Sparkles, HeartHandshake } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'Boutiques vérifiées & Sérieuses' },
  { icon: MessageCircle, label: 'Commande direct WhatsApp & Wave' },
  { icon: Store, label: 'Retrait en boutique & Livraison' },
  { icon: HeartHandshake, label: 'Éthique & Confiance Islamique' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-islamic-pattern pt-8 pb-20 md:pt-14 md:pb-24 border-b border-amber-100/60">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-200/30 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center lg:text-left lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
          {/* Left */}
          <div className="space-y-6">
            {/* Islamic greeting badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm border border-amber-400/40">
                <span>بِسْمِ ٱللَّٰهِ</span>
                <span className="text-emerald-300">·</span>
                <span>Mode Modeste & Lifestyle Halal</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Côte d&apos;Ivoire · Abidjan & Bouaké</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-gray-950 font-heading leading-[1.15] tracking-tight">
                L’Élégance Modeste & Islamique <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600">Réunie</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-medium text-gray-700 mt-2.5">
                Toutes vos boutiques de hijabs, abayas, qamis, gourdes isothermes & lifestyle en un seul clic.
              </p>
            </div>

            {/* Signature */}
            <p className="text-sm md:text-base text-gray-600 font-medium italic border-l-4 border-amber-400 bg-amber-50/50 py-1.5 pl-3.5 rounded-r-lg">
              « Découvrez les collections modestes des meilleures créatrices et boutiques de Côte d'Ivoire. »
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Trouvez facilement vos voiles en Soie de Médine, robes de fête, bazins riches Getzner, muscs orientaux, gourdes bien-être et cadeaux islamiques. Commandez en direct avec paiement sécurisé ou WhatsApp.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1">
              <Link
                href="/products"
                id="hero-discover-stores-btn"
                className="btn btn-primary btn-lg group shadow-md shadow-emerald-900/10"
              >
                Explorer le Catalogue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/stores"
                id="hero-stores-btn"
                className="btn btn-outline btn-lg bg-white/90 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-800"
              >
                🏬 Voir les Boutiques
              </Link>
              <Link
                href="/devenir-vendeur"
                id="hero-vendor-btn"
                className="btn btn-secondary btn-lg hidden xl:inline-flex"
              >
                ✨ Vendre sur la plateforme
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 justify-center lg:justify-start pt-2">
              {badges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-xs text-gray-700 font-medium bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 shadow-xs">
                  <badge.icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual & Cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[500px]">
            {/* Main card */}
            <div className="relative w-80 h-[410px] bg-gradient-to-b from-gray-950 via-[#0a1e1b] to-emerald-950 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4),0_0_35px_rgba(212,175,55,0.2)] border border-amber-400/30 overflow-hidden rotate-1 hover:rotate-0 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-4 bg-gray-900 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="HIJAB MARKET CI Logo officiel"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <p className="text-xl font-bold font-heading text-white leading-tight">HIJAB MARKET <span className="text-amber-400">CI</span></p>
              <p className="text-amber-300 text-xs font-semibold tracking-wider uppercase mt-1">
                La Place de Marché Modeste & Halal
              </p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold">
                🇨🇮 Abidjan · Bouaké · Toute la CI
              </div>

              {/* Decorative glows */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Floating cards */}
            <div className="absolute top-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-amber-100 -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">🧕</div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Hijab Soie de Médine</p>
                  <p className="text-emerald-700 font-bold text-xs">5 500 FCFA</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 -left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-amber-100 -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">🍼</div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Gourde Inox Bismillah</p>
                  <p className="text-amber-600 font-bold text-xs">9 500 FCFA</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 -right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-emerald-100 rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">👑</div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Abaya Dubaï Brodée</p>
                  <p className="text-emerald-700 font-bold text-xs">28 000 FCFA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mt-8 max-w-md mx-auto lg:hidden">
          <Link
            href="/products"
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-3.5 shadow-sm hover:shadow-md transition text-sm text-gray-400 font-medium"
          >
            <span className="text-gray-400">🔍</span>
            <span>Rechercher un hijab, une abaya, une gourde...</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

