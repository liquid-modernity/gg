/* public/sw.js — deterministic updates + offline fallback */
const VERSION = "X-046";
const CACHE_STATIC = `gg-static-${VERSION}`;
const CACHE_RUNTIME = `gg-runtime-${VERSION}`;

const OFFLINE_URL = "/offline.html";
const MANIFEST_URL = "/manifest.webmanifest";

const ICON_URLS = [
  "/gg-pwa-icon/android-icon-144x144.png",
  "/gg-pwa-icon/android-icon-192x192.png",
  "/gg-pwa-icon/android-icon-36x36.png",
  "/gg-pwa-icon/android-icon-48x48.png",
  "/gg-pwa-icon/android-icon-512x512.png",
  "/gg-pwa-icon/android-icon-72x72.png",
  "/gg-pwa-icon/android-icon-96x96.png",
  "/gg-pwa-icon/apple-icon-114x114.png",
  "/gg-pwa-icon/apple-icon-120x120.png",
  "/gg-pwa-icon/apple-icon-144x144.png",
  "/gg-pwa-icon/apple-icon-152x152.png",
  "/gg-pwa-icon/apple-icon-180x180.png",
  "/gg-pwa-icon/apple-icon-57x57.png",
  "/gg-pwa-icon/apple-icon-60x60.png",
  "/gg-pwa-icon/apple-icon-72x72.png",
  "/gg-pwa-icon/apple-icon-76x76.png",
  "/gg-pwa-icon/apple-icon-precomposed.png",
  "/gg-pwa-icon/apple-icon.png",
  "/gg-pwa-icon/favicon-16x16.png",
  "/gg-pwa-icon/favicon-32x32.png",
  "/gg-pwa-icon/favicon-96x96.png",
  "/gg-pwa-icon/favicon.ico",
  "/gg-pwa-icon/icon-192.png",
  "/gg-pwa-icon/icon-512.png",
  "/gg-pwa-icon/ms-icon-144x144.png",
  "/gg-pwa-icon/ms-icon-150x150.png",
  "/gg-pwa-icon/ms-icon-310x310.png",
  "/gg-pwa-icon/ms-icon-70x70.png",
];

const PRECACHE_URLS = [OFFLINE_URL, MANIFEST_URL, ...ICON_URLS];

const sameOrigin = (u) => u.origin === self.location.origin;
const isDebugUrl = (u) => u && u.searchParams.get("ggdebug") === "1";
const log = (u, ...args) => {
  if (isDebugUrl(u)) console.log("[gg-sw]", ...args);
};

async function hasDebugClient() {
  const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  return list.some((c) => {
    try {
      return new URL(c.url).searchParams.get("ggdebug") === "1";
    } catch {
      return false;
    }
  });
}

async function cacheFirst(req, cacheName, url) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) {
    log(url, "cache-first hit", url.pathname);
    return cached;
  }

  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName, url) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const refresh = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) {
    log(url, "swr hit", url.pathname);
    return cached;
  }

  const res = await refresh;
  if (res) return res;
  return new Response("Offline", { status: 503 });
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    if (await hasDebugClient()) console.log("[gg-sw]", "install");
    const cache = await caches.open(CACHE_STATIC);
    await cache.addAll(PRECACHE_URLS);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (await hasDebugClient()) console.log("[gg-sw]", "activate");
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k === CACHE_STATIC || k === CACHE_RUNTIME) return null;
      return caches.delete(k);
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  const data = event && event.data ? event.data : {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (!sameOrigin(url)) return;

  const path = url.pathname;

  if (path.startsWith("/assets/dev/")) {
    log(url, "assets/dev network-only", path);
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  if (path.startsWith("/assets/v/") || path.startsWith("/gg-pwa-icon/")) {
    event.respondWith(cacheFirst(req, CACHE_STATIC, url));
    return;
  }

  if (path === MANIFEST_URL || path === OFFLINE_URL) {
    event.respondWith(staleWhileRevalidate(req, CACHE_STATIC, url));
    return;
  }

  if (req.mode === "navigate") {
    log(url, "navigate network-first", path);
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (e) {
        const cache = await caches.open(CACHE_STATIC);
        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response("Offline", { status: 503 });
      }
    })());
  }
});
