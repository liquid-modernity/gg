#!/usr/bin/env node

/* tools/preflight.mjs — GG release preflight v10.3-cicd
 *
 * Purpose:
 * - Validate that the repository is ready for the Edge Governance Worker.
 * - Reject stale Worker contracts such as PUBLIC_STATIC_ROUTES.
 * - Validate source syntax, flags, manifest, static asset presence, Blogger XML markers,
 *   critical extracted app assets, ASSETS binding, and /__gg asset routing contracts.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();

const requiredFiles = [
  "_headers",
  "flags.json",
  "index.xml",
  "manifest.webmanifest",
  "offline.html",
  "store.html",
  "sw.js",
  "worker.js",
  "wrangler.jsonc",
];

const recommendedFiles = [
  "ads.txt",
  "landing.html",
  "llms.txt",
  "robots.txt",
];

const recommendedDirs = [
  "gg-pwa-icon",
];

function fail(message) {
  console.error(`preflight: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`preflight warning: ${message}`);
}

function ok(message) {
  console.log(message);
}

function fileExists(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  return existsSync(absolutePath) && statSync(absolutePath).isFile();
}

function dirExists(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  return existsSync(absolutePath) && statSync(absolutePath).isDirectory();
}

function read(relativePath) {
  return readFileSync(path.resolve(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
  }
}

function stripJsonc(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:\\])\/\/.*$/gm, "$1")
    .replace(/,\s*([}\]])/g, "$1");
}

function readJsonc(relativePath) {
  try {
    return JSON.parse(stripJsonc(read(relativePath)));
  } catch (error) {
    fail(`${relativePath} is not valid JSONC: ${error.message}`);
  }
}

function normalizeRelativePath(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/^\.\//, "").replace(/\/$/, "");
}

function resolveAssetDirectory(wrangler) {
  const directory = wrangler?.assets?.directory;
  if (!directory || typeof directory !== "string") {
    fail("wrangler.jsonc is missing assets.directory");
  }
  return normalizeRelativePath(directory);
}

function assertAssetFile(assetDir, relativeAssetPath, label) {
  const normalizedAssetDir = normalizeRelativePath(assetDir);
  const fullPath = `${normalizedAssetDir}/${relativeAssetPath}`;
  if (!fileExists(fullPath)) {
    fail(`${label || relativeAssetPath} is missing from ASSETS directory: ${fullPath}`);
  }
  return fullPath;
}

function assertNoBroadJsonHeaderForGgAssets(headersSource) {
  const blockMatch = headersSource.match(/\/__gg\/\*[\s\S]*?(?=\n\/|\n#|\s*$)/);
  if (blockMatch && /Content-Type:\s*application\/json/i.test(blockMatch[0])) {
    fail('_headers must not force Content-Type: application/json on /__gg/* because /__gg/assets/*.css and *.js live there');
  }
}

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    fail(label || `missing expected source marker: ${needle}`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    fail(label || `unexpected source marker present: ${needle}`);
  }
}

function assertAnyIncludes(source, needles, label) {
  if (!needles.some((needle) => source.includes(needle))) {
    fail(label || `missing one of expected markers: ${needles.join(", ")}`);
  }
}

function assertFileIncludes(relativePath, needle, label) {
  assertIncludes(read(relativePath), needle, label || `${relativePath} is missing marker: ${needle}`);
}

function assertAssetReference(source, pattern, label) {
  if (!pattern.test(source)) fail(label);
}

function syntaxCheckModule(relativePath, label) {
  const source = read(relativePath);
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "gg-syntax-check-"));
  const tempFile = path.join(tempDir, `${label}.mjs`);

  writeFileSync(tempFile, source, "utf8");

  const result = spawnSync(process.execPath, ["--check", tempFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  rmSync(tempDir, { recursive: true, force: true });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    fail(`${relativePath} failed syntax validation`);
  }
}

for (const file of requiredFiles) {
  if (!fileExists(file)) fail(`missing required file: ${file}`);
}

for (const file of recommendedFiles) {
  if (!fileExists(file)) warn(`recommended file is missing: ${file}`);
}

for (const dir of recommendedDirs) {
  if (!dirExists(dir)) warn(`recommended directory is missing: ${dir}`);
}

syntaxCheckModule("worker.js", "worker-syntax-check");

for (const script of [
  "tools/build-store-static.mjs",
  "tools/cloudflare-prepare.mjs",
  "tools/cloudflare-deploy.mjs",
  "tools/gaga-release.mjs",
  "tools/proof-store-static.mjs",
  "tools/template-pack.mjs",
]) {
  if (fileExists(script)) syntaxCheckModule(script, path.basename(script, ".mjs"));
}

const flags = readJson("flags.json");
const allowedModes = new Set(["development", "staging", "production"]);
if (!allowedModes.has(flags.mode)) {
  fail(`flags.json mode must be development, staging, or production; found ${JSON.stringify(flags.mode)}`);
}

if (flags.mode === "production") {
  warn("flags.json mode is production. Confirm dummy content has been removed before deploy.");
}

for (const key of ["edge", "robots", "sw", "limits"]) {
  if (!flags[key] || typeof flags[key] !== "object") {
    fail(`flags.json is missing required object: ${key}`);
  }
}

const manifest = readJson("manifest.webmanifest");
if (manifest.scope !== "/") fail('manifest.webmanifest must use scope "/"');
if (!manifest.start_url) fail("manifest.webmanifest is missing start_url");
if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  warn("manifest.webmanifest should define at least 192 and 512 icons");
}

const wrangler = readJsonc("wrangler.jsonc");
const assetDir = resolveAssetDirectory(wrangler);
if (wrangler.assets?.binding !== "ASSETS") fail('wrangler.jsonc assets.binding must be "ASSETS"');
if (wrangler.assets?.run_worker_first !== true) fail("wrangler.jsonc assets.run_worker_first must be true so Worker route policy runs before static assets");

for (const assetPath of [
  "__gg/assets/css/gg-app.dev.css",
  "__gg/assets/js/gg-app.dev.js",
]) {
  assertAssetFile(assetDir, assetPath, `critical extracted app asset ${assetPath}`);
}

for (const assetPath of [
  "__gg/flags.json",
  "sw.js",
  "manifest.webmanifest",
  "offline.html",
]) {
  if (!fileExists(`${assetDir}/${assetPath}`)) warn(`recommended ASSETS file is missing: ${assetDir}/${assetPath}`);
}

const headersSource = read("_headers");
assertNoBroadJsonHeaderForGgAssets(headersSource);
assertAnyIncludes(headersSource, ["/__gg/assets/*.css", "/__gg/assets/css/*"], "_headers should define a CSS-specific /__gg/assets rule");
assertAnyIncludes(headersSource, ["/__gg/assets/*.js", "/__gg/assets/js/*"], "_headers should define a JS-specific /__gg/assets rule");
assertAnyIncludes(headersSource, ["text/css"], "_headers must set text/css for extracted CSS assets");
assertAnyIncludes(headersSource, ["application/javascript", "text/javascript"], "_headers must set JavaScript MIME for extracted JS assets");

const indexSourceForAssets = read("index.xml");
assertAnyIncludes(indexSourceForAssets, ["/__gg/assets/css/gg-app.dev.css", "gg-app.min.css"], "index.xml should reference the extracted app CSS asset");
assertAnyIncludes(indexSourceForAssets, ["/__gg/assets/js/gg-app.dev.js", "gg-app.min.js"], "index.xml should reference the extracted app JS asset");

const workerSource = read("worker.js");
const requiredWorkerMarkers = [
  "edge-governance-v10",
  "STATIC_ROUTE_ASSET_MAP",
  "GG_ASSET_PREFIX",
  '"/__gg/assets/"',
  "STORE_PUBLIC_PATH",
  "STORE_INTERNAL_PATH",
  "FLAGS_CANONICAL_PATH",
  '"/gg-flags.json"',
  '"/flags.json"',
  '"/__gg/health"',
  '"/__gg/routes"',
  '"/__gg/robots"',
  '"/__gg/headers"',
  '"/__gg/pwa"',
  "storeRouteRedirect",
  "legacyViewRedirect",
  "isLegacyViewPath",
  "withResponsePolicy",
  "Service-Worker-Allowed",
  "X-GG-Worker",
  "X-GG-Edge-Mode",
  "X-GG-Route-Class",
  "X-GG-Template-Contract",
];

for (const marker of requiredWorkerMarkers) {
  assertIncludes(workerSource, marker, `worker.js is missing v10 governance marker: ${marker}`);
}

if (workerSource.includes("PUBLIC_STATIC_ROUTES")) {
  fail("worker.js still contains stale PUBLIC_STATIC_ROUTES contract");
}

assertAnyIncludes(workerSource, ["pathname.startsWith(GG_ASSET_PREFIX)", "path.startsWith(GG_ASSET_PREFIX)", "startsWith(\"/__gg/assets/\")"], "worker.js must route /__gg/assets/* before diagnostics");
assertAnyIncludes(workerSource, ["env.ASSETS.fetch"], "worker.js must serve Cloudflare ASSETS through env.ASSETS.fetch");

assertAnyIncludes(workerSource, ["developmentRobotsTag", "noindex, nofollow, nosnippet"], "worker.js is missing development crawler lockdown policy");
assertAnyIncludes(workerSource, ["Google-Extended", "GPTBot", "OAI-SearchBot"], "worker.js is missing AI/search crawler robots policy");

const swSource = read("sw.js");
assertIncludes(swSource, "/offline.html", "sw.js is missing offline fallback URL");
assertAnyIncludes(swSource, ["/gg-flags.json", "/flags.json", "FLAGS_URL"], "sw.js is missing flags URL contract");

const storeSource = read("store.html");
assertIncludes(storeSource, 'name="gg-store-contract" content="store-static-prerender-v1"', "store.html is missing the static prerender contract marker");
for (const marker of [
  "<!-- STORE_LCP_PRELOAD_START -->",
  "<!-- STORE_STATIC_GRID_START -->",
  "<!-- STORE_STATIC_PRODUCTS_JSON_START -->",
  '<script type="application/json" id="store-static-products">',
  "<!-- STORE_ITEMLIST_JSONLD_START -->",
  '<script type="application/ld+json" id="store-itemlist-jsonld">',
  "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->",
]) {
  assertIncludes(storeSource, marker, `store.html is missing static store marker: ${marker}`);
}
assertAssetReference(
  storeSource,
  /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']\/assets\/store\/store\.css["'][^>]*>/i,
  "store.html is missing /assets/store/store.css reference"
);
assertAssetReference(
  storeSource,
  /<script\b[^>]*src=["']\/assets\/store\/store\.js["'][^>]*\bdefer\b[^>]*><\/script>/i,
  "store.html is missing deferred /assets/store/store.js reference"
);
for (const marker of [
  "function readStaticProducts(",
  "function hydrateStaticProducts(",
  "function loadProducts(",
]) {
  assertNotIncludes(storeSource, marker, `store.html unexpectedly contains re-inlined runtime store function: ${marker}`);
}

if (!fileExists("assets/store/store.js")) fail("missing required file: assets/store/store.js");
if (!fileExists("assets/store/store.css")) fail("missing required file: assets/store/store.css");

const storeRuntimeSource = read("assets/store/store.js");
const storeCssSource = read("assets/store/store.css");

for (const marker of [
  "// STORE_LCP_PRODUCT_START",
  "function readStaticProducts(",
  "function hydrateStaticProducts(",
  "function loadProducts(",
  "data-store-open-preview",
  "store-static-products",
]) {
  assertIncludes(storeRuntimeSource, marker, `assets/store/store.js is missing runtime store marker: ${marker}`);
}

for (const marker of [
  ".store-app",
  ".store-card",
  ".store-preview-sheet",
  ".store-semantic-category-rail",
  ".gg-dock",
]) {
  assertIncludes(storeCssSource, marker, `assets/store/store.css is missing store style marker: ${marker}`);
}

const offlineSource = read("offline.html");
assertAnyIncludes(offlineSource, ["data-gg-surface=\"offline\"", "data-gg-surface='offline'"], "offline.html is missing data-gg-surface=offline");
assertAnyIncludes(offlineSource, ["noindex", "robots"], "offline.html should carry noindex robots metadata");

const templateSource = read("index.xml");
if (!templateSource.includes("<html") || !templateSource.includes("<b:skin")) {
  fail("index.xml does not look like the Blogger template source");
}

const templateMarkers = [
  `id='gg-shell'`,
  `id='main'`,
  `id='gg-dock'`,
  `id='gg-command-panel'`,
  `id='gg-preview-sheet'`,
  `id='gg-more-panel'`,
];

for (const marker of templateMarkers) {
  if (!templateSource.includes(marker)) {
    fail(`index.xml is missing expected template marker: ${marker}`);
  }
}

const wranglerSource = read("wrangler.jsonc");
assertAnyIncludes(wranglerSource, [".cloudflare-build/worker.js", "main"], "wrangler.jsonc should point to the prepared Worker entry");
assertAnyIncludes(wranglerSource, [".cloudflare-build/public", "assets"], "wrangler.jsonc should include static assets directory/binding");
assertIncludes(wranglerSource, '"run_worker_first": true', "wrangler.jsonc must force the Worker to run before static assets");

ok("PREFLIGHT OK");
ok(`mode=${flags.mode}`);
ok(`assets_directory=${assetDir}`);
ok("critical_app_assets=/__gg/assets/css/gg-app.dev.css,/__gg/assets/js/gg-app.dev.js");
ok("worker_contract=edge-governance-v10");
ok("legacy_view_redirect=/view* -> /");
ok("crawler_policy=development-lockdown-unless-production");
ok("scope=release-and-cloudflare-preflight");
