#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STORE_PATH = path.resolve(ROOT, "store.html");
const LCP_FALLBACK_PATH = path.resolve(ROOT, "config/store-lcp-product.json");
const FEED_URL = "https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50";
const STORE_ORIGIN = "https://www.pakrpp.com";
const STORE_PATHNAME = "/store";
const SYSTEM_LABELS = new Set(["store", "yellowcard", "yellowcart"]);
const MARKET_KEYS = ["shopee", "tokopedia", "tiktok", "lazada", "website", "official"];
const SOFT_MODE = process.argv.includes("--soft");

function fail(message) {
  console.error(`store:build: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`store:build warning: ${message}`);
}

function read(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    fail(`unable to read ${path.relative(ROOT, filePath) || filePath}: ${error.message}`);
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(read(filePath));
  } catch (error) {
    fail(`${path.relative(ROOT, filePath) || filePath} is not valid JSON: ${error.message}`);
  }
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function arr(value) {
  return Array.isArray(value) ? value : (value ? [value] : []);
}

function cleanFirst(value) {
  if (Array.isArray(value)) return clean(value[0]);
  if (value && typeof value === "object") return clean(value.name || value.label || value.value || value.title || "");
  return clean(value);
}

function cleanTextList(value) {
  return arr(value).map(cleanFirst).filter(Boolean);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function slugify(value) {
  let base = clean(value).toLowerCase();
  if (!base) return "";
  if (typeof base.normalize === "function") {
    base = base.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function text(node) {
  return node && typeof node.$t === "string" ? node.$t : "";
}

function storeAbsoluteUrl(slug) {
  return `${STORE_ORIGIN}${STORE_PATHNAME}?item=${encodeURIComponent(slug)}`;
}

function absoluteUrl(value) {
  const raw = clean(value);
  if (!raw || raw === "#") return "";
  try {
    const url = new URL(raw, STORE_ORIGIN);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch (error) {
    return "";
  }
}

function lower(value) {
  return clean(value).toLowerCase();
}

function parsePriceValue(value) {
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

function detectPriceCurrency(priceText, explicitCurrency) {
  const currency = clean(explicitCurrency).toUpperCase();
  const raw = lower(priceText);
  if (currency) return currency;
  if (raw.includes("rp") || raw.includes("idr")) return "IDR";
  return "";
}

function dateValue(raw) {
  const timestamp = Date.parse(raw || "");
  return Number.isFinite(timestamp) ? timestamp : NaN;
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(value) {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForScript(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, "<\\/script");
}

function replaceMarkedRegion(source, startMarker, endMarker, nextContent) {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);
  const startLineStart = source.lastIndexOf("\n", startIndex);
  const markerIndent = startLineStart === -1 ? "" : source.slice(startLineStart + 1, startIndex);

  if (startIndex === -1) fail(`missing marker: ${startMarker}`);
  if (endIndex === -1) fail(`missing marker: ${endMarker}`);
  if (source.indexOf(startMarker, startIndex + startMarker.length) !== -1) fail(`duplicate marker: ${startMarker}`);
  if (source.indexOf(endMarker, endIndex + endMarker.length) !== -1) fail(`duplicate marker: ${endMarker}`);
  if (endIndex <= startIndex) fail(`marker order is invalid: ${startMarker} -> ${endMarker}`);

  return `${source.slice(0, startIndex + startMarker.length)}\n${nextContent}\n${markerIndent}${source.slice(endIndex)}`;
}

function extractScriptTextById(source, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`<script\\b[^>]*id=["']${escapedId}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i"));
  return match ? match[1] : "";
}

function entryAlternateUrl(entry) {
  const links = arr(entry && entry.link);
  for (const link of links) {
    if (clean(link.rel) === "alternate") return absoluteUrl(link.href);
  }
  return "";
}

function entryLabels(entry) {
  return arr(entry && entry.category).map((item) => clean(item && item.term)).filter(Boolean);
}

