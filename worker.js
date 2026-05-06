/* worker.js — PakRPP Edge Governance Layer v10.3
 *
 * Role:
 * - Cloudflare Worker edge router
 * - route-policy enforcer
 * - development crawler lockdown layer
 * - PWA asset gateway
 * - robots.txt generator
 * - diagnostics surface
 *
 * Non-goal:
 * - This Worker is NOT a replacement CMS.
 * - Blogger SSR remains the canonical source of truth.
 * - Worker must not proxy/mutate all Blogger posts just to hide Blogger.
 */

const SITE = {
  canonicalHost: "www.pakrpp.com",
  apexHost: "pakrpp.com",
  originName: "PakRPP",
  release: "ac33998",
  templateFingerprint: "4f454c2091f7",
  workerVersion: "edge-governance-v10.3",
};

const FLAGS_TTL_MS = 60 * 1000;
let flagsCache = { ts: 0, value: null };

const ALLOWED_MODES = new Set(["development", "staging", "production"]);

const DEFAULT_FLAGS = {
  mode: "development",
  release: SITE.release,
  templateFingerprint: SITE.templateFingerprint,
  csp_report_enabled: true,
  edge: {
    canonicalHost: true,
    httpsRedirect: true,
    normalizeMobileQuery: true,
    redirectLegacyViews: true,
    annotateTemplateContract: true,
    mutateLandingContactAnchor: true,
    hardBlockKnownBotsInDevelopment: false,
  },
  robots: {
    developmentLockdown: true,
    blockAiBots: true,
    blockSearchBots: true,
  },
  sw: {
    enabled: true,
    navigationPreload: true,
    htmlQualityGate: true,
    offlineSearch: true,
    savedReading: true,
    contentIndex: false,
    backgroundSync: false,
    devAggressiveUpdate: false,
    debug: false,
  },
  limits: {
    maxPageEntries: 50,
    maxSavedEntries: 100,
    maxRuntimeImages: 120,
    maxFeedAgeHours: 24,
    maxPageAgeDays: 30,
  },
  vanity: {
    "/about": "/p/about.html",
    "/authors": "/p/authors.html",
    "/privacy": "/p/privacy-policy.html",
    "/sitemap": "/p/sitemap.html",
    "/contact": "/p/contact.html",
  },
};

const LANDING_PUBLIC_PATH = "/landing";
const LANDING_INTERNAL_PATH = "/landing.html";
const STORE_PUBLIC_PATH = "/store";
const STORE_INTERNAL_PATH = "/store.html";
const STORE_DATA_PREFIX = "/store/data/";
const STORE_ASSET_PREFIX = "/assets/store/";
// STORE_CATEGORY_REGISTRY_START
const STORE_CATEGORY_REGISTRY = Object.freeze([
  {
    "key": "fashion",
    "label": "Fashion",
    "slug": "fashion",
    "path": "/store/fashion",
    "aliases": [
      "fashion",
      "style",
      "outfit"
    ],
    "routeAliases": [],
    "fallback": false
  },
  {
    "key": "skincare",
    "label": "Skincare",
    "slug": "skincare",
    "path": "/store/skincare",
    "aliases": [
      "skincare"
    ],
    "routeAliases": [],
    "fallback": false
  },
  {
    "key": "workspace",
    "label": "Workspace",
    "slug": "workspace",
    "path": "/store/workspace",
    "aliases": [
      "workspace"
    ],
    "routeAliases": [],
    "fallback": false
  },
  {
    "key": "tech",
    "label": "Tech",
    "slug": "tech",
    "path": "/store/tech",
    "aliases": [
      "tech"
    ],
    "routeAliases": [],
    "fallback": false
  },
  {
    "key": "everyday",
    "label": "Lainnya",
    "slug": "everyday",
    "path": "/store/everyday",
    "aliases": [
      "everyday",
      "lainnya",
      "etc",
      "other"
    ],
    "routeAliases": [
      "lainnya",
      "etc"
    ],
    "fallback": true
  }
].map((entry) => Object.freeze({
  ...entry,
  aliases: Object.freeze(entry.aliases || []),
  routeAliases: Object.freeze(entry.routeAliases || []),
})));
// STORE_CATEGORY_REGISTRY_END
const STORE_CATEGORY_KEYS = Object.freeze(STORE_CATEGORY_REGISTRY.map((entry) => entry.key));
const STORE_CATEGORY_SET = new Set(STORE_CATEGORY_KEYS);
const STORE_CATEGORY_ALIASES = new Map(
  STORE_CATEGORY_REGISTRY.flatMap((entry) => (
    (entry.routeAliases || []).map((alias) => [String(alias || "").trim().toLowerCase(), entry.key])
  ))
);
const YELLOWCART_LEGACY_PUBLIC_PATH = "/yellowcart";
const YELLOWCART_LEGACY_INTERNAL_PATH = "/yellowcart.html";
const YELLOWCARD_LEGACY_PUBLIC_PATH = "/yellowcard";
const YELLOWCARD_LEGACY_INTERNAL_PATH = "/yellowcard.html";
const FLAGS_CANONICAL_PATH = "/gg-flags.json";
const FLAGS_LEGACY_PATH = "/flags.json";
const ORIGIN_MOBILE_NORMALIZED_HEADER = "X-GG-Origin-Mobile-Normalized";
// Legacy internal name: "home" here means root listing (/), not public Home (/landing).
const ROOT_LISTING_LEGACY_ROUTE = "home";

const STATIC_ROUTE_ASSET_MAP = new Map([
  ["/manifest.webmanifest", "/manifest.webmanifest"],
  ["/sw.js", "/sw.js"],
  ["/offline.html", "/offline.html"],
  ["/ads.txt", "/ads.txt"],
  ["/llms.txt", "/llms.txt"],
  [FLAGS_CANONICAL_PATH, "/__gg/flags.json"],
  [FLAGS_LEGACY_PATH, "/__gg/flags.json"],
  [LANDING_PUBLIC_PATH, LANDING_INTERNAL_PATH],
  [STORE_PUBLIC_PATH, STORE_INTERNAL_PATH],
]);
const GG_ASSET_PREFIX = "/__gg/assets/";
const AI_AND_TRAINING_BOTS = [
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "google-extended",
  "ccbot",
  "claudebot",
  "anthropic-ai",
  "perplexitybot",
  "applebot-extended",
  "bytespider",
  "amazonbot",
  "omgili",
  "omgilibot",
  "youbot",
  "diffbot",
  "cohere-ai",
  "facebookbot",
  "meta-externalagent",
  "meta-externalfetcher",
];

const SEARCH_BOTS = [
  "googlebot",
  "googlebot-image",
  "googlebot-video",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
];

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergePlainObject(base, incoming) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return out;

  for (const [key, value] of Object.entries(incoming)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = mergePlainObject(out[key], value);
    } else {
      out[key] = value;
    }
  }

  return out;
}

function normalizeMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "lab" || mode === "public") return mode === "public" ? "development" : "development";
  if (ALLOWED_MODES.has(mode)) return mode;
  return DEFAULT_FLAGS.mode;
}

