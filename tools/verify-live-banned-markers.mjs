const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const parsePositiveInt = (name, fallback) => {
  const raw = parseInt(getArg(name), 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_MAX = 4;
const DEFAULT_RETRY_BASE_MS = 800;
const DEFAULT_RETRY_CAP_MS = 10000;
const DEFAULT_INTER_REQUEST_DELAY_MS = 250;
const DEFAULT_USER_AGENT = "gg-live-gate/1.0 (+https://www.pakrpp.com)";
const BANNED_MARKERS = [
  "Feed unavailable",
  "Dummy form",
  "Curated stories are loading",
  "YOUR_HANDLE",
];

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || "").trim();
const timeoutMs = parsePositiveInt("--timeout-ms", DEFAULT_TIMEOUT_MS);
const retryMax = parsePositiveInt("--retry-max", DEFAULT_RETRY_MAX);
const retryBaseMs = parsePositiveInt("--retry-base-ms", DEFAULT_RETRY_BASE_MS);
const retryCapMs = parsePositiveInt("--retry-cap-ms", DEFAULT_RETRY_CAP_MS);
const interRequestDelayMs = parsePositiveInt(
  "--inter-request-delay-ms",
  DEFAULT_INTER_REQUEST_DELAY_MS
);
const userAgent = (getArg("--user-agent") || DEFAULT_USER_AGENT).trim() || DEFAULT_USER_AGENT;

const report = {
  transient: [],
  unavailable: [],
  functional: [],
};

const addTransient = (message) => {
  report.transient.push(message);
};

const addUnavailable = (message) => {
  report.unavailable.push(`LIVE UNAVAILABLE AFTER RETRIES: ${message}`);
};

const addFunctional = (message) => {
  report.functional.push(`FUNCTIONAL FAIL: ${message}`);
};

if (!baseRaw) {
  addFunctional("missing --base");
}

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);
const HOME_URL = `${base}/`;
const BLOG_URL = `${base}/blog`;

const sleep = (ms) => {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
  if (safe <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, safe));
};

const parseRetryAfterMs = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return 0;

  if (/^\d+$/.test(value)) {
    const seconds = parseInt(value, 10);
    if (!Number.isFinite(seconds) || seconds < 0) return 0;
    return seconds * 1000;
  }

  const when = Date.parse(value);
  if (!Number.isFinite(when)) return 0;
  const delta = when - Date.now();
  return delta > 0 ? delta : 0;
};

const nextWaitMs = (attempt, retryAfterMs) => {
  const exp = Math.min(retryCapMs, retryBaseMs * 2 ** Math.max(0, attempt - 1));
  const jitterBound = Math.max(120, Math.floor(exp * 0.25));
  const jitter = Math.floor(Math.random() * jitterBound);
  if (retryAfterMs > 0) return retryAfterMs + jitter;
  return exp + jitter;
};

const withCacheBust = (url) => {
  const sep = String(url || "").includes("?") ? "&" : "?";
  return `${url}${sep}x=${Date.now()}`;
};

const normalizeUrl = (raw) => {
  try {
    return new URL(raw).toString();
  } catch (_) {
    const path = String(raw || "").trim();
    if (!path) return "";
    const prefixed = path.startsWith("/") ? path : `/${path}`;
    return `${base}${prefixed}`;
  }
};

const excerptAround = (source, index, marker) => {
  if (index < 0) return "";
  const start = Math.max(0, index - 80);
  const end = Math.min(source.length, index + marker.length + 80);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
};

