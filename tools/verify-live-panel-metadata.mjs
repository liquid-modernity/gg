const args = process.argv.slice(2);

function getArg(name) {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
}

function parsePositiveInt(name, fallback) {
  const raw = parseInt(getArg(name), 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_MAX = 4;
const DEFAULT_RETRY_BASE_MS = 800;
const DEFAULT_RETRY_CAP_MS = 10000;
const DEFAULT_INTER_REQUEST_DELAY_MS = 250;
const DEFAULT_USER_AGENT = "gg-live-gate/1.0 (+https://www.pakrpp.com)";

const LISTING_MARKERS = [
  "panel-listing-editorial",
  "panel-listing-title",
  "panel-listing-thumbnail",
  "panel-listing-author",
  "panel-listing-contributor",
  "panel-listing-labels",
  "panel-listing-tags",
  "panel-listing-date",
  "panel-listing-updated",
  "panel-listing-comments",
  "panel-listing-reading-time",
  "panel-listing-snippet",
  "panel-listing-toc",
  "panel-listing-cta",
];

const LISTING_ROWS = [
  "title",
  "thumbnail",
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

const LISTING_ROW_ORDER = [
  "title",
  "thumbnail",
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
];

const POST_LEFT_MARKERS = [
  "panel-post-date",
  "panel-post-updated",
  "panel-post-reading-time",
  "panel-post-tags",
  "panel-post-author",
  "panel-post-contributor",
];

const BANNED_LISTING_TEXT = ["Curated stories", "Feed unavailable", "No content found", "Dummy"];

const CARD_MIN_ATTRS = ["data-gg-author", "data-gg-tags", "data-gg-updated"];
const CARD_REQUIRED_ATTRS = [
  "data-gg-author",
  "data-gg-contributors",
  "data-gg-tags",
  "data-gg-labels",
  "data-gg-date",
  "data-gg-updated",
  "data-gg-comments",
  "data-gg-readtime",
  "data-gg-snippet",
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

if (!baseRaw) {
  console.error("VERIFY_LIVE_PANEL_METADATA: FAIL");
  console.error("- FUNCTIONAL FAIL: missing --base");
  process.exit(1);
}

const stripTrailingSlash = (s) => s.replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);
const listingUrl = `${base}/blog`;

const report = {
  transient: [],
  unavailable: [],
  functional: [],
  evidence: [],
};

function addTransient(message) {
  report.transient.push(message);
}

function addUnavailable(message) {
  report.unavailable.push(`LIVE UNAVAILABLE AFTER RETRIES: ${message}`);
}

function addFunctional(message) {
  report.functional.push(`FUNCTIONAL FAIL: ${message}`);
}

function addEvidence(message) {
  report.evidence.push(`EVIDENCE: ${message}`);
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

function normalizeUrl(raw) {
  try {
    return new URL(raw).toString();
  } catch (_) {
    const path = String(raw || "").trim();
    if (!path) return "";
    const prefixed = path.startsWith("/") ? path : `/${path}`;
    return `${base}${prefixed}`;
  }
}

function markerRegex(marker) {
  const escaped = String(marker).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bdata-gg-marker\\s*=\\s*([\"'])${escaped}\\1`, "i");
}

function rowRegex(row) {
  const escaped = String(row).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bdata-row\\s*=\\s*([\"'])${escaped}\\1`, "i");
}

function rowIndex(source, row) {
  const escaped = String(row).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\bdata-row\\s*=\\s*([\"'])${escaped}\\1`, "i");
  const m = String(source || "").match(re);
  return m && Number.isFinite(m.index) ? m.index : -1;
}

function hasAttr(tag, attrName) {
  const escaped = String(attrName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    "\\b" + escaped + "\\s*=\\s*(?:\\\"[^\\\"]*\\\"|'[^']*'|[^\\s\\\"'=<>`]+)",
    "i"
  );
  return re.test(String(tag || ""));
}

function findPostUrl(html, baseUrl) {
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
        const headers = {
          ggAssets: String(res.headers.get("x-gg-assets") || "").trim(),
          ggWorkerVersion: String(res.headers.get("x-gg-worker-version") || "").trim(),
          ggTemplateMismatch: String(res.headers.get("x-gg-template-mismatch") || "").trim(),
          ggTemplateMismatchReason: String(
            res.headers.get("x-gg-template-mismatch-reason") || ""
          ).trim(),
          ggTemplateContract: String(res.headers.get("x-gg-template-contract") || "").trim(),
          ggTemplateContractReason: String(
            res.headers.get("x-gg-template-contract-reason") || ""
          ).trim(),
          ggTemplateReleaseDrift: String(
            res.headers.get("x-gg-template-release-drift") || ""
          ).trim(),
          ggTemplateReleaseDriftReason: String(
            res.headers.get("x-gg-template-release-drift-reason") || ""
          ).trim(),
        };
        return {
          ok: true,
          status: res.status,
          headers,
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

function verifyMarkers(targetId, url, html, markers) {
  const src = String(html || "");
  for (const marker of markers) {
    if (!markerRegex(marker).test(src)) {
      addFunctional(`${targetId}: missing marker "${marker}" @ ${url}`);
    }
  }
}

function verifyTemplateHeaders(targetId, url, headers) {
  const h = headers && typeof headers === "object" ? headers : {};
  const mismatch = h.ggTemplateMismatch === "1";
  const contract = h.ggTemplateContract === "1";
  const drift = h.ggTemplateReleaseDrift === "1";
  addEvidence(
    `${targetId}: x-gg-assets=${h.ggAssets || "-"} x-gg-worker-version=${h.ggWorkerVersion || "-"} x-gg-template-mismatch=${h.ggTemplateMismatch || "0"} x-gg-template-contract=${h.ggTemplateContract || "0"} x-gg-template-release-drift=${h.ggTemplateReleaseDrift || "0"}`
  );
  if (h.ggAssets && h.ggWorkerVersion && h.ggAssets !== h.ggWorkerVersion) {
    addFunctional(
      `${targetId}: release header mismatch x-gg-assets=${h.ggAssets} x-gg-worker-version=${h.ggWorkerVersion} @ ${url}`
    );
  }
  if (mismatch || contract || drift) {
    const reasons = [];
    if (mismatch) reasons.push(`mismatch:${h.ggTemplateMismatchReason || "unknown"}`);
    if (contract) reasons.push(`contract:${h.ggTemplateContractReason || "unknown"}`);
    if (drift) reasons.push(`drift:${h.ggTemplateReleaseDriftReason || "unknown"}`);
    addFunctional(
      `${targetId}: template headers indicate live theme drift (${reasons.join(
        ", "
      )}) @ ${url}. Paste latest index.prod.xml into Blogger Theme.`
    );
  }
}

function findElementRangeFromOpen(source, openStart, openTag, tagName) {
  const html = String(source || "");
  const open = String(openTag || "");
  const name = String(tagName || "").trim().toLowerCase();
  if (!html || !open || !name) return null;
  const openEnd = openStart + open.length;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<\\/?${escaped}\\b[^>]*>`, "gi");
  re.lastIndex = openEnd;
  let depth = 1;
  let closeStart = -1;
  let closeEnd = -1;
  let token;
  while ((token = re.exec(html))) {
    const tag = token[0];
    const isClose = /^<\//.test(tag);
    const selfClose = /\/>\s*$/.test(tag);
    if (isClose) depth -= 1;
    else if (!selfClose) depth += 1;
    if (depth === 0) {
      closeStart = token.index;
      closeEnd = re.lastIndex;
      break;
    }
  }
  if (closeStart < 0 || closeEnd < 0) return null;
  return {
    outerHtml: html.slice(openStart, closeEnd),
    innerHtml: html.slice(openEnd, closeStart),
  };
}

function findTagBlockByClass(html, tagName, classToken) {
  const source = String(html || "");
  const tag = String(tagName || "").trim().toLowerCase();
  const needle = String(classToken || "").trim();
  if (!source || !tag || !needle) return "";
  const openRe = new RegExp(
    `<${tag}\\b[^>]*\\bclass\\s*=\\s*(?:(['"])([^'"]*)\\1|([^\\s"'=<>` + "`" + `]+))[^>]*>`,
    "gi"
  );
  let match;
  while ((match = openRe.exec(source))) {
    const classes = String(match[2] || match[3] || "")
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!classes.includes(needle)) continue;
    const range = findElementRangeFromOpen(source, match.index, match[0], tag);
    if (range && range.outerHtml) return range.outerHtml;
  }
  return "";
}

function verifyListingContract(url, html) {
  const src = String(html || "");
  addEvidence(`listing-scope: enforce metadata+toc on right editorial panel @ ${url}`);
  const rightScope = findTagBlockByClass(src, "aside", "gg-blog-sidebar--right");
  if (!rightScope) {
    addFunctional(`listing: missing right sidebar .gg-blog-sidebar--right @ ${url}`);
  }
  const scope = rightScope || src;
  if (!/\bdata-gg-panel\s*=\s*(["'])info\1/i.test(scope)) {
    addFunctional(`listing: missing right info panel hook data-gg-panel="info" @ ${url}`);
  }
  if (!/\bdata-gg-panelmeta\s*=\s*(["'])listing\1/i.test(scope)) {
    addFunctional(`listing: missing right panelmeta contract data-gg-panelmeta="listing" @ ${url}`);
  }
  if (!/\bdata-gg-epanel\s*=\s*(["'])editorial\1/i.test(scope)) {
    addFunctional(`listing: missing editorial marker data-gg-epanel="editorial" @ ${url}`);
  }

  verifyMarkers("listing-right", url, scope, LISTING_MARKERS);

  for (const row of LISTING_ROWS) {
    if (!rowRegex(row).test(scope)) {
      addFunctional(`listing: missing row marker data-row="${row}" @ ${url}`);
    }
  }

  let lastIdx = -1;
  for (const row of LISTING_ROW_ORDER) {
    const idx = rowIndex(scope, row);
    if (idx < 0) continue;
    if (idx < lastIdx) {
      addFunctional(
        `listing: metadata row order mismatch, "${row}" appears before required predecessor @ ${url}`
      );
      break;
    }
    lastIdx = idx;
  }

  for (const marker of BANNED_LISTING_TEXT) {
    if (src.toLowerCase().includes(marker.toLowerCase())) {
      addFunctional(`listing: banned text "${marker}" found @ ${url}`);
    }
  }

  const cardRe =
    /<article\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-post-card\b[^"']*\1[^>]*>/gi;
  let foundMin = false;
  let foundFull = false;
  for (const m of src.matchAll(cardRe)) {
    const tag = String(m[0] || "");
    if (!foundMin && CARD_MIN_ATTRS.every((attr) => hasAttr(tag, attr))) {
      foundMin = true;
    }
    if (!foundFull && CARD_REQUIRED_ATTRS.every((attr) => hasAttr(tag, attr))) {
      foundFull = true;
    }
    if (foundMin && foundFull) break;
  }
  if (!foundMin) {
    addFunctional(
      `listing: no gg-post-card carries minimum attrs (${CARD_MIN_ATTRS.join(", ")}) @ ${url}`
    );
  }
  if (!foundFull) {
    addFunctional(
      `listing: no gg-post-card carries full attrs (${CARD_REQUIRED_ATTRS.join(", ")}) @ ${url}`
    );
  }
}

function verifyPostLeftContract(url, html) {
  const src = String(html || "");
  addEvidence(
    `post-scope: enforce metadata on left info panel only (right editorial not required) @ ${url}`
  );
  const leftScope = findTagBlockByClass(src, "aside", "gg-blog-sidebar--left");
  if (!leftScope) {
    addFunctional(`post: missing left sidebar .gg-blog-sidebar--left @ ${url}`);
  }
  const scope = leftScope || src;
  if (!/\bid\s*=\s*(["'])gg-postinfo\1/i.test(scope)) {
    addFunctional(`post: missing left info hook id="gg-postinfo" @ ${url}`);
  }
  if (!/\bdata-gg-panelmeta\s*=\s*(["'])post\1/i.test(scope)) {
    addFunctional(`post: missing left panelmeta contract data-gg-panelmeta="post" @ ${url}`);
  }
  verifyMarkers("post-left", url, scope, POST_LEFT_MARKERS);
}

function verifyPostDataSource(url, html) {
  const src = String(html || "");
  const postRe =
    /<article\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-post\b[^"']*\1[^>]*>/gi;
  let postTag = "";
  for (const m of src.matchAll(postRe)) {
    postTag = String(m[0] || "");
    if (postTag) break;
  }
  if (!postTag) {
    addFunctional(`post: missing article.gg-post source @ ${url}`);
    return;
  }
  const requiredPostAttrs = ["data-author", "data-date", "data-id"];
  for (const attr of requiredPostAttrs) {
    if (!hasAttr(postTag, attr)) {
      addFunctional(`post: article.gg-post missing ${attr} (metadata source empty) @ ${url}`);
    }
  }
  const postMetaRe =
    /<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-postmeta\b[^"']*\1[^>]*>/gi;
  let postMetaTag = "";
  for (const m of src.matchAll(postMetaRe)) {
    postMetaTag = String(m[0] || "");
    if (postMetaTag) break;
  }
  if (!postMetaTag) {
    addFunctional(`post: missing .gg-postmeta source node @ ${url}`);
    return;
  }
  if (!hasAttr(postMetaTag, "data-updated")) {
    addFunctional(`post: .gg-postmeta missing data-updated (metadata source empty) @ ${url}`);
  }
}

const listingFetchUrl = `${listingUrl}?x=${Date.now()}`;
let listingHtml = "";
const listing = await fetchTextWithRetry(listingFetchUrl, "listing");
if (listing.ok) {
  listingHtml = String(listing.text || "");
  verifyTemplateHeaders("listing", listingUrl, listing.headers);
  verifyListingContract(listingUrl, listingHtml);
} else if (listing.fatal) {
  addFunctional(`listing: status ${listing.status} ${listingUrl}`);
}

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) {
    addFunctional(`post: invalid --post target (${postRaw})`);
  }
}
if (!postUrl && listingHtml) {
  postUrl = findPostUrl(listingHtml, base);
}
if (!postUrl) {
  addFunctional("post: unable to resolve post URL (set --post or ensure /blog has a post link)");
}

if (postUrl) {
  if (interRequestDelayMs > 0) {
    await sleep(interRequestDelayMs);
  }

  const sep = postUrl.includes("?") ? "&" : "?";
  const post = await fetchTextWithRetry(`${postUrl}${sep}x=${Date.now()}`, "post");
  if (post.ok) {
    verifyTemplateHeaders("post", postUrl, post.headers);
    verifyPostLeftContract(postUrl, post.text);
    verifyPostDataSource(postUrl, post.text);
  } else if (post.fatal) {
    addFunctional(`post: status ${post.status} ${postUrl}`);
  }
}

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_PANEL_METADATA: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.evidence) console.error(`- ${line}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_PANEL_METADATA: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}
for (const line of report.evidence) console.log(`- ${line}`);
console.log(`VERIFY_LIVE_PANEL_METADATA: PASS listing=${listingUrl} post=${postUrl || "(auto)"}`);
