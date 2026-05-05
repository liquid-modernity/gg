#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import path from "node:path";

import {
  STORE_ASSET_CSS_HREF,
  STORE_ASSET_JS_HREF,
  STORE_FEED_URL,
  STORE_ORIGIN,
  SYSTEM_LABELS,
  storeAbsoluteUrl,
} from "../src/store/store.config.mjs";
import { buildStoreJsonLd } from "../src/store/lib/build-store-jsonld.mjs";
import { buildStoreManifest } from "../src/store/lib/build-store-manifest.mjs";
import { renderCategoryPage } from "../src/store/lib/render-category-page.mjs";
import { CATEGORY_PAGE_SIZE, productsForCategory, storeCategoryRoutes } from "../src/store/lib/store-routes.mjs";
import { extractFeedProducts } from "../src/store/lib/extract-feed-products.mjs";
import { extractScriptTextById, extractStaticProductsFromStoreHtml } from "../src/store/lib/extract-static-products.mjs";
import {
  absoluteUrl,
  arr,
  clean,
  cleanFirst,
  cleanTextList,
  dateValue,
  detectPriceCurrency,
  lower,
  normalizeStoreProduct,
  parsePriceValue,
  unique,
} from "../src/store/lib/normalize-store-product.mjs";
import { buildStoreReport, formatStoreReport } from "../src/store/lib/store-report.mjs";
import { isDummyProduct, validateStoreProduct } from "../src/store/lib/validate-store-product.mjs";

const ROOT = process.cwd();
const FLAGS_PATH = path.resolve(ROOT, "flags.json");
const STORE_PATH = path.resolve(ROOT, "store.html");
const LCP_FALLBACK_PATH = path.resolve(ROOT, "config/store-lcp-product.json");
const STORE_SOURCE_DIR = path.resolve(ROOT, "src/store");
const STORE_CRITICAL_CSS_PATH = path.resolve(STORE_SOURCE_DIR, "store.critical.css");
const STORE_CSS_SOURCE_PATH = path.resolve(STORE_SOURCE_DIR, "store.css");
const STORE_JS_SOURCE_PATH = path.resolve(STORE_SOURCE_DIR, "store.js");
const STORE_ASSET_DIR = path.resolve(ROOT, "assets/store");
const STORE_ASSET_CSS_PATH = path.resolve(STORE_ASSET_DIR, "store.css");
const STORE_ASSET_JS_PATH = path.resolve(STORE_ASSET_DIR, "store.js");
const STORE_MANIFEST_REPORT_PATH = "store/data/manifest.json";
const STORE_MANIFEST_PATH = path.resolve(ROOT, STORE_MANIFEST_REPORT_PATH);
const STORE_MANIFEST_DIST_PATH = path.resolve(ROOT, "dist/store/data/manifest.json");
const STORE_BUILD_REPORT_PATH = path.resolve(ROOT, "dist/store-build-report.json");
const STORE_FEED_CACHE_PATH = clean(process.env.GG_STORE_FEED_JSON_PATH || "");
const STORE_FEED_PROBE_WARNING = clean(process.env.GG_STORE_FEED_PROBE_WARNING || "");
const SOFT_MODE = process.argv.includes("--soft");
const STORE_CI = isTruthyEnv(process.env.STORE_CI);
const STORE_REQUIRE_LIVE_FEED = isTruthyEnv(process.env.STORE_REQUIRE_LIVE_FEED);
const STORE_STRICT_IMAGES = isTruthyEnv(process.env.STORE_STRICT_IMAGES);
const STORE_STRICT_MODE = STORE_REQUIRE_LIVE_FEED || STORE_STRICT_IMAGES;
const STORE_SKIP_NETWORK_FEED = isTruthyEnv(process.env.GG_STORE_SKIP_NETWORK_FEED);
const STORE_FEED_TIMEOUT_MS = parseTimeoutMs(process.env.STORE_FEED_TIMEOUT_SECONDS, 20);
const LEGACY_PRODUCT_REPLACEMENTS = new Map([
  ["desk-tray-organizer", "minimal-desk-tray-organizer"],
]);
let LAST_MACHINE_REPORT = null;

