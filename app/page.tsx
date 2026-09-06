import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FeaturedStores from '@/components/home/FeaturedStores';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf6]">
      {/* Navbar with Official Logo */}
      <Navbar />

      {/* Hero with Radiant Logo Showcase */}
      <Hero />

      {/* Categories Grid */}
      <Categories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Verified Partner Stores in Abidjan */}
      <FeaturedStores />

      {/* How it Works (3 easy steps) */}
      <HowItWorks />

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Footer with Payment Methods and Official Logo */}
      <Footer />
    </div>
  );
}
