const CACHE_NAME = 'diomede-v10';

// Inserisci qui solo i file che sei SICURO esistano in quelle cartelle
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './assets/images/header.png',
  './assets/images/sfondo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});