function normalizeFlags(data, env = {}) {
  let flags = cloneJson(DEFAULT_FLAGS);

  if (data && typeof data === "object") {
    flags = mergePlainObject(flags, data);
  }

  if (typeof env.GG_MODE === "string" && env.GG_MODE.trim()) {
    flags.mode = env.GG_MODE.trim();
  }

  flags.mode = normalizeMode(flags.mode);
  flags.release = String(flags.release || SITE.release);
  flags.templateFingerprint = String(flags.templateFingerprint || SITE.templateFingerprint);
  flags.csp_report_enabled = !!flags.csp_report_enabled;
  flags.edge = mergePlainObject(DEFAULT_FLAGS.edge, flags.edge || {});
  flags.robots = mergePlainObject(DEFAULT_FLAGS.robots, flags.robots || {});
  flags.sw = mergePlainObject(DEFAULT_FLAGS.sw, flags.sw || {});
  flags.limits = mergePlainObject(DEFAULT_FLAGS.limits, flags.limits || {});
  flags.vanity = mergePlainObject(DEFAULT_FLAGS.vanity, flags.vanity || {});

  return flags;
}

async function loadFlags(env) {
  const now = Date.now();
  if (flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
    return cloneJson(flagsCache.value);
  }

  let data = null;

  if (env && typeof env.GG_FLAGS_JSON === "string" && env.GG_FLAGS_JSON.trim()) {
    try {
      data = JSON.parse(env.GG_FLAGS_JSON);
    } catch (_) {
      data = null;
    }
  }

  if (!data && env?.ASSETS) {
    try {
      const req = new Request("https://assets.local/__gg/flags.json");
      const res = await env.ASSETS.fetch(req);
      if (res.ok) data = await res.json();
    } catch (_) {
      data = null;
    }
  }

  const flags = normalizeFlags(data, env || {});
  flagsCache = { ts: now, value: flags };
  return cloneJson(flags);
}

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(payload, null, 2), {
    status: init.status || 200,
    statusText: init.statusText,
    headers,
  });
}

function textResponse(text, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", init.contentType || "text/plain; charset=utf-8");
  return new Response(text, {
    status: init.status || 200,
    statusText: init.statusText,
    headers,
  });
}

function isSafeMethod(request) {
  return request.method === "GET" || request.method === "HEAD";
}

function getRequestHost(request) {
  return request.headers.get("host") || new URL(request.url).host;
}

function getProto(request, url) {
  return request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
}

function redirectStatusForMode(flags) {
  return flags.mode === "production" ? 301 : 302;
}

function mobileQueryRedirectStatus() {
  // Keep mobile query normalization on 302 in every mode for now.
  // 301 can be considered later only after live mobile validation confirms it is safe.
  return 302;
}

function redirectUrl(url, status = 301) {
  return Response.redirect(url.toString(), status);
}

function isRedirectStatus(status) {
  return status >= 300 && status < 400;
}

function maybeCanonicalRedirect(request, flags) {
  const url = new URL(request.url);
  const host = getRequestHost(request).toLowerCase();
  const proto = getProto(request, url).toLowerCase();
  let changed = false;

  if (flags.edge.httpsRedirect && proto === "http") {
    url.protocol = "https:";
    changed = true;
  }

  if (flags.edge.canonicalHost && (host === SITE.apexHost || url.hostname === SITE.apexHost)) {
    url.hostname = SITE.canonicalHost;
    changed = true;
  }

  if (!changed) return null;
  return redirectUrl(url, redirectStatusForMode(flags));
}

function normalizeMobileQueryRedirect(request, flags) {
  if (!flags.edge.normalizeMobileQuery) return null;
  const url = new URL(request.url);
  if (!url.searchParams.has("m")) return null;
  const mValues = url.searchParams.getAll("m");
  if (!mValues.length) return null;
  if (mValues.some((value) => value !== "0" && value !== "1")) return null;
  url.searchParams.delete("m");
  return redirectUrl(url, mobileQueryRedirectStatus());
}

function vanityRedirect(request, flags) {
  const url = new URL(request.url);
  const target = flags.vanity && flags.vanity[url.pathname];
  if (!target) return null;

  const next = new URL(request.url);
  next.pathname = target;
  return redirectUrl(next, redirectStatusForMode(flags));
}

function storeCanonicalRedirectStatus(flags, pathname) {
  if (pathname === `${STORE_PUBLIC_PATH}/`) {
    return flags.mode === "production" ? 308 : 302;
  }
  return 301;
}

function isStoreCleanRoutePath(pathname) {
  const path = String(pathname || "");
  if (path.startsWith(STORE_DATA_PREFIX)) return false;
  return (
    path === STORE_PUBLIC_PATH ||
    path === STORE_INTERNAL_PATH ||
    path === `${STORE_PUBLIC_PATH}/` ||
    path.startsWith(`${STORE_PUBLIC_PATH}/`) ||
    path === YELLOWCART_LEGACY_PUBLIC_PATH ||
    path === YELLOWCART_LEGACY_INTERNAL_PATH ||
    path === YELLOWCARD_LEGACY_PUBLIC_PATH ||
    path === YELLOWCARD_LEGACY_INTERNAL_PATH
  );
}

function normalizeStoreCategoryKey(value) {
  const key = String(value || "").trim().toLowerCase();
  return STORE_CATEGORY_ALIASES.get(key) || key;
}

function storeCategoryAliasPaths() {
  return STORE_CATEGORY_REGISTRY.flatMap((entry) => (
    (entry.routeAliases || []).map((alias) => `${STORE_PUBLIC_PATH}/${alias}`)
  ));
}

function storeCategoryAliasRedirects() {
  return Object.fromEntries(storeCategoryAliasPaths().map((aliasPath) => {
    const alias = aliasPath.slice(`${STORE_PUBLIC_PATH}/`.length);
    return [aliasPath, storeCategoryPublicPath(normalizeStoreCategoryKey(alias))];
  }));
}

function storeCategoryNestedAssetPath(categoryKey, pageNumber = 1) {
  return pageNumber === 1
    ? `/store/${categoryKey}/index.html`
    : `/store/${categoryKey}/page/${pageNumber}/index.html`;
}

function storeCategoryFlatAssetPath(categoryKey, pageNumber = 1) {
  return pageNumber === 1
    ? `/store-${categoryKey}.html`
    : `/store-${categoryKey}-page-${pageNumber}.html`;
}

function storeCategoryPublicPath(categoryKey, pageNumber = 1) {
  return pageNumber === 1
    ? `${STORE_PUBLIC_PATH}/${categoryKey}`
    : `${STORE_PUBLIC_PATH}/${categoryKey}/page/${pageNumber}`;
}

function storeCategoryAssetPaths(categoryKey, pageNumber = 1) {
  return [
    storeCategoryNestedAssetPath(categoryKey, pageNumber),
    storeCategoryFlatAssetPath(categoryKey, pageNumber),
  ];
}

function storeRouteDebug(storeRoute, categoryKey = "", pageNumber = 1) {
  return {
    source: "assets",
    storeRoute,
    category: categoryKey,
    page: pageNumber,
  };
}

function storeRedirectResolution(targetPath, reason) {
  return {
    action: "redirect",
    targetPath,
    reason,
  };
}

function storeNotFoundResolution(reason, categoryKey = "", pageNumber = "") {
  return {
    action: "not-found",
    reason,
    storeDebug: storeRouteDebug("not-found", categoryKey, pageNumber || ""),
  };
}

