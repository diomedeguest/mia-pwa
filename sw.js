const CACHE_NAME = 'diomede-luxury-v5'; // Incrementato a v5 per forzare il refresh

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './welcome.html',
  './logo.png',
  './logo_start.png',
  './sfondo.png',
  './logowelcome.png',
  './manifest.json',
  './assets/pages/menu.html',
  './assets/pages/regole.html',
  './assets/pages/trasporti.html',
  './assets/pages/contatti.html',
  './assets/pages/convenzioni.html',
  './assets/pages/dettagli.html',
  './assets/pages/istruzioni.html',
  './assets/pages/turismo.html',
  './assets/pages/checkout.html',
  './assets/pages/wifi.html',
  './assets/images/header.png'
];

// Installazione: scarica i nuovi file
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      ).then(() => self.skipWaiting());
    })
  );
});

// Attivazione: elimina le vecchie cache (v1, v2, v3, v4)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Elimino vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia: Stale-while-revalidate
// Serve il file dalla cache ma aggiorna la cache in background se c'è rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});