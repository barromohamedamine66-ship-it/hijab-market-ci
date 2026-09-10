import Link from 'next/link';
import { Store, Camera, TrendingUp, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: Store,
    title: 'Votre boutique en ligne',
    description: 'Une vitrine digitale professionnelle avec lien partageable sur WhatsApp, Instagram et Facebook.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    icon: Camera,
    title: 'Nous créons votre catalogue',
    description: "L'équipe Hijab Market CI peut venir photographier vos produits et créer vos fiches. Vous n'avez rien à faire.",
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    icon: TrendingUp,
    title: 'Commandes mesurées',
    description: 'Chaque commande générée via la plateforme est tracée. Vous voyez exactement combien Hijab Market vous rapporte.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    icon: ShieldCheck,
    title: 'Badge Boutique Vérifiée',
    description: 'Vos clientes voient que votre boutique est officielle et vérifiée par Hijab Market CI.',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
];

export default function JoinAsBoutique() {
  return (
    <section id="devenir-boutique" className="py-20 md:py-28 bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-full text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Offre de Lancement — Pilote Bouaké
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading leading-tight mb-4">
            Vous avez une boutique physique ?<br />
            <span className="text-emerald-400">Devenez visible en ligne.</span>
          </h2>
          <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
            Hijab Market CI digitalise votre boutique. Vous fournissez vos produits et prix, 
            nous créons votre vitrine en ligne. Vos clientes commandent, vous vendez.
          </p>
        </div>

        {/* Offer Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl p-6 sm:p-8 text-center mb-12 shadow-2xl border border-emerald-400/30">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div>
              <p className="text-emerald-100 text-sm font-semibold mb-1">Offre Spéciale Boutiques Fondatrices</p>
              <p className="text-white text-3xl sm:text-4xl font-black">60 JOURS GRATUITS</p>
              <p className="text-emerald-100 text-sm mt-1">0 FCFA d&apos;abonnement • 0% de commission pendant la période de lancement</p>
            </div>
            <div className="h-px sm:h-16 w-16 sm:w-px bg-emerald-400/40" />
            <div className="text-center">
              <p className="text-emerald-100 text-xs mb-1">Objectif pilote</p>
              <p className="text-white font-black text-xl">30 boutiques</p>
              <p className="text-white font-black text-xl">500 produits</p>
              <p className="text-emerald-100 text-xs mt-1">à Bouaké</p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${benefit.color}`}>
                <benefit.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* How it works for seller */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 mb-12">
          <h3 className="text-white font-bold text-lg text-center mb-8">
            Comment nous digitalisons votre boutique
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '1', title: 'Vous nous contactez', desc: 'Via WhatsApp ou le formulaire. On prend rendez-vous à Bouaké.', emoji: '📞' },
              { step: '2', title: 'On crée votre catalogue', desc: "Photos, fiches produits, prix, tailles et couleurs. On s&apos;occupe de tout.", emoji: '📸' },
              { step: '3', title: 'Votre boutique est en ligne', desc: 'Un lien partageable. Vos clientes commandent directement.', emoji: '🚀' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-2xl flex items-center justify-center mb-3">
                  {item.emoji}
                </div>
                <p className="text-xs text-emerald-400 font-bold mb-1">Étape {item.step}</p>
                <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/2250152182840?text=Bonjour%2C%20je%20souhaite%20rejoindre%20Hijab%20Market%20CI%20avec%20ma%20boutique%20de%20Bouak%C3%A9"
            target="_blank"
            rel="noopener noreferrer"
            id="join-whatsapp-btn"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-xl transition active:scale-95"
          >
            <span className="text-lg">💬</span>
            Nous contacter sur WhatsApp
          </a>
          <Link
            href="/devenir-vendeur"
            id="join-vendor-btn"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition"
          >
            En savoir plus sur l&apos;offre
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          🏙️ Pilote lancé à <strong className="text-gray-400">Bouaké</strong> — Extension prévue vers Yamoussoukro, Korhogo et Abidjan
        </p>
      </div>
    </section>
  );
}
