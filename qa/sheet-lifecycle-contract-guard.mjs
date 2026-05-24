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
  requireIncludes(label, source, "min-width: var(--gg-hit-min)");
  requireIncludes(label, source, "min-height: var(--gg-hit-min)");
  requireIncludes(label, source, "--gg-panel-handle-height");
}

requireIncludes("landing.html", text.landing, 'data-gg-preview-surface="none"');
requireNotIncludes("landing.html", text.landing, 'data-gg-panel="preview"');

requireIncludes("index.xml", text.index, "data-gg-panel='preview'");
requireIncludes("store.html", text.store, 'data-gg-panel="preview"');

assertPanelScrollContainer("index.xml command", text.index, "gg-command-panel", "gg-discovery__body");
assertPanelScrollContainer("index.xml more", text.index, "gg-more-panel", "gg-more-body");
assertPanelScrollContainer("index.xml preview", text.index, "gg-preview-sheet", "gg-preview__body");

assertPanelScrollContainer("landing.html command", text.landing, "gg-command-panel", "gg-discovery-body");
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
  requireIncludes(label, source, "data-gg-scroll-container");
  requireIncludes(label, source, "open-before-render");
  requireIncludes(label, source, "query-change");
  requireIncludes(label, source, "filter-change");
  requireIncludes(label, source, "close-after-hide");
}

requireNotIncludes("src/js/gg-app.source.js", text.appJs, "function resetSheetScroll");
requireNotIncludes("src/store/store-discovery.js", text.storeJs, "function resetSheetScroll");

assertPolicy("src/js/gg-app.source.js", text.appJs, "command", ["openBeforeRender", "queryChange", "filterChange"]);
assertPolicy("src/js/gg-app.source.js", text.appJs, "preview", ["openBeforeRender", "openAfterRender", "closeBeforeHide", "itemChange"]);
assertPolicy("src/js/gg-app.source.js", text.appJs, "more", ["openBeforeRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);
assertPolicy("landing.html", text.landing, "command", ["openBeforeRender", "queryChange", "filterChange"]);
assertPolicy("landing.html", text.landing, "more", ["openBeforeRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "preview", ["openBeforeRender", "openAfterRender", "closeBeforeHide", "itemChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "discovery", ["openBeforeRender", "queryChange", "filterChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "saved", ["openBeforeRender", "filterChange"]);
assertPolicy("src/store/store-discovery.js", text.storeJs, "more", ["openBeforeRender", "closeAfterHide", "clearLocalSearchOnClose", "closePreferencePanelOnClose"]);

assertCssHitTarget("src/css/gg-app.source.css", text.appCss);
if (text.appCssAsset) assertCssHitTarget("__gg/assets/css/gg-app.dev.css", text.appCssAsset);
assertCssHitTarget("src/store/store.css", text.storeCss);
if (text.storeCssAsset) assertCssHitTarget("assets/store/store.css", text.storeCssAsset);

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
