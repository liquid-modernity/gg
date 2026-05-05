#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  CRITICAL_CSS_BUDGET_BYTES,
  STORE_ASSET_CSS_HREF,
  STORE_ASSET_JS_HREF,
  STORE_FEED_PATH,
  STORE_LEGACY_FEED_PATH,
} from "../src/store/store.config.mjs";
import { STORE_MANIFEST_VERSION } from "../src/store/lib/build-store-manifest.mjs";
import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryCounts } from "../src/store/lib/category-config.mjs";
import { extractMarkedRegion, extractStaticProductsFromStoreHtml, parseJsonScript } from "../src/store/lib/extract-static-products.mjs";
import { normalizeStoreProduct, slugEndsWithHtml, slugLooksLikeUrl } from "../src/store/lib/normalize-store-product.mjs";
import { CATEGORY_PAGE_SIZE, productCategoryKey, storeCategoryRoutes } from "../src/store/lib/store-routes.mjs";
import { isDummyProduct, validateStoreProduct } from "../src/store/lib/validate-store-product.mjs";

const ROOT = process.cwd();
const TARGET_PATH = path.resolve(ROOT, process.argv[2] || "store.html");
const TARGET_ROOT = path.dirname(TARGET_PATH);
const WORKER_PATH = path.resolve(ROOT, "worker.js");
const FLAGS_PATH = path.resolve(ROOT, "flags.json");
const STORE_ASSET_CSS_PATH = path.resolve(ROOT, "assets/store/store.css");
const STORE_ASSET_JS_PATH = path.resolve(ROOT, "assets/store/store.js");
const STORE_MANIFEST_PATH = path.resolve(TARGET_ROOT, "store/data/manifest.json");
const source = readFileSync(TARGET_PATH, "utf8");
const failures = [];
const warnings = [];
const STORE_REQUIRE_LIVE_FEED = isTruthyEnv(process.env.STORE_REQUIRE_LIVE_FEED);
const STORE_STRICT_IMAGES = isTruthyEnv(process.env.STORE_STRICT_IMAGES);
const STORE_STRICT_MODE = STORE_REQUIRE_LIVE_FEED || STORE_STRICT_IMAGES;
const STORE_PROOF_ALLOW_REPORT_DRIFT = isTruthyEnv(process.env.STORE_PROOF_ALLOW_REPORT_DRIFT);

