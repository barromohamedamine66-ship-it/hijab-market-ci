/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // ✅ Optimisation d'images activée (réduit la bande passante de ~70%)
    // Remplace unoptimized: true par des formats modernes (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
    // Cache des images optimisées (1 semaine)
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // ✅ Compression activée (réduit la taille des réponses JSON/HTML de ~60%)
  compress: true,
  // ✅ Headers de cache pour les assets statiques
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