function resolveStoreCleanRoutePath(pathname) {
  const path = String(pathname || "");

  if (!isStoreCleanRoutePath(path)) return null;

  if (
    path === STORE_INTERNAL_PATH ||
    path === YELLOWCART_LEGACY_PUBLIC_PATH ||
    path === YELLOWCART_LEGACY_INTERNAL_PATH ||
    path === YELLOWCARD_LEGACY_PUBLIC_PATH ||
    path === YELLOWCARD_LEGACY_INTERNAL_PATH
  ) {
    return storeRedirectResolution(STORE_PUBLIC_PATH, "store-root-normalization");
  }

  if (path === `${STORE_PUBLIC_PATH}/`) {
    return storeRedirectResolution(STORE_PUBLIC_PATH, "store-trailing-slash-normalization");
  }

  if (path === STORE_PUBLIC_PATH) {
    return {
      action: "asset",
      assetPaths: [STORE_INTERNAL_PATH],
      canonicalPath: STORE_PUBLIC_PATH,
      storeDebug: storeRouteDebug("root", "", 1),
    };
  }

  if (path.length > STORE_PUBLIC_PATH.length + 1 && path.endsWith("/")) {
    return storeRedirectResolution(path.replace(/\/+$/, ""), "store-trailing-slash-normalization");
  }

  const rest = path.slice(`${STORE_PUBLIC_PATH}/`.length);
  const segments = rest.split("/");
  if (!rest || segments.some((segment) => segment === "")) return storeNotFoundResolution("store-malformed-path");

  if (segments.length === 1) {
    const rawCategory = segments[0];
    const categoryKey = normalizeStoreCategoryKey(rawCategory);
    if (!STORE_CATEGORY_SET.has(categoryKey)) return storeNotFoundResolution("store-unknown-category", categoryKey);
    if (rawCategory !== categoryKey) return storeRedirectResolution(storeCategoryPublicPath(categoryKey), "store-category-alias-normalization");
    return {
      action: "asset",
      assetPaths: storeCategoryAssetPaths(categoryKey, 1),
      canonicalPath: storeCategoryPublicPath(categoryKey, 1),
      storeDebug: storeRouteDebug("category", categoryKey, 1),
    };
  }

  if (segments.length === 3 && segments[1] === "page") {
    const rawCategory = segments[0];
    const categoryKey = normalizeStoreCategoryKey(rawCategory);
    const rawPage = segments[2];
    if (!STORE_CATEGORY_SET.has(categoryKey)) return storeNotFoundResolution("store-unknown-category", categoryKey);
    if (!/^\d+$/.test(rawPage)) return storeNotFoundResolution("store-malformed-pagination", categoryKey);

    const pageNumber = Number.parseInt(rawPage, 10);
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
      return storeNotFoundResolution("store-invalid-pagination", categoryKey, pageNumber || rawPage);
    }

    if (pageNumber === 1) {
      return storeRedirectResolution(storeCategoryPublicPath(categoryKey, 1), "store-page-one-normalization");
    }

    const canonicalPath = storeCategoryPublicPath(categoryKey, pageNumber);
    if (rawCategory !== categoryKey || rawPage !== String(pageNumber)) {
      return storeRedirectResolution(canonicalPath, "store-pagination-normalization");
    }

    return {
      action: "asset",
      assetPaths: storeCategoryAssetPaths(categoryKey, pageNumber),
      canonicalPath,
      storeDebug: storeRouteDebug("category-page", categoryKey, pageNumber),
    };
  }

  return storeNotFoundResolution("store-malformed-path");
}

function isLegacyViewPath(pathname) {
  return pathname === "/view" || pathname.startsWith("/view/");
}

function legacyViewRedirect(request, flags) {
  const url = new URL(request.url);
  if (!isLegacyViewPath(url.pathname)) return null;
  const next = new URL("/", request.url);
  return redirectUrl(next, redirectStatusForMode(flags));
}

function storeRouteRedirect(request, flags) {
  const url = new URL(request.url);
  const resolution = resolveStoreCleanRoutePath(url.pathname);
  if (!resolution || resolution.action !== "redirect") return null;

  const next = new URL(request.url);
  next.pathname = resolution.targetPath;
  return redirectUrl(next, storeCanonicalRedirectStatus(flags, url.pathname));
}

function classifyRoute(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/") return ROOT_LISTING_LEGACY_ROUTE;
  if (path === LANDING_PUBLIC_PATH || path === LANDING_INTERNAL_PATH) return "landing";
  if (isStoreCleanRoutePath(path)) return "store";
  if (path === "/robots.txt") return "robots";
  if (path === "/sitemap.xml") return "sitemap";
  if (path === "/sw.js") return "service-worker";
  if (path === "/offline.html") return "offline";
  if (path === "/manifest.webmanifest") return "manifest";
  if (path === FLAGS_CANONICAL_PATH || path === FLAGS_LEGACY_PATH) return "flags";
  if (path.startsWith(GG_ASSET_PREFIX)) return "asset";
  if (path.startsWith("/__gg/")) return "diagnostic";
  if (path.startsWith("/assets/v/")) return "versioned-asset";
  if (path.startsWith("/assets/latest/")) return "latest-asset";
  if (path.startsWith(STORE_ASSET_PREFIX)) return "asset";
  if (path.startsWith("/assets/")) return "asset";
  if (path.startsWith("/gg-pwa-icon/")) return "icon";
  if (path.startsWith("/feeds/")) return "feed";
  if (path.startsWith("/search/label/")) return "label";
  if (path === "/search" || path.startsWith("/search/")) return "search";
  if (isLegacyViewPath(path)) return "legacy-view";
  if (path.startsWith("/p/") && path.endsWith(".html")) return "static-page";
  if (/^\/\d{4}\/\d{2}\/.+\.html$/i.test(path)) return "post";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".xml")) return "xml";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".txt")) return "text";

  return "origin";
}

function isHtmlContentType(contentType) {
  return String(contentType || "").toLowerCase().includes("text/html");
}

function shouldServeStaticFromAssets(pathname) {
  if (STATIC_ROUTE_ASSET_MAP.has(pathname)) return true;
  if (pathname.startsWith(STORE_DATA_PREFIX)) return true;
  if (pathname.startsWith(GG_ASSET_PREFIX)) return true;
  if (pathname.startsWith("/gg-pwa-icon/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  return false;
}

function resolveAssetPath(pathname) {
  if (STATIC_ROUTE_ASSET_MAP.has(pathname)) return STATIC_ROUTE_ASSET_MAP.get(pathname);
  return pathname;
}

async function serveFromAssets(request, env, pathname) {
  if (!env?.ASSETS) return textResponse("ASSETS binding missing", { status: 500 });

  const assetPath = resolveAssetPath(pathname);
  const url = new URL(request.url);
  url.pathname = assetPath;
  return env.ASSETS.fetch(new Request(url.toString(), request));
}

async function serveAssetPath(request, env, assetPath) {
  if (!env?.ASSETS) return textResponse("ASSETS binding missing", { status: 500 });

  const url = new URL(request.url);
  url.pathname = assetPath;
  return env.ASSETS.fetch(new Request(url.toString(), request));
}

async function serveStoreCleanRoute(request, env, resolution) {
  if (resolution.action === "not-found") {
    return textResponse("Store page not found", {
      status: 404,
      headers: {
        "X-GG-Store-Miss": resolution.reason || "not-found",
      },
    });
  }

  let firstResponse = null;
  for (const assetPath of resolution.assetPaths || []) {
    const response = await serveAssetPath(request, env, assetPath);
    if (!firstResponse) firstResponse = response;
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set("X-GG-Store-Asset", assetPath);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
  }

  const headers = new Headers(firstResponse?.headers || {});
  headers.set("X-GG-Store-Miss", "asset-not-found");
  return new Response("Store page not found", { status: 404, headers });
}

async function handleStaticRoutes(request, env, flags) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === LANDING_INTERNAL_PATH) {
    return {
      response: redirectUrl(new URL(LANDING_PUBLIC_PATH, request.url), redirectStatusForMode(flags)),
      route: "landing",
    };
  }

  const storeResolution = resolveStoreCleanRoutePath(pathname);
  if (storeResolution) {
    if (storeResolution.action === "redirect") {
      const next = new URL(request.url);
      next.pathname = storeResolution.targetPath;
      return {
        response: redirectUrl(next, storeCanonicalRedirectStatus(flags, pathname)),
        route: "store",
        redirectReason: storeResolution.reason || "store-route-normalization",
      };
    }

    return {
      response: await serveStoreCleanRoute(request, env, storeResolution),
      route: "store",
      storeDebug: storeResolution.storeDebug,
    };
  }

  if (shouldServeStaticFromAssets(pathname)) {
    return {
      response: await serveFromAssets(request, env, pathname),
      route: classifyRoute(request),
    };
  }

  return null;
}

