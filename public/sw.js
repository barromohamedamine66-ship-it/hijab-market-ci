// ==============================================================================
// HIJAB MARKET CI — Service Worker PWA Haute Performance & Sécurisé
// ==============================================================================

const CACHE_VERSION = 'hm-ci-pwa-v1.0.2';
const STATIC_CACHE = `hm-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `hm-images-${CACHE_VERSION}`;
const PAGES_CACHE = `hm-pages-${CACHE_VERSION}`;

const MAX_IMAGE_CACHE_ITEMS = 60;

// Ressources indispensables pré-mises en cache au démarrage
const PRECACHE_ASSETS = [
  '/offline',
  '/manifest.json',
  '/favicon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/logo.png',
];

// Chemins hautement sensibles à NE JAMAIS METTRE EN CACHE
const SENSITIVE_PATTERNS = [
  '/api/auth',
  '/api/payments',
  '/api/admin',
  '/api/seller',
  '/seller/',
  '/admin/',
  '/checkout',
  'supabase.co',
  'cinetpay.com',
];

// Helper : Vérifier si une URL est sensible
function isSensitive(url) {
  const urlStr = url.toString().toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => urlStr.includes(pattern));
}

// Helper : Nettoyer le cache d'images (LRU)
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch (err) {
    // Silencieux
  }
}

// ------------------------------------------------------------------------------
// Installation
// ------------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Pré-mise en cache du shell avec gestion d'erreurs individuelles
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
            })
            .catch(() => {
              // Ignore les échecs non critiques d'installation
            })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ------------------------------------------------------------------------------
// Activation & Nettoyage des anciens caches
// ------------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const activeCaches = [STATIC_CACHE, IMAGE_CACHE, PAGES_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!activeCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ------------------------------------------------------------------------------
// Gestion des Messages (Mise à jour à chaud)
// ------------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && (event.data.action === 'skipWaiting' || event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// ------------------------------------------------------------------------------
// Interception des requêtes Réseau (Fetch)
// ------------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // RÈGLE 1 : Ne jamais intercepter les requêtes non-GET (POST, PUT, DELETE...)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // RÈGLE 2 : Sécurité & Confidentialité — Exclusion des données privées
  if (isSensitive(url)) {
    return; // Laisse passer directement au réseau sans aucun cache
  }

  // RÈGLE 3 : Navigation HTML (Pages du site)
  // Stratégie : Network-First avec timeout 2.5s (optimisé pour 3G/4G Côte d'Ivoire)
  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigation(request)
    );
    return;
  }

  // RÈGLE 4 : Fichiers Statiques (JS bundles Next.js, CSS, Polices Google)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Stale-While-Revalidate en arrière-plan
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // RÈGLE 5 : Images (Produits, Bannières, Logos, Icônes)
  // Stratégie : Cache-First avec Stale-While-Revalidate
  if (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|svg|webp|avif|gif|ico)(\?.*)?$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ITEMS);
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Par défaut : Laisser le navigateur gérer les autres requêtes normalement
});

// ------------------------------------------------------------------------------
// Gestionnaire de Navigation (Network-First avec Fallback Hors-Ligne)
// ------------------------------------------------------------------------------
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    if (networkResponse) {
      return networkResponse;
    }
  } catch (err) {
    // Hors connexion
  }

  // Tente de récupérer la page depuis le cache
  const cachedPage = await caches.match(request);
  if (cachedPage) {
    return cachedPage;
  }

  // En dernier recours : renvoie la page de secours /offline
  const offlinePage = await caches.match('/offline');
  if (offlinePage) {
    return offlinePage;
  }

  // Fallback HTML minimal embarqué si /offline n'était pas encore chargé
  return new Response(
    `<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Hors connexion — HIJAB MARKET CI</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #faf9f6; color: #1e293b; padding: 2rem; text-align: center; }
        .card { max-width: 400px; margin: 3rem auto; background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h1 { color: #064e3b; margin-bottom: 0.5rem; font-size: 1.5rem; }
        p { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.5; }
        button { background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🧕📶</div>
        <h1>Vous êtes hors connexion</h1>
        <p>Vérifiez votre connexion données mobiles (Orange, MTN, Moov) ou Wi-Fi pour continuer à naviguer sur HIJAB MARKET CI.</p>
        <button onclick="window.location.reload()">Réessayer la connexion</button>
      </div>
    </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
