#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const files = {
  packageJson: "package.json",
  index: "index.xml",
  landing: "landing.html",
  store: "store.html",
  appJs: "src/js/gg-app.source.js",
  storeJs: "src/store/store-discovery.js",
  appCss: "src/css/gg-app.source.css",
  appCssAsset: "__gg/assets/css/gg-app.dev.css",
  storeCss: "src/store/store.css",
  storeCssAsset: "assets/store/store.css",
};

const text = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, existsSync(file) ? readFileSync(file, "utf8") : ""]),
);
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireIncludes(label, source, needle) {
  if (!source.includes(needle)) fail(`${label} missing ${needle}`);
}

function requireNotIncludes(label, source, needle) {
  if (source.includes(needle)) fail(`${label} must not include ${needle}`);
}

function blockById(source, id) {
  const start = source.search(new RegExp(`<[^>]+\\bid=(['"])${id}\\1[^>]*>`, "i"));
  if (start < 0) return "";
  const next = source.slice(start + 1).search(/<[^>]+\bdata-gg-panel=(['"])[^'"]+\1/i);
  return next < 0 ? source.slice(start) : source.slice(start, start + 1 + next);
}

function assertPanelScrollContainer(label, source, id, className = "") {
  const block = blockById(source, id);
  if (!block) {
    fail(`${label} missing #${id}`);
    return;
  }
  if (!block.includes("data-gg-scroll-container")) fail(`${label} #${id} missing data-gg-scroll-container`);
  if (className && !block.includes(className)) fail(`${label} #${id} missing ${className}`);
}

function assertPolicy(label, source, panelName, keys) {
  const panelPattern = new RegExp(`${panelName}:\\s*\\{`, "g");
  const matches = [...source.matchAll(panelPattern)];
  if (!matches.length) {
    fail(`${label} missing ${panelName} lifecycle policy`);
    return;
  }
  const hasPolicy = matches.some((match) => {
    const block = source.slice(match.index || 0, (match.index || 0) + 900);
    return keys.every((key) => block.includes(key));
  });
  if (!hasPolicy) {
    for (const key of keys) fail(`${label} ${panelName} policy missing ${key}`);
  }
}

function assertCssHitTarget(label, source) {
  requireIncludes(label, source, "--gg-hit-min: 44px");
  requireNotIncludes(label, source, "--gg-hit-min: 10px");
  requireIncludes(label, source, "--gg-sheet-handle-hit: 44px");
  requireIncludes(label, source, "--gg-sheet-head-height: 44px");
  requireNotIncludes(label, source, "--gg-sheet-head-height: 56px");
  requireIncludes(label, source, "--gg-sheet-handle-visual-width: 30px");
  requireIncludes(label, source, "--gg-sheet-handle-visual-height: 2.5px");
  requireIncludes(label, source, "min-width: var(--gg-sheet-handle-hit)");
  requireIncludes(label, source, "min-height: var(--gg-sheet-handle-hit)");
  requireIncludes(label, source, "height: var(--gg-panel-handle-height)");
}

function assertSheetTokens(label, source) {
  requireIncludes(label, source, "--gg-shell-edge-gap: 10px");
  requireIncludes(label, source, "--gg-dock-edge-gap:");
  requireIncludes(label, source, "--gg-sheet-edge-gap: 0px");
  requireIncludes(label, source, "--gg-dock-width:");
  requireIncludes(label, source, "--gg-panel-width: min(calc(100");
  requireNotIncludes(label, source, "--gg-panel-width: var(--gg-dock-width)");
  requireIncludes(label, source, "--gg-sheet-utility-max-height");
  requireIncludes(label, source, "--gg-sheet-content-max-height");
  requireIncludes(label, source, "width: var(--gg-dock-width)");
  if (!source.includes("width: var(--gg-panel-width)") && !source.includes("--store-sheet-width: var(--gg-panel-width)")) {
    fail(`${label} missing sheet width usage from --gg-panel-width`);
  }
}

function assertPreviewMediaTokens(label, source) {
  requireIncludes(label, source, "--gg-preview-panel-initial-height: min(72dvh, 720px)");
  requireIncludes(label, source, "--gg-preview-hero-height: clamp(360px, 58dvh, 540px)");
  requireIncludes(label, source, "--gg-preview-hero-aspect: 4 / 5");
  requireIncludes(label, source, "--gg-preview-overlay-lift: clamp(108px, 18vw, 148px)");
  requireIncludes(label, source, "--gg-preview-media-fit: cover");
  requireIncludes(label, source, "aspect-ratio: var(--gg-preview-hero-aspect)");
  requireIncludes(label, source, "object-fit: var(--gg-preview-media-fit)");
}

function assertDockDemotion(label, source) {
  requireIncludes(label, source, "body[data-gg-panel-active='true'] .gg-dock");
  requireIncludes(label, source, "pointer-events: none");
  requireIncludes(label, source, "user-select: none");
  requireIncludes(label, source, ".gg-dock::after");
  requireIncludes(label, source, "body[data-gg-panel-active='true'] .gg-dock::after");
  requireNotIncludes(label, source, "body[data-gg-dock-state='hidden-by-scroll'] .gg-dock, body[data-gg-panel-active='true'] .gg-dock");
}

function assertDockInert(label, source) {
  requireIncludes(label, source, "setDockInert");
  requireIncludes(label, source, "setAttribute('aria-hidden', 'true')");
  requireIncludes(label, source, "setAttribute('inert', '')");
  requireIncludes(label, source, "removeAttribute('inert')");
}

function assertDragZoneRuntime(label, source) {
  requireIncludes(label, source, "data-gg-drag-zone");
  requireIncludes(label, source, "resolveDragCandidate");
  requireIncludes(label, source, "isInteractiveDragZoneTarget");
  requireIncludes(label, source, "fromHandle");
  if (!source.includes("session.active") && !source.includes("drag.active") && !source.includes("state.dragSession.active")) {
    fail(`${label} missing drag threshold active-state tracking`);
  }
}

function assertScrimActivation(label, source) {
  requireIncludes(label, source, "[data-gg-state='opening']");
  requireIncludes(label, source, "[data-gg-state='open']");
  requireIncludes(label, source, "[data-gg-state='dragging']");
  requireIncludes(label, source, "opacity: 1");
}

function assertStoreDots(label, source) {
  const dotsIndex = source.indexOf("store-preview__dots");
  if (dotsIndex === -1) {
    fail(`${label} missing store-preview__dots`);
    return;
  }
  const dotsBlock = source.slice(dotsIndex, dotsIndex + 700);
  if (dotsBlock.includes("gg-sheet__handle")) fail(`${label} store-preview__dots must not include gg-sheet__handle`);
  if (dotsBlock.includes("data-gg-drag-handle")) fail(`${label} store-preview__dots must not include data-gg-drag-handle`);
  if (dotsBlock.includes("data-gg-drag-zone")) fail(`${label} store-preview__dots must not include data-gg-drag-zone`);
  if (dotsBlock.includes("position:")) {
    requireIncludes(label, dotsBlock, "right:");
    requireIncludes(label, dotsBlock, "background: transparent");
    requireIncludes(label, dotsBlock, "transform: none");
  }
}

function assertResetTargets(label, source) {
  requireIncludes(label, source, "function collectPanelScrollTargets");
  requireIncludes(label, source, ".gg-sheet__panel, .gg-content-sheet__panel");
  requireIncludes(label, source, "[data-gg-scroll-container], .gg-sheet__panel, .gg-content-sheet__panel");
  requireIncludes(label, source, "collectPanelScrollTargets");
}

requireIncludes("landing.html", text.landing, 'data-gg-preview-surface="none"');
requireNotIncludes("landing.html", text.landing, 'data-gg-panel="preview"');

requireIncludes("index.xml", text.index, "data-gg-panel='preview'");
requireIncludes("store.html", text.store, 'data-gg-panel="preview"');

assertPanelScrollContainer("index.xml command", text.index, "gg-command-panel", "gg-discovery__body");
assertPanelScrollContainer("index.xml more", text.index, "gg-more-panel", "gg-more-body");
assertPanelScrollContainer("index.xml preview", text.index, "gg-preview-sheet", "gg-preview__body");

assertPanelScrollContainer("landing.html command", text.landing, "gg-command-panel", "gg-discovery__body");
assertPanelScrollContainer("landing.html more", text.landing, "gg-more-panel", "gg-more-body");

assertPanelScrollContainer("store.html preview", text.store, "store-preview-sheet", "store-preview__body");
assertPanelScrollContainer("store.html discovery", text.store, "store-discovery-sheet", "store-discovery-body");
assertPanelScrollContainer("store.html saved", text.store, "store-saved-sheet", "store-sheet-body");
assertPanelScrollContainer("store.html more", text.store, "store-more-sheet", "gg-more-body");

for (const [label, source] of [
  ["src/js/gg-app.source.js", text.appJs],
  ["landing.html", text.landing],
  ["src/store/store-discovery.js", text.storeJs],
]) {
  requireIncludes(label, source, "function resetPanelScroll");
  assertResetTargets(label, source);
  assertDockInert(label, source);
  assertDragZoneRuntime(label, source);
  requireIncludes(label, source, "data-gg-scroll-container");
  requireIncludes(label, source, "open-before-render");
  requireIncludes(label, source, "query-change");
  requireIncludes(label, source, "filter-change");
  requireIncludes(label, source, "close-after-hide");
}

requireNotIncludes("src/js/gg-app.source.js", text.appJs, "function resetSheetScroll");
requireNotIncludes("src/store/store-discovery.js", text.storeJs, "function resetSheetScroll");

assertPolicy("src/js/gg-app.source.js", text.appJs, "command", ["openBeforeRender", "openAfterRender", "closeAfterHide", "queryChange", "filterChange"]);
assertPolicy("src/js/gg-app.source.js", text.appJs, "preview", ["openBeforeRender", "openAfterRender", "closeBeforeHide", "closeAfterHide", "itemChange"]);
assertPolicy("src/js/gg-app.source.js", text.appJs, "more", ["openBeforeRender", "openAfterRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);
assertPolicy("landing.html", text.landing, "command", ["openBeforeRender", "openAfterRender", "closeAfterHide", "queryChange", "filterChange"]);
assertPolicy("landing.html", text.landing, "more", ["openBeforeRender", "openAfterRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "preview", ["openBeforeRender", "openAfterRender", "closeBeforeHide", "closeAfterHide", "itemChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "discovery", ["openBeforeRender", "openAfterRender", "closeAfterHide", "queryChange", "filterChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "saved", ["openBeforeRender", "openAfterRender", "closeAfterHide", "filterChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "more", ["openBeforeRender", "openAfterRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);

requireIncludes("landing.html", text.landing, "#gg-command-panel .gg-sheet__panel");
requireIncludes("landing.html", text.landing, "grid-template-rows: auto minmax(0, 1fr) auto;");
requireIncludes("landing.html", text.landing, "overflow: hidden;");
requireIncludes("landing.html", text.landing, ".gg-discovery__body");
requireIncludes("landing.html", text.landing, "-webkit-overflow-scrolling: touch");

requireIncludes("index.xml", text.index, "data-gg-drag-zone='sheet-head'");
requireIncludes("index.xml", text.index, "data-gg-drag-zone='preview-affordance'");
requireIncludes("landing.html", text.landing, 'data-gg-drag-zone="sheet-head"');
requireIncludes("store.html", text.store, 'data-gg-drag-zone="sheet-head"');
requireIncludes("store.html", text.store, 'data-gg-drag-zone="preview-affordance"');

assertCssHitTarget("src/css/gg-app.source.css", text.appCss);
if (text.appCssAsset) assertCssHitTarget("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
assertCssHitTarget("src/store/store.css", text.storeCss);
if (text.storeCssAsset) assertCssHitTarget("assets/store/store.css", text.storeCssAsset);

assertSheetTokens("src/css/gg-app.source.css", text.appCss);
assertSheetTokens("landing.html", text.landing);
assertSheetTokens("src/store/store.css", text.storeCss);
if (text.appCssAsset) assertSheetTokens("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
if (text.storeCssAsset) assertSheetTokens("assets/store/store.css", text.storeCssAsset);

assertDockDemotion("src/css/gg-app.source.css", text.appCss);
assertDockDemotion("landing.html", text.landing);
assertDockDemotion("src/store/store.css", text.storeCss);
if (text.appCssAsset) assertDockDemotion("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
if (text.storeCssAsset) assertDockDemotion("assets/store/store.css", text.storeCssAsset);

assertScrimActivation("src/css/gg-app.source.css", text.appCss);
assertScrimActivation("landing.html", text.landing);
assertScrimActivation("src/store/store.css", text.storeCss);
if (text.appCssAsset) assertScrimActivation("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
if (text.storeCssAsset) assertScrimActivation("assets/store/store.css", text.storeCssAsset);

assertPreviewMediaTokens("src/css/gg-app.source.css", text.appCss);
assertPreviewMediaTokens("src/store/store.css", text.storeCss);
if (text.appCssAsset) assertPreviewMediaTokens("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
if (text.storeCssAsset) assertPreviewMediaTokens("assets/store/store.css", text.storeCssAsset);

assertStoreDots("store.html", text.store);
assertStoreDots("src/store/store.css", text.storeCss);
if (text.storeCssAsset) assertStoreDots("assets/store/store.css", text.storeCssAsset);

requireNotIncludes("src/css/gg-app.source.css", text.appCss, "width: min(calc(100vw - 20px), 600px)");
requireNotIncludes("src/store/store.css", text.storeCss, "--gg-panel-width: min(calc(100vw - 12px), 600px)");
requireNotIncludes("landing.html", text.landing, "--gg-panel-width: min(calc(100vw - 0px), 600px)");
requireNotIncludes("src/css/gg-app.source.css", text.appCss, "--gg-panel-width: var(--gg-dock-width)");
requireNotIncludes("src/store/store.css", text.storeCss, "--gg-panel-width: var(--gg-dock-width)");
requireNotIncludes("landing.html", text.landing, "--gg-panel-width: var(--gg-dock-width)");

requireIncludes("package.json", text.packageJson, '"gaga:verify-sheet-lifecycle"');
requireIncludes("package.json", text.packageJson, "gaga:verify-preview-sheet && npm run gaga:verify-sheet-lifecycle");

if (existsSync("template/partials") || existsSync("template/index.original.xml")) {
  fail("template partials remain in active template/ path");
}
requireIncludes("docs/archive/template-deprecated/README.md", existsSync("docs/archive/template-deprecated/README.md") ? readFileSync("docs/archive/template-deprecated/README.md", "utf8") : "", "index.xml");

if (failures.length) {
  console.error("SHEET LIFECYCLE CONTRACT GUARD FAIL");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("SHEET LIFECYCLE CONTRACT GUARD PASS");
