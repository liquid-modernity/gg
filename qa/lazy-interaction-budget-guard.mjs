#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

function absolute(file) {
  return path.resolve(ROOT, file);
}

function read(file) {
  if (!existsSync(absolute(file))) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute(file), "utf8");
}

function pass(message) {
  passes.push(message);
}

function warn(message) {
  warnings.push(message);
}

function fail(message) {
  failures.push(message);
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertPattern(source, pattern, label) {
  if (pattern.test(source)) pass(label);
  else fail(label);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function block(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return "";
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  return end < 0 ? source.slice(start) : source.slice(start, end);
}

const packageJson = JSON.parse(read("package.json") || "{}");
const scripts = packageJson.scripts || {};
const app = read("src/js/gg-app.source.js");
const landing = read("landing.html");
const store = read("src/store/store-discovery.js");
const indexXml = read("index.xml");
const storeHtml = read("store.html");
const worker = read("worker.js");
const report = read("LAZY-INTERACTION-BUDGET-REPORT.md");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const readinessReport = read("READINESS-85-REPORT.md");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const readinessGuard = read("qa/readiness-85-guard.mjs");

if (scripts["gaga:verify-lazy-interaction-budget"] === "node qa/lazy-interaction-budget-guard.mjs") {
  pass("package script gaga:verify-lazy-interaction-budget is wired");
} else {
  fail("package.json missing gaga:verify-lazy-interaction-budget script");
}
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-lazy-interaction-budget", "ci:qa includes lazy interaction budget guard");
assertIncludes(ciGuard, "qa/lazy-interaction-budget-guard.mjs", "CI reconciliation classifies lazy interaction budget guard");
assertIncludes(readinessGuard, "gaga:verify-lazy-interaction-budget", "readiness guard runs lazy interaction budget guard");

for (const doc of [report, qaCommands, sourceOfTruth, readinessReport]) {
  assertIncludes(doc, "npm run gaga:verify-lazy-interaction-budget", "docs include lazy interaction guard command");
}
assertIncludes(sourceOfTruth, "LAZY-INTERACTION-BUDGET-REPORT.md", "SOURCE-OF-TRUTH documents lazy interaction report");

for (const marker of [
  "Blogger SSR content",
  "route-critical JSON-LD",
  "Reader Mode eligibility",
  "Store static product cards",
  "advisory unless a strict release mode is explicitly configured",
  "No UX feature was removed",
]) {
  assertIncludes(report, marker, `lazy interaction report documents ${marker}`);
}

const bootBlock = block(app, "bindBootStateListeners();", "ggIdle(function () {\n          initListingGrowth()");
assertIncludes(bootBlock, "applySurfaceContract();", "root boot keeps route detection eager");
assertIncludes(bootBlock, "setTheme(readPreferredTheme(), true);", "root boot keeps theme bootstrap eager");
assertIncludes(bootBlock, "initDockVisibility();", "root boot keeps dock visibility eager");
assertIncludes(bootBlock, "markShellReady();", "root boot marks shell ready before deferred work");
assertIncludes(bootBlock, "markFirstInteractionReady();", "root boot keeps first interaction readiness before deferred work");
assertIncludes(bootBlock, "scheduleCommentsEnhancement('post-hydration');", "root comments enhancement is deferred after hydration");

const pwaBlock = block(app, "function initPwaClient()", "function lockBodyScrollWhileOpen");
assertIncludes(pwaBlock, "ggIdle(function ()", "PWA service worker registration is idle-gated");
assertIncludes(pwaBlock, "registerPwaServiceWorker().then", "PWA registration remains available after idle");

const commentsSchedule = block(app, "function scheduleCommentsEnhancement", "function openCommentsSheet");
assertIncludes(commentsSchedule, "ggIdle(function ()", "comments enhancement scheduler uses idle");
assertIncludes(commentsSchedule, "runCommentsEnhancement", "comments enhancement scheduler keeps native comments enhancement path");
const commentsOpen = block(app, "function openCommentsSheet", "function closeCommentsSheet");
assertIncludes(commentsOpen, "runCommentsEnhancement(openOptions.reason || 'comments-open');", "comments enhancement runs on comments intent");

const previewLoad = block(app, "function loadPreviewDetail", "function hydratePreviewForLocale");
assertIncludes(previewLoad, "fetch(payload.url", "preview detail fetch remains in preview loader");
const previewOpen = block(app, "function openPreview", "function closePreview");
assertIncludes(previewOpen, "loadPreviewDetail(payload);", "preview detail loader is reached from preview intent");
assertNoPattern(bootBlock, /loadPreviewDetail\s*\(/u, "root boot does not fetch preview detail");

const discoveryLaunch = block(app, "function launchDiscovery", "function normalizedPath");
assertIncludes(discoveryLaunch, "ensureDiscoveryIndex()", "root discovery feed/index work is command intent-gated");
assertNoPattern(bootBlock, /ensureDiscoveryIndex\s*\(|requestCommandFeedEnhancement\s*\(/u, "root boot does not fetch discovery feed");

const landingCommand = block(landing, "function setupCommand()", "function openMorePreferencePanel");
assertIncludes(landingCommand, "renderCommand('');", "landing command renders static discovery immediately");
assertIncludes(landingCommand, "ggIdle(function(){ requestDiscoveryFeedEnhancement(); }, 1600);", "landing feed enhancement is idle-gated");

const storeLoad = block(store, "function loadProducts()", "function priceNumber");
const storeRefresh = block(store, "function refreshProductsFromFeed", "function scheduleProductFeedRefresh");
const storeOpenDiscovery = block(store, "function openDiscovery", "function scrollToStoreTarget");
assertIncludes(storeLoad, "hydrateStaticProducts(staticProducts)", "Store hydrates static products before live refresh");
assertIncludes(storeLoad, "if (hadStatic) scheduleProductFeedRefresh('static-idle');", "Store live feed refresh is idle-gated after static render");
assertIncludes(storeLoad, "else refreshProductsFromFeed('no-static');", "Store live feed remains eager only when no static products exist");
assertIncludes(storeRefresh, "fetchFeed('primary')", "Store live feed refresh path remains available");
assertIncludes(storeOpenDiscovery, "scheduleProductFeedRefresh('discovery-intent')", "Store discovery intent can schedule product feed refresh");
assertIncludes(storeOpenDiscovery, "ensureDiscoveryManifest();", "Store discovery manifest remains intent-gated");

assertIncludes(indexXml, "<data:post.body/>", "Blogger post body remains SSR-owned");
assertIncludes(indexXml, "id='gg-post-jsonld'", "route-critical post JSON-LD remains in Blogger HTML");
assertIncludes(storeHtml, "STORE_STATIC_GRID_START", "Store static product grid remains in HTML");
assertIncludes(storeHtml, "STORE_STATIC_PRODUCTS_JSON_START", "Store static product payload remains in HTML");

for (const scriptName of ["store:check:strict", "store:check:production"]) {
  assertIncludes(String(scripts[scriptName] || ""), "STORE_STRICT_IMAGES=1", `${scriptName} can promote Store image budgets explicitly`);
}
assertIncludes(String(scripts["store:check:strict"] || ""), "STORE_REQUIRE_LIVE_FEED=1", "strict Store check explicitly requires live feed");
assertIncludes(readinessReport, "Performance budgets are practical size checks", "readiness report keeps performance budgets advisory");
assertIncludes(readinessReport, "advisory unless strict release mode is explicit", "readiness report documents strict release budget promotion");

assertNoPattern(worker, /HTMLRewriter/u, "Worker does not repair lazy interaction contracts through HTMLRewriter");

warn("ADVISORY_WARNING route=all asset=interaction-budget current=tracked recommended=keep optimizing heavy interactions behind idle/intent blocking=advisory-unless-strict-release");

for (const passMessage of passes) console.log(`PASS ${passMessage}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);

if (failures.length) {
  console.error("LAZY INTERACTION BUDGET GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(warnings.length ? "LAZY INTERACTION BUDGET GUARD PASS_WITH_WARNINGS" : "LAZY INTERACTION BUDGET GUARD PASS");
