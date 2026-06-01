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

function attr(tag, name) {
  const pattern = new RegExp(`\\s${name}=([\"'])(.*?)\\1`, "i");
  const match = tag.match(pattern);
  return match ? match[2] : "";
}

function rootTagById(source, id) {
  const pattern = new RegExp(`<[^>]+\\bid=([\"'])${id}\\1[^>]*>`, "i");
  const match = source.match(pattern);
  if (!match) {
    fail(`${id}: missing sheet root`);
    return "";
  }
  return match[0];
}

function blockById(source, id) {
  const start = source.search(new RegExp(`<[^>]+\\bid=([\"'])${id}\\1[^>]*>`, "i"));
  if (start < 0) return "";
  const rest = source.slice(start);
  const next = rest.search(/\n\s*<(?:div|section)\b[^>]*\bid=/i);
  return next > 0 ? rest.slice(0, next) : rest;
}

function requireIncludes(label, text, needle, message) {
  if (text.includes(needle)) pass(`${label}: ${message}`);
  else fail(`${label}: ${message}`);
}

function forbidPattern(label, text, pattern, message) {
  if (pattern.test(text)) fail(`${label}: ${message}`);
  else pass(`${label}: ${message}`);
}

function assertSheet(source, id, expected) {
  const tag = rootTagById(source, id);
  const block = blockById(source, id);
  if (!tag) return;

  const origin = attr(tag, "data-gg-sheet-origin");
  const edge = attr(tag, "data-gg-edge");
  const surface = attr(tag, "data-gg-sheet-surface");
  const state = attr(tag, "data-gg-sheet-state");
  const legacyState = attr(tag, "data-gg-state");

  if (origin === expected.origin) pass(`${id}: declares ${expected.origin} sheet origin`);
  else fail(`${id}: expected data-gg-sheet-origin="${expected.origin}", got "${origin || "missing"}"`);

  if (edge === expected.origin) pass(`${id}: legacy edge agrees with sheet origin`);
  else fail(`${id}: expected data-gg-edge="${expected.origin}", got "${edge || "missing"}"`);

  if (surface === expected.surface) pass(`${id}: declares sheet surface ${expected.surface}`);
  else fail(`${id}: expected data-gg-sheet-surface="${expected.surface}", got "${surface || "missing"}"`);

  if (state === "closed" && legacyState === "closed") pass(`${id}: closed state is deterministic in source`);
  else fail(`${id}: data-gg-sheet-state and data-gg-state must both start closed`);

  if (/\baria-hidden=(["'])true\1/i.test(tag) && /\binert(?:\s|=|>|\/)/i.test(tag) && /\bhidden(?:\s|=|>|\/)/i.test(tag)) {
    pass(`${id}: hidden sheet is hidden from assistive tech`);
  } else {
    fail(`${id}: closed sheet must carry hidden, aria-hidden=true, and inert`);
  }

  if (/\brole=(["'])dialog\1/i.test(tag) || /\brole=(["'])dialog\1/i.test(block)) pass(`${id}: exposes dialog semantics`);
  else fail(`${id}: missing dialog role on sheet root or panel`);

  if (/\baria-labelledby=/.test(tag) || /\baria-labelledby=/.test(block)) pass(`${id}: exposes labelled dialog title`);
  else fail(`${id}: missing aria-labelledby`);

  if (/data-gg-close=|data-gg-action=(["'])comments(?:-replies)?-close\1|data-store-close=/.test(block)) pass(`${id}: has focusable close control`);
  else fail(`${id}: missing close control`);
}

const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");
const appJs = read("src/js/gg-app.source.js");
const storeJs = read("src/store/store-discovery.js");
const storeCore = read("src/store/store-core.js");
const sheetCore = read("src/css/components/gg-sheet-core.css");
const packageJson = JSON.parse(read("package.json") || "{}");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const worker = read("worker.js");

[
  [indexXml, "gg-comments-sheet", { origin: "bottom", surface: "comments" }],
  [indexXml, "gg-command-panel", { origin: "bottom", surface: "discovery" }],
  [indexXml, "gg-more-panel", { origin: "bottom", surface: "more" }],
  [indexXml, "gg-preview-sheet", { origin: "top", surface: "preview" }],
  [landingHtml, "gg-command-panel", { origin: "bottom", surface: "discovery" }],
  [landingHtml, "gg-more-panel", { origin: "bottom", surface: "more" }],
  [storeHtml, "store-preview-sheet", { origin: "top", surface: "store-preview" }],
  [storeHtml, "store-discovery-sheet", { origin: "bottom", surface: "discovery" }],
  [storeHtml, "store-more-sheet", { origin: "bottom", surface: "more" }],
].forEach(([source, id, expected]) => assertSheet(source, id, expected));

[
  [indexXml, "gg-comment-replies-sheet", { origin: "bottom", surface: "comment-replies" }],
  [storeHtml, "store-saved-sheet", { origin: "bottom", surface: "saved" }],
].forEach(([source, id, expected]) => assertSheet(source, id, expected));

requireIncludes("src/js/gg-app.source.js", appJs, "function setSheetState(root, value)", "keeps root sheet state sync centralized");
requireIncludes("src/js/gg-app.source.js", appJs, "root.setAttribute('data-gg-sheet-state', value)", "syncs normalized sheet state");
requireIncludes("src/js/gg-app.source.js", appJs, "panelDefs = {", "uses one root panel registry");
requireIncludes("src/js/gg-app.source.js", appJs, "command:", "registers discovery sheet");
requireIncludes("src/js/gg-app.source.js", appJs, "preview:", "registers root preview sheet");
requireIncludes("src/js/gg-app.source.js", appJs, "more:", "registers More sheet");
requireIncludes("src/js/gg-app.source.js", appJs, "comments:", "registers comments sheet");
requireIncludes("src/js/gg-app.source.js", appJs, "trapFocusWhileOpen", "keeps shared focus trap");
requireIncludes("src/js/gg-app.source.js", appJs, "event.key === 'Escape'", "keeps Escape close path");

requireIncludes("landing.html", landingHtml, "function setSheetState(sheet, value)", "keeps landing sheet state sync centralized");
requireIncludes("landing.html", landingHtml, "sheet.setAttribute('data-gg-sheet-state', value)", "syncs landing normalized sheet state");
requireIncludes("landing.html", landingHtml, "trapFocus(event)", "keeps landing focus trap");
requireIncludes("landing.html", landingHtml, "event.key === 'Escape'", "keeps landing Escape close path");

requireIncludes("src/store/store-discovery.js", storeJs, "function setSheetState(sheet, value)", "keeps Store sheet state sync centralized");
requireIncludes("src/store/store-discovery.js", storeJs, "sheet.setAttribute('data-gg-sheet-state', value)", "syncs Store normalized sheet state");
requireIncludes("src/store/store-discovery.js", storeJs, "function getPanel(name)", "uses Store panel registry");
requireIncludes("src/store/store-discovery.js", storeJs, "window.addEventListener('popstate'", "keeps Store preview back-navigation close path");
requireIncludes("src/store/store-discovery.js", storeJs, "event.key === 'Escape'", "keeps Store Escape close path");
requireIncludes("src/store/store-core.js", storeCore, "function setSheetState(sheet, value)", "keeps Store fallback state sync");

requireIncludes("src/css/components/gg-sheet-core.css", sheetCore, ".gg-sheet[data-gg-sheet-origin='top']", "CSS recognizes top sheet origin");
requireIncludes("src/css/components/gg-sheet-core.css", sheetCore, ".gg-sheet[data-gg-state='closing'][data-gg-sheet-origin='bottom']", "CSS recognizes bottom dismiss origin");
requireIncludes("src/css/components/gg-sheet-core.css", sheetCore, ".gg-sheet[data-gg-state='closing'][data-gg-sheet-origin='top']", "CSS recognizes top dismiss origin");

forbidPattern("worker.js", worker, /HTMLRewriter/, "must not use HTMLRewriter as sheet contract repair");
forbidPattern("worker.js", worker, /data-gg-sheet-origin|data-gg-sheet-surface|data-gg-sheet-state/i, "must not inject sheet contract markup");

const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-global-sheet-contract"] === "node qa/global-sheet-contract-guard.mjs") pass("package script gaga:verify-global-sheet-contract is wired");
else fail("package.json missing gaga:verify-global-sheet-contract script");

if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-global-sheet-contract")) pass("ci:qa includes global sheet contract guard");
else fail("ci:qa must include npm run gaga:verify-global-sheet-contract");

requireIncludes("QA-COMMANDS.md", qaCommands, "npm run gaga:verify-global-sheet-contract", "documents global sheet contract guard");
requireIncludes("SOURCE-OF-TRUTH.md", sourceOfTruth, "qa/global-sheet-contract-guard.mjs", "documents global sheet contract guard");

if (failures.length) {
  console.error("GLOBAL SHEET CONTRACT GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("GLOBAL SHEET CONTRACT GUARD PASS");
