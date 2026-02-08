#!/usr/bin/env node
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

function parseArgs(argv) {
  const out = { base: '' };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base' && argv[i + 1]) {
      out.base = argv[i + 1];
      i++;
      continue;
    }
    if (arg.startsWith('--base=')) {
      out.base = arg.split('=')[1] || '';
    }
  }
  return out;
}

function normalizeBase(raw) {
  let base = String(raw || '').trim();
  if (!base) return '';
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
  return base.replace(/\/+$/, '');
}

function fetchUrl(url, opts = {}) {
  const maxRedirects = opts.maxRedirects || 5;
  const headers = Object.assign(
    {
      'User-Agent': 'gg-verify-js-chain/1.0',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Accept-Encoding': 'identity'
    },
    opts.headers || {}
  );

  function requestOnce(targetUrl, redirectCount) {
    return new Promise((resolve, reject) => {
      let urlObj;
      try {
        urlObj = new URL(targetUrl);
      } catch (err) {
        reject(err);
        return;
      }
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(
        {
          method: 'GET',
          headers,
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + urlObj.search
        },
        (res) => {
          const status = res.statusCode || 0;
          const location = res.headers.location;
          if ([301, 302, 303, 307, 308].includes(status) && location && redirectCount < maxRedirects) {
            const nextUrl = new URL(location, urlObj).toString();
            res.resume();
            requestOnce(nextUrl, redirectCount + 1).then(resolve, reject);
            return;
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const body = Buffer.concat(chunks);
            resolve({
              url: urlObj.toString(),
              status,
              headers: res.headers || {},
              body
            });
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  return requestOnce(url, 0);
}

function extractScriptSrc(html) {
  const list = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    list.push(match[2]);
  }
  return list;
}

function classifyUrl(u) {
  if (/boot\.js(\?|#|$)/i.test(u)) return 'boot';
  if (/main\.js(\?|#|$)/i.test(u)) return 'main';
  if (/app\.js(\?|#|$)/i.test(u)) return 'app';
  if (/core\.js(\?|#|$)/i.test(u)) return 'core';
  if (/\/modules\/ui\.js(\?|#|$)/i.test(u) || /ui\.js(\?|#|$)/i.test(u)) return 'ui';
  return 'other';
}

function deriveSibling(url, fromName, toName) {
  try {
    const u = new URL(url);
    if (!u.pathname.endsWith(fromName)) return '';
    u.pathname = u.pathname.replace(new RegExp(fromName + '$'), toName);
    return u.toString();
  } catch (_) {
    return '';
  }
}

function markForCheck(map, url, type, source) {
  if (!url) return;
  const key = url.toString();
  if (!map.has(key)) {
    map.set(key, { url: key, types: new Set(), sources: new Set() });
  }
  const entry = map.get(key);
  entry.types.add(type);
  if (source) entry.sources.add(source);
}

function contentTypeIsJs(ct) {
  if (!ct) return false;
  const val = String(ct).toLowerCase();
  return val.includes('javascript') || val.includes('ecmascript');
}

function markerBootOk(body) {
  return /main\.js|loadMain|mainUrl|GG_BOOT/i.test(body);
}

function markerMainOk(body) {
  return /GG\.|window\.GG|core\.js|modules\/ui\.js|requestUi/i.test(body);
}

async function main() {
  const args = parseArgs(process.argv);
  const base = normalizeBase(args.base || 'https://www.pakrpp.com');
  if (!base) {
    console.error('FAIL: missing --base');
    process.exit(1);
  }

  const pages = [
    { label: 'home', path: '/' },
    { label: 'blog', path: '/blog' }
  ];

  const failures = [];
  const warnings = [];
  const checks = new Map();

  for (const page of pages) {
    const url = `${base}${page.path}?x=${Date.now()}`;
    let res;
    try {
      res = await fetchUrl(url, { headers: { Accept: 'text/html' } });
    } catch (err) {
      failures.push(`FAIL: ${page.label} html fetch error (${err.message || err})`);
      continue;
    }
    if (res.status !== 200) {
      failures.push(`FAIL: ${page.label} html status ${res.status} (${url})`);
      continue;
    }
    const html = res.body.toString('utf8');
    const scripts = extractScriptSrc(html);
    const abs = scripts.map((src) => {
      try {
        return new URL(src, url).toString();
      } catch (_) {
        return '';
      }
    }).filter(Boolean);

    const bootScripts = abs.filter((u) => /boot\.js(\?|#|$)/i.test(u));
    if (!bootScripts.length) {
      failures.push(`FAIL: ${page.label} missing boot.js script tag`);
    } else {
      bootScripts.forEach((u) => markForCheck(checks, u, 'boot', `${page.label}:html`));
    }

    const mainScripts = abs.filter((u) => /main\.js(\?|#|$)/i.test(u));
    mainScripts.forEach((u) => markForCheck(checks, u, 'main', `${page.label}:html`));

    const coreScripts = abs.filter((u) => /core\.js(\?|#|$)/i.test(u));
    coreScripts.forEach((u) => markForCheck(checks, u, 'core', `${page.label}:html`));

    const uiScripts = abs.filter((u) => /\/modules\/ui\.js(\?|#|$)/i.test(u));
    uiScripts.forEach((u) => markForCheck(checks, u, 'ui', `${page.label}:html`));
  }

  // Derive chain from boot -> main -> core -> ui
  for (const entry of Array.from(checks.values())) {
    if (entry.types.has('boot')) {
      const mainUrl = deriveSibling(entry.url, 'boot.js', 'main.js');
      if (mainUrl) markForCheck(checks, mainUrl, 'main', 'derived:boot');
    }
  }
  for (const entry of Array.from(checks.values())) {
    if (entry.types.has('main') || entry.types.has('app')) {
      const coreUrl = deriveSibling(entry.url, 'main.js', 'core.js') || deriveSibling(entry.url, 'app.js', 'core.js');
      if (coreUrl) markForCheck(checks, coreUrl, 'core', 'derived:main');
    }
  }
  for (const entry of Array.from(checks.values())) {
    if (entry.types.has('core')) {
      const uiUrl = deriveSibling(entry.url, 'core.js', 'modules/ui.js');
      if (uiUrl) markForCheck(checks, uiUrl, 'ui', 'derived:core');
    }
  }

  for (const entry of checks.values()) {
    let res;
    try {
      res = await fetchUrl(entry.url, { headers: { Accept: '*/*' } });
    } catch (err) {
      failures.push(`FAIL: ${entry.url} fetch error (${err.message || err})`);
      continue;
    }

    if (res.status !== 200) {
      failures.push(`FAIL: ${entry.url} status ${res.status}`);
      continue;
    }

    const ct = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || '';
    if (!contentTypeIsJs(ct)) {
      failures.push(`FAIL: ${entry.url} content-type not javascript (${ct || 'missing'})`);
      continue;
    }

    const size = res.body ? res.body.length : 0;
    if (size <= 200) {
      failures.push(`FAIL: ${entry.url} body too small (${size} bytes)`);
      continue;
    }

    const bodyStr = res.body.toString('utf8');
    const types = Array.from(entry.types).sort().join(',');
    console.log(`OK: ${entry.url} [${types}] status=200 bytes=${size}`);

    if (entry.types.has('boot') && !markerBootOk(bodyStr)) {
      failures.push(`FAIL: ${entry.url} boot marker missing (expected main.js/loader string)`);
    }
    if ((entry.types.has('main') || entry.types.has('app')) && !markerMainOk(bodyStr)) {
      failures.push(`FAIL: ${entry.url} main/app marker missing (expected GG namespace or core/ui load)`);
    }
    if (entry.types.has('core') && !/GG\.boot|GG\.modules|GG\.core/i.test(bodyStr)) {
      warnings.push(`WARN: ${entry.url} core marker not detected`);
    }
    if (entry.types.has('ui') && !/GG\.modules\.ui|loadBucket|GG\.modules/i.test(bodyStr)) {
      warnings.push(`WARN: ${entry.url} ui marker not detected`);
    }
  }

  warnings.forEach((w) => console.warn(w));

  if (failures.length) {
    failures.forEach((f) => console.error(f));
    console.error(`FAIL: verify-js-chain (${failures.length} failure${failures.length === 1 ? '' : 's'})`);
    process.exit(1);
  }

  console.log('OK: verify-js-chain');
}

main().catch((err) => {
  console.error(`FAIL: verify-js-chain crashed (${err && err.message ? err.message : err})`);
  process.exit(1);
});
