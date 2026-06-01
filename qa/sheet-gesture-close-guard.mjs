#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const failures = [];
const passes = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function requireIncludes(label, text, needle, message) {
  if (text.includes(needle)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function requirePattern(label, text, pattern, message) {
  if (pattern.test(text)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function forbidPattern(label, text, pattern, message) {
  if (pattern.test(text)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

function rootTagById(source, id) {
  const pattern = new RegExp(`<[^>]+\\bid=(["'])${id}\\1[^>]*>`, "i");
  const match = source.match(pattern);
  if (!match) fail(`${id}: missing sheet root`);
  return match ? match[0] : "";
}

function blockById(source, id) {
  const start = source.search(new RegExp(`<[^>]+\\bid=(["'])${id}\\1[^>]*>`, "i"));
  if (start < 0) return "";
  return source.slice(start, start + 7000);
}

function attr(tag, name) {
  const pattern = new RegExp(`\\s${name}=(["'])(.*?)\\1`, "i");
  const match = tag.match(pattern);
  return match ? match[2] : "";
}

function assertSheetRoot(source, id, origin) {
  const tag = rootTagById(source, id);
  if (!tag) return;
  if (attr(tag, "data-gg-sheet-origin") === origin) pass(`${id}: declares ${origin} origin for gesture direction`);
  else fail(`${id}: expected data-gg-sheet-origin="${origin}"`);
}

function assertBottomSheet(source, id, handleName) {
  const block = blockById(source, id);
  assertSheetRoot(source, id, "bottom");
  requirePattern(id, block, /class=(["'])[^"']*\bgg-sheet__head\b[^"']*\1[^>]*data-gg-sheet-drag-zone=(["'])head\2|data-gg-sheet-drag-zone=(["'])head\3[^>]*class=(["'])[^"']*\bgg-sheet__head\b[^"']*\4/i, "limits drag zone to sheet head");
  requirePattern(id, block, new RegExp(`data-gg-drag-handle=(["'])${handleName}\\1[^>]*data-gg-sheet-drag-zone=(["'])handle\\2|data-gg-sheet-drag-zone=(["'])handle\\3[^>]*data-gg-drag-handle=(["'])${handleName}\\4`, "i"), "marks handle as explicit drag/tap close zone");
  forbidPattern(id, block, /(?:gg-sheet__body|gg-content-sheet__body|gg-preview__body|store-preview__body)[^>]*data-gg-sheet-drag-zone/i, "does not make scrollable body a drag zone");
}

function assertTopPreview(source, id, handleName) {
  const block = blockById(source, id);
  assertSheetRoot(source, id, "top");
  requirePattern(id, block, /(?:gg-preview__footer|store-preview__footer|gg-content-sheet__affordance)[^>]*data-gg-sheet-drag-zone=(["'])footer\1|data-gg-sheet-drag-zone=(["'])footer\2[^>]*(?:gg-preview__footer|store-preview__footer|gg-content-sheet__affordance)/i, "limits drag zone to preview footer");
  requirePattern(id, block, new RegExp(`data-gg-drag-handle=(["'])${handleName}\\1[^>]*data-gg-sheet-drag-zone=(["'])handle\\2|data-gg-sheet-drag-zone=(["'])handle\\3[^>]*data-gg-drag-handle=(["'])${handleName}\\4`, "i"), "marks footer handle as explicit drag/tap close zone");
  forbidPattern(id, block, /(?:gg-sheet__body|gg-content-sheet__body|gg-preview__body|store-preview__body)[^>]*data-gg-sheet-drag-zone/i, "does not make preview body a drag zone");
}

const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const appJs = read("src/js/gg-app.source.js");
const landingJs = landingHtml;
const storeJs = read("src/store/store-discovery.js");
const sheetCoreCss = read("src/css/components/gg-sheet-core.css");
const storeCss = read("src/store/store.css");
const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const readinessGuard = read("qa/readiness-85-guard.mjs");
const worker = read("worker.js");

[
  [indexXml, "gg-comments-sheet", "comments"],
  [indexXml, "gg-comment-replies-sheet", "comment-replies"],
  [indexXml, "gg-command-panel", "command"],
  [indexXml, "gg-more-panel", "more"],
  [landingHtml, "gg-command-panel", "command"],
  [landingHtml, "gg-more-panel", "more"],
  [storeHtml, "store-discovery-sheet", "discovery"],
  [storeHtml, "store-saved-sheet", "saved"],
  [storeHtml, "store-more-sheet", "more"],
].forEach(([source, id, handle]) => assertBottomSheet(source, id, handle));

[
  [indexXml, "gg-preview-sheet", "preview"],
  [storeHtml, "store-preview-sheet", "preview"],
].forEach(([source, id, handle]) => assertTopPreview(source, id, handle));

[
  ["src/js/gg-app.source.js", appJs],
  ["landing.html", landingJs],
  ["src/store/store-discovery.js", storeJs],
].forEach(([label, source]) => {
  requireIncludes(label, source, "[data-gg-sheet-drag-zone], [data-gg-drag-zone]", "resolves normalized drag-zone grammar");
  requireIncludes(label, source, "event.preventDefault()", "prevents default only inside explicit gesture handling");
  requireIncludes(label, source, "pushState", "arms browser Back to close active sheets");
  requireIncludes(label, source, "popstate", "handles browser Back for active sheets");
  requireIncludes(label, source, "fromPopstate", "distinguishes Back close from button/Escape close");
  requirePattern(label, source, /restoreFocus|returnFocus|lastFocus/, "keeps focus restoration path");
  requireIncludes(label, source, "Escape", "keeps Escape close path");
});

requirePattern("src/js/gg-app.source.js", appJs, /getPanelEdge\(panel\) === 'top'[\s\S]*offsetY < -threshold[\s\S]*return offsetY > threshold/, "keeps top-up and bottom-down dismiss thresholds");
requirePattern("src/js/gg-app.source.js", appJs, /edge === 'top'[\s\S]*offset > 0 \? offset \* 0\.28 : offset[\s\S]*offset < 0 \? offset \* 0\.28 : offset/, "resists wrong-direction root drags");
requirePattern("landing.html", landingJs, /Math\.max\(0,\s*offsetY\)/, "keeps landing bottom sheets downward-only");
requirePattern("src/store/store-discovery.js", storeJs, /edge === 'top' \? Math\.min\(0,\s*offsetY\) : Math\.max\(0,\s*offsetY\)/, "keeps Store top-up and bottom-down drag application");
requirePattern("src/store/store-discovery.js", storeJs, /session\.name === 'preview'[\s\S]*deltaY <= -84[\s\S]*session\.name !== 'preview'[\s\S]*deltaY >= 84/, "keeps Store preview upward and bottom sheets downward dismiss");
requirePattern("src/css/components/gg-sheet-core.css", sheetCoreCss, /data-gg-sheet-drag-zone=['"]head['"][\s\S]*data-gg-sheet-drag-zone=['"]footer['"][\s\S]*data-gg-sheet-drag-zone=['"]handle['"][\s\S]*touch-action:\s*none/, "disables browser panning only on explicit drag zones for touch devices");
requirePattern("src/store/store.css", storeCss, /data-gg-sheet-drag-zone=['"]head['"][\s\S]*data-gg-sheet-drag-zone=['"]footer['"][\s\S]*data-gg-sheet-drag-zone=['"]handle['"][\s\S]*touch-action:\s*none/, "Store runtime CSS inherits explicit drag-zone touch contract");

forbidPattern("index.xml", indexXml, /data-gg-sheet-drag-zone=(["'])(?:body|content|scroll)\1/i, "does not define body/content drag zones");
forbidPattern("landing.html", landingHtml, /data-gg-sheet-drag-zone=(["'])(?:body|content|scroll)\1/i, "does not define body/content drag zones");
forbidPattern("store.html", storeHtml, /data-gg-sheet-drag-zone=(["'])(?:body|content|scroll)\1/i, "does not define body/content drag zones");
forbidPattern("src/css/components/gg-sheet-core.css", sheetCoreCss, /(?:gg-sheet__body|gg-content-sheet__body|gg-preview__body|store-preview__body)[^{]*\{[^}]*touch-action:\s*none/i, "does not disable touch scrolling on sheet bodies");
forbidPattern("src/store/store.css", storeCss, /(?:gg-sheet__body|gg-content-sheet__body|gg-preview__body|store-preview__body)[^{]*\{[^}]*touch-action:\s*none/i, "does not disable touch scrolling on Store sheet bodies");
forbidPattern("worker.js", worker, /HTMLRewriter|data-gg-sheet-drag-zone/i, "does not repair sheet gestures at the edge");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-sheet-gesture-close"] === "node qa/sheet-gesture-close-guard.mjs") pass("package script gaga:verify-sheet-gesture-close is wired");
else fail("package.json missing gaga:verify-sheet-gesture-close script");

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-sheet-gesture-close")) pass("ci:qa includes sheet gesture close guard");
else fail("ci:qa must include npm run gaga:verify-sheet-gesture-close");

requireIncludes("qa/ci-reconciliation-guard.mjs", ciGuard, "qa/sheet-gesture-close-guard.mjs", "classifies sheet gesture guard");
requireIncludes("qa/readiness-85-guard.mjs", readinessGuard, "qa/sheet-gesture-close-guard.mjs", "includes sheet gesture guard in readiness");
requireIncludes("QA-COMMANDS.md", qaCommands, "npm run gaga:verify-sheet-gesture-close", "documents sheet gesture guard");
requireIncludes("SOURCE-OF-TRUTH.md", sourceOfTruth, "qa/sheet-gesture-close-guard.mjs", "documents sheet gesture guard");

if (failures.length) {
  console.error("SHEET GESTURE CLOSE GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("SHEET GESTURE CLOSE GUARD PASS");
