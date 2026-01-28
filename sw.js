const CACHE_NAME = "diomede-v5";

const ASSETS = [
  "index.html",
  "manifest.json",
  "documento.pdf",
  "icona.png",
  // Librerie PDF.js necessarie per il funzionamento offline
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf_viewer.min.css"
];

// Installazione: salva i file nella cache
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione: cancella la vecchia cache e forza l'aggiornamento
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Rimozione vecchia cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch: serve i file dalla cache se offline
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});