function isTruthyEnv(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function parseTimeoutMs(value, fallbackSeconds) {
  const seconds = Number.parseInt(String(value || fallbackSeconds), 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : fallbackSeconds * 1000;
}

function validationMode() {
  return "development";
}

function writeMachineReport(report) {
  const normalized = {
    timestamp: new Date().toISOString(),
    ...report,
  };

  mkdirSync(path.dirname(STORE_BUILD_REPORT_PATH), { recursive: true });
  writeFileSync(STORE_BUILD_REPORT_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  LAST_MACHINE_REPORT = normalized;
  return normalized;
}

function buildMachineReport({ source = "unknown", report = null, status = "unknown", warnings = [], error = "" } = {}) {
  const sourceReport = report && typeof report === "object" ? report : {};
  return {
    source,
    sourceType: sourceReport.sourceType || source,
    products: Number(sourceReport.productCount || 0),
    categoryCounts: sourceReport.categoryCounts || {},
    feedEntries: Number(sourceReport.feedEntries || 0),
    validProducts: Number(sourceReport.validProducts || sourceReport.productCount || 0),
    invalidProducts: Number(sourceReport.invalidProducts || 0),
    imageSourceSummary: sourceReport.imageSources || {},
    imageSourceSummaryText: sourceReport.imageSourceSummary || "",
    warnings: unique(arr(sourceReport.warnings).concat(arr(warnings)).filter(Boolean)),
    strict: STORE_STRICT_MODE,
    strictImages: STORE_STRICT_IMAGES,
    requireLiveFeed: STORE_REQUIRE_LIVE_FEED,
    ci: STORE_CI,
    manifestPath: clean(sourceReport.manifestPath),
    manifestBytes: Number(sourceReport.manifestBytes || 0),
    manifestItems: Number(sourceReport.manifestItems || 0),
    manifestCategories: Array.isArray(sourceReport.manifestCategories) ? sourceReport.manifestCategories : [],
    categoryPages: Array.isArray(sourceReport.categoryPages) ? sourceReport.categoryPages : [],
    status,
    pageCount: Number(sourceReport.pageCount || 0),
    error: clean(error),
  };
}

function fail(message) {
  try {
    if (!LAST_MACHINE_REPORT) {
      writeMachineReport(buildMachineReport({
        status: "failed",
        warnings: [message, STORE_FEED_PROBE_WARNING ? `STORE FEED PROBE WARN ${STORE_FEED_PROBE_WARNING}` : ""],
        error: message,
      }));
    } else if (LAST_MACHINE_REPORT.status !== "failed") {
      writeMachineReport({
        ...LAST_MACHINE_REPORT,
        status: "failed",
        error: clean(message),
        warnings: unique(arr(LAST_MACHINE_REPORT.warnings).concat(message).filter(Boolean)),
      });
    }
  } catch (error) {
    // Best effort only; build errors should still surface even if report writing fails.
  }
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

function readMode() {
  if (!existsSync(FLAGS_PATH)) return "development";
  const flags = readJson(FLAGS_PATH);
  const mode = clean(flags?.mode || "development").toLowerCase() || "development";
  if (["development", "staging", "production"].includes(mode)) return mode;
  fail(`flags.json has an invalid mode (${JSON.stringify(flags?.mode)})`);
}

function readFeedPayloadCache(filePath) {
  if (!filePath) return null;

  try {
    const payload = JSON.parse(readFileSync(filePath, "utf8"));
    if (Array.isArray(payload?.feed?.entry) && payload.feed.entry.length) return payload;
    warn(`prefetched store feed cache is missing entries: ${filePath}`);
  } catch (error) {
    warn(`unable to read prefetched store feed cache ${filePath}: ${error.message}`);
  }

  return null;
}

function normalizeTextFile(value) {
  return String(value).replace(/\r\n/g, "\n").trimEnd() + "\n";
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

function writeTextFile(filePath, value) {
  const nextValue = normalizeTextFile(value);
  const prevValue = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  mkdirSync(path.dirname(filePath), { recursive: true });
  if (prevValue !== nextValue) writeFileSync(filePath, nextValue, "utf8");
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

function buildCriticalCssBlock(cssSource) {
  return `  <style>\n${normalizeTextFile(cssSource).trimEnd()}\n  </style>`;
}

function buildAssetCssLink() {
  return `  <link rel="stylesheet" href="${STORE_ASSET_CSS_HREF}" />`;
}

function buildRuntimeScriptTag() {
  return `  <script src="${STORE_ASSET_JS_HREF}" defer></script>`;
}

function syncStoreAssets() {
  const criticalCss = read(STORE_CRITICAL_CSS_PATH);
  const storeCss = read(STORE_CSS_SOURCE_PATH);
  const storeJs = read(STORE_JS_SOURCE_PATH);

  mkdirSync(STORE_ASSET_DIR, { recursive: true });

  return {
    criticalCss: normalizeTextFile(criticalCss),
    storeCss: normalizeTextFile(storeCss),
    storeJs: normalizeTextFile(storeJs),
  };
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

function text(node) {
  return node && typeof node.$t === "string" ? node.$t : "";
}

function entryAlternateUrl(entry) {
  const links = arr(entry?.link);
  for (const link of links) {
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
    return JSON.parse(bodyMatch[1]);
  }
  return {};
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

function normalizeEntryProduct(entry, index) {
  const html = text(entry?.content || entry?.summary);
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
    return { errors: [`entry ${index + 1}: invalid gg-store-data JSON: ${error.message}`] };
  }

  const title = clean(data.name || data.title || text(entry?.title));
  const rawProduct = {
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
    images: unique(arr(data.images).concat(arr(data.image)).concat(fallbackImages).map(absoluteUrl).filter(Boolean)),
    links: normalizeLinks(data.links, fallbackLinks),
    canonicalUrl: absoluteUrl(data.canonicalUrl || data.url || fallbackUrl),
    storeUrl: absoluteUrl(data.storeUrl),
    datePublished: clean(data.datePublished || text(entry?.published)),
    dateModified: clean(data.dateModified || text(entry?.updated)),
  };

  return { product: normalizeStoreProduct(rawProduct), errors: [] };
}

function sortProductEntries(entries) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const aModified = dateValue(a.entry.product.dateModified);
      const bModified = dateValue(b.entry.product.dateModified);
      const aPublished = dateValue(a.entry.product.datePublished);
      const bPublished = dateValue(b.entry.product.datePublished);

      if (Number.isFinite(aModified) && Number.isFinite(bModified) && aModified !== bModified) return bModified - aModified;
      if (Number.isFinite(aModified) !== Number.isFinite(bModified)) return Number.isFinite(bModified) ? 1 : -1;
      if (Number.isFinite(aPublished) && Number.isFinite(bPublished) && aPublished !== bPublished) return bPublished - aPublished;
      if (Number.isFinite(aPublished) !== Number.isFinite(bPublished)) return Number.isFinite(bPublished) ? 1 : -1;
      return a.index - b.index;
    })
    .map((entry) => entry.entry);
}

function wrapProducts(products, imageSource = "existing-static-fallback") {
  return products.map((product) => ({
    product: normalizeStoreProduct(product),
    imageSource,
    warnings: [],
    errors: [],
  }));
}

function replacedLegacySlugs(entries) {
  const slugs = new Set(entries.map((entry) => entry?.product?.slug).filter(Boolean));
  const replaced = new Map();

  for (const [legacySlug, replacementSlug] of LEGACY_PRODUCT_REPLACEMENTS) {
    if (slugs.has(legacySlug) && slugs.has(replacementSlug)) replaced.set(legacySlug, replacementSlug);
  }

  return replaced;
}

function governProducts(entries, options = {}) {
  const sourceType = clean(options.sourceType);
  const mode = clean(options.mode || validationMode()).toLowerCase() || validationMode();
  const feedEntries = Number.isFinite(options.feedEntries) ? options.feedEntries : arr(entries).length;
  const normalized = sortProductEntries(
    arr(entries)
      .filter((entry) => entry?.product)
      .map((entry) => ({
        ...entry,
        product: normalizeStoreProduct(entry.product),
      }))
  );
  const output = [];
  const keptEntries = [];
  const warnings = [];
  const errors = [];
  const duplicateSlugs = [];
  const removedInvalidProducts = [];
  const seen = new Set();
  const replacedSlugs = replacedLegacySlugs(normalized);

  for (const entry of normalized) {
    const product = entry.product;
    const productLabel = product.slug || product.name || "unknown";
    const validation = validateStoreProduct(product, { mode, imageSource: entry.imageSource });

    warnings.push(...arr(entry.warnings).map((message) => `${productLabel}: ${message}`));
    warnings.push(...validation.warnings.map((message) => `${productLabel}: ${message}`));

    if (replacedSlugs.has(product.slug)) {
      removedInvalidProducts.push({
        slug: product.slug,
        name: product.name,
        reason: `replaced by ${replacedSlugs.get(product.slug)}`,
      });
      continue;
    }

    if (isDummyProduct(product)) {
      removedInvalidProducts.push({ slug: product.slug, name: product.name, reason: "dummy product" });
      continue;
    }

    if (arr(entry.errors).length) {
      errors.push(...entry.errors.map((message) => `${productLabel}: ${message}`));
      continue;
    }

    if (validation.errors.length) {
      errors.push(`${productLabel}: ${validation.errors.join(", ")}`);
      continue;
    }

    if (seen.has(product.slug)) {
      duplicateSlugs.push(product.slug);
      removedInvalidProducts.push({ slug: product.slug, name: product.name, reason: "duplicate slug" });
      continue;
    }

    seen.add(product.slug);
    output.push(product);
    keptEntries.push({
      ...entry,
      product,
    });
  }

  const report = buildStoreReport({
    products: output,
    productEntries: keptEntries,
    removedInvalidProducts,
    duplicateSlugs: unique(duplicateSlugs),
    warnings: unique(warnings),
    sourceType,
    feedEntries,
    invalidProducts: errors.length,
  });

  return {
    products: output,
    errors,
    report,
  };
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
      "            <div class=\"store-card__media\">",
      `              <img src="${image}" width="900" height="1125" alt="${escapeHtmlAttr(product.name)}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}" draggable="false" />`,
      "              <span class=\"store-card__shade\" aria-hidden=\"true\"></span>",
      "              <div class=\"store-card__content\">",
      `                <span class="store-card__badge">${category}</span>`,
      `                <span class="store-card__price">${priceText}</span>`,
      `                <h2 class="store-card__title">${name}</h2>`,
      buildCardDots(product),
      "              </div>",
      "            </div>",
      "          </a>",
      "        </article>",
    ].join("\n");
  }).join("\n");
}

function buildStaticProductsJsonBlock(products) {
  return `  <script type="application/json" id="store-static-products">\n${escapeJsonForScript(products)}\n  </script>`;
}

function buildItemListJsonLdBlock(products) {
  return `  <script type="application/ld+json" id="store-itemlist-jsonld">\n${escapeJsonForScript(buildStoreJsonLd(products))}\n  </script>`;
}

function buildStoreReportBlock(report) {
  return `  <script type="application/json" id="store-build-report">\n${escapeJsonForScript(report)}\n  </script>`;
}

function buildSemanticFact(label, value) {
  if (!clean(value)) return "";
  return [
    "          <div class=\"store-semantic-product__fact\">",
    `            <dt class="store-semantic-product__label">${escapeHtmlText(label)}</dt>`,
    `            <dd class="store-semantic-product__value">${escapeHtmlText(value)}</dd>`,
    "          </div>",
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
      "            <div class=\"store-semantic-product__head\">",
      `              <p class="store-semantic-product__category">${escapeHtmlText(product.category)}</p>`,
      `              <h3 class="store-semantic-product__title">${escapeHtmlText(product.name)}</h3>`,
      `              <p class="store-semantic-product__summary">${escapeHtmlText(product.summary)}</p>`,
      "            </div>",
      facts.length ? "            <dl class=\"store-semantic-product__facts\">" : "",
      facts.join("\n"),
      facts.length ? "            </dl>" : "",
      "            <div class=\"store-semantic-product__links\">",
      `              <a class="store-button store-button--subtle" href="${escapeHtmlAttr(product.canonicalUrl)}">Editorial detail</a>`,
      `              <a class="store-button" href="${escapeHtmlAttr(product.storeUrl)}" data-store-open-slug="${escapeHtmlAttr(product.slug)}">Open in Store</a>`,
      "            </div>",
      "          </article>",
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
  try {
    return extractStaticProductsFromStoreHtml(storeSource).map((product) => normalizeStoreProduct(product));
  } catch (error) {
    warn(`existing #store-static-products snapshot is invalid and will be ignored: ${error.message}`);
    return [];
  }
}

function readLcpFallbackProducts() {
  if (!existsSync(LCP_FALLBACK_PATH)) return [];
  const config = readJson(LCP_FALLBACK_PATH);
  const fallback = normalizeStoreProduct({
    id: clean(config.slug || config.name),
    slug: clean(config.slug),
    name: clean(config.name),
    category: clean(config.category),
    priceText: clean(config.priceText),
    images: [absoluteUrl(config.image)],
    canonicalUrl: config.canonicalUrl || storeAbsoluteUrl(clean(config.slug || config.name)),
    storeUrl: config.storeUrl || storeAbsoluteUrl(clean(config.slug || config.name)),
    summary: "Curated Yellow Cart product.",
  });
  const validation = validateStoreProduct(fallback, { mode: "development" });

  if (validation.errors.length) {
    warn("config/store-lcp-product.json is present but incomplete; skipping fallback seed");
    return [];
  }

  return [fallback];
}

function reuseExistingSnapshotOrFail(storeSource, reason) {
  const existingStatic = readExistingStaticProducts(storeSource);
  if (existingStatic.length) {
    warn(`${reason}; reusing existing static snapshot (${existingStatic.length} product${existingStatic.length === 1 ? "" : "s"})`);
    const governed = governProducts(wrapProducts(existingStatic), {
      sourceType: "existing-static",
      mode: validationMode(),
      feedEntries: existingStatic.length,
    });
    if (!governed.products.length) fail(`${reason}; existing static snapshot yielded no valid products`);
    if (governed.errors.length) fail(`${reason}; existing static snapshot failed validation:\n- ${governed.errors.join("\n- ")}`);
    return { products: governed.products, source: "existing-static", report: governed.report };
  }

  const fallbackSeed = readLcpFallbackProducts();
  if (fallbackSeed.length) {
    warn(`${reason}; using config/store-lcp-product.json as an emergency static seed`);
    const governed = governProducts(wrapProducts(fallbackSeed), {
      sourceType: "lcp-fallback",
      mode: validationMode(),
      feedEntries: fallbackSeed.length,
    });
    if (!governed.products.length || governed.errors.length) fail(`${reason}; lcp fallback failed validation`);
    return { products: governed.products, source: "lcp-fallback", report: governed.report };
  }

  fail(reason);
}

async function fetchFeedPage(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { accept: "application/json" } }, (response) => {
      const status = Number(response.statusCode || 0);
      const location = absoluteUrl(response.headers.location || "", url);

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        response.resume();
        resolve(fetchFeedPage(location, attempt));
        return;
      }

      if (status < 200 || status >= 300) {
        response.resume();
        reject(new Error(`feed request failed with status ${status}`));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`feed payload is not valid JSON: ${error.message}`));
        }
      });
    });

    request.setTimeout(STORE_FEED_TIMEOUT_MS, () => {
      request.destroy(new Error("feed request timed out"));
    });

    request.on("error", (error) => {
      if (attempt < 2) resolve(fetchFeedPage(url, attempt + 1));
      else reject(error);
    });
  });
}

