import { storeAbsoluteUrl } from "../store.config.mjs";
import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryCounts } from "./category-config.mjs";
import { clean, cleanTextList, dateValue, lower, slugify, unique } from "./normalize-store-product.mjs";

export const STORE_MANIFEST_VERSION = "store-manifest-v1";

function normalizeDate(value) {
  const timestamp = dateValue(value);
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp).toISOString().slice(0, 10);
}

function trimSummary(value, maxLength = 140) {
  const summary = clean(value);
  let sliced;
  let safeIndex;
  if (!summary || summary.length <= maxLength) return summary;
  sliced = summary.slice(0, maxLength + 1);
  safeIndex = sliced.lastIndexOf(" ");
  if (safeIndex > 40) return clean(sliced.slice(0, safeIndex));
  return clean(summary.slice(0, maxLength));
}

function priceBand(price) {
  const amount = Number(price || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "unknown";
  if (amount < 50000) return "under-50k";
  if (amount < 100000) return "50k-100k";
  if (amount < 200000) return "100k-200k";
  if (amount < 500000) return "200k-500k";
  return "over-500k";
}

function normalizedList(values, limit = 8) {
  return unique(
    cleanTextList(values)
      .map((value) => slugify(value))
      .filter(Boolean)
  ).slice(0, limit);
}

function matchedIntent(out, haystack, intent, patterns) {
  if (out.includes(intent)) return;
  if (patterns.some((pattern) => haystack.includes(pattern))) out.push(intent);
}

function deriveIntent(product) {
  const rawHaystack = [
    product?.categoryKey,
    product?.category,
    product?.useCase,
    product?.geoContext,
    ...(Array.isArray(product?.tags) ? product.tags : []),
    ...(Array.isArray(product?.bestFor) ? product.bestFor : []),
    ...(Array.isArray(product?.notes) ? product.notes : []),
  ]
    .map((value) => lower(value))
    .filter(Boolean)
    .join(" | ");
  const categoryConfig = CATEGORY_CONFIG[clean(product?.categoryKey)] || CATEGORY_CONFIG.everyday || CATEGORY_CONFIG[CATEGORY_ORDER[0]];
  const defaultIntent = clean(categoryConfig?.defaultIntent || "daily");
  const intents = [];

  if (defaultIntent) intents.push(defaultIntent);

  matchedIntent(intents, rawHaystack, "workwear", ["workwear", "office", "meeting", "smart-casual", "overshirt"]);
  matchedIntent(intents, rawHaystack, "travel", ["travel", "trip", "packing", "airplane", "commute"]);
  matchedIntent(intents, rawHaystack, "daily", ["daily", "everyday", "harian"]);
  matchedIntent(intents, rawHaystack, "study", ["study", "belajar", "student"]);
  matchedIntent(intents, rawHaystack, "workspace", ["workspace", "desk", "meja", "setup"]);
  matchedIntent(intents, rawHaystack, "wfh", ["wfh", "work-from-home", "remote"]);
  matchedIntent(intents, rawHaystack, "skincare-routine", ["skincare", "cleanser", "serum", "moisturizer", "sunscreen"]);
  matchedIntent(intents, rawHaystack, "hydration", ["hydration", "hydrate", "moisturizer", "barrier"]);
  matchedIntent(intents, rawHaystack, "cable-management", ["cable", "charger", "cord", "wire"]);
  matchedIntent(intents, rawHaystack, "portable", ["portable", "travel", "wireless", "compact", "foldable"]);
  matchedIntent(intents, rawHaystack, "campus", ["campus", "kuliah", "mahasiswa"]);
  matchedIntent(intents, rawHaystack, "compact", ["compact", "slim", "minimal", "small"]);
  matchedIntent(intents, rawHaystack, "gift", ["gift", "hadiah"]);

  return unique(intents).slice(0, 8);
}

function buildManifestCategories(products) {
  const counts = categoryCounts(products);
  return CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_CONFIG[key].label,
    count: Number(counts[key] || 0),
    path: CATEGORY_CONFIG[key].path || CATEGORY_CONFIG[key].futurePath,
  }));
}

function buildManifestItem(product) {
  const normalizedPublished = normalizeDate(product?.datePublished);
  const normalizedModified = normalizeDate(product?.dateModified);
  const sortDate = normalizedModified || normalizedPublished;

  return {
    slug: clean(product?.slug),
    name: clean(product?.name),
    categoryKey: clean(product?.categoryKey),
    categoryLabel: clean(product?.category || CATEGORY_CONFIG[clean(product?.categoryKey)]?.label || CATEGORY_CONFIG.everyday.label),
    price: Number(product?.price || 0),
    priceText: clean(product?.priceText || "Rp-"),
    priceBand: priceBand(product?.price),
    summary: trimSummary(product?.summary || product?.verdict || product?.name),
    image: clean(Array.isArray(product?.images) ? product.images[0] : ""),
    url: clean(product?.canonicalUrl),
    storeUrl: storeAbsoluteUrl(clean(product?.slug)),
    tags: normalizedList(product?.tags, 8),
    intent: deriveIntent(product),
    datePublished: normalizedPublished,
    dateModified: normalizedModified,
    sort: {
      name: lower(product?.name),
      date: sortDate,
      price: Number(product?.price || 0),
      score: 0,
    },
  };
}

export function buildStoreManifest(products, options = {}) {
  const normalizedProducts = Array.isArray(products) ? products : [];
  const source = clean(options.source || "unknown");

  return {
    version: STORE_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    source,
    count: normalizedProducts.length,
    categories: buildManifestCategories(normalizedProducts),
    items: normalizedProducts.map((product) => buildManifestItem(product)),
  };
}