function isTruthyEnv(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function reportDrift(message) {
  if (STORE_PROOF_ALLOW_REPORT_DRIFT) warn(message);
  else fail(message);
}

function countOccurrences(text, needle) {
  return (text.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function scriptTags(text) {
  return text.match(/<script\b[\s\S]*?<\/script>/gi) || [];
}

function styleTags(text) {
  return text.match(/<style\b[\s\S]*?<\/style>/gi) || [];
}

function anchorTags(text) {
  return text.match(/<a\b[\s\S]*?<\/a>/gi) || [];
}

function imageTags(text) {
  return text.match(/<img\b[^>]*>/gi) || [];
}

function preloadTags(text) {
  return text.match(/<link\b[^>]*rel=["']preload["'][^>]*>/gi) || [];
}

function tagAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function tagBody(tag) {
  const match = tag.match(/>([\s\S]*?)<\/script>/i) || tag.match(/>([\s\S]*?)<\/style>/i);
  return match ? match[1] : "";
}

function isThemeBootScript(body) {
  return /gg:theme/.test(body) && /data-gg-theme/.test(body) && /localStorage/.test(body);
}

function isNonSpecificOfferUrl(value) {
  return /\/search\b|[?&](q|query|keyword|keywords)=|[?&]st=product(?:&|$)/i.test(String(value || ""));
}

function hasType(node, expected) {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  return types.filter(Boolean).includes(expected);
}

function graphNodes(schema) {
  if (!schema) return [];
  if (Array.isArray(schema["@graph"])) return schema["@graph"];
  return [schema];
}

function findGraphNode(nodes, expectedType, idSuffix = "") {
  return nodes.find((node) => hasType(node, expectedType) && (!idSuffix || String(node["@id"] || "").endsWith(idSuffix))) || null;
}

function manifestCategoryMap(categories = []) {
  const map = new Map();
  for (const entry of Array.isArray(categories) ? categories : []) {
    map.set(String(entry?.key || ""), entry || {});
  }
  return map;
}

function validateInlineRuntimeScripts(pageSource, pageLabel) {
  const tags = scriptTags(pageSource);
  for (const tag of tags) {
    const src = tagAttr(tag, "src");
    const type = String(tagAttr(tag, "type") || "").toLowerCase();
    const body = tagBody(tag).trim();
    if (src || !body) continue;
    if (type === "application/ld+json" || type === "application/json") continue;
    if (isThemeBootScript(body)) continue;
    fail(`${pageLabel}: unexpected inline runtime JavaScript remains`);
  }
}

let mode = "development";
if (existsSync(FLAGS_PATH)) {
  try {
    const flags = JSON.parse(readFileSync(FLAGS_PATH, "utf8"));
    mode = String(flags.mode || "development");
    if (!["development", "staging", "production"].includes(mode)) {
      fail(`flags.json has an invalid mode (${JSON.stringify(flags.mode)})`);
    }
  } catch (error) {
    fail(`flags.json is not valid JSON: ${error.message}`);
  }
}

const gridRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->");
const staticProductsRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->");
const jsonLdRegion = extractMarkedRegion(source, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->");
const semanticRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->");
const preloadRegion = extractMarkedRegion(source, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->");
const criticalCssRegion = extractMarkedRegion(source, "<!-- STORE_CRITICAL_CSS_START -->", "<!-- STORE_CRITICAL_CSS_END -->");
const assetCssRegion = extractMarkedRegion(source, "<!-- STORE_ASSET_CSS_START -->", "<!-- STORE_ASSET_CSS_END -->");
const buildReportRegion = extractMarkedRegion(source, "<!-- STORE_BUILD_REPORT_START -->", "<!-- STORE_BUILD_REPORT_END -->");
const runtimeAssetRegion = extractMarkedRegion(source, "<!-- STORE_RUNTIME_JS_START -->", "<!-- STORE_RUNTIME_JS_END -->");

if (!gridRegion) fail("missing STORE_STATIC_GRID markers");
if (!staticProductsRegion) fail("missing STORE_STATIC_PRODUCTS_JSON markers");
if (!jsonLdRegion) fail("missing STORE_ITEMLIST_JSONLD markers");
if (!semanticRegion) fail("missing STORE_STATIC_SEMANTIC_PRODUCTS markers");
if (!preloadRegion) fail("missing STORE_LCP_PRELOAD markers");
if (!criticalCssRegion) fail("missing STORE_CRITICAL_CSS markers");
if (!assetCssRegion) fail("missing STORE_ASSET_CSS markers");
if (!buildReportRegion) fail("missing STORE_BUILD_REPORT markers");
if (!runtimeAssetRegion) fail("missing STORE_RUNTIME_JS markers");

if (!/id=["']store-static-products["']/.test(staticProductsRegion)) fail("STORE_STATIC_PRODUCTS_JSON marker block is missing #store-static-products");
if (!/id=["']store-itemlist-jsonld["']/.test(jsonLdRegion)) fail("STORE_ITEMLIST_JSONLD marker block is missing #store-itemlist-jsonld");
if (!/id=["']store-build-report["']/.test(buildReportRegion)) fail("STORE_BUILD_REPORT marker block is missing #store-build-report");
if (source.includes(STORE_MANIFEST_VERSION)) fail("store manifest must not be injected inline into store.html");

let rawStaticProducts = [];
let schema = null;
let buildReport = null;
let manifest = null;
try {
  rawStaticProducts = extractStaticProductsFromStoreHtml(source);
} catch (error) {
  fail(`invalid JSON in script#store-static-products: ${error.message}`);
}
try {
  schema = parseJsonScript(source, "store-itemlist-jsonld");
} catch (error) {
  fail(`invalid JSON in script#store-itemlist-jsonld: ${error.message}`);
}
try {
  buildReport = parseJsonScript(source, "store-build-report");
} catch (error) {
  fail(`invalid JSON in script#store-build-report: ${error.message}`);
}
if (!existsSync(STORE_MANIFEST_PATH)) {
  fail(`store manifest is missing at ${path.relative(ROOT, STORE_MANIFEST_PATH) || STORE_MANIFEST_PATH}`);
} else {
  try {
    manifest = JSON.parse(readFileSync(STORE_MANIFEST_PATH, "utf8"));
  } catch (error) {
    fail(`store manifest is not valid JSON: ${error.message}`);
  }
}

const staticProducts = rawStaticProducts.map((product) => normalizeStoreProduct(product));
const expectedManifestCounts = categoryCounts(staticProducts);
const graph = graphNodes(schema);
const websiteNode = findGraphNode(graph, "WebSite", "#website");
const organizationNode = findGraphNode(graph, "Organization", "#organization");
const collectionNode = findGraphNode(graph, "CollectionPage", "#collection");
const itemListNode = findGraphNode(graph, "ItemList", "#itemlist") || findGraphNode(graph, "ItemList");
const inlineStyleTags = styleTags(source);
const inlineScriptTags = scriptTags(source);
const criticalStyleTag = inlineStyleTags[0] || "";
const criticalCssText = tagBody(criticalStyleTag).trim();
const headEndIndex = source.indexOf("</head>");
const themeBootScripts = inlineScriptTags.filter((tag) => {
  const src = tagAttr(tag, "src");
  const type = String(tagAttr(tag, "type") || "").toLowerCase();
  if (src || type === "application/ld+json" || type === "application/json") return false;
  return isThemeBootScript(tagBody(tag));
});

if (!/<meta\s+name=["']gg-store-contract["']\s+content=["']store-static-prerender-v1["']\s*\/?>/i.test(source)) {
  fail("missing gg-store-contract marker");
}
if (!source.includes(`data-store-feed-url="${STORE_FEED_PATH}"`)) fail("store feed URL changed or missing");
if (!source.includes(`data-store-legacy-feed-url="${STORE_LEGACY_FEED_PATH}"`)) fail("legacy store feed URL changed or missing");

if (inlineStyleTags.length !== 1) fail(`expected exactly one inline style block, found ${inlineStyleTags.length}`);
if (!/<style\b[^>]*>[\s\S]*<\/style>/i.test(criticalCssRegion)) fail("critical CSS marker block is missing its inline <style>");
if (Buffer.byteLength(criticalCssText, "utf8") > CRITICAL_CSS_BUDGET_BYTES) {
  fail(`critical CSS exceeds 15 KB (${Buffer.byteLength(criticalCssText, "utf8")} bytes)`);
}
if (!/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']\/assets\/store\/store\.css["'][^>]*>/i.test(assetCssRegion)) {
  fail(`store.html does not reference ${STORE_ASSET_CSS_HREF}`);
}
if (!/<script\b[^>]*src=["']\/assets\/store\/store\.js["'][^>]*\bdefer\b[^>]*><\/script>/i.test(runtimeAssetRegion)) {
  fail(`store.html does not reference ${STORE_ASSET_JS_HREF} with defer`);
}
if (countOccurrences(source, STORE_ASSET_CSS_HREF) !== 1) fail(`expected exactly one ${STORE_ASSET_CSS_HREF} reference`);
if (countOccurrences(source, STORE_ASSET_JS_HREF) !== 1) fail(`expected exactly one ${STORE_ASSET_JS_HREF} reference`);
if (themeBootScripts.length !== 1) fail(`expected exactly one inline theme boot script, found ${themeBootScripts.length}`);
if (themeBootScripts.length === 1) {
  const themeScriptIndex = source.indexOf(themeBootScripts[0]);
  if (headEndIndex !== -1 && themeScriptIndex > headEndIndex) fail("theme boot script is not in <head>");
}

for (const tag of inlineScriptTags) {
  const src = tagAttr(tag, "src");
  const type = String(tagAttr(tag, "type") || "").toLowerCase();
  const body = tagBody(tag).trim();
  if (src || !body) continue;
  if (type === "application/ld+json" || type === "application/json") continue;
  if (isThemeBootScript(body)) continue;
  fail("unexpected inline runtime JavaScript remains in store.html");
}

let storeCssAsset = "";
let storeJsAsset = "";
if (!existsSync(STORE_ASSET_CSS_PATH)) fail(`${STORE_ASSET_CSS_HREF} is missing`);
else {
  storeCssAsset = readFileSync(STORE_ASSET_CSS_PATH, "utf8");
  if (!storeCssAsset.trim()) fail(`${STORE_ASSET_CSS_HREF} is empty`);
}
if (!existsSync(STORE_ASSET_JS_PATH)) fail(`${STORE_ASSET_JS_HREF} is missing`);
else {
  storeJsAsset = readFileSync(STORE_ASSET_JS_PATH, "utf8");
  if (!storeJsAsset.trim()) fail(`${STORE_ASSET_JS_HREF} is empty`);
}
if (storeJsAsset && !/marketplaceAriaLabel\(/.test(storeJsAsset)) fail(`runtime marketplace aria-label helper is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/window\.StoreSurface/.test(storeJsAsset)) fail(`runtime StoreSurface contract is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/\/store\/data\/manifest\.json/.test(storeJsAsset)) fail(`runtime discovery manifest fetch path is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/function loadStoreManifest\(/.test(storeJsAsset)) fail(`runtime discovery manifest loader is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/function validateStoreManifest\(/.test(storeJsAsset)) fail(`runtime discovery manifest validator is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/function applyDiscoveryFilters\(/.test(storeJsAsset)) fail(`runtime discovery filter model is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/function fallbackDiscoveryItems\(/.test(storeJsAsset)) fail(`runtime discovery static fallback is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/storeManifestCache/.test(storeJsAsset)) fail(`runtime discovery manifest cache is missing from ${STORE_ASSET_JS_HREF}`);
if (storeJsAsset && !/discoveryManifestState = ["']fallback["']/.test(storeJsAsset)) fail(`runtime discovery manifest failure fallback is missing from ${STORE_ASSET_JS_HREF}`);
if (!/id=["']store-discovery-search["'][^>]*\baria-label=/.test(source)) reportDrift("Discovery search input is missing an accessible label");
if (!/id=["']store-discovery-status["'][^>]*\baria-live=/.test(source)) reportDrift("Discovery result status is missing aria-live");
if (!/data-store-price-band=["']under-50k["']/.test(source)) reportDrift("Discovery price-band filter hooks are missing");
if (!/data-store-sort=["']recommended["']/.test(source)) reportDrift("Discovery sort hooks are missing");

if (/\bdummy\b/i.test(source) || /\bdummy\b/i.test(storeJsAsset)) fail('public output still contains "Dummy" or "dummy"');
if (/\bEtc\b/.test(source) || /\bEtc\b/.test(storeJsAsset)) fail('public output still contains category "Etc"');

if (!staticProducts.length) fail("static product JSON is empty");
if (!buildReport || typeof buildReport !== "object") fail("build report is missing or empty");

const reportSourceType = String(buildReport?.sourceType || "");
const reportImageSummary = String(buildReport?.imageSourceSummary || "");
const reportImageSources = buildReport?.imageSources && typeof buildReport.imageSources === "object" ? buildReport.imageSources : null;
const reportValidProducts = Number(buildReport?.validProducts ?? buildReport?.productCount ?? 0);
const reportExistingStaticFallbackCount = Number(reportImageSources?.["existing-static-fallback"] || 0);
const reportMissingImageCount = Number(reportImageSources?.missing || 0);

if (!reportSourceType) fail("build report is missing sourceType");
if (!reportImageSources) fail("build report is missing imageSources");
if (!reportImageSummary) fail("build report is missing imageSourceSummary");
if (reportValidProducts && reportValidProducts !== staticProducts.length) {
  fail(`build report validProducts (${reportValidProducts}) does not match normalized product count (${staticProducts.length})`);
}

if (reportSourceType === "existing-static") {
  if (STORE_STRICT_MODE) fail("build report sourceType is existing-static while strict mode is enabled");
  else warn("build report sourceType is existing-static");
} else if (reportSourceType !== "live-feed") {
  if (STORE_STRICT_MODE) fail(`build report sourceType is ${reportSourceType} while strict mode is enabled`);
  else warn(`build report sourceType is ${reportSourceType}`);
}

if (reportExistingStaticFallbackCount > 0) {
  if (STORE_STRICT_MODE) fail(`build report used existing-static-fallback images (${reportExistingStaticFallbackCount})`);
  else warn(`build report used existing-static-fallback images (${reportExistingStaticFallbackCount})`);
}

if (reportMissingImageCount > 0) {
  if (STORE_STRICT_MODE) fail(`build report has missing image extractions (${reportMissingImageCount})`);
  else warn(`build report has missing image extractions (${reportMissingImageCount})`);
}

if (!manifest || typeof manifest !== "object") {
  fail("store manifest is missing or empty");
} else {
  const forbiddenFields = ["whyPicked", "bestFor", "notes", "caveat", "geoContext", "links"];
  const requiredFields = ["slug", "name", "categoryKey", "categoryLabel", "priceText", "summary", "image", "url", "storeUrl"];
  const manifestItems = Array.isArray(manifest.items) ? manifest.items : [];
  const manifestCategories = Array.isArray(manifest.categories) ? manifest.categories : [];
  const manifestCategoryLookup = manifestCategoryMap(manifestCategories);
  const duplicateManifestSlugs = [];
  const seenManifestSlugs = new Set();

  if (!manifest.version) fail("store manifest is missing version");
  else if (manifest.version !== STORE_MANIFEST_VERSION) fail(`store manifest version is not ${STORE_MANIFEST_VERSION}`);

  if (!Array.isArray(manifest.items)) fail("store manifest items is not an array");
  if (!Array.isArray(manifest.categories)) fail("store manifest categories is not an array");

  if (Number(manifest.count || 0) !== manifestItems.length) {
    fail(`store manifest count (${manifest.count}) does not match item count (${manifestItems.length})`);
  }
  if (manifestItems.length !== staticProducts.length) {
    fail(`store manifest item count (${manifestItems.length}) does not match normalized product count (${staticProducts.length})`);
  }
  if (String(manifest.source || "") !== reportSourceType) {
    reportDrift(`store manifest source (${manifest.source || "missing"}) does not match build report sourceType (${reportSourceType || "missing"})`);
  }
  if (Number(buildReport?.manifestItems || 0) !== manifestItems.length) {
    reportDrift(`build report manifestItems (${buildReport?.manifestItems || 0}) does not match store manifest item count (${manifestItems.length})`);
  }
  if (String(buildReport?.manifestPath || "") !== "store/data/manifest.json") {
    reportDrift(`build report manifestPath is unexpected (${buildReport?.manifestPath || "missing"})`);
  }
  if (!Array.isArray(buildReport?.manifestCategories)) {
    reportDrift("build report manifestCategories is missing");
  } else if (JSON.stringify(buildReport.manifestCategories) !== JSON.stringify(manifestCategories)) {
    reportDrift("build report manifestCategories does not match store manifest categories");
  }

  if (String(manifest.source || "") === "existing-static") {
    if (STORE_STRICT_MODE) fail("store manifest source is existing-static while strict mode is enabled");
    else warn("store manifest source is existing-static");
  }

  for (const key of CATEGORY_ORDER) {
    const entry = manifestCategoryLookup.get(key);
    if (!entry) {
      fail(`store manifest category is missing key ${key}`);
      continue;
    }
    if (String(entry.label || "") !== CATEGORY_CONFIG[key].label) {
      fail(`store manifest category ${key} has unexpected label (${entry.label || "missing"})`);
    }
    if (String(entry.path || "") !== CATEGORY_CONFIG[key].futurePath) {
      fail(`store manifest category ${key} has unexpected path (${entry.path || "missing"})`);
    }
    if (Number(entry.count || 0) !== Number(expectedManifestCounts[key] || 0)) {
      fail(`store manifest category ${key} count (${entry.count || 0}) does not match normalized product count (${expectedManifestCounts[key] || 0})`);
    }
  }

  for (const category of manifestCategories) {
    const key = String(category?.key || "");
    const label = String(category?.label || "");
    const routePath = String(category?.path || "");
    if (/\bdummy\b/i.test(key) || /\bdummy\b/i.test(label) || /\bdummy\b/i.test(routePath)) {
      fail(`store manifest category contains dummy (${key || label || routePath})`);
    }
    if (key === "etc") fail('store manifest categoryKey "etc" is not allowed');
    if (label === "Etc") fail('store manifest category label "Etc" is not allowed');
    if (/\/store\/etc(?:$|[/?#])/.test(routePath)) fail("store manifest category path must not reference /store/etc");
  }

  for (const item of manifestItems) {
    const label = String(item?.slug || item?.name || "unknown");

    if (seenManifestSlugs.has(label)) duplicateManifestSlugs.push(label);
    else seenManifestSlugs.add(label);

    if (/\bdummy\b/i.test(JSON.stringify(item || {}))) fail(`${label}: store manifest still contains dummy`);
    if (String(item?.categoryKey || "") === "etc") fail(`${label}: store manifest categoryKey "etc" is not allowed`);
    if (String(item?.categoryLabel || "") === "Etc") fail(`${label}: store manifest categoryLabel "Etc" is not allowed`);
    if (/\/store\/etc(?:$|[/?#])/.test(String(item?.storeUrl || ""))) fail(`${label}: store manifest storeUrl must not reference /store/etc`);

    for (const field of forbiddenFields) {
      if (Object.prototype.hasOwnProperty.call(item || {}, field)) fail(`${label}: store manifest contains forbidden field ${field}`);
    }

    for (const field of requiredFields) {
      if (!String(item?.[field] || "").trim()) fail(`${label}: store manifest is missing ${field}`);
    }

    if (!Array.isArray(item?.intent)) fail(`${label}: store manifest intent is not an array`);
    else if (item.intent.length > 8) fail(`${label}: store manifest has more than 8 intent values`);

    if (String(item?.summary || "").length > 180) fail(`${label}: store manifest summary exceeds 180 characters`);

    if (Array.isArray(item?.intent) && item.intent.some((value) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || "")))) {
      fail(`${label}: store manifest intent values must be lowercase kebab-case`);
    }

    if (Array.isArray(item?.tags) && item.tags.some((value) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || "")))) {
      fail(`${label}: store manifest tags must be lowercase kebab-case`);
    }

    if (/picsum\.photos/i.test(String(item?.image || ""))) {
      if (STORE_STRICT_MODE) fail(`${label}: store manifest image uses picsum.photos`);
      else warn(`${label}: store manifest image uses picsum.photos`);
    }
  }

  if (duplicateManifestSlugs.length) {
    fail(`store manifest has duplicate slugs: ${Array.from(new Set(duplicateManifestSlugs)).join(", ")}`);
  }
}

const duplicateSlugs = [];
const seenSlugs = new Set();
for (const product of staticProducts) {
  const label = product.slug || product.name || "unknown";
  const validation = validateStoreProduct(product, { mode: STORE_STRICT_IMAGES ? "production" : "development" });
  if (isDummyProduct(product)) fail(`${label}: dummy product remained in normalized output`);
  if (slugLooksLikeUrl(product.slug)) fail(`${label}: slug looks like a URL`);
  if (slugEndsWithHtml(product.slug)) fail(`${label}: slug ends with .html`);
  if (seenSlugs.has(product.slug)) duplicateSlugs.push(product.slug);
  else seenSlugs.add(product.slug);
  for (const message of validation.errors) fail(`${label}: ${message}`);
  for (const message of validation.warnings) warn(`${label}: ${message}`);
}
if (duplicateSlugs.length) fail(`duplicate slugs remain: ${Array.from(new Set(duplicateSlugs)).join(", ")}`);

if (!websiteNode) fail("schema graph is missing WebSite");
if (!organizationNode) fail("schema graph is missing Organization");
if (!collectionNode) fail("schema graph is missing CollectionPage");
if (!itemListNode) fail("schema graph is missing ItemList");

if (collectionNode) {
  if (!collectionNode.mainEntity || collectionNode.mainEntity["@id"] !== String(itemListNode?.["@id"] || "")) {
    fail("CollectionPage mainEntity does not reference the ItemList @id");
  }
}

if (itemListNode) {
  if (!Array.isArray(itemListNode.itemListElement) || !itemListNode.itemListElement.length) {
    fail("ItemList JSON-LD itemListElement is empty");
  }
}

if (staticProducts.length) {
  const gridTagMatch = source.match(/<section\b[^>]*id=["']store-grid["'][^>]*>/i);
  const cards = gridRegion.match(/data-store-product-id=/g) || [];
  const notes = semanticRegion.match(/class=["']store-semantic-product["']/g) || [];
  const images = imageTags(gridRegion);
  const highPriorityImages = images.filter((tag) => /fetchpriority=["']high["']/i.test(tag));
  const preloadImages = preloadTags(preloadRegion).filter((tag) => /\bas=["']image["']/i.test(tag));
  const preloadHigh = preloadImages.filter((tag) => /fetchpriority=["']high["']/i.test(tag));
  const previewMarkup = source.match(/<div class="store-preview__market"[\s\S]*?<\/div>/i)?.[0] || "";
  const previewLinks = anchorTags(previewMarkup);
  const firstImageSrc = images[0]?.match(/\bsrc=(["'])(.*?)\1/i)?.[2] || "";
  const preloadHref = preloadHigh[0]?.match(/\bhref=(["'])(.*?)\1/i)?.[2] || "";

  if (!gridTagMatch) {
    fail("missing #store-grid section");
  } else if (/\shidden(?:[\s=>]|$)/i.test(gridTagMatch[0])) {
    fail("#store-grid is hidden while static products exist");
  }

  if (!cards.length) fail("generated store grid is empty");
  if (cards.length !== staticProducts.length) fail(`generated store grid count (${cards.length}) does not match static products (${staticProducts.length})`);
  if (!notes.length) fail("generated semantic products are empty");
  if (notes.length !== staticProducts.length) fail(`generated semantic notes count (${notes.length}) does not match static products (${staticProducts.length})`);
  if (semanticRegion.includes("Product notes will appear here after the curation loads.")) fail("semantic placeholder remains visible after products were generated");

  if (!images.length) fail("generated store grid has no images");
  if (!highPriorityImages.length) fail("generated store grid has no fetchpriority=high image");
  if (highPriorityImages.length > 1) fail(`generated store grid has ${highPriorityImages.length} fetchpriority=high images`);
  if (images.length && !/fetchpriority=["']high["']/i.test(images[0])) fail("first generated image is not fetchpriority=high");

  if (preloadImages.length !== 1) fail(`expected exactly one preload image, found ${preloadImages.length}`);
  if (preloadHigh.length !== 1) fail(`expected exactly one high-priority preload image, found ${preloadHigh.length}`);
  if (preloadHref && firstImageSrc && preloadHref !== firstImageSrc) fail("preload high-priority image does not match the first generated product image");

  if (!previewLinks.length) fail("preview marketplace CTA group is missing");
  for (const anchor of previewLinks) {
    const text = anchor.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const ariaLabel = anchor.match(/\baria-label=(["'])(.*?)\1/i)?.[2] || "";
    if (!["Shopee", "Tokopedia", "TikTok"].includes(text)) fail(`preview marketplace label is not short-form (${text || "missing"})`);
    if (!/(cek harga|check price)/i.test(ariaLabel)) fail(`preview marketplace aria-label is not descriptive (${text || "missing"})`);
  }
  if (!/store-preview__footnote/.test(source)) fail("preview marketplace footnote is missing");

  if (!itemListNode) {
    fail("ItemList graph is missing");
  } else {
    if (Number(itemListNode.numberOfItems) !== staticProducts.length) {
      fail(`ItemList numberOfItems (${itemListNode.numberOfItems}) does not match normalized product count (${staticProducts.length})`);
    }
    if (itemListNode.itemListOrder !== "https://schema.org/ItemListOrderDescending") {
      fail("ItemList itemListOrder is not descending");
    }
    if (!Array.isArray(itemListNode.itemListElement) || itemListNode.itemListElement.length !== staticProducts.length) {
      fail(`ItemList itemListElement count does not match normalized product count (${staticProducts.length})`);
    }

    for (const [index, entry] of itemListNode.itemListElement.entries()) {
      const url = String(entry?.url || "");
      const product = entry?.item || {};
      if (!url) fail(`ListItem ${index + 1} is missing url`);
      if (/(?:shopee|tokopedia|tiktok|lazada)\./i.test(url)) fail(`ListItem ${index + 1} url points to marketplace instead of canonical post`);
      if (isNonSpecificOfferUrl(url)) fail(`ListItem ${index + 1} url points to a search-style URL`);
      if (!product || !hasType(product, "Product")) fail(`ListItem ${index + 1} is missing Product item`);
      if (!product["@id"] || !String(product["@id"]).endsWith("#product")) fail(`ListItem ${index + 1} Product is missing #product @id`);
      if (/\bdummy\b/i.test(String(product.name || ""))) fail(`ListItem ${index + 1} still contains dummy product`);
      if (String(product.category || "") === "Etc") fail(`ListItem ${index + 1} still uses public category Etc`);
      if (product.offers?.url && isNonSpecificOfferUrl(product.offers.url)) fail(`ListItem ${index + 1} emitted Offer for search-style marketplace URL`);
      if (product.offers?.seller?.name === "PakRPP") fail(`ListItem ${index + 1} Offer seller must not be PakRPP`);
    }
  }
}

if (staticProducts.length) {
  const categoryPageSeenSlugs = new Map();
  const categoryExpectedCounts = categoryCounts(staticProducts);

  for (const route of storeCategoryRoutes()) {
    const nestedPath = path.resolve(TARGET_ROOT, route.nestedOutputPath);
    const flatPath = path.resolve(TARGET_ROOT, route.flatOutputPath);
    const pageLabel = `category page ${route.path}`;

    if (!existsSync(nestedPath)) {
      reportDrift(`${pageLabel}: artifact is missing at ${path.relative(ROOT, nestedPath) || nestedPath}`);
      continue;
    }
    if (!existsSync(flatPath)) {
      reportDrift(`${pageLabel}: transitional flat artifact is missing at ${path.relative(ROOT, flatPath) || flatPath}`);
    }

    const pageSource = readFileSync(nestedPath, "utf8");
    const pageStaticRegion = extractMarkedRegion(pageSource, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->");
    const pageGridRegion = extractMarkedRegion(pageSource, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->");
    const pageSemanticRegion = extractMarkedRegion(pageSource, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->");
    const pageJsonLdRegion = extractMarkedRegion(pageSource, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->");
    let pageProducts = [];
    let pageSchema = null;

    if (/\bdummy\b/i.test(pageSource)) fail(`${pageLabel}: contains dummy`);
    if (/\bEtc\b/.test(pageSource)) fail(`${pageLabel}: contains public category Etc`);
    if (pageSource.includes(STORE_MANIFEST_VERSION)) fail(`${pageLabel}: manifest is inlined`);
    if (!pageStaticRegion) fail(`${pageLabel}: missing static products markers`);
    if (!pageGridRegion) fail(`${pageLabel}: missing static grid markers`);
    if (!pageSemanticRegion) fail(`${pageLabel}: missing semantic product markers`);
    if (!pageJsonLdRegion) fail(`${pageLabel}: missing ItemList JSON-LD markers`);

    if (!new RegExp(`<title>\\s*${route.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<\\/title>`, "i").test(pageSource)) {
      fail(`${pageLabel}: title is missing category context`);
    }
    if (!new RegExp(`rel=["']canonical["'][^>]*href=["']${route.canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(pageSource)) {
      fail(`${pageLabel}: canonical is wrong or missing`);
    }
    if (!new RegExp(`<meta\\s+property=["']og:url["'][^>]*content=["']${route.canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(pageSource)) {
      fail(`${pageLabel}: OG URL is wrong or missing`);
    }
    if (/<title>\s*Yellow Cart · PakRPP\s*<\/title>/i.test(pageSource)) {
      fail(`${pageLabel}: title duplicates /store title`);
    }
    if (!new RegExp(`<h1[^>]*>\\s*${route.h1.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<\\/h1>`, "i").test(pageSource)) {
      fail(`${pageLabel}: H1 is wrong or missing`);
    }
    if (!/class=["'][^"']*store-category-page-rail[^"']*["']/.test(pageSource)) {
      fail(`${pageLabel}: category rail is missing`);
    }
    for (const expectedRoute of storeCategoryRoutes()) {
      if (!pageSource.includes(`href="${expectedRoute.path}"`)) fail(`${pageLabel}: category rail misses ${expectedRoute.path}`);
    }
    if (!pageSource.includes('href="/store"')) fail(`${pageLabel}: link back to /store is missing`);
    if (!pageSource.includes(`data-store-category-key="${route.key}"`)) fail(`${pageLabel}: runtime category key is missing`);
    if (countOccurrences(pageSource, STORE_ASSET_CSS_HREF) !== 1) fail(`${pageLabel}: expected exactly one ${STORE_ASSET_CSS_HREF} reference`);
    if (countOccurrences(pageSource, STORE_ASSET_JS_HREF) !== 1) fail(`${pageLabel}: expected exactly one ${STORE_ASSET_JS_HREF} reference`);
    if (!/<script\b[^>]*src=["']\/assets\/store\/store\.js["'][^>]*\bdefer\b[^>]*><\/script>/i.test(pageSource)) {
      fail(`${pageLabel}: misses deferred ${STORE_ASSET_JS_HREF}`);
    }
    validateInlineRuntimeScripts(pageSource, pageLabel);
    if (/function\s+readStaticProducts\(/.test(pageSource) || /function\s+loadProducts\(/.test(pageSource)) {
      fail(`${pageLabel}: full runtime JavaScript is inlined`);
    }

    try {
      pageProducts = extractStaticProductsFromStoreHtml(pageSource).map((product) => normalizeStoreProduct(product));
    } catch (error) {
      fail(`${pageLabel}: invalid static products JSON: ${error.message}`);
    }
    try {
      pageSchema = parseJsonScript(pageSource, "store-itemlist-jsonld");
    } catch (error) {
      fail(`${pageLabel}: invalid ItemList JSON-LD: ${error.message}`);
    }

    const expectedCount = Math.min(Number(categoryExpectedCounts[route.key] || 0), CATEGORY_PAGE_SIZE);
    if (!pageProducts.length) fail(`${pageLabel}: has no visible products`);
    if (pageProducts.length !== expectedCount) {
      fail(`${pageLabel}: visible product count (${pageProducts.length}) does not match category count (${expectedCount})`);
    }
    if (pageProducts.length > CATEGORY_PAGE_SIZE) {
      fail(`${pageLabel}: includes more than ${CATEGORY_PAGE_SIZE} products`);
    }

    for (const product of pageProducts) {
      if (productCategoryKey(product) !== route.key) {
        fail(`${pageLabel}: contains product from wrong category (${product.slug || product.name || "unknown"})`);
      }
      if (categoryPageSeenSlugs.has(product.slug)) {
        fail(`${pageLabel}: duplicate product slug across category pages (${product.slug})`);
      } else {
        categoryPageSeenSlugs.set(product.slug, route.key);
      }
    }

    const pageCards = pageGridRegion.match(/data-store-product-id=/g) || [];
    const pageNotes = pageSemanticRegion.match(/class=["']store-semantic-product["']/g) || [];
    if (pageCards.length !== pageProducts.length) {
      fail(`${pageLabel}: grid count (${pageCards.length}) does not match static products (${pageProducts.length})`);
    }
    if (pageNotes.length !== pageProducts.length) {
      fail(`${pageLabel}: semantic note count (${pageNotes.length}) does not match static products (${pageProducts.length})`);
    }

    const pageGraph = graphNodes(pageSchema);
    const pageCollection = findGraphNode(pageGraph, "CollectionPage", "#collection");
    const pageItemList = findGraphNode(pageGraph, "ItemList", "#itemlist") || findGraphNode(pageGraph, "ItemList");
    if (!pageCollection) fail(`${pageLabel}: JSON-LD is missing CollectionPage`);
    if (!pageItemList) fail(`${pageLabel}: JSON-LD is missing ItemList`);
    if (pageCollection && String(pageCollection.url || "") !== route.canonicalUrl) {
      fail(`${pageLabel}: CollectionPage URL is wrong (${pageCollection.url || "missing"})`);
    }
    if (pageCollection && pageItemList && String(pageCollection.mainEntity?.["@id"] || "") !== String(pageItemList["@id"] || "")) {
      fail(`${pageLabel}: CollectionPage mainEntity does not reference category ItemList`);
    }
    if (pageItemList) {
      const entries = Array.isArray(pageItemList.itemListElement) ? pageItemList.itemListElement : [];
      if (String(pageItemList.url || "") !== route.canonicalUrl) fail(`${pageLabel}: ItemList URL is wrong (${pageItemList.url || "missing"})`);
      if (Number(pageItemList.numberOfItems) !== pageProducts.length) {
        fail(`${pageLabel}: ItemList numberOfItems (${pageItemList.numberOfItems}) does not match visible products (${pageProducts.length})`);
      }
      if (entries.length !== pageProducts.length) {
        fail(`${pageLabel}: ItemList item count (${entries.length}) does not match visible products (${pageProducts.length})`);
      }
      for (const [index, entry] of entries.entries()) {
        const product = entry?.item || {};
        if (product.category && product.category !== route.label) {
          fail(`${pageLabel}: JSON-LD product ${index + 1} has wrong category (${product.category})`);
        }
        if (product.offers?.url && isNonSpecificOfferUrl(product.offers.url)) {
          fail(`${pageLabel}: JSON-LD product ${index + 1} emitted Offer for search-style marketplace URL`);
        }
      }
    }
  }
}

if (existsSync(WORKER_PATH)) {
  const workerSource = readFileSync(WORKER_PATH, "utf8");
  if (!/function developmentRobotsTag\(\)/.test(workerSource)) fail("worker.js is missing developmentRobotsTag()");
  if (!/noindex, nofollow, nosnippet, noimageindex/.test(workerSource)) fail("worker.js is missing the development lockdown robots contract");
  if (!/function productionIndexableHtmlRobotsTag\(\)/.test(workerSource)) fail("worker.js is missing explicit production indexable HTML robots helper");
  if (!/index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1/.test(workerSource)) fail("worker.js is missing the production indexable /store robots tag");
  if (!/flags\.mode !== "production"\) return developmentRobotsTag\(\);/.test(workerSource)) fail("worker.js is missing the non-production robots guard");
  if (!/X-GG-Store-Source/.test(workerSource)) fail("worker.js is missing the /store source debug header");
  if (!/X-GG-Store-Static/.test(workerSource)) fail("worker.js is missing the /store static debug header");
  if (!/User-agent: Googlebot/.test(workerSource)) fail("worker.js is missing explicit Googlebot robots allowance");
  if (!/User-agent: OAI-SearchBot/.test(workerSource)) fail("worker.js is missing explicit OAI-SearchBot robots allowance");
}

if (failures.length) {
  console.error(`STORE STATIC PROOF FAIL path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH}`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

for (const message of warnings) console.warn(`STORE STATIC PROOF WARN ${message}`);

console.log(`STORE STATIC PROOF PASS path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH} products=${staticProducts.length} itemList=${itemListNode?.itemListElement?.length || 0}`);
