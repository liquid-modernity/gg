/* src/worker.js — Cloudflare Worker (edge) */
const cleanUrlForSchema = (inputUrl) => {
  const u = new URL(inputUrl);
  u.searchParams.delete("m");
  u.searchParams.delete("x");
  u.searchParams.delete("view");
  u.searchParams.delete("fbclid");
  u.searchParams.delete("gclid");
  u.searchParams.delete("msclkid");
  for (const key of Array.from(u.searchParams.keys())) {
    if (key.startsWith("utm_")) {
      u.searchParams.delete(key);
    }
  }
  u.hash = "";
  u.search = "";
  return `${u.origin}${u.pathname}`;
};

const FLAGS_TTL_MS = 60 * 1000;
let flagsCache = { ts: 0, value: null };
const FLAGS_MODE_PUBLIC = "public";
const FLAGS_MODE_LAB = "lab";

const normalizeFlagsMode = (value) => {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === FLAGS_MODE_LAB) return FLAGS_MODE_LAB;
  return FLAGS_MODE_PUBLIC;
};

const normalizeFlags = (data) => {
  const out = {
    sw: { enabled: true },
    csp_report_enabled: true,
    mode: FLAGS_MODE_PUBLIC,
  };
  if (data && typeof data === "object") {
    if (data.sw && typeof data.sw === "object") {
      if (typeof data.sw.enabled === "boolean") {
        out.sw.enabled = data.sw.enabled;
      }
    }
    if (typeof data.csp_report_enabled === "boolean") {
      out.csp_report_enabled = data.csp_report_enabled;
    }
    if (typeof data.mode === "string") {
      out.mode = normalizeFlagsMode(data.mode);
    }
    for (const [key, value] of Object.entries(data)) {
      if (key === "sw" || key === "csp_report_enabled" || key === "mode") continue;
      out[key] = value;
    }
  }
  return out;
};

const loadFlags = async (env) => {
  const now = Date.now();
  if (flagsCache.value && now - flagsCache.ts < FLAGS_TTL_MS) {
    return { ...flagsCache.value };
  }

  let data = null;
  if (env && env.ASSETS) {
    try {
      const req = new Request("https://flags.local/__gg/flags.json");
      const res = await env.ASSETS.fetch(req);
      if (res && res.ok) {
        data = await res.json();
      }
    } catch (e) {
      data = null;
    }
  }

  const flags = normalizeFlags(data);
  flagsCache = { ts: now, value: flags };
  return { ...flags };
};

const extractAttrValue = (tag, attr) => {
  if (!tag) return "";
  const re = new RegExp(`${attr}\\s*=\\s*(?:(['"])([^'"]*)\\1|([^\\s"'=<>\\\`]+))`, "i");
  const match = tag.match(re);
  return match ? String(match[2] || match[3] || "") : "";
};

const findFirstTag = (html, tagName) => {
  if (!html) return [];
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "ig");
  return html.match(re) || [];
};

const findMetaContentRobust = (html, name) => {
  const tags = findFirstTag(html, "meta");
  const wanted = String(name || "").trim().toLowerCase();
  for (const t of tags) {
    const metaName = String(extractAttrValue(t, "name") || "").trim().toLowerCase();
    if (metaName === wanted) {
      return extractAttrValue(t, "content");
    }
  }
  return "";
};

const findDivTagById = (html, id) => {
  const tags = findFirstTag(html, "div");
  const wanted = String(id || "").trim().toLowerCase();
  for (const t of tags) {
    const divId = String(extractAttrValue(t, "id") || "").trim().toLowerCase();
    if (divId === wanted) return t;
  }
  return "";
};

const parseTemplateFingerprint = (html) => {
  const envMeta = findMetaContentRobust(html, "gg-env");
  const relMeta = findMetaContentRobust(html, "gg-release");
  const divTag = findDivTagById(html, "gg-fingerprint");
  const envDiv = extractAttrValue(divTag, "data-env");
  const relDiv = extractAttrValue(divTag, "data-release");
  return {
    envMeta,
    relMeta,
    envDiv,
    relDiv,
    hasFingerprintDiv: !!divTag,
  };
};

const normalizeReleaseToken = (value) => String(value || "").trim().toLowerCase();

const pushReason = (reasons, code) => {
  if (!code) return;
  if (reasons.includes(code)) return;
  reasons.push(code);
};

const getTemplateMismatchReasons = (fp, expectedEnv, expectedRelease, allowedReleases = []) => {
  const reasons = [];
  const envMeta = (fp && fp.envMeta ? fp.envMeta : "").trim().toLowerCase();
  const relMeta = normalizeReleaseToken(fp && fp.relMeta ? fp.relMeta : "");
  const hasFpDiv = !!(fp && fp.hasFingerprintDiv);
  const normalizedExpectedEnv = String(expectedEnv || "").trim().toLowerCase();
  const normalizedExpectedRelease = normalizeReleaseToken(expectedRelease);
  const normalizedAllowed = new Set(
    [normalizedExpectedRelease]
      .concat(Array.isArray(allowedReleases) ? allowedReleases.map(normalizeReleaseToken) : [])
      .filter(Boolean)
  );

  if (!envMeta) pushReason(reasons, "missing_meta_env");
  else if (!normalizedExpectedEnv || envMeta !== normalizedExpectedEnv) {
    pushReason(reasons, "env_mismatch");
  }

  if (!relMeta) pushReason(reasons, "missing_meta_release");
  else if (!normalizedAllowed.has(relMeta)) {
    pushReason(reasons, "release_mismatch");
  }

  if (!hasFpDiv) pushReason(reasons, "missing_fp_div");

  return reasons;
};

