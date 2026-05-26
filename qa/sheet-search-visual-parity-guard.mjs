#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

function absolute(file) {
  return path.resolve(ROOT, file);
}

function existsFile(file) {
  return existsSync(absolute(file)) && statSync(absolute(file)).isFile();
}

function read(file) {
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute(file), "utf8");
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function normalize(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function assertPattern(source, pattern, label) {
  if (pattern.test(source)) pass(label);
  else fail(label);
}

function generatedBlock(source, marker, file) {
  const pattern = new RegExp(
    `/\\* BEGIN GENERATED: ${escapeRegExp(marker)} \\*/\\n?([\\s\\S]*?)\\n?/\\* END GENERATED: ${escapeRegExp(marker)} \\*/`,
    "g"
  );
  const matches = Array.from(source.matchAll(pattern));
  if (matches.length !== 1) {
    fail(`${file} must contain exactly one generated ${marker} block; found ${matches.length}`);
    return "";
  }
  return matches[0][1];
}

function listFiles(dir) {
  const root = absolute(dir);
  if (!existsSync(root)) return [];
  const output = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.isFile()) output.push(path.relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  walk(root);
  return output.sort();
}

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
const tokens = read("src/css/components/gg-visual-tokens.css");
const discovery = read("src/css/components/gg-discovery-sheet.css");
const more = read("src/css/components/gg-more-sheet.css");
const appCss = read("src/css/gg-app.source.css");
const landing = read("landing.html");
const storeCss = read("src/store/store.css");
const storeHtml = read("store.html");
const indexXml = read("index.xml");
const appJs = read("src/js/gg-app.source.js");
const landingJs = landing;
const storeJs = read("src/store/store-discovery.js");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const liveSmoke = read("qa/live-smoke.sh");
const worker = read("worker.js");

for (const token of [
  "--gg-sheet-search-height",
  "--gg-sheet-search-radius",
  "--gg-sheet-search-pad-x",
  "--gg-sheet-search-border",
  "--gg-sheet-search-border-active",
  "--gg-sheet-search-surface",
  "--gg-sheet-search-focus-ring",
]) {
  assertIncludes(tokens, token, `shared sheet search token exists: ${token}`);
}
assertIncludes(tokens, "--gg-sheet-search-focus-ring: 0 0 0 2px", "shared sheet search focus ring is thin");

for (const [label, source] of [
  ["Discovery component", discovery],
  ["More component", more],
  ["Store CSS", storeCss],
]) {
  assertNoPattern(source, /0\s+0\s+0\s+3px[^;}]*/u, `${label} does not use thick 3px search focus ring`);
}

for (const needle of [
  "min-height: var(--gg-sheet-search-height)",
  "padding: 0 var(--gg-sheet-search-pad-x)",
  "border: 1px solid var(--gg-sheet-search-border)",
  "border-radius: var(--gg-sheet-search-radius)",
  "background: var(--gg-sheet-search-surface)",
  ".gg-discovery-search__field:hover",
  ".gg-discovery-search__field:focus-visible",
  "box-shadow: var(--gg-sheet-search-focus-ring)",
]) {
  assertIncludes(discovery, needle, `Discovery search field uses shared visual contract: ${needle}`);
}
assertIncludes(discovery, "min-height: var(--gg-discovery-empty-min-height, 148px)", "Saved/empty state has shared minimum height");
assertIncludes(discovery, "text-align: center", "Saved/empty state centers empty copy");

for (const needle of [
  "min-height: var(--gg-sheet-search-height)",
  "padding: 0 var(--gg-sheet-search-pad-x)",
  "border: 1px solid var(--gg-sheet-search-border)",
  "border-radius: var(--gg-sheet-search-radius)",
  "background: var(--gg-sheet-search-surface)",
  ".gg-more-local-search__field:hover",
  ".gg-more-local-search__field:focus-within",
  "box-shadow: var(--gg-sheet-search-focus-ring)",
]) {
  assertIncludes(more, needle, `More local search field uses shared visual contract: ${needle}`);
}

for (const needle of [
  ".store-field",
  "min-height: var(--gg-sheet-search-height)",
  "padding: 0 var(--gg-sheet-search-pad-x)",
  "border: 1px solid var(--gg-sheet-search-border)",
  "border-radius: var(--gg-sheet-search-radius)",
  "background: var(--gg-sheet-search-surface)",
  ".store-field:hover",
  ".store-field:focus-within",
  "box-shadow: var(--gg-sheet-search-focus-ring)",
]) {
  assertIncludes(storeCss, needle, `Store discovery search field uses shared visual contract: ${needle}`);
}

