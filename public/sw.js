/* public/sw.js — PWA Service Worker (browser) */
const CACHE = "gg-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // wajib: offline fallback harus ada di cache
    await cache.addAll([OFFLINE_URL]);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // hanya same-origin
  if (url.origin !== self.location.origin) return;

  // Cache-first untuk asset versioned dan ikon
  if (url.pathname.startsWith("/assets/v/") || url.pathname.startsWith("/gg-pwa-icon/")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;

      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // Navigasi HTML: network-first, offline fallback
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (e) {
        const cache = await caches.open(CACHE);
        const offline = await cache.match(OFFLINE_URL);
        if (offline) return offline;

        return new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })());
  }
});
