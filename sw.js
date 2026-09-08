const CACHE_NAME = 'diomede-v123';

const CORE_ASSETS = [
  "./assets/video/letto-scomparsa-cartoon-realistico-framebyframe.mp4",
  "./assets/images/letto-video-poster-realistico.jpg",

  "./assets/images/letto-step-1-def.jpg",
  "./assets/images/letto-step-2-def.jpg",
  "./assets/images/letto-step-3-def.jpg",

  "./assets/images/letto-step-1-pulito.jpg",
  "./assets/images/letto-step-2-pulito.jpg",
  "./assets/images/letto-step-3-pulito.jpg",

  "./assets/images/letto-passaggio-1-tenue.jpg",
  "./assets/images/letto-passaggio-2-tenue.jpg",
  "./assets/images/letto-passaggio-3-tenue.jpg",

  "./assets/images/letto-mobile-chiuso-illustrazione.jpg",
  "./assets/images/letto-step-apertura-illustrazione.jpg",
  "./assets/images/letto-step-discesa-illustrazione.jpg",
  "./assets/images/letto-mobile-aperto-illustrazione.jpg",

  "./assets/images/letto-mobile-chiuso-disegno.jpg",
  "./assets/images/letto-step-1-disegno.jpg",
  "./assets/images/letto-step-2-disegno.jpg",
  "./assets/images/letto-step-3-disegno.jpg",
  "./assets/images/letto-mobile-aperto-disegno.jpg",

  "./pages/istruzioni/letto-scomparsa.html",\n  "./assets/images/letto-mobile-chiuso.jpg",\n  "./assets/images/letto-mobile-aperto.jpg",\n  "./assets/images/letto-step-1.jpg",\n  "./assets/images/letto-step-2.jpg",\n  "./assets/images/letto-step-3.jpg",\n
  "./assets/images/logo-transparent.png",
  "./",
  "./assets/css/style.css",
  "./assets/images/armadio-servizio.png",
  "./assets/images/asciugatrice.png",
  "./assets/images/caffe_americano.png",
  "./assets/images/caffe_espresso.png",
  "./assets/images/calemone.png",
  "./assets/images/cantine-risveglio.png",
  "./assets/images/cassaforte.png",
  "./assets/images/depuratore-hydrazon.png",
  "./assets/images/friggitrice_aria.png",
  "./assets/images/header.png",
  "./assets/images/idromassaggio-comandi-acqua-en.png?v=69",
  "./assets/images/idromassaggio-comandi-acqua.png?v=69",
  "./assets/images/idromassaggio-manuale-en.png?v=69",
  "./assets/images/idromassaggio-manuale-it.png?v=69",
  "./assets/images/lavatrice.png",
  "./assets/images/microonde.png",
  "./assets/images/molo33.png",
  "./assets/images/piano_induzione.png",
  "./assets/images/wifi_qr.png",
  "./assets/images/work.png",
  "./index.html",
  "./logo.png",
  "./logo_start.png",
  "./logowelcome.png",
  "./manifest.json",
  "./pages/checkout.html",
  "./pages/contatti.html",
  "./pages/convenzioni.html",
  "./pages/dettagli.html",
  "./pages/istruzioni.html",
  "./pages/istruzioni/armadio-servizio.html",
  "./pages/istruzioni/asciugatrice.html",
  "./pages/istruzioni/caffe-americano.html",
  "./pages/istruzioni/caffe-espresso.html",
  "./pages/istruzioni/cassaforte.html",
  "./pages/istruzioni/depuratore.html",
  "./pages/istruzioni/friggitrice.html",
  "./pages/istruzioni/ghiaccio.html",
  "./pages/istruzioni/idromassaggio.html",
  "./pages/istruzioni/induzione.html",
  "./pages/istruzioni/lavatrice.html",
  "./pages/istruzioni/microonde.html",
  "./pages/menu.html",
  "./pages/partners/bar.html",
  "./pages/partners/beauty.html",
  "./pages/partners/lavanderia.html",
  "./pages/partners/ristoranti.html",
  "./pages/partners/stores.html",
  "./pages/regole.html",
  "./pages/trasporti.html",
  "./pages/turismo.html",
  "./pages/wifi.html",
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./pages/menu.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
