import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryCounts } from "./category-config.mjs";
import { IMAGE_SOURCE_KEYS } from "./extract-product-images.mjs";

function buildImageSourceCounts(entries = []) {
  const counts = IMAGE_SOURCE_KEYS.reduce((out, key) => {
    out[key] = 0;
    return out;
  }, {});

  for (const entry of entries) {
    const key = IMAGE_SOURCE_KEYS.includes(entry?.imageSource) ? entry.imageSource : "missing";
    counts[key] += 1;
  }

  return counts;
}

export function formatImageSourceSummary(imageSources = {}) {
  return IMAGE_SOURCE_KEYS.map((key) => `${key}:${Number(imageSources[key] || 0)}`).join(", ");
}

export function buildStoreReport({
  products,
  productEntries = [],
  removedInvalidProducts = [],
  duplicateSlugs = [],
  warnings = [],
  sourceType = "",
  feedEntries = 0,
  invalidProducts = 0,
}) {
  const counts = categoryCounts(products);
  const imageSources = buildImageSourceCounts(productEntries);

  return {
    sourceType,
    feedEntries,
    productCount: products.length,
    validProducts: products.length,
    invalidProducts,
    imageSources,
    imageSourceSummary: formatImageSourceSummary(imageSources),
    categoryCounts: CATEGORY_ORDER.reduce((out, key) => {
      out[CATEGORY_CONFIG[key].label] = counts[key] || 0;
      return out;
    }, {}),
    removedInvalidProducts,
    duplicateSlugs,
    warnings,
  };
}

export function formatStoreReport(report) {
  const categorySummary = CATEGORY_ORDER
    .map((key) => `${CATEGORY_CONFIG[key].label}:${report.categoryCounts[CATEGORY_CONFIG[key].label] || 0}`)
    .join(", ");
  const manifestCategorySummary = Array.isArray(report.manifestCategories)
    ? report.manifestCategories.map((entry) => `${entry.label || entry.key}:${Number(entry.count || 0)}`).join(", ")
    : "";
  const categoryPageSummary = Array.isArray(report.categoryPages)
    ? report.categoryPages.map((entry) => `${entry.path}:${Number(entry.visibleProducts || 0)}/${Number(entry.totalProducts || 0)}`).join(", ")
    : "";
  const removed = report.removedInvalidProducts.length
    ? report.removedInvalidProducts.map((entry) => `${entry.slug || entry.name || "unknown"} [${entry.reason}]`).join("; ")
    : "none";
  const duplicates = report.duplicateSlugs.length ? report.duplicateSlugs.join(", ") : "none";
  const warnings = report.warnings.length ? report.warnings.join(" | ") : "none";

  return [
    "FEED EXTRACTION REPORT",
    `feedEntries=${Number(report.feedEntries || 0)}`,
    `validProducts=${Number(report.validProducts || report.productCount || 0)}`,
    `invalidProducts=${Number(report.invalidProducts || 0)}`,
    `imageSourceSummary=${report.imageSourceSummary || formatImageSourceSummary(report.imageSources)}`,
    `categoryCounts=${categorySummary}`,
    report.manifestPath ? `manifestPath=${report.manifestPath}` : "",
    Number.isFinite(report.manifestBytes) ? `manifestBytes=${report.manifestBytes}` : "",
    Number.isFinite(report.manifestItems) ? `manifestItems=${report.manifestItems}` : "",
    manifestCategorySummary ? `manifestCategories=${manifestCategorySummary}` : "",
    categoryPageSummary ? `categoryPages=${categoryPageSummary}` : "",
    `removedInvalidProducts=${removed}`,
    `duplicateSlugs=${duplicates}`,
    `warnings=${warnings}`,
  ].filter(Boolean);
}