function publicCategory(labels) {
  const publicLabels = labels.filter((label) => !SYSTEM_LABELS.has(lower(label)));
  return clean(publicLabels[0] || "Etc");
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
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

function extractImagesFromHtml(html) {
  const out = [];
  const patterns = [
    /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi,
    /<img\b[^>]*\bdata-src=(["'])(.*?)\1/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html || ""))) {
      const href = absoluteUrl(match[2]);
      if (href) out.push(href);
    }
  }

  return unique(out);
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
  let url;
  let host;
  if (!value) return null;
  try {
    url = new URL(value);
  } catch (error) {
    return null;
  }
  host = lower(url.hostname).replace(/^www\./, "");
  if (/(^|\.)shopee\.[a-z.]+$/.test(host)) return { key: "shopee", href: url.toString() };
  if (host === "tokopedia.com" || /(^|\.)tokopedia\.com$/.test(host)) return { key: "tokopedia", href: url.toString() };
  if (host === "tiktok.com" || /(^|\.)tiktok\.com$/.test(host)) return { key: "tiktok", href: url.toString() };
  if (host === "lazada.com" || /(^|\.)lazada\.[a-z.]+$/.test(host)) return { key: "lazada", href: url.toString() };
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

function extractStoreDataScript(html) {
  const scripts = String(html || "").match(/<script\b[\s\S]*?<\/script>/gi) || [];
  for (const script of scripts) {
    if (!/\bgg-store-data\b/i.test(script)) continue;
    const bodyMatch = script.match(/>([\s\S]*?)<\/script>/i);
    if (!bodyMatch) continue;
    try {
      return JSON.parse(bodyMatch[1]);
    } catch (error) {
      throw new Error(`invalid gg-store-data JSON: ${error.message}`);
    }
  }
  return {};
}

function normalizeLinks(rawLinks, parsedLinks) {
  const out = {};
  const source = rawLinks && typeof rawLinks === "object" ? rawLinks : {};
  const parsed = parsedLinks && typeof parsedLinks === "object" ? parsedLinks : {};
  for (const key of MARKET_KEYS) {
    out[key] = absoluteUrl(source[key]) || absoluteUrl(parsed[key]) || "";
  }
  return out;
}

function normalizeSnapshotProduct(raw, index = 0) {
  const source = raw && typeof raw === "object" ? raw : {};
  const slug = slugify(source.slug || source.id || source.name || source.title || `store-product-${index + 1}`);
  const summary = clean(source.summary || source.verdict || "Curated Yellow Cart product.");
  const bestFor = unique(cleanTextList(source.bestFor));
  const notes = unique(cleanTextList(source.notes || source.contents));
  const tags = unique(cleanTextList(source.tags));
  const images = unique(arr(source.images || source.image).map(absoluteUrl).filter(Boolean));
  const storeUrl = absoluteUrl(source.storeUrl) || storeAbsoluteUrl(slug);
  const canonicalUrl = absoluteUrl(source.canonicalUrl || source.url) || storeUrl;

  return {
    id: clean(source.id || slug),
    slug,
    name: clean(source.name || source.title || slug),
    category: clean(source.category || "Etc"),
    priceText: clean(source.priceText || source.price || "Rp—"),
    price: parsePriceValue(source.price) || parsePriceValue(source.priceText),
    priceCurrency: detectPriceCurrency(source.priceText, source.priceCurrency || source.currency),
    availability: clean(source.availability || ""),
    condition: clean(source.condition || ""),
    brand: cleanFirst(source.brand),
    summary,
    verdict: clean(source.verdict || ""),
    whyPicked: clean(source.whyPicked || ""),
    bestFor,
    notes,
    caveat: clean(source.caveat || ""),
    material: clean(source.material || ""),
    useCase: cleanFirst(source.useCase),
    geoContext: cleanFirst(source.geoContext),
    tags,
    images,
    links: normalizeLinks(source.links, {}),
    canonicalUrl,
    storeUrl,
    datePublished: clean(source.datePublished || ""),
    dateModified: clean(source.dateModified || ""),
  };
}

function validateProduct(product) {
  const missing = [];
  if (!product.slug) missing.push("slug");
  if (!product.name) missing.push("name");
  if (!product.category) missing.push("category");
  if (!product.priceText) missing.push("priceText");
  if (!product.summary) missing.push("summary");
  if (!(product.images && product.images[0])) missing.push("images[0]");
  if (!product.canonicalUrl) missing.push("canonicalUrl");
  return missing;
}

function normalizeEntryProduct(entry, index) {
  const html = text(entry && (entry.content || entry.summary));
  const labels = entryLabels(entry);
  const fallbackUrl = entryAlternateUrl(entry);
  const fallbackSummary = stripHtml(html).slice(0, 220);
  const fallbackHeadings = extractHeadingTexts(html);
  const fallbackImages = extractImagesFromHtml(html);
  const fallbackLinks = extractMarketplaceLinksFromHtml(html);
  let data;

  try {
    data = extractStoreDataScript(html);
  } catch (error) {
    return { errors: [`entry ${index + 1}: ${error.message}`] };
  }

  const title = clean(data.name || data.title || text(entry && entry.title));
  const slug = slugify(data.slug || data.id || data.handle || data.storeSlug || fallbackUrl || title || `store-product-${index + 1}`);
  const images = unique(
    arr(data.images || [])
      .concat(arr(data.image || []))
      .concat(fallbackImages)
      .map(absoluteUrl)
      .filter(Boolean)
  );
  const notes = unique(cleanTextList(data.notes || data.contents || data.sections || fallbackHeadings));
  const bestFor = unique(cleanTextList(data.bestFor || data.best_for || data.audience));
  const category = clean(data.category || publicCategory(labels) || "Etc");
  const product = {
    id: clean(data.id || data.slug || slug),
    slug,
    name: title,
    category,
    priceText: clean(data.priceText || data.priceLabel || data.price || ""),
    price: parsePriceValue(data.price) || parsePriceValue(data.priceText),
    priceCurrency: detectPriceCurrency(data.priceText, data.priceCurrency || data.currency),
    availability: clean(data.availability || ""),
    condition: clean(data.condition || data.itemCondition || ""),
    brand: cleanFirst(data.brand),
    summary: clean(data.summary || data.tagline || data.verdict || fallbackSummary),
    verdict: clean(data.verdict || data.takeaway || ""),
    whyPicked: clean(data.whyPicked || data.why || data.reason || ""),
    bestFor,
    notes,
    caveat: clean(data.caveat || data.consider || data.warning || ""),
    material: clean(data.material || ""),
    useCase: clean(data.useCase || data.use_case || ""),
    geoContext: clean(data.geoContext || data.geo || data.locationContext || ""),
    tags: unique(cleanTextList(data.tags || data.keywords || data.labels || data.topics)),
    images,
    links: normalizeLinks(data.links, fallbackLinks),
    canonicalUrl: absoluteUrl(data.canonicalUrl || data.url || fallbackUrl),
    storeUrl: absoluteUrl(data.storeUrl) || storeAbsoluteUrl(slug),
    datePublished: clean(data.datePublished || text(entry && entry.published)),
    dateModified: clean(data.dateModified || text(entry && entry.updated)),
  };
  const missing = validateProduct(product);
  const label = product.slug || product.name || `entry-${index + 1}`;

  if (missing.length) {
    return {
      product,
      errors: [`${label}: missing ${missing.join(", ")}`],
    };
  }

  return { product, errors: [] };
}

function sortProducts(products) {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aModified = dateValue(a.product.dateModified);
      const bModified = dateValue(b.product.dateModified);
      const aPublished = dateValue(a.product.datePublished);
      const bPublished = dateValue(b.product.datePublished);

      if (Number.isFinite(aModified) && Number.isFinite(bModified) && aModified !== bModified) return bModified - aModified;
      if (Number.isFinite(aModified) !== Number.isFinite(bModified)) return Number.isFinite(bModified) ? 1 : -1;
      if (Number.isFinite(aPublished) && Number.isFinite(bPublished) && aPublished !== bPublished) return bPublished - aPublished;
      if (Number.isFinite(aPublished) !== Number.isFinite(bPublished)) return Number.isFinite(bPublished) ? 1 : -1;
      return a.index - b.index;
    })
    .map((entry) => entry.product);
}

function isNonSpecificOfferUrl(value) {
  return /\/search\b|[?&](q|query|keyword|keywords)=/i.test(clean(value));
}

function specificOfferUrl(product) {
  for (const key of ["shopee", "tokopedia", "tiktok", "lazada", "website"]) {
    const href = absoluteUrl(product && product.links && product.links[key]);
    if (href && !isNonSpecificOfferUrl(href)) return href;
  }
  return "";
}

function buildPreloadBlock(product) {
  return `  <link rel="preload" as="image" href="${escapeHtmlAttr(product.images[0])}" fetchpriority="high" />`;
}

function buildCardDots(product) {
  if (!product.images || product.images.length < 2) {
    return '            <span class="store-card__dots" aria-hidden="true" hidden></span>';
  }

  const dots = product.images.map((_, index) => `              <span class="store-card__dot${index === 0 ? " is-active" : ""}"></span>`).join("\n");
  return `            <span class="store-card__dots" aria-hidden="true">\n${dots}\n            </span>`;
}

function buildGridBlock(products) {
  return products.map((product, index) => {
    const href = escapeHtmlAttr(product.canonicalUrl);
    const name = escapeHtmlText(product.name);
    const image = escapeHtmlAttr(product.images[0]);
    const category = escapeHtmlText(product.category);
    const priceText = escapeHtmlText(product.priceText);
    const slug = escapeHtmlAttr(product.slug);
    const cardId = escapeHtmlAttr(product.id || product.slug);
    const loading = index === 0 ? "eager" : "lazy";
    const fetchPriority = index === 0 ? "high" : "auto";

    return [
      `        <article class="store-card" data-store-product-id="${cardId}">`,
      `          <a class="store-card__button" href="${href}" aria-label="${escapeHtmlAttr(`Buka ${product.name}`)}" data-store-open-preview="${index}" data-store-product-slug="${slug}">`,
      '            <div class="store-card__media">',
      `              <img src="${image}" width="900" height="1125" alt="${escapeHtmlAttr(product.name)}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}" draggable="false" />`,
      '              <span class="store-card__shade" aria-hidden="true"></span>',
      '              <div class="store-card__content">',
      `                <span class="store-card__badge">${category}</span>`,
      `                <span class="store-card__price">${priceText}</span>`,
      `                <h2 class="store-card__title">${name}</h2>`,
      buildCardDots(product),
      '              </div>',
      '            </div>',
      '          </a>',
      '        </article>',
    ].join("\n");
  }).join("\n");
}

function buildStaticProductsJsonBlock(products) {
  return `  <script type="application/json" id="store-static-products">\n${escapeJsonForScript(products)}\n  </script>`;
}

function buildItemListJsonLdBlock(products) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Yellow Cart product picks",
    url: `${STORE_ORIGIN}${STORE_PATHNAME}`,
    itemListElement: products.map((product, index) => {
      const item = {
        "@type": "Product",
        "@id": `${product.canonicalUrl}#product`,
        name: product.name,
        description: product.summary,
        image: product.images,
        brand: {
          "@type": "Brand",
          name: product.brand || "Generic",
        },
        category: product.category,
      };
      const offerUrl = specificOfferUrl(product);
      if (product.price > 0 && product.priceCurrency && offerUrl) {
        item.offers = {
          "@type": "Offer",
          url: offerUrl,
          price: String(product.price),
          priceCurrency: product.priceCurrency,
        };
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        url: product.canonicalUrl,
        item,
      };
    }),
  };

  return `  <script type="application/ld+json" id="store-itemlist-jsonld">\n${escapeJsonForScript(itemList)}\n  </script>`;
}

