import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || null;
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return null;
};

const mode = getArg("--mode");
if (!mode || !["config", "live"].includes(mode)) {
  console.error("Usage: node tools/verify-headers.mjs --mode=config|live [--base=https://www.pakrpp.com]");
  process.exit(1);
}

const root = process.cwd();
const contractPath = path.join(root, "tools", "headers-contract.json");
if (!fs.existsSync(contractPath)) {
  console.error("ERROR: tools/headers-contract.json missing");
  process.exit(1);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const base = getArg("--base") || contract.base || "https://www.pakrpp.com";

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function extractReleaseId(xml) {
  const m = xml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css)/);
  return m ? m[1] : null;
}

const indexXml = readFile("index.prod.xml");
const releaseId = extractReleaseId(indexXml);
if (!releaseId) {
  console.error("ERROR: unable to extract release id from index.prod.xml");
  process.exit(1);
}

function resolvePath(p) {
  return p.replace(/<REL>|<RELEASE_ID>/g, releaseId);
}

function parseCacheControl(cc) {
  const tokens = (cc || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  let maxAge = null;
  for (const t of tokens) {
    if (t.startsWith("max-age=")) {
      const n = parseInt(t.split("=")[1], 10);
      if (!Number.isNaN(n)) maxAge = n;
    }
  }
  return { tokens, maxAge };
}

function hasTokens(tokens, required) {
  return required.every((t) => tokens.includes(t));
}

function cacheControlMatches(cc, rule) {
  const { tokens, maxAge } = parseCacheControl(cc);
  if (rule.anyOf && rule.anyOf.length) {
    const ok = rule.anyOf.some((group) => hasTokens(tokens, group));
    if (!ok) return `cache-control missing anyOf tokens: ${JSON.stringify(rule.anyOf)} (got ${cc})`;
  }
  if (rule.allOf && rule.allOf.length) {
    if (!hasTokens(tokens, rule.allOf)) {
      return `cache-control missing tokens: ${rule.allOf.join(", ")} (got ${cc})`;
    }
  }
  if (rule.minMaxAge !== undefined && rule.minMaxAge !== null) {
    if (maxAge === null || maxAge < rule.minMaxAge) {
      return `cache-control max-age < ${rule.minMaxAge} (got ${cc || ""})`;
    }
  }
  if (rule.maxMaxAge !== undefined && rule.maxMaxAge !== null) {
    if (maxAge === null || maxAge > rule.maxMaxAge) {
      return `cache-control max-age > ${rule.maxMaxAge} (got ${cc || ""})`;
    }
  }
  return null;
}

function contentTypeMatches(ct, rule) {
  if (!rule) return null;
  if (!ct) return "content-type missing";
  const re = new RegExp(rule.regex, "i");
  if (!re.test(ct)) {
    return `content-type mismatch (expected ${rule.regex}, got ${ct})`;
  }
  return null;
}

function extractSetCache(src, condition) {
  const idx = src.lastIndexOf(condition);
  if (idx === -1) return null;
  const slice = src.slice(idx);
  const m = slice.match(/setCache\("([^"]+)"\)/);
  return m ? m[1] : null;
}

function extractHeaderSet(src, condition, headerName) {
  const idx = src.lastIndexOf(condition);
  if (idx === -1) return null;
  const slice = src.slice(idx);
  const re = new RegExp(`headers\\.set\\(\"${headerName}\",\\s*\"([^\"]+)\"\\)`);
  const m = slice.match(re);
  return m ? m[1] : null;
}

function workerCacheForPath(pathname, workerSrc) {
  if (pathname.startsWith("/assets/latest/")) {
    return extractSetCache(workerSrc, 'pathname.startsWith("/assets/latest/")');
  }
  if (pathname.startsWith("/assets/v/")) {
    return extractSetCache(workerSrc, 'pathname.startsWith("/assets/v/")');
  }
  if (pathname === "/sw.js") {
    return extractSetCache(workerSrc, 'pathname === "/sw.js"');
  }
  if (pathname === "/manifest.webmanifest" || pathname === "/offline.html") {
    return extractSetCache(workerSrc, 'pathname === "/manifest.webmanifest" || pathname === "/offline.html"');
  }
  if (pathname === "/gg-flags.json") {
    return extractHeaderSet(workerSrc, 'pathname === "/gg-flags.json"', "Cache-Control");
  }
  return null;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method: "HEAD", redirect: "manual", signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchWithRetry(url, timeoutMs, retries) {
  let lastErr = null;
  for (let i = 0; i < retries; i += 1) {
    try {
      return await fetchWithTimeout(url, timeoutMs);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function printSummary(results) {
  console.log(`VERIFY_HEADERS (${mode})`);
  results.forEach((r) => {
    console.log(`${r.ok ? "OK" : "FAIL"} ${r.id} ${r.note}`);
  });
}

const rules = Array.isArray(contract.rules) ? contract.rules : [];

if (mode === "config") {
  const workerSrc = readFile("src/worker.js");
  if (!workerSrc) {
    console.error("ERROR: src/worker.js missing");
    process.exit(1);
  }

  const results = [];
  let failure = null;

  for (const rule of rules) {
    if (!rule.modes || !rule.modes.includes("config")) continue;
    if (!rule.path) continue;

    const pathResolved = resolvePath(rule.path);
    const cc = workerCacheForPath(pathResolved, workerSrc);
    if (!cc) {
      const msg = `worker cache rule not found for ${pathResolved}`;
      results.push({ id: rule.id || pathResolved, ok: false, note: msg });
      failure = failure || msg;
      continue;
    }

    const cacheErr = cacheControlMatches(cc, rule.cacheControl || {});
    if (cacheErr) {
      results.push({ id: rule.id || pathResolved, ok: false, note: cacheErr });
      failure = failure || cacheErr;
      continue;
    }

    results.push({ id: rule.id || pathResolved, ok: true, note: `cache-control=${cc}` });
  }

  printSummary(results);
  if (failure) {
    console.error(`ERROR: ${failure}`);
    process.exit(1);
  }
  process.exit(0);
}

if (mode === "live") {
  const results = [];
  let failure = null;
  const timeoutMs = 6000;

  for (const rule of rules) {
    if (!rule.modes || !rule.modes.includes("live")) continue;

    if (rule.type === "redirect") {
      const url = rule.url;
      try {
        const res = await fetchWithRetry(url, timeoutMs, 2);
        const okStatus = rule.statusAny && rule.statusAny.includes(res.status);
        const loc = res.headers.get("location") || "";
        const okLoc = rule.locationPrefix ? loc.startsWith(rule.locationPrefix) : true;
        const ok = okStatus && okLoc;
        const note = `status=${res.status} location=${loc || "(none)"}`;
        results.push({ id: rule.id || url, ok, note });
        if (!ok && !failure) {
          failure = `redirect mismatch for ${url} (${note})`;
        }
      } catch (e) {
        const msg = `redirect check failed for ${url}: ${e && e.message ? e.message : String(e)}`;
        results.push({ id: rule.id || url, ok: false, note: msg });
        failure = failure || msg;
      }
      continue;
    }

    if (!rule.path) continue;
    const pathResolved = resolvePath(rule.path);
    const url = `${base}${pathResolved}`;

    try {
      const res = await fetchWithRetry(url, timeoutMs, 2);
      const statusOk = rule.status ? res.status === rule.status : true;
      const cc = res.headers.get("cache-control") || "";
      const ct = res.headers.get("content-type") || "";
      const cacheErr = cacheControlMatches(cc, rule.cacheControl || {});
      const ctErr = rule.contentType ? contentTypeMatches(ct, rule.contentType) : null;

      let ok = statusOk && !cacheErr && !ctErr;
      let note = `status=${res.status} cache-control=${cc || "(none)"}`;
      if (ct) note += ` content-type=${ct}`;
      results.push({ id: rule.id || pathResolved, ok, note });
      if (!ok && !failure) {
        if (!statusOk) failure = `status mismatch for ${url} (expected ${rule.status}, got ${res.status})`;
        else if (cacheErr) failure = `cache-control mismatch for ${url} (${cacheErr})`;
        else if (ctErr) failure = `content-type mismatch for ${url} (${ctErr})`;
      }
    } catch (e) {
      const msg = `request failed for ${url}: ${e && e.message ? e.message : String(e)}`;
      results.push({ id: rule.id || pathResolved, ok: false, note: msg });
      failure = failure || msg;
    }
  }

  printSummary(results);
  if (failure) {
    console.error(`ERROR: ${failure}`);
    process.exit(1);
  }
  process.exit(0);
}
