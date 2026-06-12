import {
  STORE_CATEGORIES,
  STORE_CATEGORY_KEYS,
  STORE_FALLBACK_CATEGORY,
  categoryForKey,
  normalizeStoreCategoryKey,
} from "../store-categories.config.mjs";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export const CATEGORY_ORDER = STORE_CATEGORY_KEYS;

export const CATEGORY_CONFIG = Object.freeze(Object.fromEntries(
  STORE_CATEGORIES.map((category) => [
    category.key,
    Object.freeze({
      ...category,
      futurePath: category.path,
      legacyValues: category.aliases,
    }),
  ])
));

export function isCategoryKey(value) {
  return CATEGORY_ORDER.includes(clean(value));
}

export function categoryLabelForKey(value) {
  return categoryForKey(normalizeStoreCategoryKey(value)).label;
}

export function normalizeCategory(value) {
  const normalized = normalizeStoreCategoryKey(value);
  const category = categoryForKey(normalized) || STORE_FALLBACK_CATEGORY;
  return {
    categoryKey: category.key,
    category: category.label,
  };
}

export function categoryCounts(products) {
  const counts = CATEGORY_ORDER.reduce((out, key) => {
    out[key] = 0;
    return out;
  }, {});

  for (const product of products) {
    const key = normalizeCategory(product?.categoryKey || product?.category).categoryKey;
    counts[key] += 1;
  }

  return counts;
}