function buildSemanticFact(label, value) {
  if (!clean(value)) return "";
  return [
    '          <div class="store-semantic-product__fact">',
    `            <dt class="store-semantic-product__label">${escapeHtmlText(label)}</dt>`,
    `            <dd class="store-semantic-product__value">${escapeHtmlText(value)}</dd>`,
    '          </div>',
  ].join("\n");
}

function buildSemanticProductsBlock(products) {
  if (!products.length) {
    return '          <p class="store-semantic-product__empty" data-copy="semanticEmptyLabel">Product notes will appear here after the curation loads.</p>';
  }

  return products.map((product) => {
    const facts = [
      buildSemanticFact("Why picked", product.whyPicked),
      buildSemanticFact("Best for", product.bestFor.join(" · ") || product.useCase || product.geoContext),
      buildSemanticFact("Caveat", product.caveat),
    ].filter(Boolean);

    return [
      `          <article class="store-semantic-product" id="store-note-${escapeHtmlAttr(product.slug)}">`,
      '            <div class="store-semantic-product__head">',
      `              <p class="store-semantic-product__category">${escapeHtmlText(product.category)}</p>`,
      `              <h3 class="store-semantic-product__title">${escapeHtmlText(product.name)}</h3>`,
      `              <p class="store-semantic-product__summary">${escapeHtmlText(product.summary)}</p>`,
      '            </div>',
      facts.length ? '            <dl class="store-semantic-product__facts">' : '',
      facts.join("\n"),
      facts.length ? '            </dl>' : '',
      '            <div class="store-semantic-product__links">',
      `              <a class="store-button store-button--subtle" href="${escapeHtmlAttr(product.canonicalUrl)}">Editorial detail</a>`,
      `              <a class="store-button" href="${escapeHtmlAttr(product.storeUrl)}" data-store-open-slug="${escapeHtmlAttr(product.slug)}">Open in Store</a>`,
      '            </div>',
      '          </article>',
    ].filter(Boolean).join("\n");
  }).join("\n");
}

