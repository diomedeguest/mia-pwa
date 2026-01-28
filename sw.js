const CACHE_NAME = "diomede-v2"; // Ho aggiornato la versione

const ASSETS = [
  "index.html",
  "manifest.json",
  "documento.pdf",
  "icona.png",
  // Librerie necessarie per il nuovo visualizzatore PDF
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf_viewer.min.css"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => {
      console.log("Caching assets...");
      return c.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => 
      Promise.all(
        ks.map((k) => {
          if (k !== CACHE_NAME) {
            console.log("Cleaning old cache...");
            return caches.delete(k);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});