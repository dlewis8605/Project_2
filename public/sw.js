const CACHE_NAME = 'aura-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/submit.html',
  '/favorites.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/pwa.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js',
  'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Install Event - cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip caching for API calls (handle with network only or network-first with no cache write, but let's do network only for safety)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a offline JSON message if API request fails
        return new Response(
          JSON.stringify({ offline: true, message: 'You are currently offline. This action is unavailable.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Cache-First strategy for static assets and CDNs
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // If response is valid, clone and save in cache (dynamic caching)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return index.html if navigating to a page that isn't cached
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