function baseSecurityHeaders(headers) {
  headers.set("X-GG-Worker", SITE.workerVersion);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()");
  headers.set("X-Frame-Options", "SAMEORIGIN");
}

function developmentRobotsTag() {
  // Development and staging stay locked down until production go-live.
  // This noindex contract is allowed only outside production mode.
  return "noindex, nofollow, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0";
}

function productionIndexableHtmlRobotsTag() {
  return "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
}

function productionRobotsTag(route, isHtmlLike) {
  if (!isHtmlLike) {
    if (["service-worker", "manifest", "flags", "diagnostic", "offline", "json"].includes(route)) return "noindex, nofollow";
    if (["feed", "xml", "sitemap"].includes(route)) return "noindex, follow";
    return "noindex";
  }

  if ([ROOT_LISTING_LEGACY_ROUTE, "landing", "store", "post", "static-page"].includes(route)) return productionIndexableHtmlRobotsTag();
  if (["label", "search", "feed"].includes(route)) return "noindex, follow";
  if (["legacy-view", "offline", "diagnostic", "flags", "manifest", "service-worker"].includes(route)) return "noindex, nofollow";
  return productionIndexableHtmlRobotsTag();
}

function routeRobotsTag(route, contentType, flags) {
  const isHtmlLike = isHtmlContentType(contentType) || [ROOT_LISTING_LEGACY_ROUTE, "post", "static-page", "landing", "store"].includes(route);
  // Only non-production modes are allowed to emit the lockdown noindex header.
  if (flags.mode !== "production") return developmentRobotsTag();
  return productionRobotsTag(route, isHtmlLike);
}

function isHashedStoreAssetPath(pathname) {
  return /^\/assets\/store\/[^/]+\.[a-f0-9]{7,}\.(?:css|js)$/i.test(String(pathname || ""));
}

function cacheControlForRoute(route, flags, pathname = "") {
  if (flags.mode !== "production") {
    if (["versioned-asset", "icon"].includes(route)) return "public, max-age=300";
    return "no-store";
  }

  if (pathname.startsWith(STORE_DATA_PREFIX)) return "public, max-age=300, stale-while-revalidate=86400";
  if (pathname.startsWith(STORE_ASSET_PREFIX)) {
    if (isHashedStoreAssetPath(pathname)) return "public, max-age=31536000, immutable";
    return "public, max-age=300, stale-while-revalidate=86400";
  }

  switch (route) {
    case "versioned-asset": return "public, max-age=31536000, immutable";
    case "icon": return "public, max-age=604800";
    case "latest-asset":
    case "service-worker":
    case "manifest":
    case "flags":
    case "diagnostic":
    case "robots":
    case "offline":
      return "no-cache, must-revalidate";
    case "feed":
    case "sitemap":
      return "public, max-age=300, stale-while-revalidate=86400";
    case ROOT_LISTING_LEGACY_ROUTE:
    case "landing":
    case "store":
      return "public, max-age=300, stale-while-revalidate=86400";
    case "post":
    case "static-page":
    case "label":
    case "search":
    case "html":
    case "origin":
      return "no-cache, must-revalidate";
    default:
      return "no-cache";
  }
}

function summarizeStoreCachePolicy(cacheControl) {
  const value = String(cacheControl || "").toLowerCase();
  if (value.includes("stale-while-revalidate")) return "swr";
  if (value.includes("no-store")) return "no-store";
  return "cacheable";
}

function storeDebugHeaders(route, flags, response, detail = {}) {
  if (route !== "store" || isRedirectStatus(response.status)) return null;

  const cacheControl = cacheControlForRoute(route, flags, detail.pathname || "");
  const source = String(detail.source || "unknown");
  let staticState = String(detail.static || "unknown");
  const storeRoute = String(detail.storeRoute || "root");
  const category = String(detail.category || "");
  const page = detail.page == null || detail.page === "" ? "" : String(detail.page);

  if (source === "assets") staticState = response.ok ? "present" : "missing";
  else if ((source === "blogger-origin" || source === "worker-fallback") && staticState === "unknown") staticState = "missing";

  const headers = {
    "X-GG-Store-Route": storeRoute,
    "X-GG-Store-Source": source,
    "X-GG-Store-Static": staticState,
    "X-GG-Store-Cache-Policy": summarizeStoreCachePolicy(cacheControl),
  };

  if (category) headers["X-GG-Store-Category"] = category;
  if (page) headers["X-GG-Store-Page"] = page;

  return headers;
}

