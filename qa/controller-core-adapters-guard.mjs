#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

function read(file) {
  const absolute = path.resolve(ROOT, file);
  if (!existsSync(absolute)) {
    failures.push(`missing required file: ${file}`);
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

function requireIncludes(label, source, needle) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function forbidIncludes(label, source, needle) {
  if (source.includes(needle)) fail(`${label}: forbidden ${needle}`);
  else pass(label);
}

function requirePattern(label, source, pattern) {
  if (pattern.test(source)) pass(label);
  else fail(label);
}

const appJs = read("src/js/gg-app.source.js");
const helperFragment = read("src/js/modules/controllers/dock-and-utils.fragment.js");
const publicApiFragment = read("src/js/modules/core/public-api.fragment.js");
const storeJs = read("src/store/store-discovery.js");
const landingHtml = read("landing.html");
const inventory = read("docs/architecture/controller-inventory-v1.md");
const worker = read("worker.js");
const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");

for (const heading of [
  "## Current Modules And Functions",
  "## Public API And Hooks",
  "## Event Listeners",
  "## Data Dependencies",
  "## CSS/Class Dependencies",
  "## Source And Feed Dependencies",
  "## Safe Extraction Completed In Task 09",
  "## Deferred Work",
]) {
  requireIncludes(`inventory documents ${heading}`, inventory, heading);
}

for (const requiredInventoryTerm of [
  "src/js/gg-app.source.js",
  "landing.html",
  "src/store/store-discovery.js",
  "window.GG.sheetController",
  "window.LandingSurface",
  "window.StoreSurface",
  "GG.core.helpers",
  "GG.adapters.store",
  "GG.sources.root",
  "GG.sources.store",
  "Worker must not mutate HTML",
]) {
  requireIncludes(`inventory includes ${requiredInventoryTerm}`, inventory, requiredInventoryTerm);
}

for (const source of [
  ["src/js/gg-app.source.js", appJs],
  ["src/js/modules/controllers/dock-and-utils.fragment.js", helperFragment],
]) {
  const [file, text] = source;
  requireIncludes(`${file}: exposes GG.core helper namespace`, text, "var controllerCore = GG.core = GG.core || {};");
  requireIncludes(`${file}: exports escapeHtml helper`, text, "controllerCore.helpers.escapeHtml = function escapeHtmlCore(value)");
  requireIncludes(`${file}: exports stripHtml helper`, text, "controllerCore.helpers.stripHtml = function stripHtmlCore(value)");
  requireIncludes(`${file}: exports debounce helper`, text, "controllerCore.helpers.debounce = function debounceCore(fn, wait)");
  requireIncludes(`${file}: exports timing helper`, text, "controllerCore.helpers.now = function nowCore()");
  requireIncludes(`${file}: legacy escapeHtml wrapper delegates to core`, text, "return coreHelpers.escapeHtml(value);");
  requireIncludes(`${file}: legacy stripHtml wrapper delegates to core`, text, "return coreHelpers.stripHtml(value);");
  requireIncludes(`${file}: legacy debounce wrapper delegates to core`, text, "return coreHelpers.debounce(fn, wait);");
  requireIncludes(`${file}: legacy body-state wrapper delegates to core`, text, "coreHelpers.writeBodyState(name, value);");
}

for (const source of [
  ["src/js/gg-app.source.js", appJs],
  ["src/js/modules/core/public-api.fragment.js", publicApiFragment],
]) {
  const [file, text] = source;
  requireIncludes(`${file}: exposes GG.registry`, text, "GG.registry = {");
  requireIncludes(`${file}: registry exposes copy`, text, "copy: COPY");
  requireIncludes(`${file}: registry exposes actions`, text, "actions: GG_GLOBAL_DISCOVERY_CONFIG.actions");
  requireIncludes(`${file}: registry exposes routes`, text, "routes: ROUTE_VOCABULARY_CONTRACT");
  requireIncludes(`${file}: registry exposes surfaces`, text, "surfaces: SURFACE_LEDGER");
  requireIncludes(`${file}: exposes source registry facade`, text, "GG.sources = {");
  requireIncludes(`${file}: exposes root source facade`, text, "root: GG_SOURCE_BOUNDARY.rootSource");
  requireIncludes(`${file}: exposes Store source facade`, text, "store: GG_SOURCE_BOUNDARY.storeSource");
  requireIncludes(`${file}: exposes route facade`, text, "GG.route = {");
  requireIncludes(`${file}: aliases existing sheet controller`, text, "GG.sheet = GG.sheetController;");
  requireIncludes(`${file}: exposes a11y facade`, text, "GG.a11y = {");
  requireIncludes(`${file}: exposes adapters facade`, text, "GG.adapters = {");
  requireIncludes(`${file}: preview adapter aliases existing API`, text, "preview: GG.preview");
  requireIncludes(`${file}: Discovery adapter aliases existing API`, text, "discovery: GG.command");
  requireIncludes(`${file}: comments adapter aliases existing API`, text, "comments: GG.commentsSheetController");
  requireIncludes(`${file}: Store adapter is descriptor only on root`, text, "owner: 'src/store/store-discovery.js'");
  requireIncludes(`${file}: Landing adapter is descriptor only on root`, text, "owner: 'landing.html'");
}

requireIncludes("Store runtime registers active Store adapter", storeJs, "window.GG.adapters.store = window.StoreSurface;");
requireIncludes("Store runtime aliases Store sheet controller under GG.sheet.store", storeJs, "window.GG.sheet.store = window.StoreSurface.sheetController;");
requireIncludes("Landing runtime registers active Landing adapter", landingHtml, "window.GG.adapters.landing = window.LandingSurface;");
requireIncludes("Landing runtime aliases Landing sheet controller under GG.sheet.landing", landingHtml, "window.GG.sheet.landing = window.LandingSurface.sheetController;");

requirePattern(
  "Blogger runtime keeps one exported panel controller",
  appJs,
  /GG\.panelController\s*=\s*\{/u
);
requirePattern(
  "Blogger runtime keeps one exported sheet controller",
  appJs,
  /GG\.sheetController\s*=\s*\{/u
);
forbidIncludes("Blogger runtime does not define a second root controller class", appJs, "class GGController");
forbidIncludes("Blogger runtime does not define a second sheet controller class", appJs, "class SheetController");
forbidIncludes("Blogger runtime does not hardcode Store feed fetch", appJs, "pakrppstore.blogspot.com/feeds/posts");
forbidIncludes("Store runtime does not hardcode root feed fetch", storeJs, "pakrpp.blogspot.com/feeds/posts");
forbidIncludes("Worker remains outside controller extraction", worker, "HTMLRewriter");
forbidIncludes("Worker does not synthesize GG adapters", worker, "GG.adapters");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-controller-core-adapters"] === "node qa/controller-core-adapters-guard.mjs") {
  pass("package script maps controller guard");
} else {
  fail("package.json must map gaga:verify-controller-core-adapters to node qa/controller-core-adapters-guard.mjs");
}

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-controller-core-adapters")) {
  pass("ci:qa includes controller guard");
} else {
  fail("ci:qa must include npm run gaga:verify-controller-core-adapters");
}

requireIncludes("QA-COMMANDS documents controller guard", qaCommands, "gaga:verify-controller-core-adapters");
requireIncludes("SOURCE-OF-TRUTH documents controller inventory", sourceOfTruth, "docs/architecture/controller-inventory-v1.md");
requireIncludes("SOURCE-OF-TRUTH documents controller guard", sourceOfTruth, "qa/controller-core-adapters-guard.mjs");

for (const message of passes) console.log(`PASS ${message}`);

if (failures.length) {
  console.error("CONTROLLER CORE ADAPTERS GUARD FAILED");
  for (const message of failures) console.error(`FAIL ${message}`);
  process.exit(1);
}

console.log("CONTROLLER CORE ADAPTERS GUARD PASS");
