import { STORE_CATEGORY_PAGE_SIZE, STORE_ORIGIN } from "../store.config.mjs";
import { CATEGORY_CONFIG, CATEGORY_ORDER, normalizeCategory } from "./category-config.mjs";

export const CATEGORY_PAGE_SIZE = STORE_CATEGORY_PAGE_SIZE;

const CATEGORY_PAGE_COPY = {
  fashion: {
    title: "Fashion Picks · Yellow Cart",
    h1: "Fashion Picks",
    description: "Fashion picks from Yellow Cart, curated for clean daily outfits, workwear, travel, and easy layering.",
    intro: "Pilihan fashion bernuansa bersih dan mudah dipadukan untuk gaya harian, kerja, dan perjalanan ringan.",
  },
  skincare: {
    title: "Skincare Picks · Yellow Cart",
    h1: "Skincare Picks",
    description: "Skincare picks from Yellow Cart for simple routines, hydration, sunscreen, cleansing, and skin barrier care.",
    intro: "Kurasi skincare sederhana untuk rutinitas realistis, hidrasi harian, cleansing, sunscreen, dan skin barrier.",
  },
  workspace: {
    title: "Workspace Picks · Yellow Cart",
    h1: "Workspace Picks",
    description: "Workspace picks from Yellow Cart for tidy desks, WFH setups, cable control, and compact work tools.",
    intro: "Produk untuk meja kerja yang lebih rapi, setup WFH, kontrol kabel, dan alat kerja ringkas.",
  },
  tech: {
    title: "Tech Picks · Yellow Cart",
    h1: "Tech Picks",
    description: "Tech picks from Yellow Cart for useful daily accessories, portable setups, charging, and compact devices.",
    intro: "Aksesori teknologi yang dipilih untuk fungsi harian, setup portabel, charging, dan perangkat ringkas.",
  },
  everyday: {
    title: "Everyday Picks · Yellow Cart",
    h1: "Everyday Picks",
    description: "Everyday picks from Yellow Cart for useful cross-category products that fit daily routines and light errands.",
    intro: "Produk lintas kategori untuk kebutuhan harian, perjalanan pendek, bawaan ringan, dan rutinitas yang praktis.",
  },
};

export function storeCategoryRoute(key) {
  const normalizedKey = normalizeCategory(key).categoryKey;
  const config = CATEGORY_CONFIG[normalizedKey];
  const copy = CATEGORY_PAGE_COPY[normalizedKey];
  const path = config.futurePath;

  return {
    key: normalizedKey,
    label: config.label,
    path,
    canonicalUrl: `${STORE_ORIGIN}${path}`,
    nestedOutputPath: `store/${normalizedKey}/index.html`,
    flatOutputPath: `store-${normalizedKey}.html`,
    title: copy.title,
    h1: copy.h1,
    description: copy.description,
    intro: copy.intro,
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
