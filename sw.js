/* public/sw.js — GG PWA offline/navigation cache contract */
(() => {
  'use strict';

  const RELEASE = 'ac33998';
  const TEMPLATE_FINGERPRINT = 'db5707fc3afa';
  const VERSION = `${RELEASE}-${TEMPLATE_FINGERPRINT}`;

  const CACHE_STATIC = `gg-static-${VERSION}`;
  const CACHE_PAGES = `gg-pages-${VERSION}`;
  const CACHE_FEEDS = `gg-feeds-${VERSION}`;
  const CACHE_RUNTIME = `gg-runtime-${VERSION}`;

  const OFFLINE_URL = '/offline.html';
  const MANIFEST_URL = '/manifest.webmanifest';
  const FLAGS_URL = '/gg-flags.json';
  const FLAGS_TTL_MS = 60 * 1000;

  const LATEST_ASSET_PREFIX = '/assets/latest/';
  const ACTIVE_ASSET_PREFIX = `/assets/v/${RELEASE}/`;

  const PRECACHE_URLS = [
    OFFLINE_URL,
    MANIFEST_URL,
    '/',
    '/landing',
    '/feeds/posts/default?alt=json&max-results=80'
  ];

  const ICON_URLS = [
    '/gg-pwa-icon/icon-192.png',
    '/gg-pwa-icon/icon-512.png',
    '/gg-pwa-icon/android-icon-192x192.png',
    '/gg-pwa-icon/android-icon-512x512.png',
    '/gg-pwa-icon/favicon-16x16.png',
    '/gg-pwa-icon/favicon-32x32.png',
    '/gg-pwa-icon/favicon-96x96.png',
    '/gg-pwa-icon/favicon.ico'
  ];

  let flagsCache = {
    ts: 0,
    value: { sw: { enabled: true }, release: RELEASE }
  };

  function sameOrigin(url) {
    return url.origin === self.location.origin;
  }

  function debugEnabled(url) {
    return url && url.searchParams && url.searchParams.get('ggdebug') === '1';
  }

  function log(url, ...args) {
    if (debugEnabled(url)) console.log('[gg-sw]', ...args);
  }

  function normalizeFlags(data) {
    const enabled = !(data && data.sw && data.sw.enabled === false);
    const release = data && typeof data.release === 'string' ? data.release : RELEASE;
    return { sw: { enabled }, release };
  }

  async function fetchFlags(force = false) {
    const now = Date.now();

    if (!force && flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
      return flagsCache.value;
    }

    try {
      const response = await fetch(FLAGS_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`flags http ${response.status}`);

      const value = normalizeFlags(await response.json());
      flagsCache = { ts: now, value };
      return value;
    } catch (error) {
      return flagsCache.value || { sw: { enabled: true }, release: RELEASE };
    }
  }

  async function hasDebugClient() {
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    return clients.some((client) => {
      try {
        return new URL(client.url).searchParams.get('ggdebug') === '1';
      } catch (error) {
        return false;
      }
    });
  }

  async function notifyClients(message) {
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    clients.forEach((client) => {
      try {
        client.postMessage(message);
      } catch (error) {}
    });
  }

  async function disableSelf() {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await notifyClients({ type: 'GG_SW_DISABLED' });

    try {
      await self.registration.unregister();
    } catch (error) {}
  }

  function isSafeResponse(response) {
    return response && response.ok && (response.type === 'basic' || response.type === 'default');
  }

  function isHtmlResponse(response) {
    const type = response.headers.get('content-type') || '';
    return type.includes('text/html');
  }

  function shouldBypass(url, request) {
    if (!sameOrigin(url)) return true;
    if (request.method !== 'GET') return true;

    const path = url.pathname;
    const query = url.searchParams;

    if (path.startsWith('/b/')) return true;
    if (path.startsWith('/admin')) return true;
    if (path.startsWith('/preview')) return true;
    if (path.startsWith('/draft')) return true;
    if (path.startsWith('/comment-iframe')) return true;
    if (path.includes('/edit')) return true;

    if (query.has('preview')) return true;
    if (query.has('token')) return true;
    if (query.get('view') === 'flipcard') return true;

    return false;
  }

  function normalizedPageRequest(request) {
    const url = new URL(request.url);

    url.hash = '';

    // Blogger mobile query should not explode page cache variants.
    if (url.searchParams.get('m') === '1' && url.searchParams.size === 1) {
      url.search = '';
    }

    return new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
      credentials: request.credentials,
      redirect: 'follow'
    });
  }

  async function putIfSafe(cacheName, request, response, options = {}) {
    if (!isSafeResponse(response)) return;
    if (options.html && !isHtmlResponse(response)) return;

    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    } catch (error) {}
  }

  async function precacheOne(cache, url, debug) {
    try {
      const request = new Request(url, { credentials: 'same-origin' });
      const response = await fetch(request, { cache: 'no-store' });

      if (!isSafeResponse(response)) {
        throw new Error(`http ${response.status}`);
      }

      await cache.put(request, response.clone());

      if (debug) {
        console.log('[gg-sw]', 'precache ok', url);
      }
    } catch (error) {
      if (debug) {
        console.log('[gg-sw]', 'precache skip', url, String(error));
      }
    }
  }

  async function cacheFirst(request, cacheName, url) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      log(url, 'cache-first hit', url.pathname);
      return cached;
    }

    const response = await fetch(request);
    await putIfSafe(cacheName, request, response);
    return response;
  }

  async function staleWhileRevalidate(request, cacheName, url) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const refresh = fetch(request)
      .then((response) => {
        if (isSafeResponse(response)) {
          cache.put(request, response.clone());
        }

        return response;
      })
      .catch(() => null);

    if (cached) {
      log(url, 'swr hit', url.pathname);
      return cached;
    }

    const response = await refresh;

    if (response) return response;

    return offlineResponse();
  }

  async function networkFirst(request, cacheName, url, options = {}) {
    const cacheRequest = options.normalize ? normalizedPageRequest(request) : request;

    try {
      const response = await fetch(request, {
        cache: options.noStore ? 'no-store' : 'default'
      });

      await putIfSafe(cacheName, cacheRequest, response, {
        html: options.html
      });

      log(url, 'network-first fresh', url.pathname);

      return response;
    } catch (error) {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(cacheRequest);

      if (cached) {
        log(url, 'network-first cached fallback', url.pathname);
        return cached;
      }

      throw error;
    }
  }

  async function offlineResponse() {
    try {
      const cache = await caches.open(CACHE_STATIC);
      const cached = await cache.match(OFFLINE_URL);

      if (cached) return cached;
    } catch (error) {}

    try {
      const response = await fetch(OFFLINE_URL, { cache: 'no-store' });

      if (isSafeResponse(response)) return response;
    } catch (error) {}

    return new Response(
      '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body><h1>Koneksi tidak tersedia</h1><p>Halaman offline belum tersedia dari cache.</p></body></html>',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    );
  }

  async function navigationResponse(request, url) {
    try {
      return await networkFirst(request, CACHE_PAGES, url, {
        html: true,
        normalize: true
      });
    } catch (error) {
      return offlineResponse();
    }
  }

  async function feedResponse(request, url) {
    try {
      return await networkFirst(request, CACHE_FEEDS, url, {
        normalize: false
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'offline',
        feed: 'unavailable'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
  }

  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const debug = await hasDebugClient();

      if (debug) {
        console.log('[gg-sw]', 'install', VERSION);
      }

      const staticCache = await caches.open(CACHE_STATIC);
      const pageCache = await caches.open(CACHE_PAGES);
      const feedCache = await caches.open(CACHE_FEEDS);

      await Promise.all([
        ...PRECACHE_URLS.map((url) => {
          if (url.startsWith('/feeds/')) {
            return precacheOne(feedCache, url, debug);
          }

          if (url === '/' || url === '/landing') {
            return precacheOne(pageCache, url, debug);
          }

          return precacheOne(staticCache, url, debug);
        }),

        ...ICON_URLS.map((url) => precacheOne(staticCache, url, debug))
      ]);

      await self.skipWaiting();
    })());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      if (await hasDebugClient()) {
        console.log('[gg-sw]', 'activate', VERSION);
      }

      const flags = await fetchFlags(true);

      if (flags && flags.sw && flags.sw.enabled === false) {
        await disableSelf();
        return;
      }

      const keep = new Set([
        CACHE_STATIC,
        CACHE_PAGES,
        CACHE_FEEDS,
        CACHE_RUNTIME
      ]);

      const keys = await caches.keys();

      await Promise.all(keys.map((key) => {
        return keep.has(key) ? null : caches.delete(key);
      }));

      await self.clients.claim();
      await notifyClients({
        type: 'GG_SW_READY',
        version: VERSION
      });
    })());
  });

  self.addEventListener('message', (event) => {
    const data = event && event.data ? event.data : {};

    if (data.type === 'SKIP_WAITING') {
      self.skipWaiting();
      return;
    }

    if (data.type === 'GG_SW_PREFETCH' && data.url) {
      event.waitUntil((async () => {
        try {
          const url = new URL(data.url, self.location.origin);

          if (!sameOrigin(url)) return;

          const request = new Request(url.toString(), {
            credentials: 'same-origin'
          });

          const response = await fetch(request);

          if (isSafeResponse(response)) {
            const cacheName = url.pathname.startsWith('/feeds/')
              ? CACHE_FEEDS
              : CACHE_PAGES;

            await putIfSafe(cacheName, request, response, {
              html: !url.pathname.startsWith('/feeds/')
            });
          }
        } catch (error) {}
      })());
    }
  });

  self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (shouldBypass(url, request)) return;

    if (url.pathname === FLAGS_URL) {
      event.respondWith(fetch(request, { cache: 'no-store' }));
      return;
    }

    event.respondWith((async () => {
      const flags = await fetchFlags(false);

      if (flags && flags.sw && flags.sw.enabled === false) {
        await disableSelf();
        return fetch(request, { cache: 'no-store' });
      }

      if (url.pathname.startsWith(LATEST_ASSET_PREFIX)) {
        const activeUrl = new URL(url.href);
        activeUrl.pathname = `${ACTIVE_ASSET_PREFIX}${url.pathname.slice(LATEST_ASSET_PREFIX.length)}`;

        log(url, 'assets/latest alias', activeUrl.pathname);

        return fetch(new Request(activeUrl.toString(), request), {
          cache: 'no-store'
        });
      }

      if (request.mode === 'navigate') {
        return navigationResponse(request, url);
      }

      if (url.pathname.startsWith('/feeds/')) {
        return feedResponse(request, url);
      }

      if (url.pathname === OFFLINE_URL || url.pathname === MANIFEST_URL) {
        return staleWhileRevalidate(request, CACHE_STATIC, url);
      }

      if (url.pathname.startsWith('/assets/v/') || url.pathname.startsWith('/gg-pwa-icon/')) {
        return cacheFirst(request, CACHE_STATIC, url);
      }

      if (request.destination === 'image') {
        return staleWhileRevalidate(request, CACHE_RUNTIME, url);
      }

      return fetch(request);
    })());
  });
})();