for (const [moduleFile, sourceFile] of [
  ["src/css/modules/discovery.css", "src/css/components/gg-discovery-sheet.css"],
  ["src/css/modules/more.css", "src/css/components/gg-more-sheet.css"],
  ["src/css/modules/visual-tokens.css", "src/css/components/gg-visual-tokens.css"],
]) {
  if (normalize(read(moduleFile)) === normalize(read(sourceFile))) {
    pass(`${moduleFile} mirrors ${sourceFile}`);
  } else {
    fail(`${moduleFile} must mirror ${sourceFile}; run npm run gaga:sync-components`);
  }
}

for (const [file, source, marker, expected] of [
  ["src/css/gg-app.source.css", appCss, "gg-visual-tokens", tokens],
  ["src/css/gg-app.source.css", appCss, "gg-discovery-sheet", discovery],
  ["src/css/gg-app.source.css", appCss, "gg-more-sheet", more],
  ["landing.html", landing, "gg-visual-tokens", tokens],
  ["landing.html", landing, "gg-discovery-sheet", discovery],
  ["landing.html", landing, "gg-more-sheet", more],
  ["src/store/store.css", storeCss, "gg-visual-tokens", tokens],
  ["src/store/store.css", storeCss, "gg-more-sheet", more],
]) {
  if (normalize(generatedBlock(source, marker, file)) === normalize(expected)) {
    pass(`${file} generated ${marker} block matches component source`);
  } else {
    fail(`${file} generated ${marker} block differs from component source`);
  }
}

for (const [file, source] of [
  ["index.xml", indexXml],
  ["landing.html", landing],
  ["store.html", storeHtml],
]) {
  assertIncludes(source, "data-gg-more-search-input", `${file} exposes More local search input`);
  assertIncludes(source, "more.localSearch.label", `${file} uses registry/copy-backed More search label`);
  assertIncludes(source, "more.localSearch.placeholder", `${file} uses registry/copy-backed More search placeholder`);
  assertIncludes(source, "gg-more-list__link", `${file} exposes searchable More rows`);
}

for (const [file, source] of [
  ["src/js/gg-app.source.js", appJs],
  ["landing.html", landingJs],
  ["src/store/store-discovery.js", storeJs],
]) {
  assertIncludes(
    source,
    "root.closest('.gg-more-sheet') || root.closest('[data-gg-panel=\"more\"]') || root",
    `${file} scopes More local search to the containing More panel`
  );
  assertIncludes(source, "scope.querySelector('[data-gg-more-search-input]')", `${file} binds the More search input from panel scope`);
  assertPattern(source, /row\.hidden\s*=\s*!match/u, `${file} filters More rows through existing local search behavior`);
  assertIncludes(source, "data-gg-filter-empty", `${file} preserves section empty-state filtering`);
}

const moreSearchControllers = listFiles("src/js").filter((file) => /more.*search|search.*more/iu.test(path.basename(file)));
if (moreSearchControllers.length) {
  fail(`parallel More search controller file detected: ${moreSearchControllers.join(", ")}`);
} else {
  pass("no parallel More-only search controller file exists under src/js");
}

assertIncludes(indexXml, "href='/landing'", "root More sheet preserves Home(/landing) route truth");
assertIncludes(indexXml, "href='/'", "root More sheet preserves Blog(/) route truth");
assertIncludes(indexXml, "href='/store'", "root More sheet preserves Store route truth");
assertNoPattern(indexXml, /data:schemaPosts/u, "Blog1 root schema does not use data:schemaPosts");
assertNoPattern(indexXml, /id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/iu, "Blog1 root schema does not use filtered data:posts ItemList");

for (const [file, source] of [
  ["index.xml", indexXml],
  ["src/js/gg-app.source.js", appJs],
  ["worker.js", worker],
]) {
  assertNoPattern(source, /(?:title|slug|url|path|post)[^;\n]{0,80}todo[^;\n]{0,80}(?:hide|hidden|block|remove|dummy|stale|exclude)/iu, `${file} does not hardblock valid todo content`);
}
assertIncludes(liveSmoke, "/2026/02/todo.html", "comments proof still treats todo as valid live content");

if (scripts["gaga:verify-sheet-search-visual-parity"] === "node qa/sheet-search-visual-parity-guard.mjs") {
  pass("package script gaga:verify-sheet-search-visual-parity is wired");
} else {
  fail("package.json missing gaga:verify-sheet-search-visual-parity script");
}
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-sheet-search-visual-parity", "ci:qa includes sheet search visual parity guard");
assertIncludes(ciGuard, "qa/sheet-search-visual-parity-guard.mjs", "CI reconciliation classifies sheet search visual parity guard");
assertIncludes(qaCommands, "npm run gaga:verify-sheet-search-visual-parity", "QA-COMMANDS documents sheet search visual parity guard");
assertIncludes(sourceOfTruth, "qa/sheet-search-visual-parity-guard.mjs", "SOURCE-OF-TRUTH documents sheet search visual parity guard");

if (failures.length) {
  console.error("SHEET SEARCH VISUAL PARITY GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("SHEET SEARCH VISUAL PARITY GUARD PASS");
