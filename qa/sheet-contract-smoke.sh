#!/usr/bin/env bash
set -euo pipefail

export LC_ALL=C

node --input-type=module <<'NODE'
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const failures = [];
const passes = [];
const staleWidths = ["720px", "760px", "920px", "1040px"];
const staleWidthRe = /\b(?:720|760|920|1040)px\b/;
const controlSelectorRe = /\b(?:gg-dock|gg-sheet__panel|store-preview-sheet|store-bottom-sheet|gg-content-sheet|gg-command-panel|gg-more-panel|gg-preview-sheet|gg-comments-panel)\b/;
const controlWidthPropRe = /^(?:width|max-width|min-width|inline-size|max-inline-size|min-inline-size)$/i;
const controlVariableRe = /--(?:gg-panel-width|store-sheet-width|store-bottom-sheet-width)\s*:\s*([^;{}]+)/g;
const textFileRe = /\.(?:css|html|xml)$/i;

function addPass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function read(file) {
  return readFileSync(file, "utf8");
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function collectFiles(entry, predicate) {
  if (!existsSync(entry)) return [];
  const stats = statSync(entry);
  if (stats.isFile()) return predicate(entry) ? [entry] : [];
  if (!stats.isDirectory()) return [];
  return readdirSync(entry)
    .filter((name) => !name.startsWith("."))
    .flatMap((name) => collectFiles(path.join(entry, name), predicate));
}

function requireFile(file) {
  if (!existsSync(file)) {
    fail(`missing required file: ${file}`);
    return false;
  }
  return true;
}

function requireMarker(file, marker, label) {
  if (!requireFile(file)) return;
  if (read(file).includes(marker)) {
    addPass(`${label}: ${marker}`);
  } else {
    fail(`${label} missing marker ${marker} in ${file}`);
  }
}

function parseTagName(tag) {
  const match = tag.match(/^<\s*([A-Za-z][\w:-]*)\b/);
  return match ? match[1].toLowerCase() : "";
}

function attrValue(tag, name) {
  const re = new RegExp(`\\b${name}=("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const match = tag.match(re);
  if (!match) return "";
  return match[1].replace(/^['"]|['"]$/g, "");
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split(/\n/).length;
}

function cssRegions(file, source) {
  if (/\.css$/i.test(file)) return [{ css: source, offset: 0 }];

  const regions = [];
  const styleRe = /<(style|b:skin)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of source.matchAll(styleRe)) {
    const raw = String(match[2] || "");
    const rawOffset = (match.index || 0) + match[0].indexOf(raw);
    regions.push({
      css: raw.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, ""),
      offset: rawOffset,
    });
  }
  return regions;
}

function checkWidthContracts(files) {
  let checked = 0;
  for (const file of files) {
    const source = read(file);
    checked += 1;

    for (const match of source.matchAll(controlVariableRe)) {
      if (staleWidthRe.test(match[1])) {
        fail(`${file}:${lineForOffset(source, match.index || 0)} stale control width variable ${match[0].trim()}`);
      }
    }

    const cssRuleRe = /([^{}]+)\{([^{}]*)\}/g;
    for (const region of cssRegions(file, source)) {
      for (const match of region.css.matchAll(cssRuleRe)) {
        const selector = String(match[1] || "").trim();
        const block = String(match[2] || "");
        if (!controlSelectorRe.test(selector)) continue;

        for (const declaration of block.split(";")) {
          const parts = declaration.split(":");
          if (parts.length < 2) continue;
          const property = parts.shift().trim();
          const value = parts.join(":").trim();
          if (!controlWidthPropRe.test(property)) continue;
          if (staleWidthRe.test(value)) {
            fail(`${file}:${lineForOffset(source, region.offset + (match.index || 0))} stale ${property} on control selector ${selector}: ${value}`);
          }
        }
      }
    }
  }
  addPass(`width contract scanned files=${checked} stale_widths=${staleWidths.join(",")}`);
}

function checkInteractiveHandles(files) {
  let handleTags = 0;
  for (const file of files) {
    const source = read(file);
    const tagRe = /<([A-Za-z][\w:-]*)\b[^>]*(?:data-gg-drag-handle|data-store-drag-handle)[^>]*>/g;
    for (const match of source.matchAll(tagRe)) {
      const tag = match[0];
      const tagName = parseTagName(tag);
      const line = lineForOffset(source, match.index || 0);
      const hasGgHandle = /\bdata-gg-drag-handle\b/i.test(tag);
      const hasStoreHandle = /\bdata-store-drag-handle\b/i.test(tag);
      const ariaHidden = attrValue(tag, "aria-hidden").toLowerCase();
      handleTags += 1;

      if (tagName === "div" || tagName === "span") {
        fail(`${file}:${line} passive ${tagName} drag handle is not allowed`);
      }
      if (ariaHidden === "true") {
        fail(`${file}:${line} visible drag handle must not be aria-hidden=true`);
      }
      if ((hasGgHandle || hasStoreHandle) && tagName !== "button") {
        fail(`${file}:${line} drag handle should be a button, got <${tagName}>`);
      }
    }
  }
  if (handleTags === 0) fail("no data-gg-drag-handle/data-store-drag-handle tags found");
  else addPass(`interactive handle tags are buttons count=${handleTags}`);
}

function checkHashGroup(label, files) {
  const present = files.filter(requireFile);
  if (present.length !== files.length) return;
  const hashes = new Map(present.map((file) => [file, sha256(file)]));
  const unique = new Set(hashes.values());
  if (unique.size !== 1) {
    fail(`${label} drift: ${present.map((file) => `${file}=${hashes.get(file).slice(0, 12)}`).join(" ")}`);
    return;
  }
  addPass(`${label} hash parity ${[...unique][0].slice(0, 12)}`);
}

function normalizedBloggerTemplateSource(file) {
  let source = read(file);
  source = source.replace(
    /<b:skin><!\[CDATA\[\n[\s\S]*?\n\s*\]\]><\/b:skin>/,
    "<b:skin><![CDATA[\n/* gg inline css intentionally normalized */\n]]></b:skin>",
  );
  source = source.replace(/\/__gg\/assets\/css\/gg-app\.(?:dev|min)\.css/g, "/__gg/assets/css/gg-app.css");
  return source;
}

function checkGeneratedBloggerTemplate() {
  const files = ["index.xml", "dist/blogger-template.publish.xml"];
  if (!files.every(requireFile)) return;

  const [sourceFile, artifactFile] = files;
  const sourceHash = createHash("sha256").update(normalizedBloggerTemplateSource(sourceFile)).digest("hex");
  const artifactHash = createHash("sha256").update(normalizedBloggerTemplateSource(artifactFile)).digest("hex");

  if (sourceHash === artifactHash) {
    addPass(`generated Blogger template normalized parity ${sourceHash.slice(0, 12)}`);
  } else {
    fail(`generated Blogger template drift outside critical-css extraction: ${sourceFile}=${sourceHash.slice(0, 12)} ${artifactFile}=${artifactHash.slice(0, 12)}`);
  }
}

const flatStoreFiles = readdirSync(".")
  .filter((name) => /^store-[a-z0-9-]+\.html$/i.test(name))
  .sort();

const widthRoots = [
  "index.xml",
  "landing.html",
  "store.html",
  "template",
  "src/css",
  "src/store",
  "assets/store",
  "__gg/assets/css",
  "dist/assets/css",
  ...flatStoreFiles,
  ...collectFiles("store", (file) => /index\.html$/i.test(file)),
];
const widthFiles = [...new Set(widthRoots.flatMap((entry) => collectFiles(entry, (file) => textFileRe.test(file))))].sort();
checkWidthContracts(widthFiles);

const handleFiles = [
  "index.xml",
  "template/index.original.xml",
  "template/partials/12-post-detail-comments.xml",
  "template/partials/16-discovery-panel-and-templates.xml",
  "template/partials/17-preview-panel-and-templates.xml",
  "template/partials/18-more-panel.xml",
  "store.html",
  "landing.html",
].filter(requireFile);
checkInteractiveHandles(handleFiles);

for (const file of ["index.xml", "template/partials/17-preview-panel-and-templates.xml"]) {
  for (const marker of [
    "gg-preview__hero",
    "gg-preview__shade",
    "gg-preview__intro",
    "gg-preview__surface",
    "gg-preview__affordance",
    "gg-preview__cta",
  ]) {
    requireMarker(file, marker, "Blogger preview grammar");
  }
  requireMarker(file, "gg-content-sheet__affordance", "Blogger preview sticky affordance");
  requireMarker(file, "data-gg-drag-handle='preview'", "Blogger preview interactive handle");
  requireMarker(file, "data-gg-close='preview'", "Blogger preview close handle");
}

for (const marker of [
  "store-preview__footer",
  "store-preview__handle",
  "store-bottom-sheet",
  "gg-sheet__head",
  "gg-sheet__handle",
]) {
  requireMarker("store.html", marker, "Store sheet placement");
}

for (const marker of ["gg-sheet__head", "gg-sheet__handle"]) {
  requireMarker("landing.html", marker, "Landing bottom sheet placement");
}

checkHashGroup("app css source/staged/dev/dist", [
  "src/css/gg-app.source.css",
  "__gg/assets/css/gg-app.dev.css",
  "dist/assets/css/gg-app.dev.css",
]);
checkHashGroup("app js source/staged/dev/dist", [
  "src/js/gg-app.source.js",
  "__gg/assets/js/gg-app.dev.js",
  "dist/assets/js/gg-app.dev.js",
]);
checkHashGroup("store css source/asset", [
  "src/store/store.css",
  "assets/store/store.css",
]);
checkHashGroup("store legacy js source/asset", [
  "src/store/store.js",
  "assets/store/store.js",
]);
checkHashGroup("store core js source/asset", [
  "src/store/store-core.js",
  "assets/store/store-core.js",
]);
checkGeneratedBloggerTemplate();

if (requireFile("src/store/store-discovery.js") && requireFile("assets/store/store-discovery.js")) {
  const discoverySource = read("src/store/store-discovery.js");
  const discoveryAsset = read("assets/store/store-discovery.js");
  if (!discoverySource.includes("var STORE_CATEGORY_CONFIG = {};")) {
    fail("src/store/store-discovery.js should keep the generated category config placeholder");
  } else if (
    discoveryAsset.includes("var STORE_CATEGORY_CONFIG = {};") ||
    !discoveryAsset.includes('"fashion"') ||
    !discoveryAsset.includes('"skincare"') ||
    !discoveryAsset.includes('"workspace"') ||
    !discoveryAsset.includes('"tech"') ||
    !discoveryAsset.includes('"everyday"')
  ) {
    fail("assets/store/store-discovery.js is missing generated Store category config");
  } else {
    addPass("store discovery generated category config is present");
  }
}

if (read("src/store/store.css").includes("--store-max-wide: 1040px")) {
  addPass("content-grid 1040px token is allowed");
}

for (const message of passes) console.log(`PASS: ${message}`);
if (failures.length) {
  for (const message of failures) console.error(`FAIL: ${message}`);
  console.error(`SHEET CONTRACT SMOKE RESULT: FAILED (${failures.length})`);
  process.exit(1);
}
console.log(`SHEET CONTRACT SMOKE RESULT: PASS checks=${passes.length}`);
NODE
