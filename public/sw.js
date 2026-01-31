/* public/sw.js — app-like, safe for Blogger */
const CACHE_STATIC = "gg-static-v2";
const CACHE_PAGES  = "gg-pages-v2";
const OFFLINE_URL  = "/offline.html";

// Batas cache halaman (biar tidak bengkak)
const MAX_PAGE_ENTRIES = 40;

const sameOrigin = (u) => u.origin === self.location.origin;

const isVersionedAsset = (path) =>
  path.startsWith("/assets/v/") || path.startsWith("/gg-pwa-icon/");

// Jangan cache URL yang “sensitif” / bisa bikin komentar & tracking aneh
const isSensitive = (url) => {
  const p = url.pathname;
  const sp = url.searchParams;

  // feed, search, dan parameter komentar
  if (p.startsWith("/feeds/")) return true;
  if (p.startsWith("/search")) return true;
  if (sp.has("showComment")) return true;
  if (sp.has("commentPage")) return true;

  return false;
};

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // hapus paling lama sampai <= maxEntries
  while (keys.length > maxEntries) {
    await cache.delete(keys.shift());
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC);
    await cache.addAll([OFFLINE_URL]);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k === CACHE_STATIC || k === CACHE_PAGES) return null;
      return caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (!sameOrigin(url)) return;

  // 1) Cache-first untuk asset versioned & icons
  if (isVersionedAsset(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_STATIC);
      const hit = await cache.match(req);
      if (hit) return hit;

      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  // 2) Navigasi HTML: stale-while-revalidate (feel seperti app)
  if (req.mode === "navigate") {
    if (isSensitive(url)) return; // jangan disentuh

    event.respondWith((async () => {
      const cache = await caches.open(CACHE_PAGES);
      const cached = await cache.match(req);

      // fetch terbaru di belakang layar
      const refresh = (async () => {
        try {
          const res = await fetch(req);
          const ct = res.headers.get("content-type") || "";
          if (res.ok && ct.includes("text/html")) {
            await cache.put(req, res.clone());
            await trimCache(CACHE_PAGES, MAX_PAGE_ENTRIES);
          }
          return res;
        } catch (e) {
          return null;
        }
      })();

      // kalau ada cache: instant, sambil refresh
      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }

      // kalau belum ada cache: network, kalau gagal → offline.html
      const net = await refresh;
      if (net) return net;

      const offline = await caches.open(CACHE_STATIC).then(c => c.match(OFFLINE_URL));
      return offline || new Response("Offline", { status: 503 });
    })());
  }
});
