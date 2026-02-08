const cacheName = 'diomede-v1';
const assets = [
  '/',
  '/index.html',
  '/wifi.html',
  '/convenzioni.html',
  '/checkout.html',
  '/istruzioni.html',
  '/contatti.html',
  '/manifest.json',
  '/assets/logo.svg',
  '/assets/wifi.svg',
  '/assets/regole.svg',
  '/assets/istruzioni.svg',
  '/assets/trasporti.svg',
  '/assets/vedere.svg',
  '/assets/convenzioni.svg',
  '/assets/checkout.svg',
  '/assets/casa.svg',
  '/assets/contatti.svg'
];

// Installa il Service Worker e salva i file in cache
self.addEventListener('install', e => {
  e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

// Serve i contenuti dalla cache se sei offline
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});