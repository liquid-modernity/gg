const args = process.argv.slice(2);

function getArg(name) {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
}

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;

const LISTING_MARKERS = [
  "panel-listing-editorial",
  "panel-listing-title",
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

const POST_MARKERS = [
  "panel-post-title",
  "panel-post-date",
  "panel-post-updated",
  "panel-post-reading-time",
  "panel-post-toc",
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
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

if (!baseRaw) {
  console.error("VERIFY_LIVE_PANEL_METADATA: FAIL");
  console.error("- missing --base");
  process.exit(1);
}

const stripTrailingSlash = (s) => s.replace(/\/+$/, "");
const base = stripTrailingSlash(baseRaw);
const listingUrl = `${base}/blog`;

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

function hasAttr(tag, attrName) {
  const escaped = String(attrName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s\"'=<>\\\`]+)`, "i");
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

async function fetchText(url) {
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
      },
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      status: res.status,
      text: await res.text(),
    };
  } finally {
    clearTimeout(timer);
  }
}

function verifyMarkers(targetId, url, html, markers, failures) {
  const src = String(html || "");
  for (const marker of markers) {
    if (!markerRegex(marker).test(src)) {
      failures.push(`${targetId}: missing marker "${marker}" @ ${url}`);
    }
  }
}

function verifyListingContract(url, html, failures) {
  const src = String(html || "");
  if (!/\bdata-gg-epanel\s*=\s*(["'])editorial\1/i.test(src)) {
    failures.push(`listing: missing editorial marker data-gg-epanel="editorial" @ ${url}`);
  }

  verifyMarkers("listing", url, src, LISTING_MARKERS, failures);

  for (const row of LISTING_ROWS) {
    if (!rowRegex(row).test(src)) {
      failures.push(`listing: missing row marker data-row="${row}" @ ${url}`);
    }
  }

  for (const marker of BANNED_LISTING_TEXT) {
    if (src.toLowerCase().includes(marker.toLowerCase())) {
      failures.push(`listing: banned text "${marker}" found @ ${url}`);
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
    failures.push(
      `listing: no gg-post-card carries minimum attrs (${CARD_MIN_ATTRS.join(", ")}) @ ${url}`
    );
  }
  if (!foundFull) {
    failures.push(
      `listing: no gg-post-card carries full attrs (${CARD_REQUIRED_ATTRS.join(", ")}) @ ${url}`
    );
  }
}

const failures = [];

let listing;
try {
  listing = await fetchText(`${listingUrl}?x=${Date.now()}`);
} catch (e) {
  const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
  failures.push(`listing: fetch failed (${msg}) ${listingUrl}`);
}

let listingHtml = "";
if (listing) {
  if (!listing.ok) {
    failures.push(`listing: status ${listing.status} ${listingUrl}`);
  } else {
    listingHtml = String(listing.text || "");
    verifyListingContract(listingUrl, listingHtml, failures);
  }
}

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) {
    failures.push(`post: invalid --post target (${postRaw})`);
  }
}
if (!postUrl && listingHtml) {
  postUrl = findPostUrl(listingHtml, base);
}
if (!postUrl) {
  failures.push("post: unable to resolve post URL (set --post or ensure /blog has a post link)");
}

if (postUrl) {
  let post;
  try {
    const sep = postUrl.includes("?") ? "&" : "?";
    post = await fetchText(`${postUrl}${sep}x=${Date.now()}`);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    failures.push(`post: fetch failed (${msg}) ${postUrl}`);
  }

  if (post) {
    if (!post.ok) {
      failures.push(`post: status ${post.status} ${postUrl}`);
    } else {
      verifyMarkers("post", postUrl, post.text, POST_MARKERS, failures);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_LIVE_PANEL_METADATA: FAIL");
  for (const f of failures) {
    console.error(`- ${f}`);
  }
  process.exit(1);
}

console.log(`VERIFY_LIVE_PANEL_METADATA: PASS listing=${listingUrl} post=${postUrl || "(auto)"}`);
