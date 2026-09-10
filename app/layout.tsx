import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import TopBanner from '@/components/layout/TopBanner';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import PwaRegistry from '@/components/pwa/PwaRegistry';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  applicationName: 'HIJAB MARKET CI',
  title: {
    default: 'HIJAB MARKET CI — Les boutiques de mode modeste, réunies au même endroit',
    template: '%s | HIJAB MARKET CI',
  },
  description:
    'Découvrez, comparez et commandez vos hijabs, abayas et tenues modestes auprès des boutiques physiques de Bouaké et de toute la Côte d\'Ivoire. Retrait en boutique ou livraison.',
  manifest: '/manifest.json',
  keywords: [
    'hijab', 'abaya', 'mode modeste', 'boutique hijab', 'hijab Bouaké',
    'hijab Côte d\'Ivoire', 'marketplace hijab', 'tenue modeste', 'bazin',
    'boubou femme', 'mode islamique Côte d\'Ivoire', 'Bouaké mode'
  ],
  authors: [{ name: 'HIJAB MARKET CI' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HIJAB MARKET',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  metadataBase: new URL('https://hijabmarket.ci'),
  openGraph: {
    title: 'HIJAB MARKET CI — Découvrez. Comparez. Commandez.',
    description: 'Toutes les boutiques de mode modeste de Bouaké et de Côte d\'Ivoire, réunies au même endroit. Hijabs, abayas, bazins et tenues chics avec retrait boutique ou livraison.',
    type: 'website',
    locale: 'fr_CI',
    siteName: 'HIJAB MARKET CI',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'HIJAB MARKET CI — Marketplace Mode Modeste',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HIJAB MARKET CI — Mode Modeste & Lifestyle',
    description: 'Les boutiques de mode modeste de Bouaké et de Côte d\'Ivoire, réunies au même endroit.',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=80'],
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
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HIJAB MARKET" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fcfaf6] text-gray-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-16 md:pb-0 overflow-x-hidden">
        <Providers>
          {/* PWA Lifecycle, Registration and Prompts */}
          <PwaRegistry />

          {/* Top announcements & interactive role switcher */}
          <TopBanner />

          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Native-like Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Floating WhatsApp Support 24/7 */}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
