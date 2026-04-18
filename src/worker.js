/* src/worker.js — Cloudflare Worker (edge) */
const cleanUrlForSchema = (inputUrl, { forceListing = false, forceLanding = false } = {}) => {
  const u = new URL(inputUrl);
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
  if (forceLanding) {
    u.pathname = "/landing";
  } else if (forceListing) {
    u.pathname = "/";
  }
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

const BLOG_LISTING_MIN_POSTCARDS = 9;
const BLOG_LISTING_BACKFILL_HOPS = 3;
const BLOG_LISTING_FEED_MAX_RESULTS = 30;
const BLOG_LISTING_FEED_MAX_PAGES = 4;

const toPositiveInt = (value, fallback, max = BLOG_LISTING_FEED_MAX_RESULTS) => {
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

const buildFeedLabelUrl = (label, origin) => {
  const normalized = cleanText(label);
  if (!normalized) return "";
  try {
    return new URL(`/search/label/${encodeURIComponent(normalized)}`, origin).toString();
  } catch (e) {
    return `/search/label/${encodeURIComponent(normalized)}`;
  }
};

const buildFeedPostCard = (entry, requestUrl) => {
  const origin = (() => {
    try {
      return new URL(requestUrl).origin;
    } catch (e) {
      return "";
    }
  })();
  const postUrl = pickFeedAlternateUrl(entry);
  if (!postUrl) return null;
  const title = cleanText(entry && entry.title && entry.title.$t) || "Untitled";
  const postId = extractFeedPostId(entry);
  const publishedIso = cleanText(entry && entry.published && entry.published.$t);
  const updatedIso = cleanText(entry && entry.updated && entry.updated.$t);
  const publishedRaw = publishedIso || updatedIso;
  const publishedText = formatIsoDate(publishedRaw);
  const updatedText = formatIsoDate(updatedIso || publishedRaw);
  const commentsRaw = cleanText(entry && entry["thr$total"] && entry["thr$total"].$t);
  const commentsText = commentsRaw || "0";
  const excerpt = truncateText(
    stripHtml(
      cleanText(entry && entry.summary && entry.summary.$t) ||
        cleanText(entry && entry.content && entry.content.$t)
    ),
    220
  );
  const author = pickFeedAuthor(entry);
  const authorName = cleanText(author.name) || "PakRPP";
  const thumb = pickFeedThumb(entry);
  const categories = Array.isArray(entry && entry.category) ? entry.category : [];
  const labels = categories
    .map((item) => cleanText(item && item.term))
    .filter(Boolean);
  const labelsCsv = labels.join(",");
  const label = labels.length ? labels[0] : "";
  const labelUrl = buildFeedLabelUrl(label, origin || postUrl);
  const excerptWords = excerpt ? excerpt.split(/\s+/).filter(Boolean).length : 0;
  const readMin = excerptWords ? String(Math.max(1, Math.ceil(excerptWords / 200))) : "";
  const readLabel = readMin ? `${readMin} min read` : "";
  const safeUrl = escapeHtml(postUrl);
  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(excerpt);
  const safeDateIso = escapeHtml(publishedRaw);
  const safeDateText = escapeHtml(publishedText);
  const safeUpdatedText = escapeHtml(updatedText);
  const safeComments = escapeHtml(commentsText);
  const safeAuthorName = escapeHtml(authorName);
  const safeAuthorUrl = escapeHtml(author.url);
  const safeAuthorAvatar = escapeHtml(author.avatar);
  const safePostId = escapeHtml(postId);
  const safeLabelsCsv = escapeHtml(labelsCsv);
  const safeReadLabel = escapeHtml(readLabel);
  const safeLabel = escapeHtml(label);
  const safeLabelUrl = escapeHtml(labelUrl);
  const safeThumb = escapeHtml(thumb);
  const safeCommentsHref = `${safeUrl}#comments`;
  const safeUpdatedIso = escapeHtml(updatedIso || publishedRaw);
  const thumbHtml = safeThumb
    ? `<a class='gg-post-card__thumb' href='${safeUrl}'><figure><img alt='${safeTitle}' class='gg-post-card__thumb-img' decoding='async' loading='lazy' src='${safeThumb}'/></figure></a>`
    : `<a class='gg-post-card__thumb' href='${safeUrl}' aria-label='${safeTitle}'><figure><div aria-hidden='true' class='gg-post-card__thumb-placeholder'></div></figure></a>`;
  const labelHtml =
    safeLabel && safeLabelUrl
      ? `<span class='gg-post-card__label'><a href='${safeLabelUrl}' rel='tag'>${safeLabel}</a></span><span class='gg-post-card__meta-sep'>&#8226;</span>`
      : "";
  const labelsHiddenHtml = labels.length
    ? `<div class='gg-post-card__labels' hidden='hidden'>${labels
        .map((name) => {
          const text = escapeHtml(name);
          const href = escapeHtml(buildFeedLabelUrl(name, origin || postUrl));
          return `<a href='${href || "#"}' rel='tag'>${text}</a>`;
        })
        .join("")}</div>`
    : "";
  const postMetaHtml = `<div class='gg-postmeta gg-visually-hidden' data-contributors='' data-read-min='${safeReadLabel}' data-tags='' data-author='${safeAuthorName}' data-updated='${safeUpdatedIso || safeDateIso}'></div>`;
  const toolbarHtml = [
    "<div aria-label='Post actions' class='gg-post-card__toolbar' data-gg-copy-aria='post.action.comments' role='group'>",
    `<a class='gg-post-card__tool' data-gg-copy-title='post.action.comments' href='${safeCommentsHref}' title='Comments'>`,
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>comment</span>",
    "<span class='gg-visually-hidden' data-gg-copy='post.action.comments'>Comments</span>",
    `<span aria-hidden='true' class='gg-post-card__badge'>${safeComments}</span>`,
    "</a>",
    "<button aria-label='Save to library' class='gg-post-card__tool gg-post-card__action--bookmark' data-gg-action='bookmark' data-gg-copy-aria='library.action.add' data-gg-copy-title='library.action.add' title='Save to library' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>bookmark_add</span>",
    "<span class='gg-visually-hidden' data-gg-copy='library.action.add'>Save to library</span>",
    "</button>",
    "<button aria-label='Like' class='gg-post-card__tool' data-gg-action='like' data-gg-copy-aria='post.action.like' data-gg-copy-title='post.action.like' title='Like' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>featured_seasonal_and_gifts</span>",
    "<span class='gg-visually-hidden' data-gg-copy='post.action.like'>Like</span>",
    "</button>",
    "<button aria-label='Share' class='gg-post-card__tool gg-post-card__action--share' data-gg-action='share' data-gg-copy-aria='post.action.share' data-gg-copy-title='post.action.share' title='Share' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>ios_share</span>",
    "<span class='gg-visually-hidden' data-gg-copy='post.action.share'>Share</span>",
    "</button>",
    "<button aria-label='Information' class='gg-post-card__tool gg-post-card__tool--info' data-gg-action='info' data-gg-copy-aria='post.action.info' data-gg-copy-title='post.action.info' title='Information' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>info</span>",
    "<span class='gg-visually-hidden' data-gg-copy='post.action.info'>Information</span>",
    "</button>",
    "</div>",
  ].join("");
  const cardHtml = [
    `<article class='gg-post-card' data-author-avatar='${safeAuthorAvatar}' data-author-name='${safeAuthorName}' data-author-url='${safeAuthorUrl}' data-comments='${safeComments}' data-date='${safeDateText}' data-id='${safePostId}' data-readtime='${safeReadLabel}' data-snippet='${safeExcerpt}' data-title='${safeTitle}' data-updated='${safeUpdatedText}' data-url='${safeUrl}' data-gg-author='${safeAuthorName}' data-gg-comments='${safeComments}' data-gg-contributors='' data-gg-date='${safeDateText}' data-gg-labels='${safeLabelsCsv}' data-gg-readtime='${safeReadLabel}' data-gg-snippet='${safeExcerpt}' data-gg-tags='' data-gg-toc-json='' data-gg-updated='${safeUpdatedText}'>`,
    labelsHiddenHtml,
    postMetaHtml,
    thumbHtml,
    "<div class='gg-post-card__body'>",
    "<div class='gg-post-card__meta'>",
    labelHtml,
    `<span class='gg-post-card__meta-item gg-post-card__meta-item--date'><time class='gg-post-card__date' datetime='${safeDateIso}' title='${safeDateIso}'>${safeDateText}</time></span>`,
    "<span class='gg-post-card__meta-sep'>&#8226;</span>",
    `<span class='gg-post-card__meta-item gg-post-card__meta-item--comments'>${safeComments}</span>`,
    "</div>",
    `<h2 class='gg-post-card__title'><a class='gg-post-card__title-link' href='${safeUrl}'>${safeTitle}</a></h2>`,
    `<p class='gg-post-card__excerpt'>${safeExcerpt}</p>`,
    "</div>",
    toolbarHtml,
    "</article>",
  ].join("");
  return {
    key: postId ? `id:${postId}` : `data-url:${postUrl}`,
    html: cardHtml,
    published: publishedRaw,
  };
};

const buildListingFeedQuery = (requestUrl, targetCount) => {
  const req = new URL(requestUrl);
  const maxResults = toPositiveInt(
    req.searchParams.get("max-results"),
    toPositiveInt(targetCount, BLOG_LISTING_MIN_POSTCARDS),
    BLOG_LISTING_FEED_MAX_RESULTS
  );
  const updatedMax = cleanText(req.searchParams.get("updated-max"));
  const startIndex = toPositiveInt(req.searchParams.get("start-index"), 1, 1000000);
  return { maxResults, updatedMax, startIndex };
};

const buildListingFeedUrl = (requestUrl, targetCount, startIndex) => {
  const req = new URL(requestUrl);
  const feed = new URL("/feeds/posts/default", req.origin);
  const query = buildListingFeedQuery(requestUrl, targetCount);
  feed.searchParams.set("alt", "json");
  feed.searchParams.set("max-results", String(query.maxResults));
  if (query.updatedMax) feed.searchParams.set("updated-max", query.updatedMax);
  const cursor = toPositiveInt(startIndex, query.startIndex, 1000000);
  if (cursor > 1) feed.searchParams.set("start-index", String(cursor));
  return { url: feed.toString(), maxResults: query.maxResults };
};

const mapFeedNextToSearchUrl = (feed, requestUrl, fallbackMaxResults) => {
  const req = new URL(requestUrl);
  const links = Array.isArray(feed && feed.link) ? feed.link : [];
  for (const link of links) {
    if (!link || link.rel !== "next" || !link.href) continue;
    let next;
    try {
      next = new URL(link.href, req.origin);
    } catch (e) {
      continue;
    }
    const out = new URL("/search", req.origin);
    const updatedMax = cleanText(next.searchParams.get("updated-max"));
    const startIndex = cleanText(next.searchParams.get("start-index"));
    const maxResults = cleanText(next.searchParams.get("max-results")) || String(fallbackMaxResults);
    if (updatedMax) out.searchParams.set("updated-max", updatedMax);
    if (startIndex) out.searchParams.set("start-index", startIndex);
    if (maxResults) out.searchParams.set("max-results", maxResults);
    if (!out.searchParams.has("updated-max") && !out.searchParams.has("start-index")) {
      continue;
    }
    return out.toString();
  }
  return "";
};

const parseFeedNextStartIndex = (feed, fallback) => {
  const links = Array.isArray(feed && feed.link) ? feed.link : [];
  for (const link of links) {
    if (!link || link.rel !== "next" || !link.href) continue;
    let next;
    try {
      next = new URL(link.href);
    } catch (e) {
      continue;
    }
    const parsed = toPositiveInt(next.searchParams.get("start-index"), 0, 1000000);
    if (parsed > 0) return parsed;
  }
  return toPositiveInt(fallback, 0, 1000000);
};

const fetchFeedCards = async (requestUrl, neededCount, seenKeys) => {
  const needed = toPositiveInt(neededCount, BLOG_LISTING_MIN_POSTCARDS, BLOG_LISTING_FEED_MAX_RESULTS);
  if (needed <= 0) return { cards: [], nextUrl: "" };
  const seen = seenKeys || new Set();
  const query = buildListingFeedQuery(requestUrl, needed);
  let nextStartIndex = query.startIndex;
  const cards = [];
  let fallbackNextUrl = "";
  let pages = 0;

  while (cards.length < needed && pages < BLOG_LISTING_FEED_MAX_PAGES) {
    pages += 1;
    const { url: feedUrl } = buildListingFeedUrl(requestUrl, needed, nextStartIndex);
    let feedRes;
    try {
      feedRes = await fetch(feedUrl, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
    } catch (e) {
      break;
    }
    if (!feedRes || !feedRes.ok) break;

    let json;
    try {
      json = await feedRes.json();
    } catch (e) {
      break;
    }
    const feed = json && json.feed ? json.feed : null;
    const entries = Array.isArray(feed && feed.entry) ? feed.entry : [];
    fallbackNextUrl = mapFeedNextToSearchUrl(feed, requestUrl, query.maxResults) || "";

    let addedThisPage = 0;
    for (const entry of entries) {
      const card = buildFeedPostCard(entry, requestUrl);
      if (!card || !card.html) continue;
      if (seen.has(card.key)) continue;
      seen.add(card.key);
      cards.push(card);
      addedThisPage += 1;
      if (cards.length >= needed) break;
    }
    if (cards.length >= needed) break;

    const nextFromFeed = parseFeedNextStartIndex(feed, 0);
    if (!nextFromFeed || nextFromFeed <= nextStartIndex) {
      break;
    }
    if (entries.length === 0 && addedThisPage === 0) {
      break;
    }
    nextStartIndex = nextFromFeed;
  }

  const nextUrl = fallbackNextUrl;
  return {
    cards,
    nextUrl,
  };
};

const buildLoadMoreWrapHtml = (nextUrl) => {
  const normalized = cleanText(nextUrl);
  if (!normalized) return "";
  const safeNext = escapeHtml(normalized);
  return [
    "<div class='gg-loadmore-wrap' data-gg-module='loadmore'>",
    `<button class='gg-loadmore' data-next='${safeNext}' id='loadmore' type='button'>`,
    "<span class='gg-loadmore__label'>Load More Articles</span>",
    "<span aria-hidden='true' class='gg-loadmore__spinner'></span>",
    "</button>",
    "</div>",
  ].join("");
};

const patchLoadMoreNextUrl = (html, nextUrl) => {
  const source = String(html || "");
  const normalized = cleanText(nextUrl);
  if (!source || !normalized) return source;
  const buttonRe = /<button\b[^>]*\bclass\s*=\s*(['"])[^'"]*\bgg-loadmore\b[^'"]*\1[^>]*>/i;
  const match = buttonRe.exec(source);
  if (!match) return source;
  const tag = match[0];
  const safeNext = escapeHtml(normalized);
  let patched = tag;
  if (/\bdata-next\s*=/.test(tag)) {
    patched = tag.replace(/\bdata-next\s*=\s*(['"])[^'"]*\1/i, `data-next='${safeNext}'`);
  } else {
    patched = tag.replace(/>$/, ` data-next='${safeNext}'>`);
  }
  return `${source.slice(0, match.index)}${patched}${source.slice(match.index + tag.length)}`;
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

const findElementByIdRange = (html, tagName, id) => {
  const source = String(html || "");
  if (!source) return null;
  const name = String(tagName || "").trim();
  const wantedId = String(id || "").trim();
  if (!name || !wantedId) return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedId = wantedId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const openRe = new RegExp(
    `<${escapedName}\\b[^>]*\\bid\\s*=\\s*(['"])${escapedId}\\1[^>]*>`,
    "i"
  );
  const openMatch = openRe.exec(source);
  if (!openMatch) return null;

  const openStart = openMatch.index;
  const openEnd = openStart + openMatch[0].length;
  const tokenRe = new RegExp(`<\\/?${escapedName}\\b[^>]*>`, "gi");
  tokenRe.lastIndex = openEnd;
  let depth = 1;
  let closeStart = -1;
  let closeEnd = -1;
  let token;

  while ((token = tokenRe.exec(source))) {
    const tag = token[0];
    const isClose = /^<\//.test(tag);
    const selfClose = /\/>\s*$/.test(tag);
    if (isClose) depth -= 1;
    else if (!selfClose) depth += 1;
    if (depth === 0) {
      closeStart = token.index;
      closeEnd = tokenRe.lastIndex;
      break;
    }
  }

  if (closeStart < 0 || closeEnd < 0) return null;
  return {
    openStart,
    openEnd,
    closeStart,
    closeEnd,
    innerStart: openEnd,
    innerEnd: closeStart,
    openTag: openMatch[0],
    innerHtml: source.slice(openEnd, closeStart),
  };
};

const findElementRangeFromOpenTag = (source, tagName, openStart, openTag) => {
  const html = String(source || "");
  const name = String(tagName || "").trim().toLowerCase();
  const tag = String(openTag || "");
  if (!html || !name || !tag) return null;
  const openEnd = openStart + tag.length;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tokenRe = new RegExp(`<\\/?${escapedName}\\b[^>]*>`, "gi");
  tokenRe.lastIndex = openEnd;
  let depth = 1;
  let closeStart = -1;
  let closeEnd = -1;
  let token;
  while ((token = tokenRe.exec(html))) {
    const tokenTag = token[0];
    const isClose = /^<\//.test(tokenTag);
    const selfClose = /\/>\s*$/.test(tokenTag);
    if (isClose) depth -= 1;
    else if (!selfClose) depth += 1;
    if (depth === 0) {
      closeStart = token.index;
      closeEnd = tokenRe.lastIndex;
      break;
    }
  }
  if (closeStart < 0 || closeEnd < 0) return null;
  return {
    openStart,
    openEnd,
    closeStart,
    closeEnd,
    innerStart: openEnd,
    innerEnd: closeStart,
    openTag: tag,
    innerHtml: html.slice(openEnd, closeStart),
  };
};

const classListHasToken = (className, token) => {
  if (!className || !token) return false;
  const wanted = String(token || "").trim();
  if (!wanted) return false;
  return String(className || "")
    .split(/\s+/)
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .includes(wanted);
};

const findElementByClassRange = (html, classToken, opts = {}) => {
  const source = String(html || "");
  if (!source) return null;
  const wanted = String(classToken || "").trim();
  if (!wanted) return null;
  const requiredClassTokens = Array.isArray(opts.requiredClassTokens)
    ? opts.requiredClassTokens.map((token) => String(token || "").trim()).filter(Boolean)
    : [];
  const openRe =
    /<([a-z0-9:-]+)\b[^>]*\bclass\s*=\s*(?:(['"])([^'"]*)\2|([^\s"'=<>`]+))[^>]*>/gi;
  let match;
  while ((match = openRe.exec(source))) {
    const tagName = String(match[1] || "").trim().toLowerCase();
    const className = String(match[3] || match[4] || "");
    if (!classListHasToken(className, wanted)) continue;
    let allRequired = true;
    for (const token of requiredClassTokens) {
      if (!classListHasToken(className, token)) {
        allRequired = false;
        break;
      }
    }
    if (!allRequired) continue;
    const openTag = match[0];
    const openStart = match.index;
    const range = findElementRangeFromOpenTag(source, tagName, openStart, openTag);
    if (range) return range;
  }
  return null;
};

const decodeHtmlEntities = (input) => {
  return String(input || "").replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (m, code) => {
      const token = String(code || "").toLowerCase();
      if (token === "amp") return "&";
      if (token === "lt") return "<";
      if (token === "gt") return ">";
      if (token === "quot") return '"';
      if (token === "apos") return "'";
      if (token === "nbsp") return " ";
      if (token.startsWith("#x")) {
        const cp = Number.parseInt(token.slice(2), 16);
        if (Number.isFinite(cp) && cp > 0) return String.fromCodePoint(cp);
        return m;
      }
      if (token.startsWith("#")) {
        const cp = Number.parseInt(token.slice(1), 10);
        if (Number.isFinite(cp) && cp > 0) return String.fromCodePoint(cp);
      }
      return m;
    }
  );
};

const stripHtmlTags = (html) => {
  return String(html || "").replace(/<[^>]*>/g, " ");
};

const slugifyHeadingId = (raw) => {
  const source = decodeHtmlEntities(stripHtmlTags(raw))
    .toLowerCase()
    .trim();
  if (!source) return "section";
  let normalized = source;
  try {
    normalized = source.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  } catch (e) {
    normalized = source;
  }
  const slug = normalized
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
};

const collectIdSetFromHtml = (html) => {
  const set = new Set();
  const source = String(html || "");
  const idRe = /\bid\s*=\s*(?:(['"])([^'"]+)\1|([^\s"'=<>`]+))/gi;
  let match;
  while ((match = idRe.exec(source))) {
    const id = String(match[2] || match[3] || "").trim();
    if (!id) continue;
    set.add(id);
  }
  return set;
};

const collectBlockedRanges = (html) => {
  const source = String(html || "");
  const ranges = [];
  const patterns = [
    /<pre\b[\s\S]*?<\/pre>/gi,
    /<code\b[\s\S]*?<\/code>/gi,
    /<script\b[\s\S]*?<\/script>/gi,
    /<style\b[\s\S]*?<\/style>/gi,
    /<template\b[\s\S]*?<\/template>/gi,
    /<([a-z0-9:-]+)\b[^>]*\bhidden\b[^>]*>[\s\S]*?<\/\1>/gi,
    /<([a-z0-9:-]+)\b[^>]*\baria-hidden\s*=\s*(['"])true\2[^>]*>[\s\S]*?<\/\1>/gi,
  ];
  for (const re of patterns) {
    let match;
    while ((match = re.exec(source))) {
      ranges.push([match.index, re.lastIndex]);
      if (!match[0]) break;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  return ranges;
};

const isIndexInsideRanges = (index, ranges) => {
  const point = Number(index);
  if (!Number.isFinite(point) || point < 0) return false;
  const list = Array.isArray(ranges) ? ranges : [];
  for (const range of list) {
    const start = Array.isArray(range) ? Number(range[0]) : -1;
    const end = Array.isArray(range) ? Number(range[1]) : -1;
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (point >= start && point < end) return true;
  }
  return false;
};

const extractIdFromAttrs = (attrs) => {
  const source = String(attrs || "");
  const match = source.match(/\bid\s*=\s*(?:(['"])([^'"]*)\1|([^\s"'=<>`]+))/i);
  return match ? String(match[2] || match[3] || "").trim() : "";
};

const createUniqueHeadingId = (text, usedIds, slugCounts) => {
  const base = slugifyHeadingId(text);
  const ids = usedIds || new Set();
  const counts = slugCounts || new Map();
  let n = Number(counts.get(base) || 0);
  let id = "";
  do {
    n += 1;
    id = n === 1 ? base : `${base}-${n}`;
  } while (ids.has(id));
  counts.set(base, n);
  ids.add(id);
  return id;
};

const buildTocFromPostBodyHtml = (bodyHtml, usedIds) => {
  const source = String(bodyHtml || "");
  const headingRe = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const blocked = collectBlockedRanges(source);
  const ids = usedIds || new Set();
  const slugCounts = new Map();
  const items = [];
  let out = "";
  let last = 0;
  let match;
  while ((match = headingRe.exec(source))) {
    const start = match.index;
    const end = headingRe.lastIndex;
    const level = Number.parseInt(String(match[1] || ""), 10) || 1;
    const attrs = String(match[2] || "");
    const inner = String(match[3] || "");
    const full = String(match[0] || "");
    out += source.slice(last, start);
    let replacement = full;
    if (!isIndexInsideRanges(start, blocked)) {
      const isHiddenHeading =
        /\bhidden\b/i.test(attrs) || /\baria-hidden\s*=\s*(['"])true\1/i.test(attrs);
      const text = decodeHtmlEntities(stripHtmlTags(inner)).replace(/\s+/g, " ").trim();
      if (!isHiddenHeading && text) {
        let id = extractIdFromAttrs(attrs);
        if (!id) {
          id = createUniqueHeadingId(text, ids, slugCounts);
          replacement = `<h${level}${attrs} id="${escapeHtml(id)}">${inner}</h${level}>`;
        } else {
          ids.add(id);
        }
        items.push({
          id,
          text,
          level,
        });
      }
    }
    out += replacement;
    last = end;
  }
  out += source.slice(last);
  return { html: out, items };
};

const buildPostTocListHtml = (items) => {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return "";
  const cap = rows.slice(0, 12);
  return cap
    .map((item, index) => {
      const id = String((item && item.id) || "").trim();
      const text = String((item && item.text) || "").trim();
      let level = Number.parseInt(String((item && item.level) || ""), 10);
      if (!Number.isFinite(level) || level < 1) level = 1;
      if (level > 4) level = 4;
      if (!id || !text) return "";
      return [
        `<li class="gg-toc__item gg-toc__lvl-${level}">`,
        `<a class="gg-toc__link" href="#${escapeHtml(id)}">`,
        `<span class="gg-toc__num">${index + 1}.</span>`,
        `<span class="gg-toc__txt">${escapeHtml(text)}</span>`,
        "</a>",
        "</li>",
      ].join("");
    })
    .join("");
};

const buildInfoPanelTocListHtml = (items) => {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return "";
  const cap = rows.slice(0, 12);
  return cap
    .map((item, index) => {
      const id = String((item && item.id) || "").trim();
      const text = String((item && item.text) || "").trim();
      let level = Number.parseInt(String((item && item.level) || ""), 10);
      const number = index + 1;
      const numberText = number < 10 ? `0${number}` : String(number);
      if (!Number.isFinite(level) || level < 1) level = 1;
      if (level > 4) level = 4;
      if (!id || !text) return "";
      return [
        `<li class="gg-info-panel__tocitem gg-info-panel__toclvl-${level}">`,
        `<a class="gg-info-panel__toclink" href="#${escapeHtml(id)}">`,
        `<span class="gg-info-panel__tocnum">${numberText}</span>`,
        `<span class="gg-info-panel__toctext">${escapeHtml(text)}</span>`,
        "</a>",
        "</li>",
      ].join("");
    })
    .join("");
};

const cleanPostTocHtml = (html) => {
  const source = String(html || "");
  if (!source) return source;
  if (!/id\s*=\s*(['"])gg-toc\1/i.test(source)) return source;
  const bodyRange =
    findElementByClassRange(source, "post-body", {
      requiredClassTokens: ["post-body", "entry-content"],
    }) || findElementByClassRange(source, "post-body");
  if (!bodyRange) {
    return source.replace(/No content found/gi, "");
  }
  const usedIds = collectIdSetFromHtml(source);
  const toc = buildTocFromPostBodyHtml(bodyRange.innerHtml, usedIds);
  let out = `${source.slice(0, bodyRange.innerStart)}${toc.html}${source.slice(bodyRange.innerEnd)}`;
  const listRange = findElementByClassRange(out, "gg-toc__list");
  if (listRange) {
    const listHtml = buildPostTocListHtml(toc.items);
    out = `${out.slice(0, listRange.innerStart)}${listHtml}${out.slice(listRange.innerEnd)}`;
  }
  const infoListRange = findElementByClassRange(out, "gg-info-panel__toclist");
  if (infoListRange) {
    // Final IA contract: post/page TOC lives on left Information panel only.
    // Keep right Editorial Preview TOC for listing/blog runtime, not post/page HTML rewrite.
    out = `${out.slice(0, infoListRange.innerStart)}${out.slice(infoListRange.innerEnd)}`;
  }
  return out.replace(/No content found/gi, "");
};

const normalizeCardKey = (cardHtml, fallback) => {
  const id = extractAttrValue(cardHtml, "data-id");
  if (id) return `id:${id}`;
  const dataUrl = extractAttrValue(cardHtml, "data-url");
  if (dataUrl) return `data-url:${dataUrl}`;
  const hrefMatch = String(cardHtml || "").match(/<a\b[^>]*\bhref\s*=\s*(['"])([^'"]+)\1/i);
  if (hrefMatch && hrefMatch[2]) return `href:${hrefMatch[2]}`;
  return `idx:${fallback}`;
};

const extractPostCards = (fragment) => {
  const out = [];
  const re =
    /<article\b[^>]*\bclass\s*=\s*(['"])[^'"]*\bgg-post-card\b[^'"]*\1[^>]*>[\s\S]*?<\/article>/gi;
  let match;
  while ((match = re.exec(String(fragment || "")))) {
    const cardHtml = match[0];
    out.push({
      key: normalizeCardKey(cardHtml, match.index),
      html: cardHtml,
    });
  }
  return out;
};

const normalizeListingNextUrl = (rawUrl, baseUrl) => {
  if (!rawUrl || !baseUrl) return "";
  try {
    const base = new URL(baseUrl);
    const next = new URL(String(rawUrl), base.href);
    if (next.origin !== base.origin) {
      return new URL(`${next.pathname}${next.search}${next.hash}`, base.origin).toString();
    }
    return next.toString();
  } catch (e) {
    return "";
  }
};

const hasClassToken = (className, token) => {
  if (!className || !token) return false;
  return String(className)
    .split(/\s+/)
    .some((part) => String(part || "").trim() === token);
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

const extractListingNextUrl = (html, baseUrl) => {
  const buttonRe = /<button\b[^>]*\bclass\s*=\s*(['"])[^'"]*\bgg-loadmore\b[^'"]*\1[^>]*>/gi;
  let match;
  while ((match = buttonRe.exec(String(html || "")))) {
    const tag = match[0];
    const dataNext = extractAttrValue(tag, "data-next");
    if (!dataNext) continue;
    const normalized = normalizeListingNextUrl(dataNext, baseUrl);
    if (normalized) return normalized;
  }

  const anchorRe = /<a\b[^>]*>/gi;
  while ((match = anchorRe.exec(String(html || "")))) {
    const tag = match[0];
    const className = extractAttrValue(tag, "class");
    const id = extractAttrValue(tag, "id");
    const isOlderPager =
      hasClassToken(className, "blog-pager-older-link") ||
      /blog-pager-older-link/i.test(String(id || ""));
    if (!isOlderPager) continue;
    const href = extractAttrValue(tag, "href");
    if (!href) continue;
    const normalized = normalizeListingNextUrl(href, baseUrl);
    if (normalized) return normalized;
  }
  return "";
};

const collectBackfillPostCards = async (seedHtml, seedUrl, seenKeys, neededCount) => {
  const out = [];
  const seen = seenKeys || new Set();
  const visited = new Set();
  let hops = 0;
  let nextUrl = extractListingNextUrl(seedHtml, seedUrl);

  while (nextUrl && out.length < neededCount && hops < BLOG_LISTING_BACKFILL_HOPS) {
    if (visited.has(nextUrl)) break;
    visited.add(nextUrl);

    let nextRes;
    try {
      nextRes = await fetch(nextUrl, {
        headers: {
          Accept: "text/html",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
    } catch (e) {
      break;
    }
    if (!nextRes || !nextRes.ok) break;

    const contentType = (nextRes.headers.get("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("text/html")) break;

    let nextHtml = "";
    try {
      nextHtml = await nextRes.text();
    } catch (e) {
      break;
    }

    const range = findElementByIdRange(nextHtml, "div", "postcards");
    if (range) {
      const cards = extractPostCards(range.innerHtml);
      for (const card of cards) {
        if (!card || !card.html) continue;
        if (seen.has(card.key)) continue;
        seen.add(card.key);
        out.push(card);
        if (out.length >= neededCount) break;
      }
    }

    nextUrl = extractListingNextUrl(nextHtml, nextUrl);
    hops += 1;
  }

  return out;
};

const ensureBlogListingPostcards = async (response, requestUrl, opts = {}) => {
  const options = opts || {};
  const targetCount = toPositiveInt(
    options.targetCount,
    BLOG_LISTING_MIN_POSTCARDS,
    BLOG_LISTING_FEED_MAX_RESULTS
  );
  const allowCreateContainer = options.allowCreateContainer === true;
  const useHtmlBackfill = options.useHtmlBackfill !== false;
  let html = "";
  try {
    html = await response.text();
  } catch (e) {
    return response;
  }
  if (!html) {
    return responseFromHtml(response, html);
  }

  const range = findElementByIdRange(html, "div", "postcards");
  if (!range) {
    if (!allowCreateContainer) {
      return responseFromHtml(response, html);
    }
    const feedFill = await fetchFeedCards(requestUrl, targetCount, new Set());
    if (!feedFill.cards.length) {
      return responseFromHtml(response, html);
    }
    const cardsHtml = feedFill.cards.map((card) => card.html).join("");
    const listingHtml = `<div class='gg-stack' id='postcards'>${cardsHtml}</div>${buildLoadMoreWrapHtml(
      feedFill.nextUrl
    )}`;
    const blogRange = findElementByIdRange(html, "div", "blog");
    if (blogRange) {
      html = `${html.slice(0, blogRange.innerStart)}${listingHtml}${html.slice(blogRange.innerStart)}`;
    } else {
      const mainRange = findElementByIdRange(html, "main", "gg-main");
      if (mainRange) {
        html = `${html.slice(0, mainRange.innerStart)}${listingHtml}${html.slice(mainRange.innerStart)}`;
      } else {
        html = `${listingHtml}${html}`;
      }
    }
    const out = responseFromHtml(response, html);
    out.headers.set("x-gg-ssr-postcards", String(feedFill.cards.length));
    out.headers.set("x-gg-ssr-backfill", String(feedFill.cards.length));
    if (feedFill.nextUrl) {
      out.headers.set("x-gg-ssr-next", feedFill.nextUrl);
    }
    return out;
  }

  const existing = extractPostCards(range.innerHtml);
  if (existing.length >= targetCount) {
    const out = responseFromHtml(response, html);
    out.headers.set("x-gg-ssr-postcards", String(existing.length));
    return out;
  }

  const seen = new Set(existing.map((card) => card.key));
  const extras = [];
  let loadMoreNext = "";
  if (useHtmlBackfill) {
    const htmlNeeded = targetCount - existing.length;
    const htmlExtras = await collectBackfillPostCards(html, requestUrl, seen, htmlNeeded);
    for (const extra of htmlExtras) {
      if (!extra || !extra.html) continue;
      extras.push(extra);
    }
  }

  const remaining = targetCount - (existing.length + extras.length);
  if (remaining > 0) {
    const feedFill = await fetchFeedCards(requestUrl, remaining, seen);
    if (feedFill.cards.length) {
      extras.push(...feedFill.cards);
    }
    if (feedFill.nextUrl) {
      loadMoreNext = feedFill.nextUrl;
    }
  }

  if (extras.length > 0) {
    const extraHtml = extras.map((card) => card.html).join("");
    html = `${html.slice(0, range.innerEnd)}${extraHtml}${html.slice(range.innerEnd)}`;
  }
  if (loadMoreNext) {
    html = patchLoadMoreNextUrl(html, loadMoreNext);
  }

  const out = responseFromHtml(response, html);
  out.headers.set("x-gg-ssr-postcards", String(existing.length + extras.length));
  if (extras.length > 0) {
    out.headers.set("x-gg-ssr-backfill", String(extras.length));
  }
  if (loadMoreNext) {
    out.headers.set("x-gg-ssr-next", loadMoreNext);
  }
  return out;
};

const shouldFallbackListingPagination = (url) => {
  if (!url) return false;
  if (url.pathname !== "/search") return false;
  return (
    url.searchParams.has("updated-max") ||
    url.searchParams.has("start-index") ||
    url.searchParams.has("max-results")
  );
};

const listingTargetCountFromUrl = (url, fallback = BLOG_LISTING_MIN_POSTCARDS) => {
  if (!url) return fallback;
  return toPositiveInt(url.searchParams.get("max-results"), fallback, BLOG_LISTING_FEED_MAX_RESULTS);
};

const shouldSkipListingFallback = (html) => {
  const source = String(html || "");
  if (!source) return true;
  return !/id\s*=\s*['"]blog['"]/i.test(source);
};

const isBypassEnhancementPath = (pathname) => {
  const path = String(pathname || "");
  if (!path) return false;
  return /\.txt$/i.test(path) || path.startsWith("/.well-known/");
};

const isPostLikePath = (pathname) => {
  const path = String(pathname || "");
  if (!path) return false;
  if (/^\/20\d{2}\/\d{2}\/[^/?#]+\.html$/i.test(path)) return true;
  if (/^\/p\/[^/?#]+\.html$/i.test(path)) return true;
  return false;
};

const SPECIAL_APP_PATHS = new Set(["/p/inohong.html"]);

const normalizePathname = (pathname) => {
  const path = String(pathname || "").trim().toLowerCase();
  if (!path) return "";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
};

const isSpecialAppPath = (pathname) => {
  const normalized = normalizePathname(pathname);
  return !!normalized && SPECIAL_APP_PATHS.has(normalized);
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

const ensureListingResponse = async (response, requestUrl, opts = {}) => {
  let html = "";
  try {
    html = await response.clone().text();
  } catch (e) {
    return ensureBlogListingPostcards(response, requestUrl, opts);
  }
  if (shouldSkipListingFallback(html)) {
    return responseFromHtml(response, html);
  }
  return ensureBlogListingPostcards(response, requestUrl, opts);
};

const POST_DETAIL_FALLBACK_MAX_RESULTS = 150;

const normalizePathKey = (rawPath) => {
  const value = String(rawPath || "").trim();
  if (!value) return "";
  const noQuery = value.split("?")[0].split("#")[0];
  if (!noQuery) return "/";
  const normalized = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  const trimmed = normalized.replace(/\/+$/, "");
  return trimmed || "/";
};

const entryPathname = (entry) => {
  const alt = pickFeedAlternateUrl(entry);
  if (!alt) return "";
  try {
    const parsed = new URL(alt);
    return normalizePathKey(parsed.pathname);
  } catch (e) {
    return normalizePathKey(alt);
  }
};

const findFeedEntryByPath = (feed, pathname) => {
  const targetPath = normalizePathKey(pathname);
  if (!targetPath) return null;
  const entries = Array.isArray(feed && feed.entry) ? feed.entry : [];
  for (const entry of entries) {
    if (!entry) continue;
    if (entryPathname(entry) === targetPath) {
      return entry;
    }
  }
  return null;
};

const fetchFeedEntryByPath = async (requestUrl, pathname) => {
  const targetPath = normalizePathKey(pathname);
  if (!targetPath) return null;
  let req;
  try {
    req = new URL(requestUrl);
  } catch (e) {
    return null;
  }
  const lookups = targetPath.startsWith("/p/")
    ? [
        { feedPath: "/feeds/pages/default", isPageFeed: true },
        { feedPath: "/feeds/posts/default", isPageFeed: false },
      ]
    : [
        { feedPath: "/feeds/posts/default", isPageFeed: false },
        { feedPath: "/feeds/pages/default", isPageFeed: true },
      ];
  for (const lookup of lookups) {
    const feedUrl = new URL(lookup.feedPath, req.origin);
    feedUrl.searchParams.set("alt", "json");
    feedUrl.searchParams.set("max-results", String(POST_DETAIL_FALLBACK_MAX_RESULTS));
    let feedRes;
    try {
      feedRes = await fetch(feedUrl.toString(), {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
    } catch (e) {
      continue;
    }
    if (!feedRes || !feedRes.ok) continue;
    let json;
    try {
      json = await feedRes.json();
    } catch (e) {
      continue;
    }
    const feed = json && json.feed ? json.feed : null;
    const match = findFeedEntryByPath(feed, targetPath);
    if (match) {
      return { entry: match, isPageFeed: lookup.isPageFeed };
    }
  }
  return null;
};

const buildFallbackPostToolbarHtml = (safeComments, hasCommentBadge) => {
  return [
    "<div class='gg-post__toolbar' data-gg-module='post-toolbar'>",
    "<div class='gg-post__toolbar-group'>",
    "<button aria-label='Back to blog' class='gg-post__tool' data-gg-copy-aria='post.action.back' data-gg-postbar='back' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>arrow_back_ios_new</span>",
    "</button>",
    "</div>",
    "<div class='gg-post__toolbar-group'>",
    "<button aria-expanded='false' aria-label='Information' class='gg-post__tool' data-gg-copy-aria='post.action.info' data-gg-postbar='info' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>info</span>",
    "</button>",
    "<button aria-label='Focus mode' aria-pressed='false' class='gg-post__tool' data-gg-copy-aria='post.action.focus' data-gg-postbar='focus' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>center_focus_strong</span>",
    "</button>",
    "<button aria-label='Save to library' class='gg-post__tool gg-post__action--bookmark' data-gg-copy-aria='post.action.save' data-gg-postbar='save' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>bookmark_add</span>",
    "</button>",
    "<button aria-controls='ggPanelComments' aria-expanded='false' aria-label='Toggle comments panel' class='gg-post__tool' data-gg-copy-aria='post.action.toggleComments' data-gg-postbar='comments' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>forum</span>",
    hasCommentBadge
      ? `<span aria-hidden='true' class='gg-post__tool-badge'>${safeComments}</span>`
      : "",
    "</button>",
    "<button aria-label='Share' class='gg-post__tool gg-post__action--share' data-gg-copy-aria='post.action.share' data-gg-postbar='share' type='button'>",
    "<span aria-hidden='true' class='gg-icon material-symbols-rounded'>ios_share</span>",
    "</button>",
    "</div>",
    "</div>",
  ].join("");
};

const buildFallbackCommentsPanelHtml = (safeComments, commentsCount, options = {}) => {
  const opt = options || {};
  const heading = commentsCount === 1 ? "1 Comment" : `${safeComments} Comments`;
  const message =
    commentsCount > 0
      ? "Comments are temporarily unavailable in fallback mode."
      : "No comments yet.";
  const formSrc = cleanText(opt.commentFormIframeSrc);
  const allowNewComments = opt.allowNewComments !== false && !!formSrc;
  const relayPath = cleanText(opt.appRpcRelayPath) || "https://www.blogger.com/rpc_relay.html";
  const relayLiteral = JSON.stringify(relayPath);
  const noNewCommentsText = escapeHtml(cleanText(opt.noNewCommentsText) || "Comments are closed.");
  const safeFormSrc = escapeHtml(formSrc);
  return [
    "<div class='gg-comments-panel' data-gg-panel='comments' hidden='' id='ggPanelComments' inert='' tabindex='-1'>",
    "<div class='gg-comments-panel__body' data-gg-slot='comments'>",
    `<section class='gg-comments comments2 threaded' data-gg-comment-contract='single-visible-owner' data-gg-visible-owner='enhanced-footer' data-num-comments='${safeComments}' id='comments'>`,
    "<a name='comments'></a>",
    "<div aria-hidden='true' class='gg-comments__head-spacer'></div>",
    "<header class='gg-comments__head'>",
    "<div class='gg-comments__title'>",
    "<span aria-hidden='true' class='ms'>comment</span>",
    `<h3 class='gg-comments__h'>${heading}</h3>`,
    "</div>",
    "<div class='gg-comments__sortslot' data-gg-comments-sort-slot='1'></div>",
    "</header>",
    "<div class='gg-comments__content comments-content'>",
    "<div class='gg-comments__list' data-gg-owner='enhanced-thread' id='cmt2-holder'>",
    "<div class='gg-cmt-empty'>",
    "<strong data-gg-copy='comments.empty.title'>Comments</strong>",
    `<span>${escapeHtml(message)}</span>`,
    "</div>",
    "</div>",
    "</div>",
    "<div aria-hidden='true' class='gg-comments__footer-spacer'></div>",
    `<div class='gg-comments__footer' data-gg-add-owner='footer-cta' data-gg-composer-owner='footer' data-gg-open='0' data-gg-has-cta='${allowNewComments ? "1" : "0"}'>`,
    "<div class='gg-comments__footer-inner'>",
    allowNewComments
      ? "<div class='gg-comments__footer-cta' id='gg-top-continue'><a aria-expanded='false' class='comment-reply' data-gg-copy='comments.action.add' data-gg-footer-cta='1' href='javascript:;' rel='nofollow'>Add comment</a></div>"
      : "",
    "<div class='gg-comments__footer-main'>",
    allowNewComments ? "" : `<div class='gg-comments__footer-note'>${noNewCommentsText}</div>`,
    "<div class='gg-comments__addslot' data-gg-reply-owner='footer' id='gg-addslot'></div>",
    "<div class='gg-comments__composerslot' data-gg-composer-slot='1' data-gg-owner='enhanced-footer' id='gg-composer-slot'>",
    allowNewComments
      ? `<div class='comment-form' data-gg-native-plumbing='composer' data-gg-owner='native-hidden' id='top-ce'><a name='comment-form'></a><a href='${safeFormSrc}' id='comment-editor-src' rel='noopener noreferrer' title='Comment Form Link'></a><iframe allowtransparency='allowtransparency' class='blogger-iframe-colorize blogger-comment-from-post' frameborder='0' height='90px' id='comment-editor' name='comment-editor' src='${safeFormSrc}' width='100%'></iframe><script type='text/javascript'>(function(){var relay=${relayLiteral};var done=false;var tries=0;function init(){if(done)return;if(typeof BLOG_CMT_createIframe==='function'){done=true;BLOG_CMT_createIframe(relay);}}init();var timer=setInterval(function(){tries+=1;init();if(done||tries&gt;=20){clearInterval(timer);}},200);})();</script></div>`
      : "",
    "</div>",
    "</div>",
    "</div>",
    "</div>",
    "</section>",
    "</div>",
    "</div>",
  ].join("");
};

const buildFallbackPostDetailHtml = (entry, requestUrl, options = {}) => {
  if (!entry) return "";
  const opt = options || {};
  const title = cleanText(entry && entry.title && entry.title.$t) || "Untitled";
  const postId = extractFeedPostId(entry);
  const postUrl = pickFeedAlternateUrl(entry) || String(requestUrl || "");
  const contentHtml = String(
    (entry && entry.content && entry.content.$t) ||
      (entry && entry.summary && entry.summary.$t) ||
      ""
  );
  const publishedIso = cleanText(entry && entry.published && entry.published.$t);
  const updatedIso = cleanText(entry && entry.updated && entry.updated.$t) || publishedIso;
  const publishedText = formatIsoDate(publishedIso || updatedIso);
  const commentsRaw = cleanText(entry && entry["thr$total"] && entry["thr$total"].$t) || "0";
  const commentsCount = toPositiveInt(commentsRaw, 0, 1000000);
  const commentsText = String(commentsCount);
  const author = pickFeedAuthor(entry);
  const authorName = cleanText(author.name) || "PakRPP";
  const categories = Array.isArray(entry && entry.category) ? entry.category : [];
  const labels = categories
    .map((item) => cleanText(item && item.term))
    .filter(Boolean);
  const labelsHtml = labels.length
    ? `<div class='gg-post__labels gg-visually-hidden'>${labels
        .map((name) => {
          const text = escapeHtml(name);
          const href = escapeHtml(buildFeedLabelUrl(name, postUrl));
          return `<a class='gg-post__label-link' href='${href || "#"}' rel='tag'>${text}</a>`;
        })
        .join("")}</div>`
    : "";
  const words = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
  const readMin = words ? `${Math.max(1, Math.ceil(words / 200))} min read` : "";
  const safeTitle = escapeHtml(title);
  const safePostId = escapeHtml(postId || "fallback");
  const safePostUrl = escapeHtml(postUrl || String(requestUrl || ""));
  const safeAuthor = escapeHtml(authorName);
  const safeDateText = escapeHtml(publishedText);
  const safeUpdated = escapeHtml(updatedIso || publishedIso || "");
  const safeComments = escapeHtml(commentsText);
  const safeReadMin = escapeHtml(readMin);
  const surface = opt.isPage ? "page" : "post";
  const hasCommentBadge = commentsCount > 0;
  const hasRepliesHtml = !!pickFeedRepliesLink(entry, "text/html");
  const commentFormIframeSrc = hasRepliesHtml
    ? buildFallbackCommentFormIframeSrc(entry, requestUrl, {
        blogId: extractFeedBlogId(entry),
        postId,
        isPage: opt.isPage,
      })
    : "";
  const toolbarHtml = buildFallbackPostToolbarHtml(safeComments, hasCommentBadge);
  const commentsPanelHtml = buildFallbackCommentsPanelHtml(safeComments, commentsCount, {
    allowNewComments: hasRepliesHtml,
    commentFormIframeSrc,
    appRpcRelayPath: "https://www.blogger.com/rpc_relay.html",
    noNewCommentsText: "Comments are closed.",
  });
  return [
    `<article class='gg-post' data-gg-module='post-detail' data-gg-surface='${surface}' data-author='${safeAuthor}' data-comments='${safeComments}' data-date='${safeDateText}' data-id='${safePostId}' data-title='${safeTitle}' data-url='${safePostUrl}'>`,
    toolbarHtml,
    "<header class='gg-post__header'>",
    `<h1 class='gg-post__title' data-gg-marker='panel-post-title'>${safeTitle}</h1>`,
    "</header>",
    `<div class='gg-postmeta gg-visually-hidden' data-contributors='' data-read-min='${safeReadMin}' data-tags='' data-author='${safeAuthor}' data-updated='${safeUpdated}'></div>`,
    labelsHtml,
    "<div class='gg-post__body'>",
    `<section class='gg-post__content post-body entry-content' data-gg-module='post-content' id='post-body-${safePostId}'>`,
    contentHtml,
    "</section>",
    "<div class='gg-post__footer'>",
    "<div aria-label='Tags' class='gg-post__footer-tags' data-gg-slot='footer-tags' hidden='true'></div>",
    "</div>",
    "<div aria-hidden='true' class='gg-post__comments-anchor' data-gg-comments-owner='panel' hidden='hidden'></div>",
    "</div>",
    "</article>",
    commentsPanelHtml,
  ].join("");
};

const buildFallbackSpecialSurfaceHtml = (entry, options = {}) => {
  const opt = options || {};
  const contentHtml = String(
    (entry && entry.content && entry.content.$t) ||
      (entry && entry.summary && entry.summary.$t) ||
      ""
  );
  if (!contentHtml) return "";
  if (!opt.isSpecialApp) {
    return contentHtml;
  }
  const title = cleanText(entry && entry.title && entry.title.$t) || "Special App";
  const postId = extractFeedPostId(entry) || "fallback";
  const specialKey = cleanText(opt.specialKey);
  const attrs = [
    "class='gg-special-app-page'",
    "data-gg-module='special-app-page'",
    "data-gg-special-app='1'",
    "data-gg-surface='special'",
    `data-id='${escapeHtml(postId)}'`,
    `data-title='${escapeHtml(title)}'`,
  ];
  if (specialKey) {
    attrs.push(`data-gg-special-key='${escapeHtml(specialKey)}'`);
  }
  return [
    `<article ${attrs.join(" ")}>`,
    "<div class='gg-special-app-body'>",
    contentHtml,
    "</div>",
    "</article>",
  ].join("");
};

const ensurePostDetailFallbackHtml = async (html, requestUrl, pathname) => {
  const source = String(html || "");
  if (!source) return source;
  const specialAppMatch = source.match(/data-gg-special-app\s*=\s*['"]([^'"]+)['"]/i);
  const specialMatch = source.match(/data-gg-special\s*=\s*['"]([^'"]+)['"]/i);
  const specialAppKey = cleanText(specialAppMatch && specialAppMatch[1]);
  const specialKey = specialAppKey || cleanText(specialMatch && specialMatch[1]);
  const isSpecialApp =
    !!specialAppKey ||
    /class\s*=\s*['"][^'"]*\bgg-special-app-page\b/i.test(source) ||
    isSpecialAppPath(pathname);
  const isSpecialSurface =
    /data-gg-surface\s*=\s*['"]special['"]/i.test(source) || !!specialKey || isSpecialApp;
  const hasBlog1Failure = /Failed to render gadget\s+'Blog1'/i.test(source);
  const hasPostDetail = /data-gg-module\s*=\s*['"]post-detail['"]/i.test(source);
  if (!hasBlog1Failure) {
    if (isSpecialSurface) return source;
    if (hasPostDetail) return source;
  }
  const blogRange = findElementByIdRange(source, "div", "blog");
  if (!blogRange) return source;
  const matched = await fetchFeedEntryByPath(requestUrl, pathname);
  if (!matched || !matched.entry) return source;
  const fallbackHtml = isSpecialSurface
    ? buildFallbackSpecialSurfaceHtml(matched.entry, {
        isSpecialApp,
        specialKey,
      })
    : buildFallbackPostDetailHtml(matched.entry, requestUrl, {
        isPage: !!matched.isPageFeed || /^\/p\//i.test(String(pathname || "")),
      });
  if (!fallbackHtml) return source;
  return `${source.slice(0, blogRange.innerStart)}${fallbackHtml}${source.slice(blogRange.innerEnd)}`;
};

const ensurePostDetailResponse = async (response, requestUrl, pathname) => {
  let html = "";
  try {
    html = await response.clone().text();
  } catch (e) {
    return response;
  }
  if (!html) return response;
  let patched = html;
  try {
    patched = await ensurePostDetailFallbackHtml(patched, requestUrl, pathname);
  } catch (e) {
    patched = html;
  }
  patched = cleanPostTocHtml(patched);
  if (patched === html) return response;
  return responseFromHtml(response, patched);
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

      let originRequest = request;
      let originUrl = new URL(request.url);
      let forceListing = false;
      let forceLanding = false;
      const paginationListingFallback = shouldFallbackListingPagination(url);

      if (pathname === "/" || pathname === "") {
        // Blogger does not expose the `view=blog` query to XML route logic on
        // canonical home. Use a listing-owned origin path as route intent, then
        // keep the public response canonicalized to `/` below.
        originUrl.pathname = "/search";
        originUrl.searchParams.delete("view");
        originUrl.searchParams.set("max-results", String(BLOG_LISTING_MIN_POSTCARDS));
        originRequest = new Request(originUrl.toString(), request);
        forceListing = true;
      } else if (pathname === "/landing") {
        originUrl.pathname = "/";
        // Blogger may return an error document for unknown feed-view variants on GET.
        // Fetch canonical home HTML and force landing surface in Worker rewrite instead.
        originUrl.searchParams.delete("view");
        originUrl.searchParams.delete("max-results");
        originUrl.searchParams.delete("start-index");
        originRequest = new Request(originUrl.toString(), request);
        forceLanding = true;
      }

      try {
        const forcedView = String(originUrl.searchParams.get("view") || "").trim().toLowerCase();
        if (forcedView === "blog") forceListing = true;
        if (forcedView === "landing") forceLanding = true;
      } catch (e) {}

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
        if (forceListing) {
          publicUrl.pathname = "/";
        } else if (forceLanding) {
          publicUrl.pathname = "/landing";
        }
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
        const listingH1 = `<h1 class="gg-listing__title">The PakRPP Unfiltered</h1>`;
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
          const pageUrl = cleanUrlForSchema(request.url, { forceListing, forceLanding });
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
              "@type": forceListing ? "CollectionPage" : "WebPage",
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
            (!forceListing && meta.hasArticle);
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
              if (forceListing) {
                el.setAttribute("data-gg-prehome", "blog");
              } else if (forceLanding) {
                el.setAttribute("data-gg-prehome", "landing");
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
              if (forceListing) {
                el.setAttribute("data-gg-surface", "listing");
                // Canonicalize router taxonomy for listing SSR so runtime modules do not see "home".
                el.setAttribute("data-gg-page", "listing");
                el.setAttribute("data-gg-view", "listing");
                el.setAttribute("data-gg-bloghome", "1");
              } else if (forceLanding) {
                el.setAttribute("data-gg-surface", "landing");
                el.setAttribute("data-gg-page", "home");
                el.setAttribute("data-gg-view", "home");
                el.removeAttribute("data-gg-bloghome");
              }
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

        if (forceListing) {
          // Keep both home layers in the streamed rewrite; the home-state CSS/JS contract
          // hides the inactive layer without making HTMLRewriter remove overlapping subtrees.
          rewritten
            .on("main#gg-main", {
              element(el) {
                el.setAttribute("data-gg-surface", "listing");
                el.setAttribute("data-gg-page", "listing");
                el.setAttribute("data-gg-view", "listing");
                // Keep home-root contract but force blog state for listing alias.
                el.setAttribute("data-gg-home-state", "blog");
                el.prepend(listingH1, { html: true });
              },
            })
            .on(".gg-info-panel", {
              element(el) {
                el.append(
                  '<div data-gg-worker-toc-fallback="1" hidden><ol data-gg-slot="toc"></ol><p data-gg-slot="toc-hint"></p></div>',
                  { html: true }
                );
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
            });
        } else if (forceLanding) {
          // Keep both home layers in the streamed rewrite; the home-state CSS/JS contract
          // hides the inactive layer without making HTMLRewriter remove overlapping subtrees.
          rewritten
            .on("main#gg-main", {
              element(el) {
                el.setAttribute("data-gg-surface", "landing");
                el.setAttribute("data-gg-page", "home");
                el.setAttribute("data-gg-view", "home");
                el.setAttribute("data-gg-home-state", "landing");
                el.removeAttribute("data-gg-home-root");
                el.removeAttribute("data-gg-bloghome");
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
            });
        }
        if (legalPage) {
          applyLegalCleanRoomRewrites(rewritten);
        }
        const transformed = rewritten.transform(originRes);
        let htmlResponse = transformed;
        if (request.method !== "HEAD" && (forceListing || paginationListingFallback)) {
          htmlResponse = await ensureListingResponse(transformed, request.url, {
            targetCount: forceListing
              ? BLOG_LISTING_MIN_POSTCARDS
              : listingTargetCountFromUrl(url, BLOG_LISTING_MIN_POSTCARDS),
            allowCreateContainer: forceListing || paginationListingFallback,
            useHtmlBackfill: forceListing,
          });
        }
        if (
          request.method !== "HEAD" &&
          !forceListing &&
          !forceLanding &&
          !paginationListingFallback &&
          isPostLikePath(pathname)
        ) {
          htmlResponse = await ensurePostDetailResponse(htmlResponse, request.url, pathname);
        }
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
        if (forceListing || paginationListingFallback) {
          out.headers.set("Cache-Control", "no-store, max-age=0");
          out.headers.set("Pragma", "no-cache");
          out.headers.set("Expires", "0");
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
