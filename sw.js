const CACHE_NAME = 'diomede-luxury-v4'; // Cambiato nome per forzare aggiornamento

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './logo_start.png',
  './manifest.json',
  './assets/pages/menu.html',
  './assets/documents/idromassaggio.pdf',
  './assets/documents/cassaforte.pdf',
  './assets/documents/cucina.pdf',
  './assets/pages/regole.html',
  './assets/pages/trasporti.html',
  './assets/pages/contatti.html',
  './assets/pages/convenzioni.html',
  './assets/pages/dettagli.html',
  './assets/pages/istruzioni.html',
  './assets/pages/turismo.html',
  './assets/pages/checkout.html',
  './assets/pages/wifi.html',
  './assets/servizi.json',
  './assets/images/dettagli_logo.png',
  './assets/images/logo_checkout.png',
  './assets/images/logo_contatti.png',
  './assets/images/logo_convenzioni.png',
  './assets/images/logo_istruzioni.png',
  './assets/images/logo_regole.png',
  './assets/images/logo_trasporti.png',
  './assets/images/logo_turismo.png',
  './assets/images/header.png',
  './assets/images/logo_menu.png',
  './assets/images/molo33.png',
  './assets/images/calemone.png'
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