const findPostUrl = (html, baseUrl) => {
  const hrefRe = /href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  for (const m of html.matchAll(hrefRe)) {
    const raw = String(m[1] || m[2] || m[3] || "").trim();
    if (!raw) continue;
    if (/^mailto:|^tel:|^javascript:/i.test(raw)) continue;
    let candidate;
    try {
      candidate = new URL(raw, baseUrl);
    } catch (_) {
      continue;
    }
    if (!/^https?:$/i.test(candidate.protocol)) continue;
    if (candidate.hostname !== new URL(baseUrl).hostname) continue;
    if (!/\/20\d{2}\/\d{2}\/[^/?#]+\.html$/i.test(candidate.pathname)) continue;
    return candidate.toString();
  }
  return "";
};

const fetchTextWithRetry = async (url, label) => {
  for (let attempt = 1; attempt <= retryMax; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": userAgent,
        },
        signal: controller.signal,
      });

      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          contentType: res.headers.get("content-type") || "",
          text: await res.text(),
        };
      }

      const isRateLimit = res.status === 429;
      const isUpstreamTransient = res.status >= 500;
      if (!isRateLimit && !isUpstreamTransient) {
        return {
          ok: false,
          fatal: true,
          status: res.status,
        };
      }

      if (attempt >= retryMax) {
        addUnavailable(`${label} status=${res.status} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const retryAfterMs = parseRetryAfterMs(res.headers.get("retry-after"));
      const waitMs = nextWaitMs(attempt, retryAfterMs);
      if (isRateLimit) {
        addTransient(
          `TRANSIENT RATE LIMIT: ${label} attempt ${attempt}/${retryMax} status=429 wait=${waitMs}ms${
            retryAfterMs > 0 ? ` retry-after=${retryAfterMs}ms` : ""
          } url=${url}`
        );
      } else {
        addTransient(
          `TRANSIENT UPSTREAM: ${label} attempt ${attempt}/${retryMax} status=${res.status} wait=${waitMs}ms url=${url}`
        );
      }
      await sleep(waitMs);
    } catch (error) {
      const reason =
        error && error.name === "AbortError"
          ? "timeout"
          : error && error.message
            ? error.message
            : "fetch-failed";

      if (attempt >= retryMax) {
        addUnavailable(`${label} network-error=${reason} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const waitMs = nextWaitMs(attempt, 0);
      addTransient(
        `TRANSIENT NETWORK: ${label} attempt ${attempt}/${retryMax} error=${reason} wait=${waitMs}ms url=${url}`
      );
      await sleep(waitMs);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false };
};

const checkMarkers = (id, url, text) => {
  const haystack = String(text || "");
  const low = haystack.toLowerCase();
  for (const marker of BANNED_MARKERS) {
    const idx = low.indexOf(marker.toLowerCase());
    if (idx === -1) continue;
    const snippet = excerptAround(haystack, idx, marker);
    addFunctional(
      `${id}: banned marker "${marker}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }
};

const fetchAndInspect = async (id, url) => {
  if (interRequestDelayMs > 0) {
    await sleep(interRequestDelayMs);
  }

  const result = await fetchTextWithRetry(withCacheBust(url), id);
  if (!result.ok) {
    if (result.fatal) {
      addFunctional(`${id}: status ${result.status} ${url}`);
    }
    return null;
  }

  if (!/\btext\/html\b/i.test(result.contentType)) {
    addFunctional(`${id}: non-html content-type "${result.contentType}" ${url}`);
    return null;
  }

  checkMarkers(id, url, result.text);
  return String(result.text || "");
};

let homeHtml = "";
let blogHtml = "";
if (!report.functional.length) {
  homeHtml = (await fetchAndInspect("home", HOME_URL)) || "";
  blogHtml = (await fetchAndInspect("blog", BLOG_URL)) || "";
}

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) {
    addFunctional(`post: invalid --post target (${postRaw})`);
  }
}

if (!postUrl && blogHtml) {
  postUrl = findPostUrl(blogHtml, base);
}

if (!postUrl) {
  if (!report.unavailable.length) {
    addFunctional("post: unable to resolve post URL (set --post or ensure /blog has post links)");
  }
} else {
  await fetchAndInspect("post", postUrl);
}

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_BANNED_MARKERS: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_BANNED_MARKERS: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}

console.log(`VERIFY_LIVE_BANNED_MARKERS: PASS checked=3 markers=${BANNED_MARKERS.length} base=${base}`);