function forceContentType(route, pathname, current) {
  if (route === "service-worker") return "application/javascript; charset=utf-8";
  if (route === "manifest") return "application/manifest+json; charset=utf-8";
  if (pathname.startsWith(STORE_DATA_PREFIX) || route === "json") return "application/json; charset=utf-8";
  if (route === "flags" || route === "diagnostic") return "application/json; charset=utf-8";
  if (route === "robots" || pathname.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (route === "offline" || route === "landing" || route === "store") return current || "text/html; charset=utf-8";
  return current || "";
}

function cspReportOnlyValue(request) {
  const reportUri = new URL("/api/csp-report", request.url).pathname;
  return [
    "default-src 'self' https:",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.blogger.com https://www.gstatic.com https://www.google.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.blogger.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "frame-src 'self' https://www.blogger.com https://*.blogger.com https://accounts.google.com https://www.google.com https://*.google.com",
    `report-uri ${reportUri}`,
  ].join("; ");
}

function withResponsePolicy(resp, request, flags, options = {}) {
  const url = new URL(request.url);
  const route = options.route || classifyRoute(request);
  const headers = new Headers(resp.headers);
  const storeHeaders = storeDebugHeaders(route, flags, resp, { pathname: url.pathname, ...(options.storeDebug || {}) });

  baseSecurityHeaders(headers);

  const forcedType = forceContentType(route, url.pathname, headers.get("content-type"));
  if (forcedType) headers.set("Content-Type", forcedType);

  const contentType = headers.get("content-type") || "";
  const robotsTag = routeRobotsTag(route, contentType, flags);
  if (robotsTag) headers.set("X-Robots-Tag", robotsTag);

  headers.set("Cache-Control", cacheControlForRoute(route, flags, url.pathname));
  headers.set("X-GG-Edge-Mode", flags.mode);
  headers.set("X-GG-Route-Class", route);
  headers.set("X-GG-Release", String(flags.release || SITE.release));
  headers.set("X-GG-Template-Fingerprint", String(flags.templateFingerprint || SITE.templateFingerprint));

  if (route === "service-worker") headers.set("Service-Worker-Allowed", "/");

  if ((isHtmlContentType(contentType) || route === "landing") && flags.csp_report_enabled) {
    headers.set("Content-Security-Policy-Report-Only", cspReportOnlyValue(request));
  }

  if (storeHeaders) {
    for (const [name, value] of Object.entries(storeHeaders)) {
      if (!value) continue;
      headers.set(name, String(value));
    }
  }

  if (options.headers && typeof options.headers === "object") {
    for (const [name, value] of Object.entries(options.headers)) {
      if (value == null || value === "") continue;
      headers.set(name, String(value));
    }
  }

  headers.set("Reporting-Endpoints", `gg-csp="${new URL("/api/csp-report", request.url).toString()}"`);

  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}

function redirectDiagnosticsHeaders(details = {}) {
  return {
    "X-GG-Redirect-Reason": details.reason || "redirect",
    "X-GG-Redirect-From": details.from || "",
    "X-GG-Redirect-To": details.to || "",
    "X-GG-Redirect-Status": String(details.status || 0),
  };
}

function withRedirectDiagnostics(resp, request, flags, details = {}, options = {}) {
  return withResponsePolicy(resp, request, flags, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...redirectDiagnosticsHeaders({
        from: details.from || request.url,
        to: details.to || resp.headers.get("location") || request.url,
        status: details.status || resp.status,
        reason: details.reason || "redirect",
      }),
    },
  });
}

function isKnownBotUserAgent(ua, list) {
  const source = String(ua || "").toLowerCase();
  if (!source) return false;
  return list.some((needle) => source.includes(needle));
}

function shouldHardBlockBot(request, flags) {
  if (flags.mode === "production") return false;
  if (!flags.edge.hardBlockKnownBotsInDevelopment) return false;

  const ua = request.headers.get("user-agent") || "";
  if (flags.robots.blockAiBots && isKnownBotUserAgent(ua, AI_AND_TRAINING_BOTS)) return true;
  if (flags.robots.blockSearchBots && isKnownBotUserAgent(ua, SEARCH_BOTS)) return true;
  return false;
}

function buildRobotsTxt(request, flags) {
  const sitemapUrl = new URL("/sitemap.xml", request.url).toString();
  const lines = [];

  lines.push(`# PakRPP robots policy — mode=${flags.mode}`);
  lines.push("# Generated by Cloudflare Worker. Do not edit as a static file.");
  lines.push("");

  if (flags.mode !== "production" && flags.robots.developmentLockdown) {
    if (flags.robots.blockAiBots) {
      for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "CCBot", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Applebot-Extended", "Bytespider", "Amazonbot"]) {
        lines.push(`User-agent: ${bot}`);
        lines.push("Disallow: /");
        lines.push("");
      }
    }

    if (flags.robots.blockSearchBots) {
      for (const bot of ["Googlebot", "Googlebot-Image", "Googlebot-Video", "bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "YandexBot", "Applebot"]) {
        lines.push(`User-agent: ${bot}`);
        lines.push("Disallow: /");
        lines.push("");
      }
    }

    lines.push("User-agent: *");
    lines.push("Disallow: /");
    lines.push("");
    lines.push(`# Sitemap is visible for tooling, but pages are locked by X-Robots-Tag in ${flags.mode} mode.`);
    lines.push(`Sitemap: ${sitemapUrl}`);
    return lines.join("\n") + "\n";
  }

  if (flags.robots.blockAiBots) {
    for (const bot of ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Applebot-Extended", "Bytespider", "Amazonbot"]) {
      lines.push(`User-agent: ${bot}`);
      lines.push("Disallow: /");
      lines.push("");
    }
  }

  lines.push("User-agent: Googlebot");
  lines.push("Allow: /");
  lines.push("");
  lines.push("User-agent: OAI-SearchBot");
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: *");
  lines.push("Allow: /");
  lines.push("Disallow: /view");
  lines.push("Disallow: /view/");
  lines.push("Disallow: /__gg/");
  lines.push("Disallow: /api/csp-report");
  lines.push("");
  lines.push(`Sitemap: ${sitemapUrl}`);

  return lines.join("\n") + "\n";
}

function previewRedirect(request, flags) {
  const legacy = legacyViewRedirect(request, flags);
  if (legacy) {
    return {
      to: legacy.headers.get("location") || "/",
      status: legacy.status,
      reason: "legacy-blogger-view-normalization",
    };
  }

  const mobile = normalizeMobileQueryRedirect(request, flags);
  if (mobile) {
    return {
      to: mobile.headers.get("location") || request.url,
      status: mobile.status,
      reason: "blogger-mobile-query-normalization",
    };
  }

  const storeRedirect = storeRouteRedirect(request, flags);
  if (storeRedirect) {
    return {
      to: storeRedirect.headers.get("location") || STORE_PUBLIC_PATH,
      status: storeRedirect.status,
      reason: "store-route-normalization",
    };
  }

  return null;
}

function diagnosticsFlagsForMode(flags, modeOverride) {
  if (!modeOverride) return flags;
  return normalizeFlags({ ...cloneJson(flags), mode: modeOverride });
}

function routePolicyPreview(input, flags) {
  const fake = input instanceof Request
    ? input
    : new Request(
        typeof input === "string" && /^[a-z]+:\/\//i.test(input)
          ? input
          : `https://${SITE.canonicalHost}${input || "/"}`
      );
  const route = classifyRoute(fake);
  const url = new URL(fake.url);
  const contentType =
    route === "service-worker" ? "application/javascript" :
    route === "manifest" ? "application/manifest+json" :
    route === "flags" || route === "diagnostic" || route === "json" ? "application/json" :
    route === "feed" || route === "sitemap" ? "application/xml" :
    "text/html";
  const storeResolution = resolveStoreCleanRoutePath(url.pathname);
  const storePreview = storeResolution ? {
    action: storeResolution.action,
    route: storeResolution.storeDebug?.storeRoute || (storeResolution.action === "redirect" ? "redirect" : ""),
    category: storeResolution.storeDebug?.category || "",
    page: storeResolution.storeDebug?.page || "",
    canonical: storeResolution.canonicalPath ? `https://${SITE.canonicalHost}${storeResolution.canonicalPath}` : "",
    assetPaths: storeResolution.assetPaths || [],
    reason: storeResolution.reason || "",
  } : null;

  return {
    pathname: url.pathname,
    search: url.search,
    route,
    mode: flags.mode,
    robots: routeRobotsTag(route, contentType, flags),
    cacheControl: cacheControlForRoute(route, flags, url.pathname),
    contentType: forceContentType(route, url.pathname, contentType),
    redirects: previewRedirect(fake, flags),
    store: storePreview,
  };
}

