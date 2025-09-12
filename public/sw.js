// Service Worker for Twisted Fairytale Halloween Bash
const CACHE_NAME = 'twisted-halloween-v3';
const STATIC_ASSETS = [
  '/hero-poster.jpg',
  '/costumeWalk.mp4',
  '/pongCupsTrophy.mp4',
  '/twistedTailsFood.mp4',
  '/img/goldilocks-thumb.jpg',
  '/img/jack-thumb.jpg',
  '/img/snowwhite-thumb.jpg',
  '/img/goldilocks-teaser.jpg',
  '/img/jack-teaser.jpg',
  '/img/snowwhite-teaser.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - enhanced SPA handling and auth-safe network-first
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // For navigations (HTML), use network-first to avoid stale app shells
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // Network first for auth routes to avoid token consumption issues and caching
  if (url.pathname.includes('/auth') || url.pathname.includes('/verify') || url.pathname.includes('/callback')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for other requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Only cache successful, same-origin, non-HTML responses
            const contentType = response.headers.get('content-type') || '';
            if (response && response.status === 200 && response.type === 'basic' && !contentType.includes('text/html')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Fallback: try cache match
            return caches.match(event.request);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => (cacheName !== CACHE_NAME ? caches.delete(cacheName) : Promise.resolve()))
      );
      await self.clients.claim();
      
      // Notify all clients about the new service worker
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED', cacheName: CACHE_NAME });
      });
    })()
  );
});
