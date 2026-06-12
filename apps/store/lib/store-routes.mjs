import { STORE_CATEGORY_PAGE_SIZE, STORE_ORIGIN } from "../store.config.mjs";
import { CATEGORY_CONFIG, CATEGORY_ORDER, normalizeCategory } from "./category-config.mjs";

export const CATEGORY_PAGE_SIZE = STORE_CATEGORY_PAGE_SIZE;

export function storeCategoryRoute(key) {
  const normalizedKey = normalizeCategory(key).categoryKey;
  const config = CATEGORY_CONFIG[normalizedKey];
  const path = config.path || config.futurePath;

  return {
    key: normalizedKey,
    label: config.label,
    path,
    canonicalUrl: `${STORE_ORIGIN}${path}`,
    nestedOutputPath: `store/${normalizedKey}/index.html`,
    flatOutputPath: `store-${normalizedKey}.html`,
    title: config.title,
    h1: config.h1,
    description: config.description,
    intro: config.intro,
  };
}

export function storeCategoryRoutes() {
  return CATEGORY_ORDER.map((key) => storeCategoryRoute(key));
}

export function productCategoryKey(product) {
  return normalizeCategory(product?.categoryKey || product?.category).categoryKey;
}

export function productsForCategory(products, key) {
  const route = storeCategoryRoute(key);
  return (Array.isArray(products) ? products : []).filter((product) => productCategoryKey(product) === route.key);
}