function pwaDiagnostics(flags) {
  return {
    ok: true,
    mode: flags.mode,
    release: flags.release,
    templateFingerprint: flags.templateFingerprint,
    workerVersion: SITE.workerVersion,
    routes: {
      serviceWorker: "/sw.js",
      offline: "/offline.html",
      manifest: "/manifest.webmanifest",
      flags: FLAGS_CANONICAL_PATH,
      legacyFlagsAlias: FLAGS_LEGACY_PATH,
      store: {
        public: STORE_PUBLIC_PATH,
        asset: STORE_INTERNAL_PATH,
        manifest: `${STORE_DATA_PREFIX}manifest.json`,
        categories: STORE_CATEGORY_KEYS.map((key) => storeCategoryPublicPath(key)),
        paginationPattern: `${STORE_PUBLIC_PATH}/:category/page/:page`,
        redirects: [
          STORE_INTERNAL_PATH,
          `${STORE_PUBLIC_PATH}/`,
          `${STORE_PUBLIC_PATH}/:category/`,
          `${STORE_PUBLIC_PATH}/:category/page/1`,
          `${STORE_PUBLIC_PATH}/:category/page/02`,
          ...storeCategoryAliasPaths(),
          YELLOWCART_LEGACY_PUBLIC_PATH,
          YELLOWCART_LEGACY_INTERNAL_PATH,
          YELLOWCARD_LEGACY_PUBLIC_PATH,
          YELLOWCARD_LEGACY_INTERNAL_PATH,
        ],
      },
    },
    serviceWorker: {
      enabled: !!flags.sw.enabled,
      navigationPreload: !!flags.sw.navigationPreload,
      htmlQualityGate: !!flags.sw.htmlQualityGate,
      offlineSearch: !!flags.sw.offlineSearch,
      savedReading: !!flags.sw.savedReading,
      contentIndex: !!flags.sw.contentIndex,
      backgroundSync: !!flags.sw.backgroundSync,
      devAggressiveUpdate: !!flags.sw.devAggressiveUpdate,
      debug: !!flags.sw.debug,
    },
    headers: {
      serviceWorkerAllowed: "/",
      swCacheControl: cacheControlForRoute("service-worker", flags),
      offlineRobots: routeRobotsTag("offline", "text/html", flags),
      manifestContentType: forceContentType("manifest", "/manifest.webmanifest", ""),
    },
    limits: flags.limits,
  };
}

function diagnosticsPayload(request, flags) {
  const url = new URL(request.url);
  return {
    ok: true,
    name: SITE.originName,
    mode: flags.mode,
    release: flags.release,
    templateFingerprint: flags.templateFingerprint,
    workerVersion: SITE.workerVersion,
    canonicalHost: SITE.canonicalHost,
    request: { url: request.url, host: getRequestHost(request), route: classifyRoute(request) },
    pwa: pwaDiagnostics(flags),
    routes: {
      landing: { public: LANDING_PUBLIC_PATH, asset: LANDING_INTERNAL_PATH },
      store: {
        public: STORE_PUBLIC_PATH,
        asset: STORE_INTERNAL_PATH,
        manifest: `${STORE_DATA_PREFIX}manifest.json`,
        categories: STORE_CATEGORY_KEYS.map((key) => storeCategoryPublicPath(key)),
        paginationPattern: `${STORE_PUBLIC_PATH}/:category/page/:page`,
        nestedArtifactPattern: "store/{category}/page/{page}/index.html",
        flatArtifactPattern: "store-{category}-page-{page}.html",
        redirects: [
          STORE_INTERNAL_PATH,
          `${STORE_PUBLIC_PATH}/`,
          ...storeCategoryAliasPaths(),
          `${STORE_PUBLIC_PATH}/:category/`,
          `${STORE_PUBLIC_PATH}/:category/page/1`,
          `${STORE_PUBLIC_PATH}/:category/page/02`,
          YELLOWCART_LEGACY_PUBLIC_PATH,
          YELLOWCART_LEGACY_INTERNAL_PATH,
          YELLOWCARD_LEGACY_PUBLIC_PATH,
          YELLOWCARD_LEGACY_INTERNAL_PATH,
        ],
      },
      flags: { canonical: FLAGS_CANONICAL_PATH, legacy: FLAGS_LEGACY_PATH, asset: "/__gg/flags.json" },
      mobileQueryNormalization: {
        exactValues: ["0", "1"],
        preserveOtherQueryParams: true,
        malformedValuesIgnored: true,
        developmentStatus: 302,
        stagingStatus: 302,
        productionStatus: 302,
      },
      legacyBloggerViews: {
        decision: "redirect-to-root",
        target: "/",
        developmentStatus: 302,
        stagingStatus: 302,
        productionStatus: 301,
        paths: ["/view", "/view/classic", "/view/flipcard", "/view/magazine", "/view/mosaic", "/view/sidebar", "/view/snapshot", "/view/timeslide"],
      },
      diagnostics: ["/__gg/health", "/__gg/routes", "/__gg/robots", "/__gg/headers?url=/", "/__gg/pwa"],
    },
    policy: routePolicyPreview(url.toString(), flags),
    flags,
  };
}

async function handleDiagnostics(request, flags) {
  const url = new URL(request.url);

  if (url.pathname === "/__gg/health") return jsonResponse(diagnosticsPayload(request, flags));

  if (url.pathname === "/__gg/routes") {
    return jsonResponse({
      mode: flags.mode,
      canonicalHost: SITE.canonicalHost,
      routeMatrix: {
        indexInProduction: ["/", "/YYYY/MM/slug.html", "/p/*.html", "/landing", STORE_PUBLIC_PATH, `${STORE_PUBLIC_PATH}/:category`, `${STORE_PUBLIC_PATH}/:category/page/:page`],
        noindexInProduction: ["/search", "/search/label/*", "/view/*", "/offline.html", "/sw.js", "/manifest.webmanifest", FLAGS_CANONICAL_PATH, "/__gg/*"],
        utility: ["/feeds/*", "/sitemap.xml"],
        normalizedWhenEnabled: ["?m=1", "?m=0"],
        mobileQueryNormalizationStatus: { development: 302, staging: 302, production: 302 },
        alwaysRedirected: {
          [`${STORE_PUBLIC_PATH}/`]: STORE_PUBLIC_PATH,
          ...storeCategoryAliasRedirects(),
          [`${STORE_PUBLIC_PATH}/:category/`]: `${STORE_PUBLIC_PATH}/:category`,
          [`${STORE_PUBLIC_PATH}/:category/page/1`]: `${STORE_PUBLIC_PATH}/:category`,
          [`${STORE_PUBLIC_PATH}/:category/page/02`]: `${STORE_PUBLIC_PATH}/:category/page/2`,
          "/view": "/",
          "/view/*": "/",
          [STORE_INTERNAL_PATH]: STORE_PUBLIC_PATH,
          [YELLOWCART_LEGACY_PUBLIC_PATH]: STORE_PUBLIC_PATH,
          [YELLOWCART_LEGACY_INTERNAL_PATH]: STORE_PUBLIC_PATH,
          [YELLOWCARD_LEGACY_PUBLIC_PATH]: STORE_PUBLIC_PATH,
          [YELLOWCARD_LEGACY_INTERNAL_PATH]: STORE_PUBLIC_PATH,
        },
      },
      vanity: flags.vanity,
      staticAssetMap: Object.fromEntries(STATIC_ROUTE_ASSET_MAP),
    });
  }

  if (url.pathname === "/__gg/robots") {
    const previewFlags = diagnosticsFlagsForMode(flags, normalizeMode(url.searchParams.get("mode")));
    return jsonResponse({
      mode: previewFlags.mode,
      robotsTxt: buildRobotsTxt(request, previewFlags),
      robotsTagDefault: previewFlags.mode === "production" ? "route-specific" : developmentRobotsTag(),
    });
  }

  if (url.pathname === "/__gg/headers") {
    const target = url.searchParams.get("url") || "/";
    const targetUrl = new URL(target, request.url);
    const previewFlags = diagnosticsFlagsForMode(flags, normalizeMode(url.searchParams.get("mode")));
    return jsonResponse(routePolicyPreview(targetUrl.toString(), previewFlags));
  }

  if (url.pathname === "/__gg/pwa") return jsonResponse(pwaDiagnostics(flags));

  return jsonResponse({ ok: false, error: "Unknown diagnostic endpoint" }, { status: 404 });
}