function buildLcpProductScript(product) {
  return [
    "    var STORE_LCP_PRODUCT = {",
    `      slug: ${JSON.stringify(product.slug)},`,
    `      name: ${JSON.stringify(product.name)},`,
    `      category: ${JSON.stringify(product.category)},`,
    `      priceText: ${JSON.stringify(product.priceText)},`,
    `      image: ${JSON.stringify(product.images[0])},`,
    `      alt: ${JSON.stringify(product.name)}`,
    "    };",
  ].join("\n");
}

function readExistingStaticProducts(storeSource) {
  const scriptText = extractScriptTextById(storeSource, "store-static-products");
  if (!clean(scriptText)) return [];

  try {
    const parsed = JSON.parse(scriptText);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSnapshotProduct).filter((product) => !validateProduct(product).length);
  } catch (error) {
    warn(`existing #store-static-products snapshot is invalid and will be ignored: ${error.message}`);
    return [];
  }
}

function readLcpFallbackProducts() {
  if (!existsSync(LCP_FALLBACK_PATH)) return [];
  const config = readJson(LCP_FALLBACK_PATH);
  const slug = slugify(config.slug || config.name || "");
  if (!slug || !clean(config.name) || !clean(config.category) || !clean(config.priceText) || !absoluteUrl(config.image)) {
    warn("config/store-lcp-product.json is present but incomplete; skipping fallback seed");
    return [];
  }

  return [
    normalizeSnapshotProduct({
      id: slug,
      slug,
      name: clean(config.name),
      category: clean(config.category),
      priceText: clean(config.priceText),
      image: absoluteUrl(config.image),
      canonicalUrl: storeAbsoluteUrl(slug),
      storeUrl: storeAbsoluteUrl(slug),
      summary: "Curated Yellow Cart product.",
    }),
  ];
}

