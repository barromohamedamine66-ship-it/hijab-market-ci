'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Store,
  Sparkles,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Users,
  Award,
  Crown,
  Zap,
} from 'lucide-react';

export default function DevenirVendeurPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#064e3b] via-[#043d2e] to-[#022c22] text-white py-20 px-4 sm:px-6">
          {/* Subtle gold decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Campagne Officielle de Lancement 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Ouvrez Votre Boutique sur le 1<sup>er</sup> Portail de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
                Mode Modeste & Traditionnelle
              </span>{' '}
              en Côte d'Ivoire
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
              Hijabs, Abayas, Boubous femme & homme en Bazin, Ensembles mastour, Accessoires & Parfumerie.
              Vendez sans commission intermédiaire et recevez vos commandes clientes directement sur WhatsApp !
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register/vendor"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-sm shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Store className="w-5 h-5 text-gray-950" />
                Créer ma Boutique Vendeur (Essai 90 jours Offert)
                <ArrowRight className="w-4 h-4 text-gray-950" />
              </Link>

              <a
                href="#formules"
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition flex items-center justify-center"
              >
                Découvrir les Formules
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left text-xs">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <span className="text-amber-300 font-extrabold block text-base">0 F</span>
                <span className="text-emerald-200/80 text-[11px]">Commission sur commandes</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <span className="text-amber-300 font-extrabold block text-base">100% Direct</span>
                <span className="text-emerald-200/80 text-[11px]">Sur votre WhatsApp</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <span className="text-amber-300 font-extrabold block text-base">Wave & OM</span>
                <span className="text-emerald-200/80 text-[11px]">Paiement direct à vous</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                <span className="text-amber-300 font-extrabold block text-base">90 Jours</span>
                <span className="text-emerald-200/80 text-[11px]">Gratuits pour pionniers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Programme Boutiques Fondatrices (Gold Card) */}
        <section className="py-14 px-4 container max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-emerald-500/10 border-2 border-amber-300/60 rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold">
                  <Award className="w-4 h-4 text-amber-600" />
                  Programme Exclusif « Boutiques Fondatrices »
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-snug">
                  Rejoignez les 30 Premières Boutiques Modestes et Traditionnelles de Côte d'Ivoire
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Pour célébrer le lancement de notre nouvelle plateforme dédiée à la mode modeste et aux tenues traditionnelles, nous offrons aux 30 premières boutiques inscrites un statut privilégié à vie.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>90 jours d'essai 100% GRATUIT</strong> sans engagement ni carte bancaire</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Badge officiel <strong>« 🎖️ Boutique Fondatrice »</strong> sur votre profil</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Mise en avant prioritaire sur la page d’accueil et nos réseaux</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Assistance WhatsApp pour la publication de vos premiers articles</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-amber-200 shadow-sm text-center flex-shrink-0">
                <span className="text-3xl mb-2">🎖️</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Offre Pionnière</span>
                <span className="text-3xl font-extrabold text-amber-600 my-1">90 Jours</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-4">
                  100% Gratuit
                </span>
                <Link
                  href="/auth/register/vendor"
                  className="w-full px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow transition"
                >
                  Postuler Immédiatement
                </Link>
                <span className="text-[10px] text-gray-400 mt-2">Places limitées aux 30 premières boutiques</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi vendre sur HIJAB MARKET CI ? (4 Avantages Clés) */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="container max-w-5xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                Vos Avantages Commerciaux
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
                Pourquoi Développer vos Ventes avec HIJAB MARKET CI ?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Une plateforme conçue pour respecter votre liberté commerciale et amplifier votre visibilité auprès d'acheteurs ultra-ciblés.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avantage 1 */}
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  1. Commandes Directes sur Votre WhatsApp
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Finies les interfaces compliquées ! Lorsque le client clique sur votre article, il est instantanément redirigé vers votre discussion WhatsApp avec le nom du produit, la couleur et le prix déjà pré-remplis.
                </p>
              </div>

              {/* Avantage 2 */}
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  2. 0% de Commission sur Votre Chiffre d'Affaires
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Contrairement aux marketplaces traditionnelles qui prélèvent 15% à 25% sur chaque vente, nous ne prenons <strong>aucune commission</strong> sur vos commandes. Vous encaissez 100% de votre argent.
                </p>
              </div>

              {/* Avantage 3 */}
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  3. Une Audience 100% Qualifiée & Ciblée
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Chaque visiteur sur le site recherche expressément des hijabs en soie de Médine, des abayas Dubaï, des boubous en Bazin riche ou des vêtements mastour. Votre catalogue est vu par de vrais acheteurs prêts à commander.
                </p>
              </div>

              {/* Avantage 4 */}
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  4. Votre Vitrine Digitale Dédiée 24h/24
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Vous disposez d'une page boutique officielle personnalisée (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">hijabmarket.ci/boutique/votre-nom</code>) avec votre logo, vos coordonnées, vos horaires et l'ensemble de votre catalogue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Grille Tarifaire des Formules */}
        <section id="formules" className="py-16 px-4 container max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              Tarification Claire & Transparente
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
              Choisissez la Formule Adaptée à Votre Activité
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Des formules mensuelles sans engagement pour propulser votre boutique en ligne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formule Découverte */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
                  Formule Découverte
                </div>
                <h3 className="text-lg font-bold text-gray-900">Pour Débuter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">0 F</span>
                  <span className="text-xs text-gray-400">/ mois</span>
                </div>
                <p className="text-xs text-gray-500">
                  Idéal pour tester la marketplace et publier ses premiers articles sans frais.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Jusqu’à <strong>5 articles</strong> en ligne</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Lien boutique personnalisé</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Commandes directes WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Support standard par email</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register/vendor"
                className="w-full py-3 text-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
              >
                Démarrer Gratuitement
              </Link>
            </div>

            {/* Formule Business (Populaire) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-emerald-600 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-300" /> Le Plus Populaire
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  Formule Business
                </div>
                <h3 className="text-lg font-bold text-gray-900">Boutiques Actives</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-600">15 000 F</span>
                  <span className="text-xs text-gray-400">/ mois</span>
                </div>
                <p className="text-xs text-gray-500">
                  Pour les créatrices et boutiques régulières qui souhaitent un catalogue complet et vérifié.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Articles <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Badge <strong>Vendeur Vérifié officiel</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Mise en avant dans les catégories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Statistiques des visites et clics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Support prioritaire 7j/7 WhatsApp</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register/vendor"
                className="w-full py-3 text-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition"
              >
                Choisir la Formule Business
              </Link>
            </div>

            {/* Formule Premium VIP */}
            <div className="p-6 rounded-3xl bg-white border border-amber-300 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                  Formule Premium VIP
                </div>
                <h3 className="text-lg font-bold text-gray-900">Visibilité Maximale</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-amber-600">30 000 F</span>
                  <span className="text-xs text-gray-400">/ mois</span>
                </div>
                <p className="text-xs text-gray-500">
                  Pour les marques et créateurs d’exception souhaitant dominer les ventes en Côte d'Ivoire.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Tout le pack Business inclus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Badge <strong>Boutique VIP</strong> en tête</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Bannière sur la page d’accueil</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Campagnes sponsorisées sur nos réseaux</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Conseiller dédié joignable 24h/24</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register/vendor"
                className="w-full py-3 text-center rounded-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs shadow transition"
              >
                Devenir Boutique VIP
              </Link>
            </div>
          </div>
        </section>

        {/* Comment ça marche en 3 étapes simples */}
        <section className="py-16 bg-gray-50 border-t border-gray-200/60">
          <div className="container max-w-4xl mx-auto px-4 space-y-12 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Simple & Rapide</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
                Comment Ouvrir Votre Boutique en 3 Étapes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  1
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Créez votre compte vendeuse</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Renseignez le nom de votre boutique, votre commune et votre numéro WhatsApp en moins de 2 minutes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  2
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Ajoutez vos articles</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Téléchargez les photos de vos hijabs, abayas ou boubous, définissez vos prix et précisez les matières.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  3
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Recevez vos commandes</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Les clientes vous contactent directement sur WhatsApp pour convenir de la livraison et régler leur achat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Vendeurs */}
        <section className="py-16 container max-w-3xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Foire Aux Questions des Vendeuses</h2>
            <p className="text-xs text-gray-500">Tout ce que vous devez savoir pour démarrer sereinement.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Comment les clientes me paient-elles ?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Les clientes vous paient directement selon vos préférences habituelles : Wave, Orange Money, MTN Mobile Money, Moov Money ou paiement en espèces à la livraison. HIJAB MARKET CI ne retient aucun fonds.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Qui gère la livraison des colis ?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Vous gérez vos expéditions avec vos livreurs habituels à Abidjan et compagnies de car pour l'intérieur. Nous pouvons également vous mettre en relation avec nos coursiers partenaires de confiance.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Comment fonctionne l'essai gratuit de 90 jours ?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Dans le cadre du Programme Boutiques Fondatrices, vous bénéficiez de 90 jours complets d'accès gratuit à la marketplace sans engagement. Vous pouvez tester la plateforme et réaliser vos premières ventes en toute sérénité.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white py-14 px-4 text-center">
          <div className="container max-w-3xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Prête à donner une nouvelle dimension à votre boutique ?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xl mx-auto">
              Rejoignez dès maintenant les créatrices et boutiques de mode modeste en Côte d'Ivoire.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/register/vendor"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-sm shadow-xl transition transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-gray-950" />
                Rejoindre le Programme Boutiques Fondatrices
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