async function handleCspReport(request) {
  try { await request.text(); } catch (_) {}
  return new Response(null, { status: 204 });
}

function isHtmlResponse(resp) {
  return isHtmlContentType(resp.headers.get("content-type"));
}

function responseFromHtml(resp, html) {
  const headers = new Headers(resp.headers);
  headers.delete("content-length");
  return new Response(html, { status: resp.status, statusText: resp.statusText, headers });
}

function normalizeLandingContactHtml(html) {
  if (!html) return html;
  return String(html)
    .replaceAll("#gg-landing-hero-5", "#contact")
    .replace(/\bid=(['"])gg-landing-hero-5\1/gi, `id="contact"`);
}

function normalizeMetadataUrlValue(rawValue, requestUrl) {
  const value = String(rawValue || "").trim();
  if (!value) return value;

  try {
    const url = new URL(value, requestUrl);
    if (url.hostname === SITE.apexHost) url.hostname = SITE.canonicalHost;
    url.pathname = (url.pathname || "/").replace(/\/{2,}/g, "/");
    return url.toString();
  } catch (_) {
    return value;
  }
}

function replaceTagAttributeValue(tag, attrName, nextValue) {
  return String(tag || "").replace(
    new RegExp(`(${attrName}=['"])([^'"]*)(['"])`, "i"),
    (_, prefix, currentValue, suffix) => `${prefix}${nextValue(currentValue)}${suffix}`
  );
}

function normalizeError404RouteMetadataHtml(html, requestUrl) {
  const source = String(html || "");
  if (!/\bdata-gg-(?:surface|page)=['"]error404['"]/i.test(source)) return source;

  let out = source;
  out = out.replace(
    /<link\b[^>]*\brel=['"]canonical['"][^>]*>/i,
    (tag) => replaceTagAttributeValue(tag, "href", (value) => normalizeMetadataUrlValue(value, requestUrl))
  );
  out = out.replace(
    /<meta\b[^>]*\bproperty=['"]og:url['"][^>]*>/i,
    (tag) => replaceTagAttributeValue(tag, "content", (value) => normalizeMetadataUrlValue(value, requestUrl))
  );

  return out;
}

function hasCurrentTemplateContract(html) {
  const source = String(html || "");
  const checks = {
    shell: /\bid\s*=\s*['"]gg-shell['"]/i.test(source),
    main: /\b<main\b[^>]*\bid\s*=\s*['"]main['"]/i.test(source),
    dock: /\bid\s*=\s*['"]gg-dock['"]/i.test(source),
    commandPanel: /\bid\s*=\s*['"]gg-command-panel['"]/i.test(source),
    previewSheet: /\bid\s*=\s*['"]gg-preview-sheet['"]/i.test(source),
    morePanel: /\bid\s*=\s*['"]gg-more-panel['"]/i.test(source),
  };
  const hardReasons = [];
  const warnings = [];
  if (!checks.shell) hardReasons.push("missing_gg_shell");
  if (!checks.dock) hardReasons.push("missing_dock");
  if (!checks.commandPanel) hardReasons.push("missing_command_panel");
  if (!checks.previewSheet) hardReasons.push("missing_preview_sheet");
  if (!checks.morePanel) hardReasons.push("missing_more_panel");
  if (!checks.main) warnings.push("missing_main_landmark");
  return { ok: hardReasons.length === 0, reasons: hardReasons, warnings, checks };
}

function annotateTemplateContract(resp, html) {
  const contract = hasCurrentTemplateContract(html);
  const headers = new Headers(resp.headers);
  headers.set("X-GG-Template-Contract", contract.ok ? "ok" : "mismatch");
  if (contract.reasons && contract.reasons.length) headers.set("X-GG-Template-Contract-Reasons", contract.reasons.join(","));
  if (contract.warnings && contract.warnings.length) headers.set("X-GG-Template-Contract-Warnings", contract.warnings.join(","));
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}

function shouldBypassHtmlMutation(pathname) {
  const path = String(pathname || "");
  if (!path) return false;
  if (/\.txt$/i.test(path)) return true;
  if (path.startsWith("/.well-known/")) return true;
  if (path.startsWith("/feeds/")) return true;
  if (path === "/sitemap.xml") return true;
  return false;
}

async function handleHtml(request, flags, response, options = {}) {
  const route = options.route || classifyRoute(request);
  const url = new URL(request.url);
  if (!isHtmlResponse(response)) return withResponsePolicy(response, request, flags, { route, headers: options.headers, storeDebug: options.storeDebug });
  if (shouldBypassHtmlMutation(url.pathname)) return withResponsePolicy(response, request, flags, { route, headers: options.headers, storeDebug: options.storeDebug });

  let html = "";
  try { html = await response.clone().text(); } catch (_) { return withResponsePolicy(response, request, flags, { route, headers: options.headers, storeDebug: options.storeDebug }); }
  if (!html) return withResponsePolicy(response, request, flags, { route, headers: options.headers, storeDebug: options.storeDebug });

  let out = html;
  if (flags.edge.mutateLandingContactAnchor) out = normalizeLandingContactHtml(out);
  out = normalizeError404RouteMetadataHtml(out, request.url);

  let wrapped = responseFromHtml(response, out);
  if (flags.edge.annotateTemplateContract) wrapped = annotateTemplateContract(wrapped, out);
  return withResponsePolicy(wrapped, request, flags, { route, headers: options.headers, storeDebug: options.storeDebug });
}

function isBloggerBackedHtmlRoute(route) {
  return [ROOT_LISTING_LEGACY_ROUTE, "label", "search", "post", "static-page", "html", "origin"].includes(route);
}

function shouldAddInternalMobileZero(request, route) {
  if (!isSafeMethod(request)) return false;
  if (!isBloggerBackedHtmlRoute(route)) return false;
  const url = new URL(request.url);
  return !url.searchParams.has("m");
}

function buildOriginRequest(request, route, flags, options = {}) {
  const originUrl = new URL(request.url);
  const headers = new Headers(request.headers);
  const forceMobileZero = options.forceMobileZero === true;
  const shouldNormalizeMobile = forceMobileZero || shouldAddInternalMobileZero(request, route, flags);

  if (shouldNormalizeMobile) {
    originUrl.searchParams.set("m", "0");
    headers.set(ORIGIN_MOBILE_NORMALIZED_HEADER, "1");
  }

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return new Request(originUrl.toString(), init);
}

function canonicalComparableUrl(input, options = {}) {
  const url = new URL(input.toString());
  url.hash = "";
  if (url.hostname === SITE.apexHost) url.hostname = SITE.canonicalHost;
  if (options.stripMobileQuery) url.searchParams.delete("m");
  const sortedEntries = Array.from(url.searchParams.entries()).sort(([aKey, aValue], [bKey, bValue]) => {
    if (aKey === bKey) return aValue.localeCompare(bValue);
    return aKey.localeCompare(bKey);
  });
  url.search = "";
  for (const [key, value] of sortedEntries) {
    url.searchParams.append(key, value);
  }
  return url.toString();
}

function getOriginMobileRedirectDetails(request, originRequest, response) {
  if (!isRedirectStatus(response.status)) return null;

  const location = response.headers.get("location");
  if (!location) return null;

  let locationUrl;
  try {
    locationUrl = new URL(location, request.url);
  } catch (_) {
    return null;
  }

  if (locationUrl.hostname !== SITE.canonicalHost && locationUrl.hostname !== SITE.apexHost) return null;

  const mobileValues = locationUrl.searchParams.getAll("m");
  if (!mobileValues.length) return null;
  if (mobileValues.some((value) => value !== "0" && value !== "1")) return null;

  const fromComparable = canonicalComparableUrl(originRequest.url, { stripMobileQuery: true });
  const toComparable = canonicalComparableUrl(locationUrl, { stripMobileQuery: true });
  if (fromComparable !== toComparable) return null;

  return {
    reason: "blogger-origin-mobile-redirect-suppressed",
    from: originRequest.url,
    to: locationUrl.toString(),
    status: response.status,
  };
}

function buildSuppressedOriginMobileResponse() {
  return textResponse("Upstream mobile redirect suppressed after internal normalization", { status: 502 });
}

async function fetchOrigin(request, route, flags) {
  if (!isBloggerBackedHtmlRoute(route)) {
    return {
      response: await fetch(request),
      headers: null,
    };
  }

  let originRequest = buildOriginRequest(request, route, flags);
  let response = await fetch(originRequest);
  let redirectDetails = getOriginMobileRedirectDetails(request, originRequest, response);

  if (!redirectDetails) {
    return {
      response,
      headers: null,
    };
  }

  if (originRequest.headers.get(ORIGIN_MOBILE_NORMALIZED_HEADER) === "1") {
    return {
      response: buildSuppressedOriginMobileResponse(),
      headers: redirectDiagnosticsHeaders(redirectDetails),
    };
  }

  originRequest = buildOriginRequest(request, route, flags, { forceMobileZero: true });
  response = await fetch(originRequest);
  const secondRedirectDetails = getOriginMobileRedirectDetails(request, originRequest, response);
  if (secondRedirectDetails) redirectDetails = secondRedirectDetails;

  if (secondRedirectDetails) {
    return {
      response: buildSuppressedOriginMobileResponse(),
      headers: redirectDiagnosticsHeaders(redirectDetails),
    };
  }

  return {
    response,
    headers: redirectDiagnosticsHeaders(redirectDetails),
  };
}

async function handleFlagsRoute(request, flags) {
  return withResponsePolicy(jsonResponse(flags), request, flags, { route: "flags" });
}

async function handleRobotsRoute(request, flags) {
  return withResponsePolicy(textResponse(buildRobotsTxt(request, flags), { contentType: "text/plain; charset=utf-8" }), request, flags, { route: "robots" });
}

async function handleRequest(request, env, ctx) {
  const flags = await loadFlags(env);
  const url = new URL(request.url);
  const route = classifyRoute(request);
  // Extracted app assets must bypass the /__gg diagnostics router.
  // Without this early branch, /__gg/assets/*.css/js is treated as an
  // unknown diagnostic endpoint and the Blogger shell renders without runtime bindings.
  if (url.pathname.startsWith(GG_ASSET_PREFIX)) {
    const staticResponse = await serveFromAssets(request, env, url.pathname);

    return withResponsePolicy(staticResponse, request, flags, {
      route: "asset",
      headers: {
        "Content-Type": url.pathname.endsWith(".css")
          ? "text/css; charset=utf-8"
          : url.pathname.endsWith(".js")
            ? "application/javascript; charset=utf-8"
            : staticResponse.headers.get("content-type") || "application/octet-stream"
      }
    });
  }
  if (!isSafeMethod(request) && url.pathname !== "/api/csp-report") {
    const origin = await fetchOrigin(request, route, flags);
    return handleHtml(request, flags, origin.response, { headers: origin.headers, route });
  }

  const canonicalRedirect = maybeCanonicalRedirect(request, flags);
  if (canonicalRedirect) {
    return withRedirectDiagnostics(canonicalRedirect, request, flags, {
      reason: "canonical-host-or-https-normalization",
    });
  }

  if (shouldHardBlockBot(request, flags) && url.pathname !== "/robots.txt") {
    return withResponsePolicy(textResponse("Blocked in development mode", { status: 403 }), request, flags);
  }

  if (url.pathname === "/api/csp-report" && request.method === "POST") return handleCspReport(request);

  const legacy = legacyViewRedirect(request, flags);
  if (legacy) {
    return withRedirectDiagnostics(legacy, request, flags, {
      reason: "legacy-blogger-view-normalization",
    });
  }

  if (url.pathname === "/robots.txt") return handleRobotsRoute(request, flags);
  if (url.pathname === FLAGS_CANONICAL_PATH || url.pathname === FLAGS_LEGACY_PATH) return handleFlagsRoute(request, flags);
  if (url.pathname.startsWith("/__gg/")) return withResponsePolicy(await handleDiagnostics(request, flags), request, flags, { route: "diagnostic" });

  const vanity = vanityRedirect(request, flags);
  if (vanity) {
    return withRedirectDiagnostics(vanity, request, flags, {
      reason: "vanity-path-normalization",
    });
  }

  const mobile = normalizeMobileQueryRedirect(request, flags);
  if (mobile) {
    return withRedirectDiagnostics(mobile, request, flags, {
      reason: "blogger-mobile-query-normalization",
    });
  }

  const staticResponse = await handleStaticRoutes(request, env, flags);
  if (staticResponse) {
    const response = staticResponse.response || staticResponse;
    const responseRoute = staticResponse.route || route;
    const storeDebug = staticResponse.storeDebug || (responseRoute === "store" ? { source: "assets" } : null);

    if (isRedirectStatus(response.status)) {
      return withRedirectDiagnostics(response, request, flags, {
        reason: staticResponse.redirectReason || (url.pathname === LANDING_INTERNAL_PATH
          ? "landing-internal-path-normalization"
          : "store-route-normalization"),
      }, { route: responseRoute });
    }
    return withResponsePolicy(response, request, flags, {
      route: responseRoute,
      storeDebug,
    });
  }

  const origin = await fetchOrigin(request, route, flags);
  return handleHtml(request, flags, origin.response, {
    headers: origin.headers,
    route,
    storeDebug: route === "store"
      ? { source: isBloggerBackedHtmlRoute(route) ? "blogger-origin" : "worker-fallback" }
      : null,
  });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      const flags = normalizeFlags(null, env || {});
      return withResponsePolicy(
        jsonResponse({ ok: false, error: "edge_worker_failure", message: error && error.message ? error.message : String(error) }, { status: 500 }),
        request,
        flags,
        { route: "diagnostic" }
      );
    }
  },
};
