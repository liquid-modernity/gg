#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_PATH = path.resolve(ROOT, process.argv[2] || "store.html");
const WORKER_PATH = path.resolve(ROOT, "worker.js");
const FLAGS_PATH = path.resolve(ROOT, "flags.json");
const STORE_ASSET_CSS_PATH = path.resolve(ROOT, "assets/store/store.css");
const STORE_ASSET_JS_PATH = path.resolve(ROOT, "assets/store/store.js");
const STORE_FEED_URL = "/feeds/posts/default/-/Store?alt=json&max-results=50";
const STORE_LEGACY_FEED_URL = "/feeds/posts/default/-/yellowcard?alt=json&max-results=50";
const CRITICAL_CSS_BUDGET_BYTES = 15 * 1024;
const source = readFileSync(TARGET_PATH, "utf8");
const failures = [];

function fail(message) {
  failures.push(message);
}

function countOccurrences(text, needle) {
  return (text.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function extractMarkedRegion(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1) {
    fail(`missing marker ${startMarker}`);
    return "";
  }
  if (endIndex === -1) {
    fail(`missing marker ${endMarker}`);
    return "";
  }
  if (countOccurrences(text, startMarker) !== 1) fail(`duplicate marker ${startMarker}`);
  if (countOccurrences(text, endMarker) !== 1) fail(`duplicate marker ${endMarker}`);
  if (endIndex <= startIndex) {
    fail(`marker order invalid ${startMarker} -> ${endMarker}`);
    return "";
  }

  return text.slice(startIndex + startMarker.length, endIndex);
}

function extractScriptTextById(text, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`<script\\b[^>]*id=["']${escapedId}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i"));
  return match ? match[1] : "";
}

function scriptTags(text) {
  return text.match(/<script\b[\s\S]*?<\/script>/gi) || [];
}

function styleTags(text) {
  return text.match(/<style\b[\s\S]*?<\/style>/gi) || [];
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

function parseJsonScript(id) {
  const scriptText = extractScriptTextById(source, id);
  if (!scriptText.trim()) {
    fail(`missing or empty script#${id}`);
    return null;
  }

  try {
    return JSON.parse(scriptText);
  } catch (error) {
    fail(`invalid JSON in script#${id}: ${error.message}`);
    return null;
  }
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

const gridRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->");
const staticProductsRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->");
const jsonLdRegion = extractMarkedRegion(source, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->");
const semanticRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->");
const preloadRegion = extractMarkedRegion(source, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->");
const criticalCssRegion = extractMarkedRegion(source, "<!-- STORE_CRITICAL_CSS_START -->", "<!-- STORE_CRITICAL_CSS_END -->");
const assetCssRegion = extractMarkedRegion(source, "<!-- STORE_ASSET_CSS_START -->", "<!-- STORE_ASSET_CSS_END -->");
const runtimeAssetRegion = extractMarkedRegion(source, "<!-- STORE_RUNTIME_JS_START -->", "<!-- STORE_RUNTIME_JS_END -->");

if (!/id=["']store-static-products["']/.test(staticProductsRegion)) fail("STORE_STATIC_PRODUCTS_JSON marker block is missing #store-static-products");
if (!/id=["']store-itemlist-jsonld["']/.test(jsonLdRegion)) fail("STORE_ITEMLIST_JSONLD marker block is missing #store-itemlist-jsonld");

const staticProducts = parseJsonScript("store-static-products");
const schema = parseJsonScript("store-itemlist-jsonld");
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
if (!source.includes(`data-store-feed-url="${STORE_FEED_URL}"`)) fail("store feed URL changed or missing");
if (!source.includes(`data-store-legacy-feed-url="${STORE_LEGACY_FEED_URL}"`)) fail("legacy store feed URL changed or missing");

if (inlineStyleTags.length !== 1) fail(`expected exactly one inline style block, found ${inlineStyleTags.length}`);
if (!/<style\b[^>]*>[\s\S]*<\/style>/i.test(criticalCssRegion)) fail("critical CSS marker block is missing its inline <style>");
if (Buffer.byteLength(criticalCssText, "utf8") > CRITICAL_CSS_BUDGET_BYTES) {
  fail(`critical CSS exceeds 15 KB (${Buffer.byteLength(criticalCssText, "utf8")} bytes)`);
}
if (!/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']\/assets\/store\/store\.css["'][^>]*>/i.test(assetCssRegion)) {
  fail("store.html does not reference /assets/store/store.css");
}
if (!/<script\b[^>]*src=["']\/assets\/store\/store\.js["'][^>]*\bdefer\b[^>]*><\/script>/i.test(runtimeAssetRegion)) {
  fail("store.html does not reference /assets/store/store.js with defer");
}
if (countOccurrences(source, "/assets/store/store.css") !== 1) fail("expected exactly one /assets/store/store.css reference");
if (countOccurrences(source, "/assets/store/store.js") !== 1) fail("expected exactly one /assets/store/store.js reference");
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
if (!existsSync(STORE_ASSET_CSS_PATH)) fail("/assets/store/store.css is missing");
else {
  storeCssAsset = readFileSync(STORE_ASSET_CSS_PATH, "utf8");
  if (!storeCssAsset.trim()) fail("/assets/store/store.css is empty");
}
if (!existsSync(STORE_ASSET_JS_PATH)) fail("/assets/store/store.js is missing");
else {
  storeJsAsset = readFileSync(STORE_ASSET_JS_PATH, "utf8");
  if (!storeJsAsset.trim()) fail("/assets/store/store.js is empty");
}
if (storeJsAsset && !/marketplaceAriaLabel\(/.test(storeJsAsset)) fail("runtime marketplace aria-label helper is missing from assets/store/store.js");
if (storeJsAsset && !/window\.StoreSurface/.test(storeJsAsset)) fail("runtime StoreSurface contract is missing from assets/store/store.js");

if (Array.isArray(staticProducts) && !staticProducts.length) fail("static product JSON is empty");
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

if (Array.isArray(staticProducts) && staticProducts.length) {
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
      fail(`ItemList numberOfItems (${itemListNode.numberOfItems}) does not match static products (${staticProducts.length})`);
    }
    if (itemListNode.itemListOrder !== "https://schema.org/ItemListOrderDescending") {
      fail("ItemList itemListOrder is not descending");
    }
    if (!Array.isArray(itemListNode.itemListElement) || itemListNode.itemListElement.length !== staticProducts.length) {
      fail(`ItemList itemListElement count does not match static products (${staticProducts.length})`);
    }

    for (const [index, entry] of itemListNode.itemListElement.entries()) {
      const url = String(entry?.url || "");
      const product = entry?.item || {};
      if (!url) fail(`ListItem ${index + 1} is missing url`);
      if (/(?:shopee|tokopedia|tiktok|lazada)\./i.test(url)) fail(`ListItem ${index + 1} url points to marketplace instead of canonical post`);
      if (isNonSpecificOfferUrl(url)) fail(`ListItem ${index + 1} url points to a search-style URL`);
      if (!product || !hasType(product, "Product")) fail(`ListItem ${index + 1} is missing Product item`);
      if (!product["@id"] || !String(product["@id"]).endsWith("#product")) fail(`ListItem ${index + 1} Product is missing #product @id`);
      if (product.offers?.url && isNonSpecificOfferUrl(product.offers.url)) fail(`ListItem ${index + 1} emitted Offer for search-style marketplace URL`);
      if (product.offers?.seller?.name === "PakRPP") fail(`ListItem ${index + 1} Offer seller must not be PakRPP`);
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

if (existsSync(FLAGS_PATH)) {
  try {
    const flags = JSON.parse(readFileSync(FLAGS_PATH, "utf8"));
    if (!["development", "staging", "production"].includes(String(flags.mode || ""))) {
      fail(`flags.json has an invalid mode (${JSON.stringify(flags.mode)})`);
    }
  } catch (error) {
    fail(`flags.json is not valid JSON: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`STORE STATIC PROOF FAIL path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH}`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

const staticCount = Array.isArray(staticProducts) ? staticProducts.length : 0;
const itemCount = itemListNode && Array.isArray(itemListNode.itemListElement) ? itemListNode.itemListElement.length : 0;
console.log(`STORE STATIC PROOF PASS path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH} products=${staticCount} itemList=${itemCount}`);
