#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_PATH = path.resolve(ROOT, process.argv[2] || "store.html");
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

const gridRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->");
const staticProductsRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->");
const jsonLdRegion = extractMarkedRegion(source, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->");
const semanticRegion = extractMarkedRegion(source, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->");

if (!/id=["']store-static-products["']/.test(staticProductsRegion)) fail("STORE_STATIC_PRODUCTS_JSON marker block is missing #store-static-products");
if (!/id=["']store-itemlist-jsonld["']/.test(jsonLdRegion)) fail("STORE_ITEMLIST_JSONLD marker block is missing #store-itemlist-jsonld");

const staticProducts = parseJsonScript("store-static-products");
const itemListJsonLd = parseJsonScript("store-itemlist-jsonld");

if (Array.isArray(staticProducts) && !staticProducts.length) fail("static product JSON is empty");
if (itemListJsonLd && (!Array.isArray(itemListJsonLd.itemListElement) || !itemListJsonLd.itemListElement.length)) {
  fail("ItemList JSON-LD itemListElement is empty");
}

if (Array.isArray(staticProducts) && staticProducts.length) {
  const gridTagMatch = source.match(/<section\b[^>]*id=["']store-grid["'][^>]*>/i);
  const cards = gridRegion.match(/data-store-product-id=/g) || [];
  const notes = semanticRegion.match(/class=["']store-semantic-product["']/g) || [];
  const images = imageTags(gridRegion);
  const highPriorityImages = images.filter((tag) => /fetchpriority=["']high["']/i.test(tag));
  const firstAnchor = anchorTags(gridRegion)[0] || "";

  if (!gridTagMatch) {
    fail("missing #store-grid section");
  } else if (/\shidden(?:[\s=>]|$)/i.test(gridTagMatch[0])) {
    fail("#store-grid is hidden while static products exist");
  }

  if (!cards.length) fail("generated store grid is empty");
  if (cards.length !== staticProducts.length) {
    fail(`generated store grid count (${cards.length}) does not match static products (${staticProducts.length})`);
  }

  if (!notes.length) fail("generated semantic products are empty");
  if (notes.length !== staticProducts.length) {
    fail(`generated semantic notes count (${notes.length}) does not match static products (${staticProducts.length})`);
  }

  if (semanticRegion.includes("Product notes will appear here after the curation loads.")) {
    fail("semantic placeholder remains visible after products were generated");
  }

  if (!images.length) fail("generated store grid has no images");
  if (!highPriorityImages.length) fail("generated store grid has no fetchpriority=high image");
  if (highPriorityImages.length > 1) fail(`generated store grid has ${highPriorityImages.length} fetchpriority=high images`);
  if (images.length && !/fetchpriority=["']high["']/i.test(images[0])) fail("first generated image is not fetchpriority=high");

  if (/href=["'][^"']*(?:shopee|tokopedia|tiktok|lazada)\./i.test(firstAnchor)) {
    fail("first generated product card href points to a marketplace URL instead of a canonical product URL");
  }

  for (const anchor of anchorTags(`${gridRegion}\n${semanticRegion}`)) {
    const hrefMatch = anchor.match(/\bhref=(["'])(.*?)\1/i);
    if (!hrefMatch) continue;
    if (!/(?:shopee|tokopedia|tiktok|lazada)\./i.test(hrefMatch[2])) continue;
    if (!/\btarget=(["'])_blank\1/i.test(anchor)) fail(`generated marketplace link is missing target=_blank (${hrefMatch[2]})`);
    if (!/\brel=(["'])[^"']*\bsponsored\b[^"']*\bnofollow\b[^"']*\bnoopener\b[^"']*\bnoreferrer\b[^"']*\1/i.test(anchor)) {
      fail(`generated marketplace link is missing rel=\"sponsored nofollow noopener noreferrer\" (${hrefMatch[2]})`);
    }
  }
}

if (failures.length) {
  console.error(`STORE STATIC PROOF FAIL path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH}`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

const staticCount = Array.isArray(staticProducts) ? staticProducts.length : 0;
const itemCount = itemListJsonLd && Array.isArray(itemListJsonLd.itemListElement) ? itemListJsonLd.itemListElement.length : 0;
console.log(`STORE STATIC PROOF PASS path=${path.relative(ROOT, TARGET_PATH) || TARGET_PATH} products=${staticCount} itemList=${itemCount}`);
