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
const LEGAL_PATHS = [
  "/p/editorial-policy.html",
  "/p/privacy-policy.html",
  "/p/terms-of-service.html",
  "/p/accessibility.html",
];
const BANNED_TEXT = [
  "Curated stories",
  "temporarily unavailable",
  "Feed unavailable",
  "Dummy",
];
const COMMENT_PATTERNS = [
  { label: "Load comments", re: /\bload\s+comments\b/i },
  { label: "Add comment", re: /\badd\s+comment\b/i },
  { label: "comments hash link", re: /\bhref\s*=\s*(["'])[^"']*#comments[^"']*\1/i },
  { label: "comments load gate", re: /\bdata-gg-comments-load\s*=\s*(["'])[^"']*\1/i },
];
const DECK_PATTERNS = [
  { label: "mixed deck id", re: /\bid\s*=\s*(["'])gg-mixed-[^"']+\1/i },
  { label: "mixed module", re: /\bdata-gg-module\s*=\s*(["'])mixed-media\1/i },
  { label: "mixed marker", re: /\bdata-gg-mixed\s*=\s*(["'])[^"']+\1/i },
];
const LEGAL_MARKER_RE = /\bdata-gg-page\s*=\s*(["'])legal\1/i;

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const timeoutMs = parsePositiveInt("--timeout-ms", DEFAULT_TIMEOUT_MS);
const retryMax = parsePositiveInt("--retry-max", DEFAULT_RETRY_MAX);
const retryBaseMs = parsePositiveInt("--retry-base-ms", DEFAULT_RETRY_BASE_MS);
const retryCapMs = parsePositiveInt("--retry-cap-ms", DEFAULT_RETRY_CAP_MS);
const interRequestDelayMs = parsePositiveInt(
  "--inter-request-delay-ms",
  DEFAULT_INTER_REQUEST_DELAY_MS
);
const userAgent = (getArg("--user-agent") || DEFAULT_USER_AGENT).trim() || DEFAULT_USER_AGENT;
const base = stripTrailingSlash(baseRaw);

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

if (!base) {
  addFunctional("missing --base");
}

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

const excerptAround = (source, index, marker = "") => {
  if (!Number.isFinite(index) || index < 0) return "";
  const left = Math.max(0, index - 80);
  const right = Math.min(source.length, index + String(marker || "").length + 80);
  return source.slice(left, right).replace(/\s+/g, " ").trim();
};

const findIndexInsensitive = (source, marker) => {
  const hay = String(source || "");
  const needle = String(marker || "");
  if (!needle) return -1;
  return hay.toLowerCase().indexOf(needle.toLowerCase());
};

const runRegex = (source, regex) => {
  regex.lastIndex = 0;
  const m = regex.exec(source);
  regex.lastIndex = 0;
  if (!m) return null;
  return { index: m.index, value: m[0] };
};

for (const path of LEGAL_PATHS) {
  if (interRequestDelayMs > 0) {
    await sleep(interRequestDelayMs);
  }

  const url = `${base}${path}`;
  const label = `legal:${path}`;
  const result = await fetchTextWithRetry(withCacheBust(url), label);

  if (!result.ok) {
    if (result.fatal) {
      addFunctional(`${path}: status ${result.status} ${url}`);
    }
    continue;
  }
  if (!/\btext\/html\b/i.test(result.contentType)) {
    addFunctional(`${path}: non-html content-type "${result.contentType}" ${url}`);
    continue;
  }

  const html = String(result.text || "");
  if (!LEGAL_MARKER_RE.test(html)) {
    addFunctional(`${path}: missing marker data-gg-page="legal" @ ${url}`);
  }

  for (const marker of BANNED_TEXT) {
    const idx = findIndexInsensitive(html, marker);
    if (idx === -1) continue;
    const snippet = excerptAround(html, idx, marker);
    addFunctional(
      `${path}: banned marker "${marker}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }

  for (const entry of COMMENT_PATTERNS) {
    const hit = runRegex(html, entry.re);
    if (!hit) continue;
    const snippet = excerptAround(html, hit.index, hit.value);
    addFunctional(
      `${path}: comment UI marker "${entry.label}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }

  for (const entry of DECK_PATTERNS) {
    const hit = runRegex(html, entry.re);
    if (!hit) continue;
    const snippet = excerptAround(html, hit.index, hit.value);
    addFunctional(
      `${path}: deck marker "${entry.label}" found @ ${url}${snippet ? ` | snippet: ${snippet}` : ""}`
    );
  }
}

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_LEGAL_CLEAN_ROOM: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_LEGAL_CLEAN_ROOM: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}

console.log(`VERIFY_LIVE_LEGAL_CLEAN_ROOM: PASS checked=${LEGAL_PATHS.length} base=${base}`);
