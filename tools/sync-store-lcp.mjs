#!/usr/bin/env node

/* tools/sync-store-lcp.mjs — /store LCP single-source sync
 *
 * Purpose:
 * - Read config/store-lcp-product.json as the only editable LCP featured product config.
 * - Regenerate the guarded preload, static card, and STORE_LCP_PRODUCT blocks in store.html.
 * - Fail loudly when config is invalid or guarded markers are missing/duplicated.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONFIG_PATH = path.resolve(ROOT, "config/store-lcp-product.json");
const STORE_PATH = path.resolve(ROOT, "store.html");
const REQUIRED_FIELDS = ["slug", "name", "category", "priceText", "image", "alt"];

function fail(message) {
  console.error(`sync-store-lcp: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  try {
    return readFileSync(relativePath, "utf8");
  } catch (error) {
    fail(`unable to read ${path.relative(ROOT, relativePath) || relativePath}: ${error.message}`);
  }
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    fail(`${path.relative(ROOT, relativePath) || relativePath} is not valid JSON: ${error.message}`);
  }
}

function validateConfig(rawConfig) {
  const config = {};

  if (!rawConfig || typeof rawConfig !== "object" || Array.isArray(rawConfig)) {
    fail("config/store-lcp-product.json must contain a JSON object");
  }

  for (const field of REQUIRED_FIELDS) {
    const value = typeof rawConfig[field] === "string" ? rawConfig[field].trim() : "";
    if (!value) fail(`config/store-lcp-product.json is missing required non-empty field: ${field}`);
    config[field] = value;
  }

  return config;
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

function buildPreloadBlock(config) {
  return `  <link rel="preload" as="image" href="${escapeHtmlAttr(config.image)}" fetchpriority="high" />`;
}

function buildCardBlock(config) {
  const title = escapeHtmlText(config.name);
  const alt = escapeHtmlAttr(config.alt);
  const category = escapeHtmlText(config.category);
  const priceText = escapeHtmlText(config.priceText);
  const image = escapeHtmlAttr(config.image);

  return [
    '        <article class="store-card store-card--initial-lcp" data-store-initial-lcp-card>',
    '          <div class="store-card__media">',
    `            <img src="${image}" alt="${alt}" loading="eager" decoding="async" fetchpriority="high" draggable="false" data-store-initial-lcp-image />`,
    '            <span class="store-card__shade" aria-hidden="true"></span>',
    '            <div class="store-card__content">',
    `              <span class="store-card__badge">${category}</span>`,
    `              <span class="store-card__price">${priceText}</span>`,
    `              <h2 class="store-card__title">${title}</h2>`,
    '            </div>',
    '          </div>',
    '        </article>',
  ].join("\n");
}

function buildScriptBlock(config) {
  return [
    "    var STORE_LCP_PRODUCT = {",
    `      slug: ${JSON.stringify(config.slug)},`,
    `      name: ${JSON.stringify(config.name)},`,
    `      category: ${JSON.stringify(config.category)},`,
    `      priceText: ${JSON.stringify(config.priceText)},`,
    `      image: ${JSON.stringify(config.image)},`,
    `      alt: ${JSON.stringify(config.alt)}`,
    "    };",
  ].join("\n");
}

const config = validateConfig(readJson(CONFIG_PATH));
const originalSource = read(STORE_PATH);

let nextSource = originalSource;
nextSource = replaceMarkedRegion(nextSource, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->", buildPreloadBlock(config));
nextSource = replaceMarkedRegion(nextSource, "<!-- STORE_LCP_CARD_START -->", "<!-- STORE_LCP_CARD_END -->", buildCardBlock(config));
nextSource = replaceMarkedRegion(nextSource, "// STORE_LCP_PRODUCT_START", "// STORE_LCP_PRODUCT_END", buildScriptBlock(config));

if (nextSource !== originalSource) {
  writeFileSync(STORE_PATH, nextSource, "utf8");
  console.log("STORE LCP SYNC OK");
  console.log("status=updated");
} else {
  console.log("STORE LCP SYNC OK");
  console.log("status=unchanged");
}
