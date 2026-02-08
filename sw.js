const CACHE_NAME = 'diomede-luxury-v4'; // Cambiato nome per forzare aggiornamento

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './logo_start.png',
  './manifest.json',
  './assets/menu.html',
  './assets/regole.html',
  './assets/trasporti.html',
  './assets/contatti.html',
  './assets/convenzioni.html',
  './assets/dettagli.html',
  './assets/istruzioni.html',
  './assets/turismo.html',
  './assets/checkout.html',
  './assets/wifi.html',
  './assets/servizi.json',
  './assets/dettagli_logo.png',
  './assets/logo_checkout.png',
  './assets/logo_contatti.png',
  './assets/logo_convenzioni.png',
  './assets/logo_istruzioni.png',
  './assets/logo_regole.png',
  './assets/logo_trasporti.png',
  './assets/logo_turismo.png',
  './assets/logo_wifi.png',
  './assets/logo_menu.png',
  './assets/molo33.png',
  './assets/calemone.png'
];

// Installazione migliorata: non blocca se un file manca
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aperta, salvataggio file...');
      // Proviamo a caricare i file uno per uno così se uno manca gli altri passano
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      ).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});