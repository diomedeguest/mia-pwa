const CACHE_NAME = 'diomede-luxury-v27';

// Percorsi corretti basati sulle tue cartelle reali
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './sfondo.png',
  './assets/css/style.css',
  // Immagini (cartella assets/images)
  './assets/images/header.png',
  './assets/images/logo_start.png',
  './assets/images/logomenu.png',
  './assets/images/menu.png',
  './assets/images/asciugatrice.png',
  './assets/images/lavatrice.png',
  './assets/images/cassaforte.png',
  './assets/images/idromassaggio.png',
  './assets/images/calemone.png',
  './assets/images/sfondo.png',
  './assets/images/logowelcome.png',
  './assets/images/molo33.png',
  // Pagine (cartella pages)
  './pages/menu.html',
  './pages/regole.html',
  './pages/trasporti.html',
  './pages/contatti.html',
  './pages/convenzioni.html',
  './pages/dettagli.html',
  './pages/istruzioni.html',
  './pages/turismo.html',
  './pages/checkout.html',
  './pages/wifi.html',
  // Sottocartelle
  './pages/istruzioni/asciugatrice.html',
  './pages/istruzioni/caffe.html',
  './pages/istruzioni/cassaforte.html',
  './pages/istruzioni/idromassaggio.html',
  './pages/istruzioni/induzione.html',
  './pages/istruzioni/lavatrice.html',
  './pages/partners/bar.html',
  './pages/partners/beauty.html',
  './pages/partners/lavanderia.html',
  './pages/partners/ristoranti.html',
  './pages/partners/stores.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Caricamento tollerante: non fallisce se un file è mancante
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});