function nextFeedUrl(payload) {
  for (const link of arr(payload?.feed?.link)) {
    if (clean(link?.rel) === "next") return absoluteUrl(link?.href);
  }
  return "";
}

async function fetchFeedEntries() {
  const entries = [];
  const seen = new Set();
  let nextUrl = STORE_FEED_URL;
  let pageCount = 0;
  const cachedPayload = readFeedPayloadCache(STORE_FEED_CACHE_PATH);

  if (cachedPayload) {
    const cachedEntries = Array.isArray(cachedPayload?.feed?.entry) ? cachedPayload.feed.entry : [];
    entries.push(...cachedEntries);
    pageCount += 1;
    nextUrl = nextFeedUrl(cachedPayload);
    if (!nextUrl) return { entries, pageCount };
    if (STORE_SKIP_NETWORK_FEED) {
      throw new Error("feed probe cached only the first page and network fetch is disabled");
    }
  } else if (STORE_SKIP_NETWORK_FEED) {
    throw new Error(`feed probe unavailable${STORE_FEED_PROBE_WARNING ? `: ${STORE_FEED_PROBE_WARNING}` : ""}`);
  }

  while (nextUrl) {
    if (seen.has(nextUrl)) throw new Error("feed pagination loop detected");
    seen.add(nextUrl);
    pageCount += 1;

    const payload = await fetchFeedPage(nextUrl);
    const pageEntries = Array.isArray(payload?.feed?.entry) ? payload.feed.entry : [];
    if (!pageEntries.length && !entries.length) throw new Error("feed returned no Store entries");
    entries.push(...pageEntries);
    nextUrl = nextFeedUrl(payload);
  }

  if (!entries.length) throw new Error("feed returned no Store entries");

  return { entries, pageCount };
}

