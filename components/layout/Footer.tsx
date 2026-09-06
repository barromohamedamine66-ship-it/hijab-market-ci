import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Heart, MessageCircle } from 'lucide-react';

const footerLinks = {
  parcourir: [
    { label: 'Tous les produits', href: '/products' },
    { label: 'Boutiques', href: '/stores' },
    { label: 'Catégories', href: '/#categories' },
    { label: 'Nouveautés', href: '/products?sort=newest' },
    { label: 'Promotions', href: '/products?sort=discount' },
  ],
  vendeurs: [
    { label: 'Devenir vendeur (Offre 90j)', href: '/devenir-vendeur' },
    { label: 'Espace vendeur', href: '/seller/dashboard' },
    { label: 'Formules & Tarifs', href: '/devenir-vendeur#formules' },
    { label: 'Support WhatsApp', href: 'https://wa.me/2250152182840' },
  ],
  legal: [
    { label: 'À propos', href: '/about' },
    { label: 'CGU', href: '/terms' },
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 py-12 border-b border-emerald-700/50">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-heading mb-3">
            Vous créez ou vendez de la Mode Modeste & Traditionnelle ?
          </h2>
          <p className="text-emerald-100 mb-6 text-base max-w-2xl mx-auto">
            Hijabs, Abayas, Boubous Bazin, Ensembles mastour... Rejoignez notre réseau de boutiques et vendez sans commission !
          </p>
          <Link href="/devenir-vendeur" className="btn bg-amber-400 text-gray-950 hover:bg-amber-300 font-extrabold btn-lg shadow-lg">
            Ouvrir ma boutique (Essai 90 jours offert)
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-xl bg-gray-950 overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:border-emerald-400 transition duration-300 flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="HIJAB MARKET CI Logo officiel"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div>
                <span className="text-white text-xl font-bold font-heading">
                  HIJAB MARKET <span className="text-emerald-400">CI</span>
                </span>
                <p className="text-xs text-gray-500 font-medium">Portail Mode Modeste & Traditionnelle CI</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Le premier portail multi-boutiques dédié à la mode modeste, mastour et traditionnelle en Côte d'Ivoire. Qualité, authenticité et élégance garanties.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="mailto:support@hijabmarket.ci" className="hover:text-white transition">
                  support@hijabmarket.ci
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="tel:+2250777393813" className="hover:text-white transition font-semibold text-white">
                  +225 07 77 39 38 13
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/2250152182840?text=Bonjour%20Service%20Client%20HIJAB%20MARKET%20CI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition font-semibold text-emerald-400"
                >
                  WhatsApp : 01 52 18 28 40
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition"
                  aria-label="Réseau social"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Parcourir</h4>
            <ul className="space-y-3">
              {footerLinks.parcourir.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-emerald-400 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Vendeurs</h4>
            <ul className="space-y-3">
              {footerLinks.vendeurs.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-emerald-400 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Informations</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-emerald-400 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© {year} HIJAB MARKET CI. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Fait avec <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> en Côte d'Ivoire
          </p>
        </div>
      </div>
    </footer>
  );
}
