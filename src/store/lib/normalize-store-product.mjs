import { MARKET_KEYS, STORE_ORIGIN, storeAbsoluteUrl } from "../store.config.mjs";
import { normalizeCategory } from "./category-config.mjs";

export function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function lower(value) {
  return clean(value).toLowerCase();
}

export function arr(value) {
  return Array.isArray(value) ? value : (value ? [value] : []);
}

export function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function cleanFirst(value) {
  if (Array.isArray(value)) return clean(value[0]);
  if (value && typeof value === "object") return clean(value.name || value.label || value.value || value.title || "");
  return clean(value);
}

export function cleanTextList(value) {
  return unique(arr(value).map(cleanFirst).filter(Boolean));
}

export function absoluteUrl(value, base = STORE_ORIGIN) {
  const raw = clean(value);
  if (!raw || raw === "#") return "";
  try {
    const url = new URL(raw, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch (error) {
    return "";
  }
}

export function slugify(value) {
  let base = clean(value).toLowerCase();
  if (!base) return "";
  if (typeof base.normalize === "function") {
    base = base.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function parsePriceValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let raw = clean(value);
  let compact;
  let parsed;
  if (!raw) return 0;
  compact = lower(raw).replace(/[^0-9,.\-]/g, "");
  if (!compact) return 0;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(compact)) compact = compact.replace(/\./g, "").replace(",", ".");
  if (compact.includes(",") && compact.includes(".")) compact = compact.replace(/\./g, "").replace(",", ".");
  else if (compact.includes(",")) compact = compact.replace(",", ".");
  parsed = Number.parseFloat(compact);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function detectPriceCurrency(priceText, explicitCurrency) {
  const currency = clean(explicitCurrency).toUpperCase();
  const raw = lower(priceText);
  if (currency) return currency;
  if (raw.includes("rp") || raw.includes("idr")) return "IDR";
  return "";
}

export function dateValue(raw) {
  const timestamp = Date.parse(raw || "");
  return Number.isFinite(timestamp) ? timestamp : NaN;
}

export function looksLikeUrl(value) {
  const raw = clean(value);
  if (!raw) return false;
  if (/^https?:\/\//i.test(raw)) return true;
  if (/^www\./i.test(raw)) return true;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

export function slugLooksLikeUrl(value) {
  const raw = lower(value);
  if (!raw) return false;
  if (looksLikeUrl(raw)) return true;
  if (/^https?-/.test(raw) || /^www-/.test(raw)) return true;
  return /-(?:com|net|org|id|co|io|dev|app)-/.test(raw);
}

export function slugEndsWithHtml(value) {
  const raw = lower(value);
  return raw.endsWith(".html") || raw.endsWith("-html");
}

export function isDummyValue(value) {
  return /\bdummy\b/i.test(clean(value));
}

function urlPathSlug(value) {
  const absolute = absoluteUrl(value);
  const raw = clean(value);
  let pathname = "";
  if (absolute) pathname = new URL(absolute).pathname;
  else if (raw.includes("/")) pathname = raw.split("?")[0].split("#")[0];
  if (!pathname) return "";
  const segment = pathname.split("/").filter(Boolean).pop() || "";
  return slugify(segment.replace(/\.html?$/i, ""));
}

function usableSlugValue(value) {
  const slug = slugify(value);
  if (!slug) return "";
  if (slugLooksLikeUrl(slug)) return "";
  if (slugEndsWithHtml(slug)) return "";
  if (/\s/.test(slug)) return "";
  return slug;
}

export function deriveSlug(rawProduct = {}) {
  const source = rawProduct && typeof rawProduct === "object" ? rawProduct : {};
  const directCandidates = [source.slug, source.handle, source.storeSlug, source.id];
  const urlCandidates = [source.canonicalUrl, source.url, source.href, source.permalink, source.storeUrl];
  const labelCandidates = [source.name, source.title];

  for (const candidate of directCandidates) {
    const slug = usableSlugValue(candidate);
    if (slug) return slug;
  }

  for (const candidate of urlCandidates) {
    const slug = usableSlugValue(urlPathSlug(candidate));
    if (slug) return slug;
  }

  for (const candidate of labelCandidates) {
    const slug = usableSlugValue(candidate);
    if (slug) return slug;
  }

  return "";
}

export function normalizeStoreProduct(rawProduct = {}) {
  const source = rawProduct && typeof rawProduct === "object" ? rawProduct : {};
  const slug = deriveSlug(source);
  const canonicalUrl = absoluteUrl(source.canonicalUrl || source.url || source.href || source.permalink);
  const storeUrl = slug ? storeAbsoluteUrl(slug) : absoluteUrl(source.storeUrl);
  const { categoryKey, category } = normalizeCategory(source.categoryKey || source.category || source.filter);
  const images = unique(arr(source.images || source.image).map((value) => absoluteUrl(cleanFirst(value))).filter(Boolean));
  const links = MARKET_KEYS.reduce((out, key) => {
    out[key] = absoluteUrl(source?.links?.[key] || source[key]);
    return out;
  }, {});
  const priceText = clean(source.priceText || source.priceLabel || source.price || "Rp—");

  return {
    id: slug,
    slug,
    name: clean(source.name || source.title || ""),
    category,
    categoryKey,
    priceText,
    price: parsePriceValue(source.price) || parsePriceValue(priceText),
    priceCurrency: detectPriceCurrency(priceText, source.priceCurrency || source.currency),
    brand: cleanFirst(source.brand),
    summary: clean(source.summary || source.tagline || source.verdict || "Curated Yellow Cart product."),
    verdict: clean(source.verdict || source.takeaway),
    whyPicked: clean(source.whyPicked || source.why || source.reason),
    bestFor: cleanTextList(source.bestFor || source.best_for || source.audience),
    notes: cleanTextList(source.notes || source.contents || source.sections),
    caveat: clean(source.caveat || source.consider || source.warning),
    material: clean(source.material),
    useCase: cleanFirst(source.useCase || source.use_case),
    geoContext: cleanFirst(source.geoContext || source.geo || source.locationContext),
    tags: cleanTextList(source.tags || source.keywords || source.labels || source.topics),
    images,
    links,
    canonicalUrl: canonicalUrl || storeUrl,
    storeUrl,
    datePublished: clean(source.datePublished || source.published),
    dateModified: clean(source.dateModified || source.updated),
  };
}