function reuseExistingSnapshotOrFail(storeSource, reason) {
  const existingStatic = readExistingStaticProducts(storeSource);
  if (existingStatic.length) {
    warn(`${reason}; reusing existing static snapshot (${existingStatic.length} product${existingStatic.length === 1 ? "" : "s"})`);
    return { products: existingStatic, source: "existing-static" };
  }

  const fallbackSeed = readLcpFallbackProducts();
  if (fallbackSeed.length) {
    warn(`${reason}; using config/store-lcp-product.json as an emergency static seed`);
    return { products: fallbackSeed, source: "lcp-fallback" };
  }

  fail(reason);
}

async function fetchFeedEntries() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(FEED_URL, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`feed request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const entries = payload && payload.feed && Array.isArray(payload.feed.entry) ? payload.feed.entry : [];

    if (!entries.length) throw new Error("feed returned no Store entries");
    return entries;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveProducts(storeSource) {
  try {
    const entries = await fetchFeedEntries();
    const normalized = entries.map(normalizeEntryProduct);
    const errors = normalized.flatMap((result) => result.errors || []);
    const products = sortProducts(normalized.map((result) => result.product).filter(Boolean));

    if (errors.length) {
      if (SOFT_MODE) {
        warn(`soft mode kept build running after validation issues:\n- ${errors.join("\n- ")}`);
      } else {
        return reuseExistingSnapshotOrFail(storeSource, `live Store feed failed validation:\n- ${errors.join("\n- ")}`);
      }
    }

    if (!products.length) fail("feed returned no valid products after normalization");

    return { products, source: "feed" };
  } catch (error) {
    return reuseExistingSnapshotOrFail(storeSource, `live Store feed unavailable; ${error.message}`);
  }
}

const originalStoreSource = read(STORE_PATH);
const { products, source } = await resolveProducts(originalStoreSource);
const firstProduct = products[0];

let nextStoreSource = originalStoreSource;
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->", buildPreloadBlock(firstProduct));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->", buildGridBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->", buildStaticProductsJsonBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->", buildItemListJsonLdBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->", buildSemanticProductsBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "// STORE_LCP_PRODUCT_START", "// STORE_LCP_PRODUCT_END", buildLcpProductScript(firstProduct));

if (nextStoreSource !== originalStoreSource) {
  writeFileSync(STORE_PATH, nextStoreSource, "utf8");
}

console.log("STORE STATIC BUILD OK");
console.log(`source=${source}`);
console.log(`products=${products.length}`);
console.log(`status=${nextStoreSource === originalStoreSource ? "unchanged" : "updated"}`);
