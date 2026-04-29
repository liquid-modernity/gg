/* public/sw.js — GG PWA offline/navigation cache contract */
(() => {
  'use strict';

  const RELEASE = 'ac33998';
  const TEMPLATE_FINGERPRINT = 'db5707fc3afa';
  const GG_SW_NAME = 'pakrpp-editorial-pwa';
  const GG_SW_VERSION = `${RELEASE}-${TEMPLATE_FINGERPRINT}`;
  const VERSION = GG_SW_VERSION;

  const CACHE_STATIC = `gg-static-${VERSION}`;
  const CACHE_PAGES = `gg-pages-${VERSION}`;
  const CACHE_FEEDS = `gg-feeds-${VERSION}`;
  const CACHE_IMAGES = `gg-images-${VERSION}`;
  const CACHE_RUNTIME = `gg-runtime-${VERSION}`;
  const MANAGED_CACHE_PREFIXES = ['gg-static-', 'gg-pages-', 'gg-feeds-', 'gg-images-', 'gg-runtime-', 'gg-saved-'];

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
    value: {
      mode: 'development',
      release: RELEASE,
      templateFingerprint: TEMPLATE_FINGERPRINT,
      sw: {
        enabled: true,
        navigationPreload: true,
        htmlQualityGate: true,
        devAggressiveUpdate: false,
        debug: false
      }
    }
  };
  let clientCacheModes = {};

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
    const source = data && typeof data === 'object' ? data : {};
    const sw = source.sw && typeof source.sw === 'object' ? source.sw : {};
    const mode = typeof source.mode === 'string' ? String(source.mode).toLowerCase() : 'development';

    return {
      mode: mode === 'production' || mode === 'staging' ? mode : 'development',
      release: typeof source.release === 'string' ? source.release : RELEASE,
      templateFingerprint: typeof source.templateFingerprint === 'string' ? source.templateFingerprint : TEMPLATE_FINGERPRINT,
      sw: {
        enabled: sw.enabled !== false,
        navigationPreload: sw.navigationPreload !== false,
        htmlQualityGate: sw.htmlQualityGate !== false,
        devAggressiveUpdate: !!sw.devAggressiveUpdate,
        debug: !!sw.debug
      }
    };
  }

  function shouldAggressivelyUpdate(flags) {
    return !!(
      flags &&
      (flags.mode === 'development' || flags.mode === 'staging') &&
      flags.sw &&
      flags.sw.devAggressiveUpdate
    );
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
      return flagsCache.value || normalizeFlags(null);
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

  async function notifyClient(clientId, message) {
    if (!clientId) return;

    try {
      const client = await self.clients.get(clientId);
      if (client) client.postMessage(message);
    } catch (error) {}
  }

  function isManagedCacheName(name) {
    return MANAGED_CACHE_PREFIXES.some((prefix) => String(name || '').indexOf(prefix) === 0);
  }

  async function deleteManagedCaches(options = {}) {
    const preserveSaved = options.preserveSaved !== false;
    const keep = new Set(options.keep || []);
    const keys = await caches.keys();

    await Promise.all(keys.map((key) => {
      if (!isManagedCacheName(key)) return null;
      if (keep.has(key)) return null;
      if (preserveSaved && key.indexOf('gg-saved-') === 0) return null;
      return caches.delete(key);
    }));
  }

  async function updateClientCacheMode(clientId, cacheMode, url) {
    if (!clientId) return;

    const payload = {
      type: 'GG_SW_CACHE_MODE',
      name: GG_SW_NAME,
      version: VERSION,
      cacheMode: cacheMode || 'unknown',
      path: url ? `${url.pathname || '/'}${url.search || ''}` : '/'
    };

    clientCacheModes[clientId] = {
      cacheMode: payload.cacheMode,
      path: payload.path,
      version: payload.version,
      updatedAt: Date.now()
    };

    await notifyClient(clientId, payload);
  }

  async function buildStatusPayload(clientId) {
    const flags = await fetchFlags(false);
    const cacheNames = await caches.keys();
    const cacheState = clientId && clientCacheModes[clientId] ? clientCacheModes[clientId] : null;

    return {
      type: 'GG_SW_STATUS',
      name: GG_SW_NAME,
      version: VERSION,
      mode: flags.mode,
      release: flags.release,
      templateFingerprint: flags.templateFingerprint,
      enabled: !!(flags.sw && flags.sw.enabled),
      navigationPreload: !!(flags.sw && flags.sw.navigationPreload),
      htmlQualityGate: !!(flags.sw && flags.sw.htmlQualityGate),
      devAggressiveUpdate: shouldAggressivelyUpdate(flags),
      cacheNames: cacheNames,
      lastCacheMode: cacheState ? cacheState.cacheMode : 'unknown',
      lastCachePath: cacheState ? cacheState.path : ''
    };
  }

  async function disableSelf() {
    await deleteManagedCaches({ preserveSaved: true });
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

  function hasExpectedHtmlShell(html) {
    const source = String(html || '');
    return /id\s*=\s*['"]gg-shell['"]/i.test(source) &&
      /id\s*=\s*['"]gg-dock['"]/i.test(source) &&
      /id\s*=\s*['"]gg-command-panel['"]/i.test(source) &&
      /id\s*=\s*['"]gg-preview-sheet['"]/i.test(source) &&
      /id\s*=\s*['"]gg-more-panel['"]/i.test(source);
  }

  async function isCacheableHtmlPageResponse(response, flags) {
    if (!isSafeResponse(response)) return false;
    if (!isHtmlResponse(response)) return false;
    if (response.status !== 200) return false;
    if (response.redirected) return false;
    if (flags && flags.sw && flags.sw.htmlQualityGate === false) return true;

    try {
      return hasExpectedHtmlShell(await response.clone().text());
    } catch (error) {
      return false;
    }
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
    const mobileMode = url.searchParams.get('m');

    url.hash = '';

    // Blogger mobile query should not explode page cache variants.
    if (mobileMode === '0' || mobileMode === '1') {
      url.searchParams.delete('m');
    }

    return new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
      credentials: request.credentials,
      redirect: 'follow'
    });
  }

  async function putIfSafe(cacheName, request, response, options = {}) {
    if (options.html) {
      if (!(await isCacheableHtmlPageResponse(response, options.flags))) return;
    } else if (!isSafeResponse(response)) {
      return;
    }

    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    } catch (error) {}
  }

  async function precacheOne(cache, url, debug, options = {}) {
    try {
      const request = new Request(url, { credentials: 'same-origin' });
      const response = await fetch(request, { cache: 'no-store' });

      if (options.html) {
        if (!(await isCacheableHtmlPageResponse(response, options.flags))) {
          throw new Error(response.redirected ? 'redirected html response' : `uncacheable html ${response.status}`);
        }
      } else if (!isSafeResponse(response)) {
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
        html: options.html,
        flags: options.flags
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

  async function navigationResponse(event, request, url, flags) {
    const clientId = event.resultingClientId || event.clientId;
    const cacheRequest = normalizedPageRequest(request);

    try {
      const preload = await event.preloadResponse;

      if (isSafeResponse(preload) && isHtmlResponse(preload)) {
        await putIfSafe(CACHE_PAGES, cacheRequest, preload, {
          html: true,
          flags: flags
        });
        event.waitUntil(updateClientCacheMode(clientId, preload.redirected ? 'network-redirected' : 'network-fresh', url));
        return preload;
      }
    } catch (error) {}

    try {
      const response = await fetch(request, {
        cache: 'no-store'
      });

      await putIfSafe(CACHE_PAGES, cacheRequest, response, {
        html: true,
        flags: flags
      });

      log(url, 'navigation network fresh', url.pathname);
      event.waitUntil(updateClientCacheMode(clientId, response.redirected ? 'network-redirected' : 'network-fresh', url));

      return response;
    } catch (error) {
      const cache = await caches.open(CACHE_PAGES);
      const cached = await cache.match(cacheRequest);

      if (cached) {
        log(url, 'navigation page-cache hit', url.pathname);
        event.waitUntil(updateClientCacheMode(clientId, 'page-cache-hit', url));
        return cached;
      }

      event.waitUntil(updateClientCacheMode(clientId, 'offline-fallback', url));
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
      const flags = await fetchFlags(true);

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
            return precacheOne(pageCache, url, debug, {
              html: true,
              flags: flags
            });
          }

          return precacheOne(staticCache, url, debug);
        }),

        ...ICON_URLS.map((url) => precacheOne(staticCache, url, debug))
      ]);

      if (shouldAggressivelyUpdate(flags)) {
        await self.skipWaiting();
      }
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

      const keep = [
        CACHE_STATIC,
        CACHE_PAGES,
        CACHE_FEEDS,
        CACHE_IMAGES,
        CACHE_RUNTIME
      ];

      if (self.registration.navigationPreload) {
        try {
          if (flags && flags.sw && flags.sw.navigationPreload === false) {
            await self.registration.navigationPreload.disable();
          } else {
            await self.registration.navigationPreload.enable();
          }
        } catch (error) {}
      }

      await deleteManagedCaches({
        keep: keep,
        preserveSaved: true
      });

      if (shouldAggressivelyUpdate(flags)) {
        await self.clients.claim();
      }

      await notifyClients({
        type: 'GG_SW_READY',
        name: GG_SW_NAME,
        mode: flags.mode,
        version: VERSION
      });
    })());
  });

  self.addEventListener('message', (event) => {
    const data = event && event.data ? event.data : {};
    const sourceId = event && event.source && event.source.id ? event.source.id : '';

    if (data.type === 'SKIP_WAITING') {
      event.waitUntil((async () => {
        const flags = await fetchFlags(false);
        if (shouldAggressivelyUpdate(flags)) {
          await self.skipWaiting();
        }
      })());
      return;
    }

    if (data.type === 'GG_SW_STATUS') {
      event.waitUntil((async () => {
        const payload = await buildStatusPayload(sourceId);

        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(payload);
          return;
        }

        await notifyClient(sourceId, payload);
      })());
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

          const flags = await fetchFlags(false);
          const response = await fetch(request);

          if (isSafeResponse(response)) {
            const cacheName = url.pathname.startsWith('/feeds/')
              ? CACHE_FEEDS
              : CACHE_PAGES;
            const cacheRequest = url.pathname.startsWith('/feeds/')
              ? request
              : normalizedPageRequest(request);

            await putIfSafe(cacheName, cacheRequest, response, {
              html: !url.pathname.startsWith('/feeds/'),
              flags: flags
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
        return navigationResponse(event, request, url, flags);
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
        return staleWhileRevalidate(request, CACHE_IMAGES, url);
      }

      return fetch(request);
    })());
  });
})();
