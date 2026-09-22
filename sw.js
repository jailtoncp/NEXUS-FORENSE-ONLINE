const CACHE_NAME = "nexus-forense-v3";
const BASE_URL = new URL(".", self.registration.scope).pathname;
const STATIC_ASSETS = ["manifest.json", "favicon.svg", "icon-192.png", "icon-512.png"].map(
  (asset) => `${BASE_URL}${asset}`
);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isAppCode = url.origin === self.location.origin &&
    (url.pathname.endsWith(".html") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css"));
  if (isAppCode) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
