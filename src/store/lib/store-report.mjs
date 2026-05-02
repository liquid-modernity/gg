import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryCounts } from "./category-config.mjs";

export function buildStoreReport({ products, removedInvalidProducts = [], duplicateSlugs = [], warnings = [], sourceType = "" }) {
  const counts = categoryCounts(products);

  return {
    sourceType,
    productCount: products.length,
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
  const removed = report.removedInvalidProducts.length
    ? report.removedInvalidProducts.map((entry) => `${entry.slug || entry.name || "unknown"} [${entry.reason}]`).join("; ")
    : "none";
  const duplicates = report.duplicateSlugs.length ? report.duplicateSlugs.join(", ") : "none";
  const warnings = report.warnings.length ? report.warnings.join(" | ") : "none";

  return [
    `categoryCounts=${categorySummary}`,
    `removedInvalidProducts=${removed}`,
    `duplicateSlugs=${duplicates}`,
    `warnings=${warnings}`,
  ];
}