async function resolveProducts(storeSource) {
  const mode = validationMode();
  const existingStaticProducts = readExistingStaticProducts(storeSource);
  const existingProductsBySlug = new Map(existingStaticProducts.map((product) => [product.slug, product]));
  const fallbackResult = (reason) => {
    const fallback = reuseExistingSnapshotOrFail(storeSource, reason);
    return {
      ...fallback,
      fallbackReason: reason,
      fatalError: STORE_REQUIRE_LIVE_FEED ? `STORE_REQUIRE_LIVE_FEED=1 blocked static fallback: ${reason}` : "",
    };
  };

  try {
    const { entries, pageCount } = await fetchFeedEntries();
    const extracted = extractFeedProducts(entries, { existingProductsBySlug });
    const governed = governProducts(extracted.items, {
      sourceType: "live-feed",
      mode,
      feedEntries: extracted.entryCount,
    });
    governed.report.pageCount = pageCount;
    const hardErrors = governed.errors.slice();

    if (hardErrors.length) {
      if (SOFT_MODE) {
        warn(`soft mode kept build running after validation issues:\n- ${hardErrors.join("\n- ")}`);
      } else {
        return fallbackResult(`live Store feed failed validation:\n- ${hardErrors.join("\n- ")}`);
      }
    }

    if (!governed.products.length) fail("feed returned no valid products after normalization");

    return { products: governed.products, source: "live-feed", report: governed.report };
  } catch (error) {
    return fallbackResult(`live Store feed unavailable; ${error.message}`);
  }
}

