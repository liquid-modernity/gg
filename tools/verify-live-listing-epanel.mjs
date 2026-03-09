const args = process.argv.slice(2);

function getArg(name) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === name) return args[i + 1] || "";
    if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
  }
  return "";
}

const parsePositiveInt = (name, fallback) => {
  const raw = parseInt(getArg(name), 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_MAX = 4;
const DEFAULT_RETRY_BASE_MS = 800;
const DEFAULT_RETRY_CAP_MS = 10000;
const DEFAULT_USER_AGENT = "gg-live-gate/1.0 (+https://www.pakrpp.com)";
const REQUIRED_ROWS = [
  "title",
  "author",
  "contributors",
  "labels",
  "tags",
  "date",
  "updated",
  "comments",
  "readtime",
  "snippet",
  "toc",
  "cta",
];
const BANNED_TEXT = ["No content found", "Feed unavailable", "Curated stories are loading"];

const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const timeoutMs = parsePositiveInt("--timeout-ms", DEFAULT_TIMEOUT_MS);
const retryMax = parsePositiveInt("--retry-max", DEFAULT_RETRY_MAX);
const retryBaseMs = parsePositiveInt("--retry-base-ms", DEFAULT_RETRY_BASE_MS);
const retryCapMs = parsePositiveInt("--retry-cap-ms", DEFAULT_RETRY_CAP_MS);
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

const base = String(baseRaw || "").replace(/\/+$/, "");
const listingUrl = `${base}/blog`;

function unquote(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.trim();
}

function readAttr(tag, attrName) {
  const escaped = String(attrName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(tag || "").match(
    new RegExp(`\\b${escaped}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>\\\`]+))`, "i")
  );
  if (!match) return "";
  return unquote(match[1] || match[2] || match[3] || "");
}

function hasRow(html, key) {
  const escaped = String(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bdata-row\\s*=\\s*(["'])${escaped}\\1`, "i").test(String(html || ""));
}

function sleep(ms) {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
  if (safe <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, safe));
}

function parseRetryAfterMs(raw) {
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
}

function nextWaitMs(attempt, retryAfterMs) {
  const exp = Math.min(retryCapMs, retryBaseMs * 2 ** Math.max(0, attempt - 1));
  const jitterBound = Math.max(120, Math.floor(exp * 0.25));
  const jitter = Math.floor(Math.random() * jitterBound);
  if (retryAfterMs > 0) return retryAfterMs + jitter;
  return exp + jitter;
}

function withCacheBust(url) {
  const sep = String(url || "").includes("?") ? "&" : "?";
  return `${url}${sep}x=${Date.now()}`;
}

async function fetchTextWithRetry(url, label) {
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
}

function verifyContract(url, html) {
  const source = String(html || "");

  if (!/\bdata-gg-epanel\s*=\s*(["'])editorial\1/i.test(source)) {
    addFunctional(`missing data-gg-epanel="editorial" @ ${url}`);
  }

  for (const row of REQUIRED_ROWS) {
    if (!hasRow(source, row)) addFunctional(`missing row marker data-row="${row}" @ ${url}`);
  }

  const low = source.toLowerCase();
  for (const marker of BANNED_TEXT) {
    if (low.includes(marker.toLowerCase())) {
      addFunctional(`banned text "${marker}" found @ ${url}`);
    }
  }

  const cardBlockRe =
    /<article\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-post-card\b[^"']*\1[^>]*>[\s\S]*?<\/article>/gi;
  const cards = [...source.matchAll(cardBlockRe)].map((match) => String(match[0] || ""));
  if (!cards.length) {
    addFunctional(`no .gg-post-card blocks found @ ${url}`);
    return;
  }

  for (let i = 0; i < cards.length; i += 1) {
    const block = cards[i];
    const open = block.match(/^<article\b[^>]*>/i);
    const tag = open ? String(open[0] || "") : "";
    const idx = i + 1;
    const authorAttr = readAttr(tag, "data-author-name") || readAttr(tag, "data-author");
    const updatedAttr = readAttr(tag, "data-updated") || readAttr(tag, "data-gg-updated");
    const snippetAttr = readAttr(tag, "data-snippet") || readAttr(tag, "data-gg-snippet");
    const hasExcerptEl = /<p\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-post-card__excerpt\b[^"']*\1/i.test(block);
    const postMetaOpen = block.match(/<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-postmeta\b[^"']*\1[^>]*>/i);

    if (!authorAttr) addFunctional(`card#${idx}: missing data-author-name/data-author @ ${url}`);
    if (!updatedAttr) addFunctional(`card#${idx}: missing data-updated/data-gg-updated @ ${url}`);
    if (!snippetAttr && !hasExcerptEl) {
      addFunctional(
        `card#${idx}: missing snippet source (data-snippet/data-gg-snippet or .gg-post-card__excerpt) @ ${url}`
      );
    }
    if (!postMetaOpen) {
      addFunctional(`card#${idx}: missing .gg-postmeta node @ ${url}`);
      continue;
    }
    const postMetaTag = String(postMetaOpen[0] || "");
    if (!readAttr(postMetaTag, "data-author")) {
      addFunctional(`card#${idx}: .gg-postmeta missing data-author @ ${url}`);
    }
    if (!readAttr(postMetaTag, "data-updated")) {
      addFunctional(`card#${idx}: .gg-postmeta missing data-updated @ ${url}`);
    }
  }
}

if (!report.functional.length) {
  const result = await fetchTextWithRetry(withCacheBust(listingUrl), "listing");
  if (!result.ok) {
    if (result.fatal) {
      addFunctional(`status ${result.status} ${listingUrl}`);
    }
  } else if (!/\btext\/html\b/i.test(result.contentType)) {
    addFunctional(`non-html content-type "${result.contentType}" ${listingUrl}`);
  } else {
    verifyContract(listingUrl, result.text);
  }
}

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_LISTING_EPANEL: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_LISTING_EPANEL: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}

console.log(`VERIFY_LIVE_LISTING_EPANEL: PASS listing=${listingUrl}`);
