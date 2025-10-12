// Service Worker for Twisted Fairytale Halloween Bash
const CACHE_NAME = 'twisted-halloween-v5';
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
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const dest = (event.request as any).destination || '';

  // Always network-first for app shell and code assets to avoid stale bundles
  if (
    event.request.mode === 'navigate' ||
    ['script', 'style', 'worker', 'font'].includes(dest) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/assets/') ||
    url.pathname.startsWith('/src/')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Network-first for auth and callback routes
  if (url.pathname.includes('/auth') || url.pathname.includes('/verify') || url.pathname.includes('/callback')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for media only (images/video/audio)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (
            response && response.status === 200 && response.type === 'basic' &&
            (contentType.startsWith('image/') || contentType.startsWith('video/') || contentType.startsWith('audio/'))
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => caches.match(event.request));
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
