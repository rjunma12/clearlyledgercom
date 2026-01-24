/**
 * Service Worker for ClearlyLedger
 * Caches PDF.js worker and critical assets for offline-first processing
 */

const CACHE_NAME = 'clearlyledger-v1';
const PDF_WORKER_CACHE = 'pdf-worker-v1';

// Critical assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
];

// PDF.js worker URL pattern
const PDF_WORKER_PATTERN = /cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\/.+\/pdf\.worker\.min\.js/;

// Tesseract.js assets pattern
const TESSERACT_PATTERN = /unpkg\.com\/tesseract\.js/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== PDF_WORKER_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Handle PDF.js worker - Cache First strategy
  if (PDF_WORKER_PATTERN.test(url)) {
    event.respondWith(
      caches.open(PDF_WORKER_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version, update in background
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
            }).catch(() => {});
            return cachedResponse;
          }
          
          // Not cached, fetch and cache
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle Tesseract.js assets - Cache First strategy
  if (TESSERACT_PATTERN.test(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle navigation requests - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  // Default: Network First with cache fallback for same-origin requests
  if (new URL(url).origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful GET requests
          if (event.request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For all other requests, just fetch
  event.respondWith(fetch(event.request));
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Prefetch PDF worker on demand
  if (event.data && event.data.type === 'PREFETCH_PDF_WORKER') {
    const workerUrl = event.data.url;
    caches.open(PDF_WORKER_CACHE).then((cache) => {
      cache.match(workerUrl).then((cached) => {
        if (!cached) {
          fetch(workerUrl).then((response) => {
            if (response.ok) {
              cache.put(workerUrl, response);
            }
          });
        }
      });
    });
  }
});
