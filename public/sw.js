/* public/sw.js — deterministic updates + offline fallback */
const VERSION = "e95d010";
const CACHE_STATIC = `gg-static-${VERSION}`;
const CACHE_RUNTIME = `gg-runtime-${VERSION}`;

const OFFLINE_URL = "/offline.html";
const MANIFEST_URL = "/manifest.webmanifest";
const FLAGS_URL = "/gg-flags.json";
const FLAGS_TTL_MS = 60 * 1000;

let flagsCache = {
  ts: 0,
  value: { sw: { enabled: true }, release: VERSION },
};

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

function normalizeFlags(data) {
  const enabled = !(data && data.sw && data.sw.enabled === false);
  const release = data && typeof data.release === "string" ? data.release : VERSION;
  return { sw: { enabled }, release };
}

async function fetchFlags(force) {
  const now = Date.now();
  if (!force && flagsCache && flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
    return flagsCache.value;
  }
  try {
    const res = await fetch(FLAGS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("flags http");
    const data = await res.json();
    const value = normalizeFlags(data);
    flagsCache = { ts: now, value };
    return value;
  } catch (e) {
    return flagsCache && flagsCache.value ? flagsCache.value : { sw: { enabled: true }, release: VERSION };
  }
}

async function disableSelf() {
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  list.forEach((client) => {
    try { client.postMessage({ type: "GG_SW_DISABLED" }); } catch (e) {}
  });
  try { await self.registration.unregister(); } catch (e) {}
}

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
    const debug = await hasDebugClient();
    if (debug) console.log("[gg-sw]", "install");
    try {
      const cache = await caches.open(CACHE_STATIC);
      for (const url of PRECACHE_URLS) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`http ${res.status}`);
          await cache.put(url, res.clone());
        } catch (e) {
          if (debug) console.log("[gg-sw]", "install skip", url, String(e));
        }
      }
    } catch (e) {
      if (debug) console.log("[gg-sw]", "install cache open failed", String(e));
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (await hasDebugClient()) console.log("[gg-sw]", "activate");
    const flags = await fetchFlags(true);
    if (flags && flags.sw && flags.sw.enabled === false) {
      await disableSelf();
      return;
    }
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

  if (path === FLAGS_URL) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  event.respondWith((async () => {
    const flags = await fetchFlags(false);
    if (flags && flags.sw && flags.sw.enabled === false) {
      await disableSelf();
      return fetch(req, { cache: "no-store" });
    }

    if (path.startsWith("/assets/latest/")) {
      log(url, "assets/latest network-only", path);
      return fetch(req, { cache: "no-store" });
    }

    if (path.startsWith("/assets/v/") || path.startsWith("/gg-pwa-icon/")) {
      return cacheFirst(req, CACHE_STATIC, url);
    }

    if (path === MANIFEST_URL || path === OFFLINE_URL) {
      return staleWhileRevalidate(req, CACHE_STATIC, url);
    }

    async function offlineFallback() {
      try {
        const cache = await caches.open(CACHE_STATIC);
        const offline = await cache.match(OFFLINE_URL);
        if (offline) return offline;
      } catch (e) {}
      try {
        const res = await fetch(OFFLINE_URL, { cache: "no-store" });
        if (res && res.ok) return res;
      } catch (e) {}
      return new Response(
        "<!doctype html><title>Offline</title><h1>Offline</h1><p>Offline fallback unavailable.</p>",
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (req.mode === "navigate") {
      log(url, "navigate network-first", path);
      try {
        return await fetch(req);
      } catch (e) {
        return await offlineFallback();
      }
    }

    return fetch(req);
  })());
});
