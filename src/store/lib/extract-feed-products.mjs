import { SYSTEM_LABELS } from "../store.config.mjs";
import { decodeBloggerContent, decodeEmbeddedJsonText, decodeHtmlEntities } from "./decode-blogger-content.mjs";
import { resolveProductImages } from "./extract-product-images.mjs";
import {
  absoluteUrl,
  arr,
  clean,
  cleanFirst,
  cleanTextList,
  deriveSlug,
  detectPriceCurrency,
  lower,
  normalizeStoreProduct,
  parsePriceValue,
  unique,
} from "./normalize-store-product.mjs";

function text(node) {
  return node && typeof node.$t === "string" ? node.$t : "";
}

function stripHtml(value) {
  return clean(
    decodeHtmlEntities(
      String(value || "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

function entryAlternateUrl(entry) {
  for (const link of arr(entry?.link)) {
    if (clean(link?.rel) === "alternate") return absoluteUrl(link?.href);
  }
  return "";
}

function entryLabels(entry) {
  return arr(entry?.category).map((item) => clean(item?.term)).filter(Boolean);
}

function publicCategory(labels) {
  const publicLabels = labels.filter((label) => !SYSTEM_LABELS.includes(lower(label)));
  return clean(publicLabels[0] || "Lainnya");
}

function extractHeadingTexts(html) {
  const out = [];
  const pattern = /<(?:h2|h3|li)\b[^>]*>([\s\S]*?)<\/(?:h2|h3|li)>/gi;
  let match;

  while ((match = pattern.exec(html || ""))) {
    const textValue = stripHtml(match[1]);
    if (textValue) out.push(textValue);
  }

  return unique(out).slice(0, 6);
}

function marketplaceInfo(href) {
  const value = absoluteUrl(href);
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = lower(url.hostname).replace(/^www\./, "");

    if (/(^|\.)shopee\.[a-z.]+$/.test(host)) return { key: "shopee", href: url.toString() };
    if (host === "tokopedia.com" || /(^|\.)tokopedia\.com$/.test(host)) return { key: "tokopedia", href: url.toString() };
    if (host === "tiktok.com" || /(^|\.)tiktok\.com$/.test(host)) return { key: "tiktok", href: url.toString() };
    if (host === "lazada.com" || /(^|\.)lazada\.[a-z.]+$/.test(host)) return { key: "lazada", href: url.toString() };
  } catch (error) {
    return null;
  }

  return null;
}

function extractMarketplaceLinksFromHtml(html) {
  const out = {};
  const pattern = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
  let match;

  while ((match = pattern.exec(html || ""))) {
    const info = marketplaceInfo(match[2]);
    if (info && !out[info.key]) out[info.key] = info.href;
  }

  return out;
}

function normalizeLinks(rawLinks, parsedLinks) {
  const out = {};
  const source = rawLinks && typeof rawLinks === "object" ? rawLinks : {};
  const parsed = parsedLinks && typeof parsedLinks === "object" ? parsedLinks : {};

  for (const key of Object.keys({ ...source, ...parsed })) {
    out[key] = absoluteUrl(source[key]) || absoluteUrl(parsed[key]) || "";
  }

  return out;
}

function scriptMatches(html) {
  return Array.from(String(html || "").matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi));
}

function scoreStoreDataCandidate(data) {
  const source = data && typeof data === "object" ? data : {};
  let score = 0;

  if (clean(source.slug)) score += 100;
  if (clean(source.id)) score += 50;
  if (clean(source.storeUrl)) score += 40;
  if (clean(source.canonicalUrl || source.url)) score += 40;
  if (clean(source.name || source.title)) score += 25;
  if (Array.isArray(source.images) && source.images.length) score += 20;
  if (clean(source.image)) score += 10;
  if (clean(source.priceText) || source.price) score += 10;
  if (clean(source.category)) score += 5;

  return score + Object.keys(source).length;
}

function extractStoreData(rawSegments) {
  const variants = [];
  const seen = new Set();
  const candidates = [];
  const parseErrors = [];

  function pushVariant(candidate) {
    const value = String(candidate || "");
    if (!value || seen.has(value)) return;
    seen.add(value);
    variants.push(value);
  }

  for (const segment of rawSegments) {
    const decoded = decodeBloggerContent(segment);
    for (const variant of decoded.variants) pushVariant(variant);
  }

  for (const html of variants) {
    for (const match of scriptMatches(html)) {
      const attrs = match[1] || "";
      if (!/\bgg-store-data\b/i.test(attrs)) continue;

      try {
        const json = JSON.parse(decodeEmbeddedJsonText(match[2]));
        candidates.push({
          data: json && typeof json === "object" ? json : {},
          score: scoreStoreDataCandidate(json),
        });
      } catch (error) {
        parseErrors.push(error.message);
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length) {
    return {
      data: candidates[0].data,
      errors: [],
    };
  }

  if (parseErrors.length) {
    return {
      data: {},
      errors: [`invalid gg-store-data JSON: ${parseErrors[0]}`],
    };
  }

  return {
    data: {},
    errors: ["missing gg-store-data script"],
  };
}

function normalizedContentHtml(rawSegments) {
  const out = [];
  const seen = new Set();

  for (const raw of rawSegments) {
    const decoded = decodeBloggerContent(raw).decoded;
    if (!decoded || seen.has(decoded)) continue;
    seen.add(decoded);
    out.push(decoded);
  }

  return out.join("\n");
}

function normalizeFeedEntry(entry, index, options = {}) {
  const existingProductsBySlug = options.existingProductsBySlug instanceof Map ? options.existingProductsBySlug : new Map();
  const rawSegments = [text(entry?.content), text(entry?.summary)].filter(Boolean);
  const html = normalizedContentHtml(rawSegments);
  const labels = entryLabels(entry);
  const fallbackUrl = entryAlternateUrl(entry);
  const fallbackSummary = stripHtml(html).slice(0, 220);
  const fallbackHeadings = extractHeadingTexts(html);
  const fallbackLinks = extractMarketplaceLinksFromHtml(html);
  const storeData = extractStoreData(rawSegments);
  const data = storeData.data && typeof storeData.data === "object" ? storeData.data : {};
  const title = clean(data.name || data.title || text(entry?.title));
  const baseProduct = {
    id: clean(data.id || data.slug || data.handle || title || `store-product-${index + 1}`),
    slug: clean(data.slug || data.handle || data.storeSlug || ""),
    name: title,
    title,
    category: clean(data.category || publicCategory(labels)),
    priceText: clean(data.priceText || data.priceLabel || data.price || "Rp—"),
    price: parsePriceValue(data.price) || parsePriceValue(data.priceText),
    priceCurrency: detectPriceCurrency(data.priceText, data.priceCurrency || data.currency),
    brand: cleanFirst(data.brand),
    summary: clean(data.summary || data.tagline || data.verdict || fallbackSummary),
    verdict: clean(data.verdict || data.takeaway),
    whyPicked: clean(data.whyPicked || data.why || data.reason),
    bestFor: cleanTextList(data.bestFor || data.best_for || data.audience),
    notes: cleanTextList(data.notes || data.contents || data.sections || fallbackHeadings),
    caveat: clean(data.caveat || data.consider || data.warning),
    material: clean(data.material),
    useCase: clean(data.useCase || data.use_case),
    geoContext: clean(data.geoContext || data.geo || data.locationContext),
    tags: cleanTextList(data.tags || data.keywords || data.labels || data.topics),
    links: normalizeLinks(data.links, fallbackLinks),
    canonicalUrl: absoluteUrl(data.canonicalUrl || data.url || fallbackUrl),
    storeUrl: absoluteUrl(data.storeUrl),
    datePublished: clean(data.datePublished || text(entry?.published)),
    dateModified: clean(data.dateModified || text(entry?.updated)),
  };
  const derivedSlug = deriveSlug(baseProduct);
  const existingImages = existingProductsBySlug.get(derivedSlug)?.images || [];
  const resolvedImages = resolveProductImages({
    dataImages: data.images,
    dataImage: data.image,
    contentHtml: html,
    entry,
    existingImages,
  });
  const product = normalizeStoreProduct({
    ...baseProduct,
    images: resolvedImages.images,
  });

  return {
    product,
    imageSource: resolvedImages.imageSource,
    warnings: resolvedImages.warnings.slice(),
    errors: storeData.errors.slice(),
  };
}

export function extractFeedProducts(entries, options = {}) {
  const normalizedEntries = arr(entries).map((entry, index) => normalizeFeedEntry(entry, index, options));

  return {
    entryCount: arr(entries).length,
    items: normalizedEntries,
  };
}