const originalStoreSource = read(STORE_PATH);
const { products, source, report, fatalError = "", fallbackReason = "" } = await resolveProducts(originalStoreSource);
const buildWarnings = unique(arr(report?.warnings).concat([
  fallbackReason,
  STORE_FEED_PROBE_WARNING ? `STORE FEED PROBE WARN ${STORE_FEED_PROBE_WARNING}` : "",
]).filter(Boolean));

if (fatalError) {
  writeMachineReport(buildMachineReport({
    source,
    report: {
      ...report,
      warnings: buildWarnings,
    },
    status: "failed",
    warnings: buildWarnings,
    error: fatalError,
  }));
  fail(fatalError);
}

const firstProduct = products[0];
const { criticalCss, storeCss, storeJs } = syncStoreAssets();
const nextStoreAssetJs = replaceMarkedRegion(storeJs, "// STORE_LCP_PRODUCT_START", "// STORE_LCP_PRODUCT_END", buildLcpProductScript(firstProduct));
const manifest = buildStoreManifest(products, { source });
const manifestContent = normalizeTextFile(JSON.stringify(manifest, null, 2));
const manifestBytes = Buffer.byteLength(manifestContent, "utf8");
const categoryPageSummary = storeCategoryRoutes().map((route) => {
  const categoryProducts = productsForCategory(products, route.key);
  return {
    key: route.key,
    label: route.label,
    path: route.path,
    canonicalUrl: route.canonicalUrl,
    outputPath: route.nestedOutputPath,
    flatOutputPath: route.flatOutputPath,
    totalProducts: categoryProducts.length,
    visibleProducts: Math.min(categoryProducts.length, CATEGORY_PAGE_SIZE),
    pageSize: CATEGORY_PAGE_SIZE,
    needsPagination: categoryProducts.length > CATEGORY_PAGE_SIZE,
  };
});

