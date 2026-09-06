import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import TopBanner from '@/components/layout/TopBanner';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export const metadata: Metadata = {
  title: {
    default: 'HIJAB MARKET CI — Toutes les boutiques de hijabs en un seul endroit',
    template: '%s | HIJAB MARKET CI',
  },
  description:
    'Découvrez la plus grande marketplace multi-vendeurs de hijabs en Côte d\'Ivoire. Des centaines de boutiques vérifiées, des milliers de produits de qualité.',
  keywords: ['hijab', 'marketplace', 'boutique hijab', 'vente hijab', 'mode hijab', 'Côte d\'Ivoire', 'Abidjan'],
  authors: [{ name: 'HIJAB MARKET CI' }],
  openGraph: {
    title: 'HIJAB MARKET CI',
    description: 'Toutes les boutiques de hijabs, en un seul endroit.',
    type: 'website',
    locale: 'fr_CI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fcfaf6] text-gray-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Providers>
          {/* Top announcements & interactive role switcher */}
          <TopBanner />

          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Floating WhatsApp Support 24/7 */}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
