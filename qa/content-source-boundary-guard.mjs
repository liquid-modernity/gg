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

function requireIncludes(label, text, needle, message) {
  if (!text.includes(needle)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

function forbidIncludes(label, text, needle, message) {
  if (text.includes(needle)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const architecture = read("ARCHITECTURE.md");
const surfaceContract = read("SURFACE-CONTRACT.md");
const assetArchitecture = read("ASSET-ARCHITECTURE.md");
const agents = read("AGENTS.md");
const storeConfig = read("src/store/store.config.mjs");
const storeBuild = read("tools/store-build.sh");
const storeHtml = read("store.html");
const indexXml = read("index.xml");
const appJs = read("src/js/gg-app.source.js");
const worker = read("worker.js");
const sourceRegistry = read("src/registry/gg-source-boundary.registry.js");

if (rootSource.sourceHost === "pakrpp.blogspot.com") pass("rootSource declares root Blogger source host");
else fail("rootSource.sourceHost must be pakrpp.blogspot.com");

if (rootSource.publicCanonicalBase === "https://www.pakrpp.com/") pass("rootSource declares public root canonical base");
else fail("rootSource.publicCanonicalBase must be https://www.pakrpp.com/");

if (storeSource.sourceHost === "pakrppstore.blogspot.com") pass("storeSource declares Store Blogger source host");
else fail("storeSource.sourceHost must be pakrppstore.blogspot.com");

if (storeSource.sourceCustomHost === "https://store.pakrpp.com/") pass("storeSource declares Store custom source host");
else fail("storeSource.sourceCustomHost must be https://store.pakrpp.com/");

if (storeSource.publicCanonicalBase === "https://www.pakrpp.com/store/") pass("storeSource declares public Store canonical base");
else fail("storeSource.publicCanonicalBase must be https://www.pakrpp.com/store/");

if (storeSource.feed.url.includes("pakrppstore.blogspot.com")) pass("Store feed is declared on Store Blogger source");
else fail("storeSource.feed.url must use pakrppstore.blogspot.com");

if (rootSource.feed.url.includes("pakrpp.blogspot.com")) pass("Root feed is declared on root Blogger source");
else fail("rootSource.feed.url must use pakrpp.blogspot.com");

for (const token of [
  "rootSource",
  "storeSource",
  "pakrpp.blogspot.com",
  "pakrppstore.blogspot.com",
  "store.pakrpp.com",
  "https://www.pakrpp.com/store/",
]) {
  requireIncludes("source registry", sourceRegistry, token, `declares ${token}`);
}

requireIncludes("store config", storeConfig, "../registry/gg-source-boundary.registry.js", "imports central source boundary registry");
requireIncludes("store config", storeConfig, "STORE_FEED_URL = storeSource.feed.url", "derives primary Store feed from source registry");
requireIncludes("store config", storeConfig, "STORE_FEED_PATH = storeSource.feed.url", "derives runtime Store feed from source registry");
forbidIncludes("store config", storeConfig, "https://www.pakrpp.com/feeds/posts/default/-/Store", "does not hardcode root CMS Store feed");

requireIncludes("store build wrapper", storeBuild, "storeSource.feed.url", "reads Store feed URL from source registry");
forbidIncludes("store build wrapper", storeBuild, "https://www.pakrpp.com/feeds/posts/default/-/Store", "does not hardcode root CMS Store feed");

requireIncludes("store.html", storeHtml, storeSource.feed.url, "declares Store source feed URL");
requireIncludes("store.html", storeHtml, storeSource.feed.legacyUrl, "declares Store source legacy feed URL");
forbidIncludes("store.html", storeHtml, "data-store-feed-url=\"/feeds/posts/default/-/Store", "does not use root-relative Store feed as primary source");

requireIncludes("root app runtime", appJs, "var GG_SOURCE_BOUNDARY", "declares runtime source boundary config");
requireIncludes("root app runtime", appJs, "GG_SOURCE_BOUNDARY.rootSource.feed.endpointPath", "derives root feed endpoint from runtime source config");
forbidIncludes("root app runtime", appJs, "makeHomeUrl('feeds/posts/default?alt=json", "does not hardcode root feed inside controller fetcher");

requireIncludes("index.xml", indexXml, "&quot;@type&quot;: &quot;BlogPosting&quot;", "root post detail schema remains editorial");
forbidIncludes("index.xml", indexXml, ">Product<b:else/>BlogPosting", "root Blogger template does not emit Product schema");

requireIncludes("worker.js", worker, "STORE_PUBLIC_PATH", "Worker declares Store route constants");
requireIncludes("worker.js", worker, "serveStoreCleanRoute", "Worker serves Store static clean routes");
forbidIncludes("worker.js", worker, "HTMLRewriter", "Worker does not use HTMLRewriter as source-boundary fix");

for (const [label, doc] of [
  ["AGENTS.md", agents],
  ["ARCHITECTURE.md", architecture],
  ["ASSET-ARCHITECTURE.md", assetArchitecture],
  ["SOURCE-OF-TRUTH.md", sourceOfTruth],
  ["SURFACE-CONTRACT.md", surfaceContract],
]) {
  requireIncludes(label, doc, "pakrppstore.blogspot.com", "documents Store Blogger source host");
  requireIncludes(label, doc, "store.pakrpp.com", "documents Store source-only custom host");
  requireIncludes(label, doc, "https://www.pakrpp.com/store/", "documents public Store canonical route");
  requireIncludes(label, doc, "HTMLRewriter", "documents Worker is not HTMLRewriter/CMS repair");
}

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-content-source-boundary"] === "node qa/content-source-boundary-guard.mjs") pass("package script gaga:verify-content-source-boundary is wired");
else fail("package.json missing gaga:verify-content-source-boundary script");

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-content-source-boundary")) pass("ci:qa includes content source boundary guard");
else fail("ci:qa must include npm run gaga:verify-content-source-boundary");

requireIncludes("QA-COMMANDS.md", qaCommands, "npm run gaga:verify-content-source-boundary", "documents content source boundary guard");
requireIncludes("SOURCE-OF-TRUTH.md", sourceOfTruth, "src/registry/gg-source-boundary.registry.js", "documents source boundary registry");

if (failures.length) {
  console.error("CONTENT SOURCE BOUNDARY GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("CONTENT SOURCE BOUNDARY GUARD PASS");
