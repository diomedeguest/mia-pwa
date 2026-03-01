const CACHE_NAME = 'diomede-luxury-v7'; // Incrementato a v7 per forzare l'aggiornamento della cache

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './welcome.html',
  './manifest.json',
  './sw.js',
  // LOGHI E SFONDI PRINCIPALI
  './logo.png',
  './logo_start.jpg',
  './header.png',
  './menu.png',
  './logomenu.jpg',
  // IMMAGINI SERVIZI E APPARTAMENTO
  './asciugatrice.png',
  './lavatrice.png',
  './cassaforte.jpg',
  './idromassaggio.jpg',
  './calemone.jpg',
  // PAGINE (Verifica che i percorsi siano corretti in base alla tua struttura cartelle)
  './pages/menu.html',
  './pages/regole.html',
  './pages/trasporti.html',
  './pages/contatti.html',
  './pages/convenzioni.html',
  './pages/dettagli.html',
  './pages/istruzioni.html',
  './pages/turismo.html',
  './pages/checkout.html',
  './pages/wifi.html'
];

// Installazione: scarica e memorizza tutti i file
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usiamo addAll per assicurarci che i file critici siano salvati
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Attivazione: elimina le vecchie versioni della cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME)
                  .map(cache => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia: Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Fallback se non c'è rete e il file non è in cache
          return cachedResponse;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});