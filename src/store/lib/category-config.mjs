function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

export const CATEGORY_ORDER = ["fashion", "skincare", "workspace", "tech", "everyday"];

export const CATEGORY_CONFIG = {
  fashion: {
    key: "fashion",
    label: "Fashion",
    futurePath: "/store/fashion",
    legacyValues: ["fashion"],
  },
  skincare: {
    key: "skincare",
    label: "Skincare",
    futurePath: "/store/skincare",
    legacyValues: ["skincare"],
  },
  workspace: {
    key: "workspace",
    label: "Workspace",
    futurePath: "/store/workspace",
    legacyValues: ["workspace"],
  },
  tech: {
    key: "tech",
    label: "Tech",
    futurePath: "/store/tech",
    legacyValues: ["tech"],
  },
  everyday: {
    key: "everyday",
    label: "Lainnya",
    futurePath: "/store/everyday",
    legacyValues: ["everyday", "etc", "lainnya", "other"],
  },
};

const CATEGORY_ALIAS_MAP = CATEGORY_ORDER.reduce((map, key) => {
  const config = CATEGORY_CONFIG[key];
  for (const value of config.legacyValues) map.set(lower(value), key);
  map.set(lower(config.label), key);
  map.set(lower(config.key), key);
  return map;
}, new Map());

export function isCategoryKey(value) {
  return CATEGORY_ORDER.includes(clean(value));
}

export function categoryLabelForKey(value) {
  return CATEGORY_CONFIG[clean(value)]?.label || CATEGORY_CONFIG.everyday.label;
}

export function normalizeCategory(value) {
  const normalized = CATEGORY_ALIAS_MAP.get(lower(value)) || "everyday";
  return {
    categoryKey: normalized,
    category: CATEGORY_CONFIG[normalized].label,
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
