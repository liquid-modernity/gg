#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { rootSource, storeSource } from "../src/registry/gg-source-boundary.registry.js";

const ROOT = process.cwd();
const failures = [];
const passes = [];

function read(file) {
  const absolute = path.resolve(ROOT, file);
  if (!existsSync(absolute)) {
    failures.push(`${file} is missing`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function requireIncludes(label, source, needle, message) {
  if (source.includes(needle)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function forbidIncludes(label, source, needle, message) {
  if (source.includes(needle)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

function requirePattern(label, source, pattern, message) {
  if (pattern.test(source)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function firstTag(source, pattern) {
  const match = source.match(pattern);
  return match ? match[0] : "";
}

function requireTagAttrs(label, tag, attrs, message) {
  const missing = attrs.filter((attr) => !new RegExp(`\\b${attr}\\b`).test(tag));
  if (!tag) fail(`${label}: ${message} (tag missing)`);
  else if (missing.length) fail(`${label}: ${message} (missing ${missing.join(", ")})`);
  else pass(`${label}: ${message}`);
}

function parseJson(file) {
  const source = read(file);
  if (!source) return null;
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${file}: invalid JSON (${error.message})`);
    return null;
  }
}

const packageJson = parseJson("package.json") || { scripts: {} };
const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const appJs = read("src/js/gg-app.source.js");
const storeDiscoveryJs = read("src/store/store-discovery.js");
const storeRender = read("src/store/lib/render-store-page.mjs");
const storeNormalizer = read("src/store/lib/normalize-store-product.mjs");
const storeJsonLd = read("src/store/lib/build-store-jsonld.mjs");
const storeManifestBuilder = read("src/store/lib/build-store-manifest.mjs");
const storeConfig = read("src/store/store.config.mjs");
const sourceRegistry = read("src/registry/gg-source-boundary.registry.js");
const manifest = parseJson("store/data/manifest.json") || { items: [] };
const worker = read("worker.js");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");

const scripts = packageJson.scripts || {};

for (const key of ["sourceHost", "publicCanonicalBase", "feed", "sitemap"]) {
  if (rootSource[key]) pass(`rootSource.${key} is centralized`);
  else fail(`rootSource.${key} must be centralized in source registry`);
}

for (const key of ["sourceHost", "publicCanonicalBase", "feed", "sitemap"]) {
  if (storeSource[key]) pass(`storeSource.${key} is centralized`);
  else fail(`storeSource.${key} must be centralized in source registry`);
}

if (storeSource.publicCanonicalBase === "https://www.pakrpp.com/store/") pass("Store public canonical base is /store/");
else fail("storeSource.publicCanonicalBase must be https://www.pakrpp.com/store/");

requireIncludes("source registry", sourceRegistry, "rootSource", "declares rootSource");
requireIncludes("source registry", sourceRegistry, "storeSource", "declares storeSource");
requireIncludes("store config", storeConfig, "../registry/gg-source-boundary.registry.js", "imports source boundary registry");
requireIncludes("store config", storeConfig, "STORE_FEED_URL = storeSource.feed.url", "derives Store feed from registry");
requireIncludes("root runtime", appJs, "GG_SOURCE_BOUNDARY.rootSource.feed.endpointPath", "derives root feed endpoint from runtime source boundary");
forbidIncludes("root runtime", appJs, "pakrppstore.blogspot.com/feeds/posts", "does not fetch Store feed on Root");
forbidIncludes("Store runtime", storeDiscoveryJs, "pakrpp.blogspot.com/feeds/posts", "does not fetch Root feed on Store");
forbidIncludes("Store runtime", storeDiscoveryJs, "https://pakrppstore.blogspot.com/feeds/posts", "does not hardcode Store Blogspot feed in controller");

const rootRowTag = firstTag(indexXml, /<article\b[^>]*class='gg-entry-row'[^>]*expr:data-gg-type[^>]*>/is);
const detailArticleTag = firstTag(indexXml, /<article\b[^>]*class='gg-article'[^>]*>/is);
const storeCardTag = firstTag(storeHtml, /<article\b[^>]*class="store-card"[^>]*data-store-product-id="[^"]+"[^>]*>/is);

requireTagAttrs("index.xml root rows", rootRowTag, [
  "data-gg-title",
  "data-gg-url",
  "data-gg-summary",
  "data-gg-date",
  "data-gg-author",
  "data-gg-type",
  "data-gg-surface",
  "data-gg-source",
], "previewable rows expose unified data payload");
requirePattern("index.xml root rows", indexXml, /expr:data-gg-type='&quot;post&quot;'/, "Root listing rows declare post type");
requirePattern("index.xml root rows", indexXml, /expr:data-gg-surface='&quot;root-listing&quot;'/, "Root listing rows declare root-listing surface");
requireTagAttrs("index.xml detail article", detailArticleTag, [
  "data-gg-title",
  "data-gg-url",
  "data-gg-summary",
  "data-gg-date",
  "data-gg-author",
  "data-gg-type",
  "data-gg-surface",
  "data-gg-source",
], "detail article exposes unified data payload");
requireIncludes("landing.html", landingHtml, 'data-gg-type="landing"', "landing surface declares unified type");
requireIncludes("landing.html", landingHtml, 'data-gg-source="landing-static"', "landing surface declares source");

requireIncludes("Store renderer", storeRender, 'data-gg-type="product"', "Store cards declare product type");
requireIncludes("Store renderer", storeRender, 'data-gg-surface="store-listing"', "Store cards declare listing surface");
requireIncludes("Store renderer", storeRender, 'data-gg-source="storeSource"', "Store cards declare Store source");
requireIncludes("Store renderer", storeRender, "data-store-source-url", "Store cards keep source URL separate from public URL");
requireIncludes("Store normalizer", storeNormalizer, "sourceUrl", "keeps backend/source URL separate");
requireIncludes("Store normalizer", storeNormalizer, "canonicalUrl: storeUrl || sourceUrl", "normalizes canonical URL to public Store route first");
requireIncludes("Store JSON-LD", storeJsonLd, "const publicUrl = clean(product.storeUrl)", "uses public Store URL for Product schema URL");
requireIncludes("Store manifest builder", storeManifestBuilder, "sourceUrl", "emits source URL separately");
requireIncludes("Store manifest builder", storeManifestBuilder, "url: storeAbsoluteUrl", "emits public Store URL as manifest URL");

requireTagAttrs("store.html", storeCardTag, [
  "data-gg-title",
  "data-gg-url",
  "data-gg-summary",
  "data-gg-image",
  "data-gg-date",
  "data-gg-author",
  "data-gg-type",
  "data-gg-surface",
  "data-gg-source",
  "data-store-source-url",
], "built Store cards expose unified product payload");
requireIncludes("store.html", storeCardTag, 'data-gg-type="product"', "built Store cards declare product type");
forbidIncludes("store.html", storeHtml, 'data-gg-type="post"', "Store cards do not masquerade as posts");
forbidIncludes("index.xml", indexXml, "data-gg-type='&quot;product&quot;'", "Root articles do not masquerade as products");

for (const item of Array.isArray(manifest.items) ? manifest.items : []) {
  if (!item.url || item.url.startsWith("https://www.pakrpp.com/store")) pass(`manifest ${item.slug}: public URL is Store canonical`);
  else fail(`manifest ${item.slug}: url must use https://www.pakrpp.com/store, got ${item.url}`);
  if (!item.sourceUrl || item.sourceUrl.startsWith("https://www.pakrpp.com/store") || item.sourceUrl.startsWith("https://www.pakrpp.com/") || item.sourceUrl.includes("blogspot.com") || item.sourceUrl.startsWith("https://store.pakrpp.com/")) {
    pass(`manifest ${item.slug}: source URL separated or absent`);
  } else {
    fail(`manifest ${item.slug}: unexpected sourceUrl ${item.sourceUrl}`);
  }
}

requireIncludes("root preview", appJs, "row.getAttribute('data-gg-summary')", "prefers row data-gg summary payload");
requireIncludes("root preview", appJs, "summary = payload.summary || detail.summary", "uses clicked payload before fetched detail summary");
requireIncludes("root preview", appJs, "article.getAttribute('data-gg-summary')", "parses detail data-gg summary before legacy attrs");
requirePattern(
  "root preview",
  appJs,
  /articleSummary \|\| descriptionFromJsonLd\(\) \|\| descriptionFromBody\(\) \|\| descriptionFromMeta\(\)/,
  "uses meta description last for fetched detail fallback",
);
forbidIncludes("root preview", appJs, "document.querySelector('meta[name=\"description\"]')", "does not use global meta description as repeated preview summary");

forbidIncludes("worker.js", worker, "HTMLRewriter", "Worker does not synthesize unified data payloads");
forbidIncludes("worker.js", worker, "data-gg-summary", "Worker does not inject normal data-gg summaries");

if (scripts["gaga:verify-unified-data-contract"] === "node qa/unified-data-contract-guard.mjs") pass("package script is wired");
else fail("package.json missing gaga:verify-unified-data-contract script");

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-unified-data-contract")) pass("ci:qa includes unified data guard");
else fail("ci:qa must include npm run gaga:verify-unified-data-contract");

requireIncludes("QA-COMMANDS.md", qaCommands, "npm run gaga:verify-unified-data-contract", "documents unified data guard command");
requireIncludes("SOURCE-OF-TRUTH.md", sourceOfTruth, "qa/unified-data-contract-guard.mjs", "documents unified data guard");

if (failures.length) {
  console.error("UNIFIED DATA CONTRACT GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("UNIFIED DATA CONTRACT GUARD PASS");