const getTemplateContractReasons = (html) => {
  const reasons = [];
  const source = String(html || "");
  const hasMain = /\bid\s*=\s*['"]gg-main['"]/i.test(source);
  const hasBootMarker = /<script[^>]+src=['"][^'"]*boot\.js[^'"]*['"][^>]*>/i.test(source);
  if (!hasMain) pushReason(reasons, "missing_main");
  if (!hasBootMarker) pushReason(reasons, "missing_boot_marker");
  return reasons;
};

const isSameOriginUrl = (value, origin) => {
  if (!value) return false;
  try {
    const u = new URL(value, origin);
    return u.origin === origin;
  } catch (e) {
    return false;
  }
};

const isBootScriptUrl = (value, origin) => {
  if (!value) return false;
  const src = value.trim();
  if (!src) return false;
  const lower = src.toLowerCase();
  if (!/\/boot\.js(?:[?#]|$)/.test(lower)) return false;
  if (lower.includes("/assets/v/") || lower.includes("/assets/latest/")) return true;
  return isSameOriginUrl(src, origin);
};

const isAppJsAsset = (value) => {
  if (!value) return false;
  const href = value.trim();
  if (!href) return false;
  const lower = href.toLowerCase();
  if (!/\.js(?:[?#]|$)/.test(lower)) return false;
  return lower.includes("/assets/");
};

const RELEASE_MISMATCH_REASON = "release_mismatch";
const ASSET_CACHE_BUST = "20260418030500";

const isReleaseDriftOnly = (reasons) => {
  if (!Array.isArray(reasons) || !reasons.length) return false;
  for (let i = 0; i < reasons.length; i++) {
    if (String(reasons[i] || "").trim() !== RELEASE_MISMATCH_REASON) return false;
  }
  return true;
};

const rewriteVersionedAssetRef = (value, expectedRelease, origin, cacheBust = "") => {
  const raw = String(value || "").trim();
  const release = String(expectedRelease || "").trim();
  if (!raw || !release) return raw;
  let parsed;
  try {
    parsed = new URL(raw, origin);
  } catch (_) {
    return raw;
  }
  if (!origin || parsed.origin !== origin) return raw;
  const match = parsed.pathname.match(/^\/assets\/v\/([^/]+)\/(.+)$/i);
  if (!match) return raw;
  const currentRelease = String(match[1] || "").trim().toLowerCase();
  let changed = false;
  if (currentRelease !== release.toLowerCase()) {
    parsed.pathname = `/assets/v/${release}/${match[2]}`;
    changed = true;
  }
  const version = String(cacheBust || "").trim();
  if (version && parsed.searchParams.get("v") !== version) {
    parsed.searchParams.set("v", version);
    changed = true;
  }
  if (!changed) return raw;
  if (/^(?:https?:)?\/\//i.test(raw)) {
    return parsed.toString();
  }
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
};

const toPositiveInt = (value, fallback, max) => {
  const parsed = parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  if (Number.isFinite(max) && max > 0 && parsed > max) return max;
  return parsed;
};

const escapeHtml = (value) =>
  String(value || "").replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    if (ch === '"') return "&quot;";
    return "&#39;";
  });

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const stripHtml = (value) =>
  cleanText(
    String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

const extractFirstImageFromMarkup = (value) => {
  const source = String(value || "");
  if (!source) return "";
  const quoted = source.match(/<img\b[^>]*\bsrc=(["'])(.*?)\1/i);
  if (quoted && quoted[2]) {
    const url = cleanText(quoted[2]);
    if (url) return url.startsWith("//") ? `https:${url}` : url;
  }
  const bare = source.match(/<img\b[^>]*\bsrc=([^\s>"']+)/i);
  if (bare && bare[1]) {
    const url = cleanText(bare[1]);
    if (url) return url.startsWith("//") ? `https:${url}` : url;
  }
  return "";
};

const truncateText = (value, maxLen) => {
  const input = cleanText(value);
  if (!input) return "";
  const limit = toPositiveInt(maxLen, 160, 1000);
  if (input.length <= limit) return input;
  return `${input.slice(0, limit - 3).trim()}...`;
};

const formatIsoDate = (raw) => {
  const source = String(raw || "").trim();
  if (!source) return "";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const extractFeedPostId = (entry) => {
  const raw = cleanText(entry && entry.id && entry.id.$t ? entry.id.$t : "");
  if (!raw) return "";
  const m = raw.match(/post-(\d+)/i);
  if (m && m[1]) return m[1];
  const tail = raw.split(".").pop();
  return cleanText(tail);
};

const extractFeedBlogId = (entry) => {
  const raw = cleanText(entry && entry.id && entry.id.$t ? entry.id.$t : "");
  if (!raw) return "";
  const m = raw.match(/blog-(\d+)/i);
  return m && m[1] ? m[1] : "";
};

const pickFeedRepliesLink = (entry, type) => {
  const expectedType = cleanText(type).toLowerCase();
  const links = Array.isArray(entry && entry.link) ? entry.link : [];
  for (const link of links) {
    if (!link || cleanText(link.rel).toLowerCase() !== "replies" || !link.href) continue;
    if (expectedType && cleanText(link.type).toLowerCase() !== expectedType) continue;
    return cleanText(link.href);
  }
  return "";
};

const buildFallbackCommentFormIframeSrc = (entry, requestUrl, options = {}) => {
  const opt = options || {};
  const blogId = cleanText(opt.blogId || extractFeedBlogId(entry));
  const postId = cleanText(opt.postId || extractFeedPostId(entry));
  if (!blogId || !postId) return "";
  const paramKey = opt.isPage ? "pa" : "po";
  const frameUrl = new URL(`/comment/frame/${encodeURIComponent(blogId)}`, "https://www.blogger.com");
  frameUrl.searchParams.set(paramKey, postId);
  frameUrl.searchParams.set("hl", "en");
  try {
    const req = new URL(requestUrl);
    frameUrl.searchParams.set("origin", req.origin);
  } catch (e) {
    // Keep deterministic fallback when request origin is unavailable.
  }
  return frameUrl.toString();
};

const pickFeedAlternateUrl = (entry) => {
  const links = Array.isArray(entry && entry.link) ? entry.link : [];
  for (const link of links) {
    if (!link || link.rel !== "alternate" || !link.href) continue;
    return cleanText(link.href);
  }
  return "";
};

const pickFeedThumb = (entry) => {
  const mediaThumb = cleanText(entry && entry["media$thumbnail"] && entry["media$thumbnail"].url);
  if (mediaThumb) return mediaThumb;
  const mediaContent = Array.isArray(entry && entry["media$content"]) ? entry["media$content"] : [];
  for (const item of mediaContent) {
    const url = cleanText(item && item.url);
    if (url) return url;
  }
  const summaryHtml = String(entry && entry.summary && entry.summary.$t ? entry.summary.$t : "");
  const contentHtml = String(entry && entry.content && entry.content.$t ? entry.content.$t : "");
  const fromSummary = extractFirstImageFromMarkup(summaryHtml);
  if (fromSummary) return fromSummary;
  const fromContent = extractFirstImageFromMarkup(contentHtml);
  if (fromContent) return fromContent;
  return "";
};

const pickFeedAuthor = (entry) => {
  const list = Array.isArray(entry && entry.author) ? entry.author : [];
  if (!list.length) return { name: "", url: "", avatar: "" };
  const one = list[0] || {};
  return {
    name: cleanText(one && one.name && one.name.$t),
    url: cleanText(one && one.uri && one.uri.$t),
    avatar: cleanText(one && one["gd$image"] && one["gd$image"].src),
  };
};

const responseFromHtml = (response, html) => {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const addClassToken = (className, token) => {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) return String(className || "").trim();
  const parts = String(className || "")
    .split(/\s+/)
    .map((part) => String(part || "").trim())
    .filter(Boolean);
  if (!parts.includes(cleanToken)) {
    parts.push(cleanToken);
  }
  return parts.join(" ");
};

const firstCardValue = (el, names) => {
  if (!el || !Array.isArray(names)) return "";
  for (const name of names) {
    const value = cleanText(el.getAttribute(name) || "");
    if (value) return value;
  }
  return "";
};

const setCardAttr = (el, name, value) => {
  if (!el || !name) return;
  el.setAttribute(name, String(value || ""));
};

const decoratePostCardDataset = (el) => {
  if (!el) return;
  const author = firstCardValue(el, ["data-gg-author", "data-author-name", "data-author"]);
  const contributors = firstCardValue(el, ["data-gg-contributors", "data-contributors"]);
  const tags = firstCardValue(el, ["data-gg-tags", "data-tags"]);
  const labels = firstCardValue(el, ["data-gg-labels"]);
  const date = firstCardValue(el, ["data-gg-date", "data-date", "data-published"]);
  const updated = firstCardValue(el, ["data-gg-updated", "data-updated", "data-last-updated"]) || date;
  const comments = firstCardValue(el, ["data-gg-comments", "data-comments"]);
  const readtime = firstCardValue(el, ["data-gg-readtime", "data-readtime", "data-read-time"]);
  const snippet = firstCardValue(el, ["data-gg-snippet", "data-snippet"]);
  const tocJson = firstCardValue(el, ["data-gg-toc-json"]);
  const normalizedTags = tags;
  const normalizedLabels = labels;
  setCardAttr(el, "data-gg-author", author);
  setCardAttr(el, "data-gg-contributors", contributors);
  setCardAttr(el, "data-gg-tags", normalizedTags);
  setCardAttr(el, "data-gg-labels", normalizedLabels);
  setCardAttr(el, "data-gg-date", date);
  setCardAttr(el, "data-gg-updated", updated);
  setCardAttr(el, "data-gg-comments", comments);
  setCardAttr(el, "data-gg-readtime", readtime);
  setCardAttr(el, "data-gg-snippet", snippet);
  setCardAttr(el, "data-gg-toc-json", tocJson);
};

const isBypassEnhancementPath = (pathname) => {
  const path = String(pathname || "");
  if (!path) return false;
  return /\.txt$/i.test(path) || path.startsWith("/.well-known/");
};

const LEGAL_PAGE_PATHS = new Set([
  "/p/editorial-policy.html",
  "/p/privacy-policy.html",
  "/p/terms-of-service.html",
  "/p/accessibility.html",
]);

const isLegalPage = (pathname) => {
  return LEGAL_PAGE_PATHS.has(String(pathname || ""));
};

const LEGAL_CLEAN_ROOM_SELECTORS = [
  "script#gg-mixed-config",
  ".gg-mixed",
  "[id^=\"gg-mixed-\"]",
  "[data-gg-mixed]",
  "[data-gg-module=\"mixed-media\"]",
  ".gg-mixed__error",
  ".gg-mixed__card--placeholder",
  ".gg-newsdeck",
  ".gg-post__comments",
  "#comments",
  "#comments-ssr",
  "#comments-block",
  "#comments-block-ssr",
  ".gg-comments",
  ".comments2",
  ".gg-comments-panel",
  "[data-gg-panel=\"comments\"]",
  "[data-gg-postbar=\"comments\"]",
  "[data-gg-comments-gate]",
  "[data-gg-comments-load]",
  "[data-gg-action=\"comments-help\"]",
  "[data-gg-modal=\"comments-help\"]",
  "a[href=\"#comments\"]",
  "a[href*=\"#comments\"]",
];

const applyLegalCleanRoomRewrites = (rewriter) => {
  const removeElement = {
    element(el) {
      el.remove();
    },
  };
  for (const selector of LEGAL_CLEAN_ROOM_SELECTORS) {
    rewriter.on(selector, removeElement);
  }
  return rewriter;
};

const LEGACY_LANDING_CONTACT_ID = "gg-landing-hero-5";
const LEGACY_LANDING_CONTACT_HASH = `#${LEGACY_LANDING_CONTACT_ID}`;
const CANONICAL_LANDING_CONTACT_ID = "contact";
const CANONICAL_LANDING_CONTACT_HASH = `#${CANONICAL_LANDING_CONTACT_ID}`;

const normalizeLandingContactHtml = (html) => {
  const source = String(html || "");
  if (!source) return source;
  const hasLegacyHash = source.includes(LEGACY_LANDING_CONTACT_HASH);
  const legacyIdRe = new RegExp(
    `\\bid\\s*=\\s*(['"])${LEGACY_LANDING_CONTACT_ID}\\1`,
    "i"
  );
  if (!hasLegacyHash && !legacyIdRe.test(source)) {
    return source;
  }
  let out = source;
  if (hasLegacyHash) {
    out = out.split(LEGACY_LANDING_CONTACT_HASH).join(CANONICAL_LANDING_CONTACT_HASH);
  }
  out = out.replace(
    new RegExp(`\\bid\\s*=\\s*(['"])${LEGACY_LANDING_CONTACT_ID}\\1`, "gi"),
    `id='${CANONICAL_LANDING_CONTACT_ID}'`
  );
  return out;
};

const ensureLandingContactResponse = async (response) => {
  let html = "";
  try {
    html = await response.clone().text();
  } catch (e) {
    return response;
  }
  if (!html) return response;
  const patched = normalizeLandingContactHtml(html);
  if (patched === html) return response;
  return responseFromHtml(response, patched);
};

const CSP_REPORT_BUCKET = new Map();
const CSP_REPORT_MAX = 500;
const CSP_REPORT_TRIM = 100;

const redactUrlValue = (value) => {
  if (!value || typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return `${u.origin}${u.pathname}`;
    }
    return u.protocol;
  } catch (e) {
    const noHash = raw.split("#")[0];
    const noQuery = noHash.split("?")[0];
    return noQuery;
  }
};

const extractCspReport = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload["csp-report"] && typeof payload["csp-report"] === "object") {
    return payload["csp-report"];
  }
  if (payload.body && typeof payload.body === "object") {
    return payload.body;
  }
  return payload;
};

const shouldLogCspCount = (count) => {
  if (count === 1 || count === 10 || count === 50) return true;
  if (count >= 100 && count % 100 === 0) return true;
  return false;
};

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: https://*.bp.blogspot.com https://*.googleusercontent.com https://*.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://www.blogger.com https://www.gstatic.com",
  "connect-src 'self' https://inohong-kbms-api.ratriatra.workers.dev",
  "frame-src 'self' https://www.blogger.com https://accounts.google.com https://www.google.com",
  "form-action 'self' https://www.blogger.com",
  "upgrade-insecure-requests",
  "report-uri /api/csp-report",
].join("; ");

const addSecurityHeaders = (resp, requestUrl, contentType, opts = {}) => {
  const headers = resp.headers;
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()"
  );
  headers.set("X-Frame-Options", "SAMEORIGIN");
  const isHtml = (contentType || "").toLowerCase().includes("text/html");
  const robotsMode = normalizeFlagsMode(opts.robotsMode);
  const robotsTag = robotsMode === FLAGS_MODE_LAB ? "noindex, nofollow" : "index, follow";
  if (isHtml) {
    headers.set("X-Robots-Tag", robotsTag);
  }
  const cspReportEnabled = opts.cspReportEnabled !== false;
  if (isHtml && cspReportEnabled) {
    const origin = new URL(requestUrl).origin;
    const reportTo = JSON.stringify({
      group: "csp",
      max_age: 10886400,
      endpoints: [{ url: `${origin}/api/csp-report` }],
    });
    headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
    headers.set("Report-To", reportTo);
    headers.set("Reporting-Endpoints", `csp="${origin}/api/csp-report"`);
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const legalPage = isLegalPage(pathname);
    const WORKER_VERSION = "ac33998";
    const TEMPLATE_ALLOWED_RELEASES = ["ac33998"];
    const LATEST_ASSET_PREFIX = "/assets/latest/";
    const ACTIVE_ASSET_PREFIX = `/assets/v/${WORKER_VERSION}/`;
    const stamp = (res, opts = {}) => {
      const h = new Headers(res.headers);
      h.set("X-GG-Worker", "proxy");
      h.set("X-GG-Worker-Version", WORKER_VERSION);
      h.set("X-GG-Assets", WORKER_VERSION);
      const out = new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: h,
      });
      const contentType = out.headers.get("content-type") || "";
      addSecurityHeaders(out, request.url, contentType, opts);
      return out;
    };

    if (
      pathname === "/_headers" ||
      pathname === "/_redirects" ||
      pathname === "/wrangler.toml" ||
      pathname === "/wrangler.jsonc"
    ) {
      const r = new Response("Not Found", { status: 404 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/__gg_worker_ping") {
      const r = new Response("pong", { status: 200 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/gg-flags.json") {
      const flags = await loadFlags(env);
      const body = JSON.stringify({
        ...flags,
        release: WORKER_VERSION,
        ts: Date.now(),
      });
      const r = new Response(body, { status: 200 });
      r.headers.set("Content-Type", "application/json; charset=utf-8");
      r.headers.set("Cache-Control", "no-store, max-age=0");
      const out = stamp(r);
      out.headers.set("Cache-Control", "no-store, max-age=0");
      out.headers.set("Pragma", "no-cache");
      out.headers.set("Expires", "0");
      return out;
    }

    if (pathname === "/__gg_route_test") {
      const smokeUa = String(request.headers.get("user-agent") || "").toLowerCase();
      if (!smokeUa.includes("gg-live-smoke-worker")) {
        const r = new Response("Not Found", { status: 404 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }
      const body = [
        "ROUTE_OK",
        `pathname: ${pathname}`,
        `host: ${url.host}`,
      ].join("\n");
      const r = new Response(body, { status: 200 });
      r.headers.set("Content-Type", "text/plain; charset=utf-8");
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/api/telemetry") {
      let payload = null;
      try {
        payload = await request.json();
      } catch (e) {
        try {
          payload = await request.text();
        } catch (err) {
          payload = null;
        }
      }
      console.log("GG_TELEMETRY", payload);
      const r = new Response("", { status: 204 });
      r.headers.set("Cache-Control", "no-store");
      return stamp(r);
    }

    if (pathname === "/api/csp-report") {
      if (request.method !== "POST") {
        const r = new Response("Method Not Allowed", { status: 405 });
        r.headers.set("Allow", "POST");
        r.headers.set("Cache-Control", "no-store");
        r.headers.set("Content-Type", "text/plain; charset=utf-8");
        return stamp(r);
      }

      const flags = await loadFlags(env);
      const cspReportEnabled = flags.csp_report_enabled !== false;
      if (!cspReportEnabled) {
        const r = new Response("", { status: 204 });
        r.headers.set("Cache-Control", "no-store");
        r.headers.set("Content-Type", "text/plain; charset=utf-8");
        return stamp(r);
      }

      const MAX_BODY = 65536;
      let body = "";
      try {
        body = await request.text();
      } catch (e) {
        body = "";
      }
      if (body.length > MAX_BODY) {
        body = body.slice(0, MAX_BODY);
      }

      const ts = new Date().toISOString();
      const cfRay = request.headers.get("cf-ray") || "-";
      const uaRaw = request.headers.get("user-agent") || "";
      const ua = uaRaw.slice(0, 120).replace(/"/g, "'");
      let payload = null;
      try {
        payload = JSON.parse(body || "{}");
      } catch (e) {
        payload = null;
      }

      const report = extractCspReport(payload);
      let dir = "parse_error";
      let blocked = "-";
      let source = "-";
      let doc = "-";

      if (report && typeof report === "object") {
        const dirRaw =
          report.effectiveDirective ||
          report.violatedDirective ||
          report["effective-directive"] ||
          report["violated-directive"] ||
          "";
        const blockedRaw = report.blockedURI || report["blocked-uri"] || "";
        const sourceRaw = report.sourceFile || report["source-file"] || "";
        const docRaw = report.documentURI || report["document-uri"] || "";

        dir = String(dirRaw || "-");
        blocked = redactUrlValue(blockedRaw) || String(blockedRaw || "-");
        source = redactUrlValue(sourceRaw) || String(sourceRaw || "-");
        doc = redactUrlValue(docRaw) || String(docRaw || "-");
      }

      const key = `${dir}|${blocked}|${source}`;
      const entry = CSP_REPORT_BUCKET.get(key) || {
        count: 0,
        firstTs: ts,
        lastTs: ts,
      };
      entry.count += 1;
      entry.lastTs = ts;
      CSP_REPORT_BUCKET.set(key, entry);

      if (CSP_REPORT_BUCKET.size > CSP_REPORT_MAX) {
        let trimmed = 0;
        for (const k of CSP_REPORT_BUCKET.keys()) {
          CSP_REPORT_BUCKET.delete(k);
          trimmed += 1;
          if (trimmed >= CSP_REPORT_TRIM) break;
        }
      }

      if (shouldLogCspCount(entry.count)) {
        console.log(
          `CSP_REPORT count=${entry.count} dir=${dir} blocked=${blocked} source=${source} doc=${doc} ray=${cfRay} ua="${ua}"`
        );
      }

      const r = new Response("", { status: 204 });
      r.headers.set("Cache-Control", "no-store");
      r.headers.set("Content-Type", "text/plain; charset=utf-8");
      return stamp(r);
    }

    if (pathname === "/api/proxy") {
      const target = url.searchParams.get("url");
      if (!target) {
        const r = new Response("Missing url", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      let upstream;
      try {
        upstream = new URL(target);
      } catch (e) {
        const r = new Response("Invalid url", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      if (upstream.protocol !== "https:" && upstream.protocol !== "http:") {
        const r = new Response("Invalid protocol", { status: 400 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const host = upstream.hostname || "";
      const allowlisted =
        host.endsWith(".bp.blogspot.com") ||
        host.endsWith(".googleusercontent.com");
      if (!allowlisted) {
        const r = new Response("Host not allowed", { status: 403 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      let upstreamRes;
      try {
        upstreamRes = await fetch(upstream.toString(), {
          method: "GET",
          headers: {
            "Accept": "image/*",
          },
        });
      } catch (e) {
        const r = new Response("Upstream fetch failed", { status: 502 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      if (!upstreamRes || !upstreamRes.ok) {
        const r = new Response("Upstream error", { status: 502 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const contentType = upstreamRes.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        const r = new Response("Unsupported content", { status: 415 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const headers = new Headers(upstreamRes.headers);
      headers.delete("access-control-allow-origin");
      headers.delete("access-control-allow-credentials");
      headers.delete("access-control-expose-headers");
      headers.delete("access-control-allow-methods");
      headers.delete("access-control-allow-headers");
      headers.delete("cross-origin-resource-policy");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=86400");

      const r = new Response(upstreamRes.body, { status: 200, headers });
      return stamp(r);
    }

    // Path yang memang kamu host di Workers Static Assets
    const shouldTryAssets =
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/gg-pwa-icon/") ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      pathname === "/offline.html" ||
      isBypassEnhancementPath(pathname);

    // Reverse proxy Blogger untuk semua non-asset path.
    if (!shouldTryAssets) {
      const viewParam = String(url.searchParams.get("view") || "").trim().toLowerCase();
      const redirectToSurface = (targetPathname) => {
        const dest = new URL(request.url);
        dest.pathname = targetPathname;
        dest.searchParams.delete("view");
        dest.searchParams.delete("max-results");
        dest.searchParams.delete("start-index");
        dest.hash = "";
        const r = new Response(null, {
          status: 301,
          headers: {
            "Location": dest.toString(),
            "Cache-Control": "no-store",
          },
        });
        return stamp(r);
      };

      if (pathname === "/blog" || pathname === "/blog/") {
        return redirectToSurface("/");
      }
      if ((pathname === "/" || pathname === "") && viewParam === "blog") {
        return redirectToSurface("/");
      }
      if ((pathname === "/" || pathname === "") && viewParam === "landing") {
        return redirectToSurface("/landing");
      }
      if (pathname === "/landing/") {
        return redirectToSurface("/landing");
      }
      if (pathname === "/landing" && viewParam === "landing") {
        return redirectToSurface("/landing");
      }
      if (pathname === "/landing" && viewParam === "blog") {
        return redirectToSurface("/");
      }
      function buildOriginHtmlRequest(baseRequest, originUrl) {
        const headers = new Headers();
      
        headers.set(
          "accept",
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        );
      
        const acceptLanguage = baseRequest.headers.get("accept-language");
        if (acceptLanguage) {
          headers.set("accept-language", acceptLanguage);
        }
      
        headers.set("cache-control", "no-cache");
        headers.set("pragma", "no-cache");
      
        return new Request(originUrl.toString(), {
          method: "GET",
          headers,
          redirect: "follow"
        });
      }
      let originRequest = request;
      let originUrl = new URL(request.url);
      const isListingSurfaceRequest = pathname === "/" || pathname === "";
      const isLandingSurfaceRequest = pathname === "/landing";
      const oldDebugProbeParam = String(originUrl.searchParams.get("x") || "").trim().toLowerCase();
      if (oldDebugProbeParam === "home-origin" || oldDebugProbeParam === "probe-left") {
        originUrl.searchParams.delete("x");
      }
    
      if (isLandingSurfaceRequest) {
        originUrl.pathname = "/";
        // `/landing` remains an explicit origin bridge until XML can branch
        // landing SSR without Blogger's legacy `view=landing` signal.
        originUrl.searchParams.set("view", "landing");
        originUrl.searchParams.delete("max-results");
        originUrl.searchParams.delete("start-index");
        originRequest = new Request(originUrl.toString(), request);
      }
      const isDocumentProxyRequest =
      request.method === "GET" &&
      !pathname.startsWith("/assets/") &&
      !pathname.startsWith("/feeds/") &&
      !pathname.startsWith("/api/") &&
      !/\.(?:css|js|mjs|json|xml|txt|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$/i.test(pathname);
    
    if (isDocumentProxyRequest) {
      originRequest = buildOriginHtmlRequest(request, originUrl);
    }
      let originRes;
      try {
        originRes = await fetch(originRequest);
      } catch (e) {
        return stamp(new Response("Upstream fetch failed", { status: 502 }));
      }

      const contentType = originRes.headers.get("content-type") || "";
      const isHtmlResponse = contentType.indexOf("text/html") !== -1;
      const shouldEnhanceHtml = isHtmlResponse && originRes.status >= 200 && originRes.status < 300;
      if (isHtmlResponse && !shouldEnhanceHtml) {
        // Keep upstream redirects/errors intact (not rewritten into mismatch HTML).
        const passthrough = stamp(originRes);
        // Avoid sticky browser cache for redirect/error HTML variants (mobile m=1 chain, etc).
        if (originRes.status >= 300) {
          passthrough.headers.set("Cache-Control", "no-store, max-age=0");
          passthrough.headers.set("Pragma", "no-cache");
          passthrough.headers.set("Expires", "0");
        }
        return passthrough;
      }
      if (shouldEnhanceHtml) {
        const flags = await loadFlags(env);
        const cspReportEnabled = flags.csp_report_enabled !== false;
        const robotsMode = normalizeFlagsMode(flags.mode);
        const robotsMetaContent =
          robotsMode === FLAGS_MODE_LAB ? "noindex, nofollow" : "index, follow";
        const expectedEnv = "prod";
        const expectedRelease = WORKER_VERSION;
        const shouldEvaluateTemplate = request.method !== "HEAD";
        let templateMismatch = false;
        let templateMismatchReason = "";
        let templateReleaseDrift = false;
        let templateReleaseDriftReason = "";
        let templateContract = false;
        let templateContractReason = "";
        if (shouldEvaluateTemplate) {
          try {
            const html = await originRes.clone().text();
            const fp = parseTemplateFingerprint(html);
            const mismatchReasons = getTemplateMismatchReasons(
              fp,
              expectedEnv,
              expectedRelease,
              TEMPLATE_ALLOWED_RELEASES
            );
            const contractReasons = getTemplateContractReasons(html);
            templateContract = contractReasons.length > 0;
            templateContractReason = contractReasons.length ? contractReasons.join(",") : "";
            const releaseOnlyMismatch = isReleaseDriftOnly(mismatchReasons);
            templateReleaseDrift = releaseOnlyMismatch;
            templateReleaseDriftReason = releaseOnlyMismatch ? mismatchReasons.join(",") : "";
            templateMismatch = mismatchReasons.length > 0;
            if (releaseOnlyMismatch && !templateContract) {
              templateMismatch = false;
              templateMismatchReason = "";
            } else {
              templateMismatchReason = mismatchReasons.length ? mismatchReasons.join(",") : "";
            }
          } catch (e) {
            templateMismatch = true;
            templateMismatchReason = "unknown";
            templateContract = true;
            templateContractReason = "unknown";
          }
        }
        const publicUrl = new URL(request.url);
        publicUrl.searchParams.delete("m");
        publicUrl.searchParams.delete("view");
        publicUrl.searchParams.delete("x");
        publicUrl.searchParams.delete("fbclid");
        publicUrl.searchParams.delete("gclid");
        publicUrl.searchParams.delete("msclkid");
        for (const key of Array.from(publicUrl.searchParams.keys())) {
          if (key.startsWith("utm_")) {
            publicUrl.searchParams.delete(key);
          }
        }
        publicUrl.hash = "";
        const canonicalPublic = `${publicUrl.origin}${publicUrl.pathname}`;
        const canonicalInject = [
          `<link rel="canonical" href="${canonicalPublic}">`,
          `<meta property="og:url" content="${canonicalPublic}">`,
          `<meta name="twitter:url" content="${canonicalPublic}">`,
        ].join("");
        const meta = {
          ogType: "",
          ogTitle: "",
          ogDesc: "",
          ogImage: "",
          ogSiteName: "",
          desc: "",
          author: "",
          pub: "",
          mod: "",
          titleText: "",
          hasArticle: false,
          surface: "",
        };
        const assignMeta = (key, value) => {
          if (value) {
            meta[key] = value;
          }
        };
        const buildSchema = () => {
          const origin = new URL(request.url).origin;
          const pageUrl = cleanUrlForSchema(request.url);
          const isListingSurface =
            isListingSurfaceRequest || meta.surface === "listing" || meta.surface === "global";
          const siteName = (meta.ogSiteName || "").trim() || "pakrpp.com";
          const pageName =
            (meta.ogTitle || "").trim() ||
            (meta.titleText || "").trim() ||
            siteName;
          const pageDesc = (meta.ogDesc || "").trim() || (meta.desc || "").trim();
          const publisherName = (meta.author || "").trim() || "pakrpp";
          const ogImage = (meta.ogImage || "").trim();
          let imageUrl = "";
          if (ogImage) {
            try {
              imageUrl = new URL(ogImage, origin).toString();
            } catch (e) {
              imageUrl = "";
            }
          }
          const graph = [
            {
              "@type": "WebSite",
              "@id": `${origin}/#website`,
              url: `${origin}/`,
              name: siteName,
              inLanguage: "id-ID",
              potentialAction: {
                "@type": "SearchAction",
                target: `${origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Person",
              "@id": `${origin}/#publisher`,
              name: publisherName,
              url: `${origin}/`,
            },
            {
              "@type": isListingSurface ? "CollectionPage" : "WebPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: pageName,
              description: pageDesc,
              isPartOf: { "@id": `${origin}/#website` },
              publisher: { "@id": `${origin}/#publisher` },
              inLanguage: "id-ID",
            },
          ];
          const ogType = (meta.ogType || "").trim().toLowerCase();
          const isPostSurface = meta.surface === "post";
          const isArticle =
            isPostSurface ||
            ogType === "article" ||
            !!meta.pub ||
            (!isListingSurface && meta.hasArticle);
          if (isArticle) {
            const blogPosting = {
              "@type": "BlogPosting",
              "@id": `${pageUrl}#blogposting`,
              mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
              url: pageUrl,
              headline: pageName,
              description: pageDesc,
              author: { "@id": `${origin}/#publisher` },
              publisher: { "@id": `${origin}/#publisher` },
              isPartOf: { "@id": `${origin}/#website` },
            };
            if (imageUrl) {
              blogPosting.image = [imageUrl];
            }
            if (meta.pub) {
              blogPosting.datePublished = meta.pub;
              if (meta.mod) {
                blogPosting.dateModified = meta.mod;
              } else {
                blogPosting.dateModified = meta.pub;
              }
            }
            graph.push(blogPosting);
          }
          return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
        };
        const mismatchBanner =
          '<div id="gg-template-mismatch" style="position:sticky;top:0;z-index:2147483647;background:#b91c1c;color:#fff;padding:8px 12px;font:14px/1.4 system-ui;text-align:center;">' +
          "Template mismatch detected. Enhancements disabled." +
          "</div>";
        const rewritten = new HTMLRewriter()
          .on("html", {
            element(el) {
              if (legalPage) {
                el.setAttribute("data-gg-page", "legal");
                const className = addClassToken(el.getAttribute("class"), "gg-page--legal");
                if (className) {
                  el.setAttribute("class", className);
                }
              }
            },
          })
          .on("meta[property=\"og:type\"]", {
            element(el) {
              assignMeta("ogType", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:title\"]", {
            element(el) {
              assignMeta("ogTitle", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:description\"]", {
            element(el) {
              assignMeta("ogDesc", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:image\"]", {
            element(el) {
              assignMeta("ogImage", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"og:site_name\"]", {
            element(el) {
              assignMeta("ogSiteName", el.getAttribute("content"));
            },
          })
          .on("meta[name=\"description\"]", {
            element(el) {
              assignMeta("desc", el.getAttribute("content"));
            },
          })
          .on("meta[name=\"author\"]", {
            element(el) {
              assignMeta("author", el.getAttribute("content"));
            },
          })
          .on("meta[name=\"gg-env\"]", {
            element(el) {
              el.setAttribute("content", expectedEnv);
            },
          })
          .on("meta[name=\"gg-release\"]", {
            element(el) {
              el.setAttribute("content", expectedRelease);
            },
          })
          .on("meta", {
            element(el) {
              const metaName = (el.getAttribute("name") || "").trim().toLowerCase();
              if (metaName !== "robots") return;
              el.setAttribute("content", robotsMetaContent);
            },
          })
          .on("meta[property=\"article:published_time\"]", {
            element(el) {
              assignMeta("pub", el.getAttribute("content"));
            },
          })
          .on("meta[property=\"article:modified_time\"]", {
            element(el) {
              assignMeta("mod", el.getAttribute("content"));
            },
          })
          .on("title", {
            text(text) {
              meta.titleText += text.text;
            },
          })
          .on("article.gg-post-card", {
            element(el) {
              decoratePostCardDataset(el);
            },
          })
          .on("article", {
            element() {
              meta.hasArticle = true;
            },
          })
          .on("script#gg-schema", {
            element(el) {
              el.remove();
            },
          })
          .on("div#gg-left-sb-body-list", {
            element(el) {
              el.remove();
            },
          })
          .on("div#gg-left-sb-top-post", {
            element(el) {
              el.remove();
            },
          })
          .on("#gg-left-panel .gg-leftnav__profile", {
            element(el) {
              el.remove();
            },
          })
          .on("#gg-left-panel details.gg-navtree[data-gg-navtree=\"group\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("div#gg-fingerprint", {
            element(el) {
              el.setAttribute("data-env", expectedEnv);
              el.setAttribute("data-release", expectedRelease);
              el.setAttribute("hidden", "");
            },
          })
          .on("link[href]", {
            element(el) {
              const href = (el.getAttribute("href") || "").trim();
              if (!href) return;
              const rewrittenHref = rewriteVersionedAssetRef(href, expectedRelease, url.origin, ASSET_CACHE_BUST);
              if (rewrittenHref && rewrittenHref !== href) {
                el.setAttribute("href", rewrittenHref);
              }
            },
          })
          .on("script[src]", {
            element(el) {
              const src = (el.getAttribute("src") || "").trim();
              if (!src) return;
              const rewrittenSrc = rewriteVersionedAssetRef(src, expectedRelease, url.origin, ASSET_CACHE_BUST);
              if (rewrittenSrc && rewrittenSrc !== src) {
                el.setAttribute("src", rewrittenSrc);
              }
            },
          })
          .on("#gg-toc .gg-toc__empty", {
            element(el) {
              el.setAttribute("hidden", "");
              el.setInnerContent("");
            },
          })
          .on("link[rel=\"canonical\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("meta[property=\"og:url\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("meta[name=\"twitter:url\"]", {
            element(el) {
              el.remove();
            },
          })
          .on("head", {
            element(el) {
              el.append(canonicalInject, { html: true });
            },
          })
          .on("body", {
            element(el) {
              if (legalPage) {
                el.setAttribute("data-gg-page", "legal");
                const className = addClassToken(el.getAttribute("class"), "gg-page--legal");
                if (className) {
                  el.setAttribute("class", className);
                }
              }
              meta.surface = (el.getAttribute("data-gg-surface") || "").trim();
              const schemaJson = buildSchema();
              el.prepend(
                `<script id="gg-schema" type="application/ld+json">${schemaJson}</script>`,
                { html: true }
              );
              if (templateMismatch && !legalPage) {
                el.prepend(mismatchBanner, { html: true });
              }
            },
          });

        if (templateMismatch) {
          rewritten.on("script[src]", {
            element(el) {
              const src = (el.getAttribute("src") || "").trim();
              if (isBootScriptUrl(src, url.origin)) {
                el.remove();
              }
            },
          });
          rewritten.on("link[rel]", {
            element(el) {
              const rel = (el.getAttribute("rel") || "").trim().toLowerCase();
              if (!rel) return;
              const as = (el.getAttribute("as") || "").trim().toLowerCase();
              if (rel === "preload" && as && as !== "script") return;
              if (rel !== "preload" && rel !== "modulepreload") return;
              const href = (el.getAttribute("href") || "").trim();
              if (isAppJsAsset(href)) {
                el.remove();
              }
            },
          });
        }

        if (legalPage) {
          applyLegalCleanRoomRewrites(rewritten);
        }
        const transformed = rewritten.transform(originRes);
        let htmlResponse = transformed;
        if (request.method !== "HEAD") {
          htmlResponse = await ensureLandingContactResponse(htmlResponse);
        }
        let out = stamp(htmlResponse, { cspReportEnabled, robotsMode });
        if (templateReleaseDrift) {
          out.headers.set("x-gg-template-release-drift", "1");
          out.headers.set(
            "x-gg-template-release-drift-reason",
            templateReleaseDriftReason || RELEASE_MISMATCH_REASON
          );
        }
        if (templateMismatch) {
          if (!templateMismatchReason) {
            templateMismatchReason = "unknown";
          }
          out.headers.set("x-gg-template-mismatch", "1");
          out.headers.set("x-gg-template-mismatch-reason", templateMismatchReason);
          out.headers.set("Cache-Control", "no-store, max-age=0");
          out.headers.set("Pragma", "no-cache");
          out.headers.set("Expires", "0");
        }
        if (templateContract) {
          if (!templateContractReason) {
            templateContractReason = "unknown";
          }
          out.headers.set("x-gg-template-contract", "1");
          out.headers.set("x-gg-template-contract-reason", templateContractReason);
        }
        return out;
      }

      return stamp(originRes);
    }

    if (!env.ASSETS) {
      return stamp(new Response("ASSETS binding missing", { status: 502 }));
    }

    let assetRequest = request;
    if (pathname.startsWith(LATEST_ASSET_PREFIX)) {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = `${ACTIVE_ASSET_PREFIX}${pathname.slice(LATEST_ASSET_PREFIX.length)}`;
      assetRequest = new Request(assetUrl.toString(), request);
    }

    let assetRes;
    try {
      assetRes = await env.ASSETS.fetch(assetRequest);
    } catch (e) {
      return stamp(new Response("ASSETS fetch failed", { status: 502 }));
    }

    // Jangan cache response error
    if (!assetRes.ok) {
      if (pathname === "/sw.js") {
        const r = new Response("sw.js missing in ASSETS", { status: 404 });
        r.headers.set("Cache-Control", "no-store");
        return stamp(r);
      }

      const r = new Response(assetRes.body, assetRes);
      r.headers.set("Cache-Control", "no-store");
      if (/\.txt$/i.test(pathname)) {
        r.headers.set("Content-Type", "text/plain; charset=utf-8");
      }
      const errContentType = r.headers.get("content-type") || "";
      if (errContentType.toLowerCase().includes("text/html")) {
        const flags = await loadFlags(env);
        const cspReportEnabled = flags.csp_report_enabled !== false;
        const robotsMode = normalizeFlagsMode(flags.mode);
        return stamp(r, { cspReportEnabled, robotsMode });
      }
      return stamp(r);
    }

    const res = new Response(assetRes.body, assetRes);
    const setCache = (v) => res.headers.set("Cache-Control", v);
    if (/\.txt$/i.test(pathname)) {
      res.headers.set("Content-Type", "text/plain; charset=utf-8");
    }

    if (pathname.startsWith("/assets/latest/")) {
      setCache("no-store, max-age=0");
      res.headers.set("Pragma", "no-cache");
    } else if (pathname.startsWith("/assets/v/")) {
      setCache("public, max-age=31536000, immutable");
    } else if (pathname === "/sw.js") {
      // SW harus gampang update
      setCache("no-store");
    } else if (pathname === "/manifest.webmanifest" || pathname === "/offline.html") {
      setCache("no-store");
    } else if (pathname.startsWith("/gg-pwa-icon/")) {
      setCache("public, max-age=31536000, immutable");
    } else {
      setCache("public, max-age=86400");
    }

    const assetContentType = res.headers.get("content-type") || "";
    if (assetContentType.toLowerCase().includes("text/html")) {
      const flags = await loadFlags(env);
      const cspReportEnabled = flags.csp_report_enabled !== false;
      const robotsMode = normalizeFlagsMode(flags.mode);
      return stamp(res, { cspReportEnabled, robotsMode });
    }
    return stamp(res);
  },
};
