'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, MessageCircle, Store } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'Boutiques vérifiées' },
  { icon: MessageCircle, label: 'Commande sur WhatsApp' },
  { icon: Store, label: 'Retrait en boutique' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf9f6] via-white to-emerald-50 pt-8 pb-20 md:pt-16 md:pb-28">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center lg:text-left lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left */}
          <div className="space-y-7">
            {/* Localisation badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Pilote lancé à Bouaké · Côte d&apos;Ivoire
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 font-heading leading-tight tracking-tight">
                HIJAB MARKET <span className="text-emerald-600">CI</span>
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mt-2">
                Les boutiques de mode modeste,<br className="hidden sm:block" /> réunies au même endroit.
              </p>
            </div>

            {/* Signature */}
            <p className="text-base md:text-lg text-gray-500 font-medium italic border-l-4 border-emerald-500 pl-4">
              « Découvrez. Comparez. Commandez. »
            </p>

            <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Parcourez les catalogues des boutiques physiques de Bouaké.
              Choisissez vos hijabs, abayas et tenues modestes.
              Commandez et récupérez directement en boutique.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/stores"
                id="hero-discover-stores-btn"
                className="btn btn-primary btn-lg group"
              >
                Découvrir les boutiques
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/devenir-vendeur"
                id="hero-vendor-btn"
                className="btn btn-secondary btn-lg"
              >
                Je suis une boutique
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              {badges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-xs text-gray-600">
                  <badge.icon className="w-4 h-4 text-emerald-600" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative hidden lg:flex items-center justify-center h-[480px]">
            {/* Main card */}
            <div className="relative w-80 h-[390px] bg-gradient-to-b from-gray-950 via-gray-900 to-emerald-950 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/30 overflow-hidden rotate-2 hover:rotate-0 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.35)] mb-4">
                <img
                  src="/logo.png"
                  alt="HIJAB MARKET CI Logo officiel"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <p className="text-xl font-bold font-heading text-white leading-tight">HIJAB MARKET CI</p>
              <p className="text-emerald-400 text-xs font-medium tracking-wider uppercase mt-1">
                Toutes les boutiques<br />en un seul endroit
              </p>
              <div className="mt-4 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                🏙️ Pilote Bouaké
              </div>

              {/* Decorative glows */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Floating cards */}
            <div className="absolute top-8 -left-6 bg-white rounded-2xl shadow-lg p-3 border border-gray-100 -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">🧕</div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Hijab Soie</p>
                  <p className="text-emerald-600 font-bold text-xs">5 500 FCFA</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-4 bg-white rounded-2xl shadow-lg p-3 border border-gray-100 rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-xl">🏪</div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Retrait boutique</p>
                  <p className="text-gray-500 text-xs">Bouaké Centre</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mt-10 max-w-md mx-auto lg:hidden">
          <Link
            href="/products"
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-3.5 shadow-sm hover:shadow-md transition text-sm text-gray-400 font-medium"
          >
            <span className="text-gray-400">🔍</span>
            Que recherchez-vous ?
          </Link>
        </div>
      </div>
    </section>
  );
}

