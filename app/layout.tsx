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
    default: 'HIJAB MARKET CI — Toutes les boutiques de hijabs en un seul endroit',
    template: '%s | HIJAB MARKET CI',
  },
  description:
    'Découvrez la plus grande marketplace multi-vendeurs de hijabs en Côte d\'Ivoire. Des centaines de boutiques vérifiées, des milliers de produits de qualité.',
  manifest: '/manifest.json',
  keywords: ['hijab', 'marketplace', 'boutique hijab', 'vente hijab', 'mode hijab', 'Côte d\'Ivoire', 'Abidjan', 'abaya', 'foulard'],
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
