const CACHE_NAME = 'diomede-luxury-v3'; // Incrementata versione
const ASSETS_TO_CACHE = [
  './',
  './welcome.html', // Assicurati che la tua pagina di benvenuto si chiami così
  './manifest.json',
  './logo.png',
  './logo_start.png',
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
  // Loghi e Icone
  './assets/dettagli_logo.png',
  './assets/logo_checkout.png', // Corretto refuso 'ccheckout'
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

// Installazione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usiamo addAll ma con un catch per evitare che un solo file mancante blocchi tutto
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn("Errore cache assets:", err));
    })
  );
});

// Attivazione e pulizia vecchia cache
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

// Strategia: Cache first, poi Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});