const CACHE_NAME = 'diomede-v30';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './assets/css/style.css',
  './assets/images/header.png',
  './assets/images/logo_start.png',
  './assets/images/logomenu.png',
  './assets/images/menu.png',
  './assets/images/sfondo.png',
  './pages/menu.html',
  './pages/istruzioni.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Caricamento individuale: se un file manca, gli altri vengono salvati comunque
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});