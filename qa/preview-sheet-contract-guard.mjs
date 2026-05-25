#!/usr/bin/env node

import { readFileSync } from "node:fs";

const files = {
  packageJson: "package.json",
  index: "index.xml",
  store: "store.html",
  appJs: "src/js/gg-app.source.js",
  storeJs: "src/store/store-discovery.js",
  appCss: "src/css/gg-app.source.css",
  previewCss: "src/css/modules/preview-frame.css",
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

function openingTagById(source, id) {
  const re = new RegExp(`<[^>]+\\bid=(['"])${id}\\1[^>]*>`, "i");
  const match = source.match(re);
  return match ? match[0] : "";
}

function blockById(source, id) {
  const start = source.search(new RegExp(`<[^>]+\\bid=(['"])${id}\\1[^>]*>`, "i"));
  if (start < 0) return "";
  const nextSheet = source.slice(start + 1).search(/<[^>]+\bdata-gg-panel=(['"])[^'"]+\1/i);
  return nextSheet < 0 ? source.slice(start) : source.slice(start, start + 1 + nextSheet);
}

function hasAttrValue(source, attr, value) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const val = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}=(['"])${val}\\1`, "i").test(source);
}

function buttonTags(source) {
  return source.match(/<button\b[^>]*>/gi) || [];
}

function hasAttr(tag, attr) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}(?:\\s|=|>|/)`, "i").test(tag);
}

function attrValue(tag, attr) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(new RegExp(`\\b${escaped}=(['"])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function classHas(tag, className) {
  return attrValue(tag, "class").split(/\s+/).includes(className);
}

function assertPreviewSheet(source, id, label, storeMode = false) {
  const tag = openingTagById(source, id);
  const sheet = blockById(source, id);
  const buttons = buttonTags(sheet);
  const handles = buttons.filter((tagText) => hasAttrValue(tagText, storeMode ? "data-store-drag-handle" : "data-gg-drag-handle", "preview") || hasAttrValue(tagText, "data-gg-drag-handle", "preview"));

  if (!tag) {
    fail(`${label}: missing #${id}`);
    return;
  }
  if (!hasAttrValue(tag, "data-gg-panel", "preview")) fail(`${label}: preview lacks data-gg-panel="preview"`);
  if (!hasAttrValue(tag, "data-gg-edge", "top")) fail(`${label}: preview lacks data-gg-edge="top"`);
  if (!hasAttrValue(tag, "data-gg-panel-family", "content-sheet")) fail(`${label}: preview lacks data-gg-panel-family="content-sheet"`);
  if (!/\baria-hidden=(['"])true\1/i.test(tag)) fail(`${label}: preview lacks closed aria-hidden=true`);
  if (!/\binert(?:\s|=|>|\/)/i.test(tag)) fail(`${label}: preview lacks inert in closed markup`);
  if (!/\bhidden(?:\s|=|>|\/)/i.test(tag)) fail(`${label}: preview lacks hidden in closed markup`);
  if (!handles.length) fail(`${label}: preview handle lacks data-gg-drag-handle="preview"`);
  if (!buttons.some((button) => hasAttrValue(button, "data-gg-close", "preview"))) fail(`${label}: preview close control lacks data-gg-close="preview"`);
  if (!sheet.includes("gg-content-sheet__affordance")) fail(`${label}: preview footer lacks gg-content-sheet__affordance`);
  if (!handles.some((button) => classHas(button, "gg-sheet__handle"))) fail(`${label}: preview handle lacks gg-sheet__handle`);

  if (storeMode) {
    if (!handles.some((button) => hasAttrValue(button, "data-store-drag-handle", "preview"))) fail(`${label}: store preview lacks data-store-drag-handle="preview"`);
    buttons.forEach((button) => {
      if (hasAttr(button, "data-store-drag-handle") && !hasAttr(button, "data-gg-drag-handle")) fail(`${label}: data-store-drag-handle lacks data-gg-drag-handle mirror`);
      if (hasAttr(button, "data-store-close") && !hasAttr(button, "data-gg-close")) fail(`${label}: data-store-close lacks data-gg-close mirror`);
    });
  }
}

assertPreviewSheet(text.index, "gg-preview-sheet", "index.xml", false);
assertPreviewSheet(text.store, "store-preview-sheet", "store.html", true);

if (!/class=(['"])[^'"]*gg-preview__body[^'"]*\1[\s\S]*?<header\b[^>]*class=(['"])[^'"]*gg-preview__intro[^'"]*\2[^>]*data-gg-preview-intro-flow=(['"])true\3/i.test(text.index)) {
  fail("index.xml: gg-preview__intro is not marked inside the preview body scroll flow");
}

[
  ["src/js/gg-app.source.js", text.appJs],
  ["src/store/store-discovery.js", text.storeJs],
].forEach(([file, source]) => {
  assertIncludes(source, "function resetPanelScroll", `${file}: missing resetPanelScroll helper`);
  assertIncludes(source, "function collectPanelScrollTargets", `${file}: missing collected sheet scroll target helper`);
  assertIncludes(source, "data-gg-scroll-container", `${file}: reset helper must target sheet/body containers`);
  assertIncludes(source, ".gg-sheet__panel, .gg-content-sheet__panel", `${file}: reset helper must target sheet panels`);
  assertIncludes(source, "open-before-render", `${file}: preview open path does not reset scroll before render`);
  assertIncludes(source, "open-after-render", `${file}: preview open path does not reset scroll after render`);
  assertIncludes(source, "item-change", `${file}: preview item-change path does not reset scroll`);
  if (!source.includes("resetPanelScroll(config.sheet") && !source.includes("resetPanelScroll(panel.root")) {
    fail(`${file}: preview close path does not reset sheet scroll`);
  }
  const resetBody = source.match(/function resetPanelScroll[\s\S]*?function shouldResetPanel/) || source.match(/function resetPanelScroll[\s\S]*?function shouldResetPanelName/);
  if (resetBody && /window\.scrollTo\s*\(/.test(resetBody[0])) {
    fail(`${file}: scroll reset appears to target window rather than sheet/body containers`);
  }
});

[
  "previewSheetPresent",
  "previewEdge",
  "previewFamily",
  "previewFooterAffordance",
  "previewIntroInScrollFlow",
  "previewScrollResetEnabled",
  "previewLastResetReason",
].forEach((needle) => assertIncludes(text.appJs, needle, `src/js/gg-app.source.js: snapshot missing ${needle}`));

[
  "storePreviewSheetPresent",
  "storePreviewGgDragHandleCount",
  "storePreviewStoreDragHandleCount",
  "storePreviewFooterAffordance",
  "storePreviewScrollResetEnabled",
  "storePreviewLastResetReason",
].forEach((needle) => assertIncludes(text.storeJs, needle, `src/store/store-discovery.js: snapshot missing ${needle}`));

[
  "--gg-preview-max-height",
  "--gg-preview-initial-height",
  "--gg-preview-hero-min",
  "--gg-preview-overlay-lift",
  "--gg-preview-footer-height",
  "--gg-preview-footer-safe-area",
  "--gg-preview-radius",
  "--gg-preview-surface",
  "--gg-preview-shadow",
].forEach((token) => {
  if (!text.appCss.includes(token) && !text.previewCss.includes(token)) fail(`preview CSS token missing: ${token}`);
  if (!text.storeCss.includes(token)) fail(`src/store/store.css: missing shared preview token ${token}`);
});

assertIncludes(text.appJs, "trapFocusWhileOpen", "src/js/gg-app.source.js: preview focus trap contract disappeared");
assertIncludes(text.storeJs, "function trapFocus", "src/store/store-discovery.js: preview focus trap contract disappeared");
assertIncludes(text.appJs, "Escape", "src/js/gg-app.source.js: Escape close contract disappeared");
assertIncludes(text.storeJs, "Escape", "src/store/store-discovery.js: Escape close contract disappeared");
assertIncludes(text.packageJson, '"gaga:verify-comments-proof"', "package.json: comments proof guard missing");
assertIncludes(text.packageJson, '"gaga:verify-preview-sheet"', "package.json: preview sheet guard script missing");

if (failures.length) {
  console.error("PREVIEW SHEET CONTRACT GUARD FAIL");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("PREVIEW SHEET CONTRACT GUARD PASS");
