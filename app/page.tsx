export const dynamic = 'force-dynamic';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FeaturedStores from '@/components/home/FeaturedStores';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import JoinAsBoutique from '@/components/home/JoinAsBoutique';

// VideoStories et FlashSales sont conservés en fichiers mais désactivés pour le MVP
// Ils seront réactivés après validation du marché

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf6]">
      {/* Navbar */}
      <Navbar />

      {/* Hero — Positionnement Bouaké */}
      <Hero />

      {/* Catégories */}
      <Categories />

      {/* Produits vedettes */}
      <FeaturedProducts />

      {/* Boutiques partenaires */}
      <FeaturedStores />

      {/* Comment ça marche */}
      <HowItWorks />

      {/* Appel aux premières boutiques */}
      <JoinAsBoutique />

      {/* Témoignages */}
      <Testimonials />

      {/* Footer */}
      <Footer />
    </div>
  );
}
