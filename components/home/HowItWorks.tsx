import { Search, Sparkles, MessageCircle, Truck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Explorez les boutiques',
    description:
      'Parcourez les rayons : hijabs, abayas Dubaï, boubous femme & homme, ensembles mastour. Aucun compte client n’est requis.',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Choisissez votre tenue',
    description:
      'Consultez les photos réelles, le tissu, les couleurs et les dimensions disponibles chez nos boutiques vérifiées.',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Commandez sur WhatsApp',
    description:
      'Cliquez sur "Commander via WhatsApp". Votre message pré-rempli s’ouvre directement avec la boutique vendeuse.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: Truck,
    step: '04',
    title: 'Livraison & Paiement Direct',
    description:
      'Convenez de l’adresse de livraison avec le vendeur et réglez en direct via Wave, Orange Money ou à la livraison.',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
];

export default function HowItWorks() {
  return (
    <section id="faq" className="section bg-gray-950">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-3">Simple, Rapide & Sans Frais</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">
            Comment commander sur HIJAB MARKET CI ?
          </h2>
          <p className="text-gray-400 mt-3 text-lg max-w-xl mx-auto">
            Trouvez les plus belles tenues modiques et traditionnelles et échangez directement avec les boutiques.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-800 z-0 -ml-0" />
              )}

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 ${step.lightColor} rounded-2xl flex items-center justify-center mx-auto mb-5 relative`}>
                  <step.icon className={`w-8 h-8 ${step.textColor}`} />
                  <span className={`absolute -top-2 -right-2 w-6 h-6 ${step.color} text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-heading mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/products"
            className="btn bg-emerald-500 hover:bg-emerald-400 text-white btn-lg"
          >
            Découvrir le Catalogue 🛍️
          </a>
          <a
            href="/devenir-vendeur"
            className="btn btn-outline border-amber-400 text-amber-300 hover:bg-amber-950/40 btn-lg"
          >
            🎖️ Rejoindre comme Boutique Fondatrice
          </a>
        </div>
      </div>
    </section>
  );
}
