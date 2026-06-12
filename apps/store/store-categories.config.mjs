function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function unique(values) {
  return Array.from(new Set(values.map(clean).filter(Boolean)));
}

function slugAlias(value) {
  return lower(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const RAW_STORE_CATEGORIES = [
  {
    key: "fashion",
    label: "Fashion",
    slug: "fashion",
    path: "/store/fashion",
    title: "Fashion Picks · Yellow Cart",
    h1: "Fashion Picks",
    description: "Fashion picks from Yellow Cart, curated for clean daily outfits, workwear, travel, and easy layering.",
    intro: "Pilihan fashion bernuansa bersih dan mudah dipadukan untuk gaya harian, kerja, dan perjalanan ringan.",
    aliases: ["fashion", "style", "outfit"],
    fallback: false,
    defaultIntent: "daily",
    runtime: {
      labelKey: "filterFashionLabel",
      icon: "checkroom",
      title: { id: "Fashion", en: "Fashion" },
      description: {
        id: "Pilihan fashion dengan tampilan bersih, netral, dan mudah dipadukan untuk kerja, perjalanan, dan gaya harian.",
        en: "Clean, neutral, and wearable fashion picks for work, travel, and daily style.",
      },
      keywords: ["fashion minimalis", "daily wear", "workwear"],
    },
  },
  {
    key: "skincare",
    label: "Skincare",
    slug: "skincare",
    path: "/store/skincare",
    title: "Skincare Picks · Yellow Cart",
    h1: "Skincare Picks",
    description: "Skincare picks from Yellow Cart for simple routines, hydration, sunscreen, cleansing, and skin barrier care.",
    intro: "Kurasi skincare sederhana untuk rutinitas realistis, hidrasi harian, cleansing, sunscreen, dan skin barrier.",
    aliases: ["skincare"],
    fallback: false,
    defaultIntent: "skincare-routine",
    runtime: {
      labelKey: "filterSkincareLabel",
      icon: "spa",
      title: { id: "Skincare", en: "Skincare" },
      description: {
        id: "Kurasi skincare sederhana untuk rutinitas yang realistis, termasuk kebutuhan dasar kulit di iklim tropis.",
        en: "Simple skincare picks for realistic routines, including basic needs in tropical climates.",
      },
      keywords: ["skincare tropis", "skin barrier", "daily skincare"],
    },
  },
  {
    key: "workspace",
    label: "Workspace",
    slug: "workspace",
    path: "/store/workspace",
    title: "Workspace Picks · Yellow Cart",
    h1: "Workspace Picks",
    description: "Workspace picks from Yellow Cart for tidy desks, WFH setups, cable control, and compact work tools.",
    intro: "Produk untuk meja kerja yang lebih rapi, setup WFH, kontrol kabel, dan alat kerja ringkas.",
    aliases: ["workspace"],
    fallback: false,
    defaultIntent: "workspace",
    runtime: {
      labelKey: "filterWorkspaceLabel",
      icon: "desktop_windows",
      title: { id: "Workspace", en: "Workspace" },
      description: {
        id: "Produk untuk setup kerja remote, meja kecil, dan ruang kerja yang rapi tanpa terasa berlebihan.",
        en: "Products for remote work setups, small desks, and calm workspaces.",
      },
      keywords: ["remote work setup", "workspace minimalis", "WFH"],
    },
  },
  {
    key: "tech",
    label: "Tech",
    slug: "tech",
    path: "/store/tech",
    title: "Tech Picks · Yellow Cart",
    h1: "Tech Picks",
    description: "Tech picks from Yellow Cart for useful daily accessories, portable setups, charging, and compact devices.",
    intro: "Aksesori teknologi yang dipilih untuk fungsi harian, setup portabel, charging, dan perangkat ringkas.",
    aliases: ["tech"],
    fallback: false,
    defaultIntent: "portable",
    runtime: {
      labelKey: "filterTechLabel",
      icon: "devices",
      title: { id: "Tech", en: "Tech" },
      description: {
        id: "Perangkat dan aksesori teknologi yang dipilih untuk fungsi, kerapian, dan kemudahan penggunaan harian.",
        en: "Tech devices and accessories selected for function, neatness, and everyday usability.",
      },
      keywords: ["tech accessories", "minimal setup", "daily tech"],
    },
  },
  {
    key: "everyday",
    label: "Lainnya",
    slug: "everyday",
    path: "/store/everyday",
    title: "Everyday Picks · Yellow Cart",
    h1: "Everyday Picks",
    description: "Everyday picks from Yellow Cart for useful cross-category products that fit daily routines and light errands.",
    intro: "Produk lintas kategori untuk kebutuhan harian, perjalanan pendek, bawaan ringan, dan rutinitas yang praktis.",
    aliases: ["everyday", "etc", "lainnya", "other"],
    routeAliases: ["lainnya", "etc"],
    fallback: true,
    defaultIntent: "daily",
    runtime: {
      labelKey: "filterEverydayLabel",
      icon: "category",
      title: { id: "Lainnya", en: "Other" },
      description: {
        id: "Produk lintas kategori yang tetap relevan dengan prinsip kurasi Yellow Cart.",
        en: "Cross-category products that still fit the Yellow Cart curation logic.",
      },
      keywords: ["daily essentials", "curated picks"],
    },
  },
];

function normalizeCategoryEntry(entry) {
  const key = slugAlias(entry.key);
  const slug = slugAlias(entry.slug || key);
  const aliases = unique([
    key,
    slug,
    slugAlias(entry.label),
    ...(Array.isArray(entry.aliases) ? entry.aliases.map(slugAlias) : []),
  ]);
  const routeAliases = unique(Array.isArray(entry.routeAliases) ? entry.routeAliases.map(slugAlias) : []);

  return Object.freeze({
    ...entry,
    key,
    slug,
    path: clean(entry.path || `/store/${slug}`),
    aliases: Object.freeze(aliases),
    routeAliases: Object.freeze(routeAliases),
    fallback: entry.fallback === true,
    runtime: Object.freeze({
      ...(entry.runtime || {}),
      title: Object.freeze({ ...(entry.runtime?.title || {}) }),
      description: Object.freeze({ ...(entry.runtime?.description || {}) }),
      keywords: Object.freeze(unique(entry.runtime?.keywords || [])),
    }),
  });
}

export const STORE_CATEGORIES = Object.freeze(RAW_STORE_CATEGORIES.map(normalizeCategoryEntry));
export const STORE_CATEGORY_KEYS = Object.freeze(STORE_CATEGORIES.map((category) => category.key));
export const STORE_CATEGORY_CONFIG = Object.freeze(Object.fromEntries(STORE_CATEGORIES.map((category) => [category.key, category])));
export const STORE_FALLBACK_CATEGORY = STORE_CATEGORIES.find((category) => category.fallback) || STORE_CATEGORIES[0];
export const STORE_CATEGORY_ALIAS_ENTRIES = Object.freeze(
  STORE_CATEGORIES.flatMap((category) => category.aliases.map((alias) => Object.freeze([alias, category.key])))
);
export const STORE_CATEGORY_ALIAS_MAP = new Map(STORE_CATEGORY_ALIAS_ENTRIES);

export const STORE_ALL_FILTER_CONFIG = Object.freeze({
  labelKey: "filterAllLabel",
  icon: "filter_list",
  title: Object.freeze({
    id: "Semua Kurasi",
    en: "All Picks",
  }),
  description: Object.freeze({
    id: "Kumpulan produk pilihan Yellow Cart untuk gaya hidup, kerja, dan kebutuhan harian yang dikurasi secara editorial.",
    en: "A curated Yellow Cart selection for lifestyle, work, and everyday use.",
  }),
  keywords: Object.freeze(["yellow cart", "kurasi produk", "affiliate store"]),
});

export function categoryForKey(value) {
  return STORE_CATEGORY_CONFIG[clean(value)] || STORE_FALLBACK_CATEGORY;
}

export function normalizeStoreCategoryKey(value) {
  return STORE_CATEGORY_ALIAS_MAP.get(slugAlias(value)) || STORE_FALLBACK_CATEGORY.key;
}

export function storeCategoryFilterEntries() {
  return Object.freeze([
    Object.freeze({ key: "all", label: "All", ...STORE_ALL_FILTER_CONFIG }),
    ...STORE_CATEGORIES.map((category) => Object.freeze({
      key: category.key,
      label: category.label,
      ...category.runtime,
    })),
  ]);
}

export function renderStoreRuntimeCategoryConfig() {
  const categoryConfig = Object.fromEntries(
    storeCategoryFilterEntries().map((entry) => [
      entry.key,
      {
        labelKey: entry.labelKey,
        icon: entry.icon,
        title: entry.title,
        description: entry.description,
        keywords: entry.keywords,
      },
    ])
  );

  return `    var STORE_CATEGORY_CONFIG = ${JSON.stringify(categoryConfig, null, 6).replace(/\n/g, "\n    ")};`;
}

export function renderWorkerStoreCategoryRegistry() {
  const registry = STORE_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    slug: category.slug,
    path: category.path,
    aliases: category.aliases,
    routeAliases: category.routeAliases,
    fallback: category.fallback,
  }));

  return [
    `const STORE_CATEGORY_REGISTRY = Object.freeze(${JSON.stringify(registry, null, 2)}.map((entry) => Object.freeze({`,
    "  ...entry,",
    "  aliases: Object.freeze(entry.aliases || []),",
    "  routeAliases: Object.freeze(entry.routeAliases || []),",
    "})));",
  ].join("\n");
}
