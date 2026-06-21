const CACHE = "kosmetik-baku-v5";
const ASSETS = ["/", "/styles.css", "/app.js", "/product-images.js", "/manifest.webmanifest", "/assets/icon.svg", "/assets/hero-beauty.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => cached || fetch(event.request).catch(() => cache.match("/")))
    )
  );
});