report.manifestPath = STORE_MANIFEST_REPORT_PATH;
report.manifestBytes = manifestBytes;
report.manifestItems = manifest.items.length;
report.manifestCategories = manifest.categories.map((entry) => ({ ...entry }));
report.categoryPages = categoryPageSummary.map((entry) => ({ ...entry }));

writeTextFile(STORE_ASSET_CSS_PATH, storeCss);
writeTextFile(STORE_ASSET_JS_PATH, nextStoreAssetJs);
writeTextFile(STORE_MANIFEST_PATH, manifestContent);
writeTextFile(STORE_MANIFEST_DIST_PATH, manifestContent);

let nextStoreSource = originalStoreSource;
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_CRITICAL_CSS_START -->", "<!-- STORE_CRITICAL_CSS_END -->", buildCriticalCssBlock(criticalCss));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_ASSET_CSS_START -->", "<!-- STORE_ASSET_CSS_END -->", buildAssetCssLink());
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->", buildPreloadBlock(firstProduct));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->", buildGridBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->", buildStaticProductsJsonBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->", buildItemListJsonLdBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->", buildSemanticProductsBlock(products));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_BUILD_REPORT_START -->", "<!-- STORE_BUILD_REPORT_END -->", buildStoreReportBlock(report));
nextStoreSource = replaceMarkedRegion(nextStoreSource, "<!-- STORE_RUNTIME_JS_START -->", "<!-- STORE_RUNTIME_JS_END -->", buildRuntimeScriptTag());

if (nextStoreSource !== originalStoreSource) {
  writeFileSync(STORE_PATH, nextStoreSource, "utf8");
}

for (const route of storeCategoryRoutes()) {
  const categoryPage = renderCategoryPage({
    template: nextStoreSource,
    products,
    categoryKey: route.key,
    report,
  });
  writeTextFile(path.resolve(ROOT, categoryPage.route.nestedOutputPath), categoryPage.html);
  writeTextFile(path.resolve(ROOT, categoryPage.route.flatOutputPath), categoryPage.html);
}

writeMachineReport(buildMachineReport({
  source,
  report: {
    ...report,
    warnings: buildWarnings,
  },
  status: nextStoreSource === originalStoreSource ? "unchanged" : "updated",
  warnings: buildWarnings,
}));

console.log("STORE STATIC BUILD OK");
console.log(`source=${source}`);
console.log(`products=${products.length}`);
console.log(`status=${nextStoreSource === originalStoreSource ? "unchanged" : "updated"}`);
for (const line of formatStoreReport(report)) console.log(line);
