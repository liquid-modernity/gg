const DEFAULT_CATALOG_CACHE_SECONDS = 60;
const DEFAULT_PING_CACHE_SECONDS = 300;
const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.pakrpp.com',
  'https://pakrpp.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export default {
  async fetch(request, env, ctx) {
    try {
      const cors = buildCorsHeaders(request, env);
      const url = new URL(request.url);

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            ...cors,
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
            'Vary': appendVary(null, 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers')
          }
        });
      }

      if (request.method !== 'POST' && request.method !== 'GET') {
        return jsonResponse({
          status: 'error',
          message: 'Method not allowed.'
        }, 405, cors);
      }

      const appsScriptUrl = String(env.APPS_SCRIPT_URL || '').trim();
      if (!appsScriptUrl) {
        return jsonResponse({
          status: 'error',
          message: 'Worker misconfigured: APPS_SCRIPT_URL is missing.'
        }, 500, cors);
      }

      const workerVersion = String(env.WORKER_VERSION || 'inohong-worker-v2');
      const requestData = await readRequestData(request, url);
      const action = String(requestData.action || '').trim();

      if (!action) {
        return jsonResponse({
          status: 'error',
          message: 'No action specified.'
        }, 400, cors);
      }

      const cacheEligible = request.method === 'POST' && (action === 'ping' || action === 'getCatalog');

      if (cacheEligible) {
        const cached = await maybeGetCachedResponse(request, requestData, action, env, cors, workerVersion);
        if (cached) return cached;
      }

      const upstreamResponse = await forwardToAppsScript(appsScriptUrl, requestData, action, env);
      const downstream = await buildDownstreamResponse(upstreamResponse, cors, action, workerVersion);

      if (cacheEligible && downstream.ok) {
        ctx.waitUntil(
          maybeCacheResponse(request, requestData, action, env, downstream, cors, workerVersion)
        );
      }

      return downstream;
    } catch (error) {
      return jsonResponse({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unexpected Worker error.'
      }, 500, buildCorsHeaders(request, env));
    }
  }
};

async function readRequestData(request, url) {
  if (request.method === 'GET') {
    return Object.fromEntries(url.searchParams.entries());
  }

  const contentType = request.headers.get('content-type') || '';
  const bodyText = await request.text();

  if (!bodyText.trim()) {
    throw new Error('Request body is empty.');
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('Content-Type must be application/json.');
  }

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error('Invalid JSON body.');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('JSON body must be an object.');
  }

  return data;
}

async function forwardToAppsScript(appsScriptUrl, payload, action, env) {
  const url = new URL(appsScriptUrl);

  const requestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'inohong-worker-v2'
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
    cf: { cacheTtl: 0, cacheEverything: false }
  };

  const response = await fetch(url.toString(), requestInit);
  return response;
}

async function buildDownstreamResponse(upstreamResponse, cors, action, workerVersion) {
  const text = await upstreamResponse.text();

  let payload;
  try {
    payload = text ? JSON.parse(text) : { status: 'error', message: 'Empty upstream response.' };
  } catch {
    payload = {
      status: 'error',
      message: 'Upstream returned invalid JSON.',
      upstreamStatus: upstreamResponse.status,
      upstreamText: text.slice(0, 500)
    };
  }

  const status = normalizeStatus(upstreamResponse.status, payload);

  const headers = {
    ...cors,
    'Content-Type': 'application/json; charset=utf-8',
    'X-GG-Worker': workerVersion,
    'X-GG-Action': action,
    'Cache-Control': 'no-store',
    'Vary': appendVary(upstreamResponse.headers.get('Vary'), 'Origin')
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers
  });
}

function normalizeStatus(upstreamStatus, payload) {
  if (Number.isInteger(upstreamStatus) && upstreamStatus >= 400) {
    return upstreamStatus;
  }

  const logicalStatus = String(payload?.status || '').toLowerCase();
  if (logicalStatus === 'denied') return 403;
  if (logicalStatus === 'error') return 400;
  return 200;
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);

  const allowOrigin = allowedOrigins.includes('*')
    ? '*'
    : (origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '*');

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'false'
  };
}

function parseAllowedOrigins(raw) {
  const input = String(raw || '').trim();
  if (!input) return DEFAULT_ALLOWED_ORIGINS;

  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendVary(existing, addition) {
  const parts = new Set();

  String(existing || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => parts.add(part));

  String(addition || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => parts.add(part));

  return Array.from(parts).join(', ');
}

function getCatalogCacheSeconds(env) {
  const n = Number(env.CATALOG_CACHE_SECONDS || DEFAULT_CATALOG_CACHE_SECONDS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_CATALOG_CACHE_SECONDS;
}

function getPingCacheSeconds(env) {
  const n = Number(env.PING_CACHE_SECONDS || DEFAULT_PING_CACHE_SECONDS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PING_CACHE_SECONDS;
}

async function maybeGetCachedResponse(request, requestData, action, env, cors, workerVersion) {
  const cache = caches.default;
  const cacheKey = await buildCacheKey(request.url, requestData, action, workerVersion);
  const hit = await cache.match(cacheKey);

  if (!hit) return null;

  const response = new Response(hit.body, hit);
  response.headers.set('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
  response.headers.set('Access-Control-Allow-Credentials', cors['Access-Control-Allow-Credentials']);
  response.headers.set('X-GG-Worker', workerVersion);
  response.headers.set('X-GG-Action', action);
  response.headers.set('X-GG-Cache', 'HIT');
  response.headers.set('Vary', appendVary(response.headers.get('Vary'), 'Origin'));

  return response;
}

async function maybeCacheResponse(request, requestData, action, env, response, cors, workerVersion) {
  const cache = caches.default;
  const cacheKey = await buildCacheKey(request.url, requestData, action, workerVersion);
  const cacheTtl = action === 'ping' ? getPingCacheSeconds(env) : getCatalogCacheSeconds(env);

  const cacheable = new Response(response.body, response);
  cacheable.headers.set('Cache-Control', `public, max-age=${cacheTtl}`);
  cacheable.headers.set('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
  cacheable.headers.set('Access-Control-Allow-Credentials', cors['Access-Control-Allow-Credentials']);
  cacheable.headers.set('X-GG-Worker', workerVersion);
  cacheable.headers.set('X-GG-Action', action);
  cacheable.headers.set('X-GG-Cache', 'MISS');
  cacheable.headers.set('Vary', appendVary(cacheable.headers.get('Vary'), 'Origin'));

  await cache.put(cacheKey, cacheable);
}

async function buildCacheKey(requestUrl, requestData, action, workerVersion) {
  const safePayload = { ...requestData };
  const digest = await sha256Hex(JSON.stringify(safePayload));
  const url = new URL(requestUrl);

  url.pathname = `/__inohong_cache/${workerVersion}/${action}/${digest}`;
  url.search = '';

  return new Request(url.toString(), { method: 'GET' });
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function jsonResponse(payload, status, cors) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...(cors || {}),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Vary': appendVary(null, 'Origin')
    }
  });
}