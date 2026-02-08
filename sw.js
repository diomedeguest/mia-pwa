const CACHE_NAME = 'diomede-luxury-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './menu.html',
  './regole.html',
  './trasporti.html',
  './contatti.html',
  './convenzioni.html',
  './dettagli.html',
  './istruzioni.html',
  './regole.html',
  './convenzioni.html',
  './trasporti.html',
  './turismo.html',
  './checkout.html',
  './wifi.html',
  './servizi.json',
  './manifest.json',
  // Aggiungi qui i loghi e le immagini se hanno nomi diversi
  './dettagli_logo.png',
  './logo.png',
  './logo_ccheckout.png',
  './logo_contatti.png',
  './logo_convenzioni.png',
  './logo_istruzioni.png',
  './logo_regole.png',
  './logo_trasporti.png',
  './logo_turismo.png',
  './logo_wifi.png',
  './logo_menu.png',
  './molo33.png',
  './calemone.png'
];

// Installazione: crea il database di cache e salva i file
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Attivazione: pulisce le vecchie versioni della cache
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
    })
  );
});

// Intercettazione richieste: serve i file dalla cache se offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});