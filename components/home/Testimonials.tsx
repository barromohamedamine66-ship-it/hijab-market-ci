import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aminata K.',
    role: 'Cliente',
    emoji: '👩🏿',
    text: 'J\'ai trouvé le hijab parfait pour mon mariage en 5 minutes. La qualité est exceptionnelle et la livraison était rapide !',
    rating: 5,
    date: 'il y a 2 jours',
  },
  {
    id: 2,
    name: 'Fatoumata D.',
    role: 'Vendeuse — Boutique Fatou',
    emoji: '👩🏿‍💼',
    text: 'Depuis que j\'ai ouvert ma boutique sur HIJAB MARKET CI, mes ventes ont triplé. La plateforme est très simple à utiliser.',
    rating: 5,
    date: 'il y a 1 semaine',
  },
  {
    id: 3,
    name: 'Mariame T.',
    role: 'Cliente fidèle',
    emoji: '🧕🏿',
    text: 'Enfin une plateforme dédiée aux hijabs en Côte d\'Ivoire ! Les boutiques sont sérieuses et les produits correspondent aux photos.',
    rating: 5,
    date: 'il y a 3 jours',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-african-pattern relative border-b border-gray-100">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            💬 Avis Vérifiés
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 font-heading">
            Ce qu'elles disent de nous
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            La confiance de milliers de clientes et créatrices en Côte d'Ivoire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white/95 backdrop-blur-sm rounded-3xl border border-amber-100/70 p-6 relative shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-amber-200/60 absolute top-5 right-5" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-emerald-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-950 text-sm">{t.name}</p>
                    <p className="text-xs text-emerald-700 font-semibold">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 italic">
                  « {t.text} »
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
