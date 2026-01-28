const CACHE_NAME = "diomede-v1";
const ASSETS = ["index.html", "manifest.json", "documento.pdf", "icona.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => {
    if (k !== CACHE_NAME) return caches.delete(k);
  }))));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});