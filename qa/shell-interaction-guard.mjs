#!/usr/bin/env node

import { readFileSync } from "node:fs";

const files = {
  packageJson: "package.json",
  index: "index.xml",
  landing: "landing.html",
  store: "store.html",
  appJs: "src/js/gg-app.source.js",
  landingJs: "landing.html",
  storeJs: "src/store/store-discovery.js",
  appCss: "src/css/gg-app.source.css",
  dockCss: "src/css/modules/dock.css",
  outlineCss: "src/css/modules/detail-outline.css",
  sheetsCss: "src/css/modules/sheets.css",
  storeCss: "src/store/store.css",
};

const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readFileSync(file, "utf8")]));
const failures = [];

function fail(message) {
  failures.push(message);
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) fail(message);
}

function openingTag(source, id) {
  const re = new RegExp(`<[^>]+\\bid=(['"])${id}\\1[^>]*>`, "i");
  const match = source.match(re);
  return match ? match[0] : "";
}

function block(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([\\s\\S]*?)\\}`, "m");
  const match = source.match(re);
  return match ? match[1] : "";
}

function assertFlatGlass(source, selector, fileLabel) {
  const css = block(source, selector);
  if (!css) {
    fail(`${fileLabel}: missing ${selector} block`);
    return;
  }
  if (!/\bborder:\s*0\b/.test(css)) fail(`${fileLabel}: ${selector} should use border: 0`);
  if (!/backdrop-filter:\s*blur\([^)]*\)\s*saturate\(/.test(css)) {
    fail(`${fileLabel}: ${selector} should keep glass backdrop blur/saturate`);
  }
}

function assertDockOrder(source, fileLabel, attrName) {
  const nav = source.match(/<nav\b[^>]*\bid=(['"])gg-dock\1[\s\S]*?<\/nav>/i);
  if (!nav) {
    fail(`${fileLabel}: missing #gg-dock nav`);
    return;
  }
  const order = [];
  const re = new RegExp(`${attrName}=(['"])(home|contact|search|blog|more)\\1`, "g");
  let match;
  while ((match = re.exec(nav[0]))) order.push(match[2]);
  const expected = "home,contact,search,blog,more";
  if (order.join(",") !== expected) fail(`${fileLabel}: dock order changed (${order.join(",") || "none"})`);
}

function assertSheetBlock(source, id, fileLabel) {
  const start = source.indexOf(`id="${id}"`) > -1 ? source.indexOf(`id="${id}"`) : source.indexOf(`id='${id}'`);
  if (start < 0) {
    fail(`${fileLabel}: missing #${id}`);
    return;
  }
  const snippet = source.slice(Math.max(0, start - 500), start + 2500);
  if (!/\brole=(['"])dialog\1/.test(snippet)) fail(`${fileLabel}: #${id} is missing dialog role`);
  if (!/\baria-modal=(['"])true\1/.test(snippet)) fail(`${fileLabel}: #${id} is missing aria-modal=true`);
  if (!/\baria-labelledby=(['"])[^'"]+\1/.test(snippet)) fail(`${fileLabel}: #${id} is missing aria-labelledby`);
}

function assertInteractiveHandle(source, name, fileLabel) {
  const re = new RegExp(`<button\\b[^>]*(?:data-gg-drag-handle|data-store-drag-handle)=(['"])${name}\\1[^>]*>`, "i");
  if (!re.test(source)) fail(`${fileLabel}: missing interactive drag handle for ${name}`);
}

assertIncludes(text.packageJson, '"gaga:verify-shell"', "package.json: missing gaga:verify-shell script");

assertDockOrder(text.index, "index.xml", "data-gg-nav");
assertDockOrder(text.landing, "landing.html", "data-gg-nav");
assertDockOrder(text.store, "store.html", "data-store-dock");

["command", "preview", "more", "comments", "comment-replies"].forEach((name) => {
  assertInteractiveHandle(text.index, name, "index.xml");
});
["command", "more"].forEach((name) => assertInteractiveHandle(text.landing, name, "landing.html"));
["preview", "discovery", "saved", "more"].forEach((name) => assertInteractiveHandle(text.store, name, "store.html"));

["gg-command-panel", "gg-preview-sheet", "gg-more-panel", "gg-comments-sheet", "gg-comment-replies-sheet"].forEach((id) => {
  assertSheetBlock(text.index, id, "index.xml");
});
["gg-command-panel", "gg-more-panel"].forEach((id) => assertSheetBlock(text.landing, id, "landing.html"));
["store-preview-sheet", "store-discovery-sheet", "store-saved-sheet", "store-more-sheet"].forEach((id) => {
  const tag = openingTag(text.store, id);
  if (!tag) fail(`store.html: missing #${id}`);
  if (!tag.includes('data-gg-edge=')) fail(`store.html: #${id} missing data-gg-edge`);
  assertSheetBlock(text.store, id, "store.html");
});

[
  ["src/js/gg-app.source.js", text.appJs, "trapFocusWhileOpen"],
  ["landing.html", text.landingJs, "function trapFocus"],
  ["src/store/store-discovery.js", text.storeJs, "function trapFocus"],
].forEach(([file, source, needle]) => assertIncludes(source, needle, `${file}: missing focus trap helper`));

[
  ["src/js/gg-app.source.js", text.appJs],
  ["landing.html", text.landingJs],
  ["src/store/store-discovery.js", text.storeJs],
].forEach(([file, source]) => assertIncludes(source, "ggSheetGestureController", `${file}: missing ggSheetGestureController`));

if (text.landing.includes("document.querySelectorAll('[data-sheet-handle]')")) {
  fail("landing.html: duplicate data-sheet-handle gesture loop is still present");
}

assertFlatGlass(text.dockCss, ".gg-dock", "src/css/modules/dock.css");
assertFlatGlass(text.outlineCss, ".gg-detail-outline", "src/css/modules/detail-outline.css");
assertFlatGlass(text.sheetsCss, ".gg-sheet__panel", "src/css/modules/sheets.css");
assertFlatGlass(text.appCss, ".gg-dock", "src/css/gg-app.source.css");
assertFlatGlass(text.appCss, ".gg-detail-outline", "src/css/gg-app.source.css");
assertFlatGlass(text.appCss, ".gg-sheet__panel", "src/css/gg-app.source.css");
assertFlatGlass(text.storeCss, ".gg-dock", "src/store/store.css");
assertFlatGlass(text.storeCss, ".gg-sheet__panel", "src/store/store.css");
assertFlatGlass(text.storeCss, ".store-filter-outline", "src/store/store.css");

["more.section.navigation", "more.section.discover", "more.section.info", "more.section.preferences"].forEach((key) => {
  if (!text.index.includes(key) || !text.landing.includes(key) || !text.store.includes(key)) {
    fail(`More sheet IA key missing across surfaces: ${key}`);
  }
});

if (!text.index.includes("data-gg-discovery-domain='global'")) fail("index.xml: global discovery domain marker missing");
if (!text.landing.includes('data-gg-discovery-domain="global"')) fail("landing.html: global discovery domain marker missing");
if (!text.store.includes('data-gg-discovery-domain="store"')) fail("store.html: store discovery domain marker missing");

if (failures.length) {
  console.error("SHELL INTERACTION GUARD FAIL");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("SHELL INTERACTION GUARD PASS");
