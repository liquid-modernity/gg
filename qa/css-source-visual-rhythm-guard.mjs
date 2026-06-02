#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const ownershipCategories = [
  "critical",
  "tokens/base",
  "shared component",
  "surface-specific",
  "route-specific",
  "generated",
  "dead/legacy",
  "forbidden patch/override",
];

const activeCssFiles = [
  "src/css/gg-app.source.css",
  "src/css/gg-critical.source.css",
  "src/css/components/gg-discovery-sheet.css",
  "src/css/components/gg-more-sheet.css",
  "src/css/components/gg-preview-frame.css",
  "src/css/components/gg-sheet-core.css",
  "src/css/components/gg-sheet-modal.css",
  "src/css/components/gg-visual-tokens.css",
  "src/css/modules/base.css",
  "src/css/modules/comments.css",
  "src/css/modules/detail-outline.css",
  "src/css/modules/detail-toolbar.css",
  "src/css/modules/detail.css",
  "src/css/modules/discovery.css",
  "src/css/modules/dock.css",
  "src/css/modules/feedback.css",
  "src/css/modules/listing.css",
  "src/css/modules/more.css",
  "src/css/modules/motion.css",
  "src/css/modules/preview-frame.css",
  "src/css/modules/responsive.css",
  "src/css/modules/sheets.css",
  "src/css/modules/shell.css",
  "src/css/modules/theme.css",
  "src/css/modules/tokens.css",
  "src/css/modules/visual-tokens.css",
  "src/store/store.css",
  "src/store/store.critical.css",
  "src/landing/landing.css",
  "src/dashboard/dashboard.css",
  "src/knowledge base/knowledgebase.css",
  "assets/store/store.css",
  "assets/landing/landing.css",
  "assets/dashboard/dashboard.css",
  "assets/knowledge base/knowledgebase.css",
];

const appCssAssetPairs = [
  ["src/css/gg-app.source.css", "__gg/assets/css/gg-app.dev.css"],
  ["src/css/gg-app.source.css", "__gg/assets/css/gg-app.min.css"],
  ["src/css/gg-app.source.css", "dist/assets/css/gg-app.dev.css"],
  ["src/css/gg-app.source.css", "dist/assets/css/gg-app.min.css"],
  ["src/css/gg-critical.source.css", "__gg/assets/css/gg-critical.css"],
  ["src/css/gg-critical.source.css", "dist/assets/css/gg-critical.css"],
  ["src/store/store.css", "assets/store/store.css"],
  ["src/landing/landing.css", "assets/landing/landing.css"],
  ["src/dashboard/dashboard.css", "assets/dashboard/dashboard.css"],
  ["src/knowledge base/knowledgebase.css", "assets/knowledge base/knowledgebase.css"],
];

const optionalStagedCssPairs = [
  ["__gg/assets/css/gg-app.dev.css", ".cloudflare-build/public/__gg/assets/css/gg-app.dev.css"],
  ["__gg/assets/css/gg-app.min.css", ".cloudflare-build/public/__gg/assets/css/gg-app.min.css"],
  ["assets/store/store.css", ".cloudflare-build/public/assets/store/store.css"],
  ["assets/landing/landing.css", ".cloudflare-build/public/assets/landing/landing.css"],
  ["assets/dashboard/dashboard.css", ".cloudflare-build/public/assets/dashboard/dashboard.css"],
  ["assets/knowledge base/knowledgebase.css", ".cloudflare-build/public/assets/knowledge base/knowledgebase.css"],
];

const generatedModuleMirrors = {
  "src/css/modules/discovery.css": "src/css/components/gg-discovery-sheet.css",
  "src/css/modules/more.css": "src/css/components/gg-more-sheet.css",
  "src/css/modules/preview-frame.css": "src/css/components/gg-preview-frame.css",
  "src/css/modules/sheets.css": "src/css/components/gg-sheet-core.css",
  "src/css/modules/visual-tokens.css": "src/css/components/gg-visual-tokens.css",
};

const syncToolInputs = [
  "src/css/components/gg-discovery-sheet.css",
  "src/css/components/gg-more-sheet.css",
  "src/css/components/gg-preview-frame.css",
  "src/css/components/gg-sheet-core.css",
  "src/css/components/gg-sheet-modal.css",
  "src/css/components/gg-visual-tokens.css",
  "src/css/modules/detail-toolbar.css",
];

const forbiddenLayerPattern = /(?:^|[._-])(?:patch|override|hotfix|emergency)(?:[._-]|$)/iu;
const largeUnclassifiedCssBytes = 32 * 1024;

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

function warn(message) {
  warnings.push(message);
}

function fail(message) {
  failures.push(message);
}

function sha(file) {
  if (!existsFile(file)) {
    fail(`missing CSS parity endpoint: ${file}`);
    return "";
  }
  return createHash("sha256").update(readFileSync(absolute(file))).digest("hex");
}

function normalize(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trim();
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function assertSameFile(source, output, label) {
  const sourceHash = sha(source);
  const outputHash = sha(output);
  if (!sourceHash || !outputHash) return;
  if (sourceHash === outputHash) pass(label);
  else fail(`${label}: ${output} differs from ${source}; run the owning build/sync command`);
}

function walkFiles(dir) {
  if (!existsSync(absolute(dir))) return [];
  const out = [];
  for (const entry of readdirSync(absolute(dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) out.push(...walkFiles(rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

function activeCssTreeFiles() {
  return ["src", "assets"]
    .flatMap((dir) => walkFiles(dir))
    .filter((file) => file.endsWith(".css"))
    .sort();
}

function findUnclassifiedLargeCss() {
  const excludedDirs = new Set([
    ".git",
    ".cloudflare-build",
    "__gg",
    "dist",
    "docs/archive",
    "node_modules",
    "store",
  ]);
  const known = new Set(activeCssFiles);
  const out = [];

  function walk(relativeDir) {
    const absoluteDir = absolute(relativeDir);
    if (!existsSync(absoluteDir)) return;
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const rel = path.join(relativeDir, entry.name).replace(/\\/g, "/").replace(/^\.\//u, "");
      if (entry.isDirectory()) {
        if (excludedDirs.has(rel) || excludedDirs.has(entry.name)) continue;
        walk(rel);
      } else if (entry.isFile() && rel.endsWith(".css") && !known.has(rel)) {
        const size = statSync(absolute(rel)).size;
        if (size >= largeUnclassifiedCssBytes) out.push(`${rel} (${size} bytes)`);
      }
    }
  }

  walk(".");
  return out.sort();
}

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
const report = read("CSS-SOURCE-OF-TRUTH-REPORT.md");
const wiringReport = read("CSS-MODULE-BUNDLE-WIRING-REPORT.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const assetArchitecture = read("ASSET-ARCHITECTURE.md");
const qaCommands = read("QA-COMMANDS.md");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const readinessGuard = read("qa/readiness-85-guard.mjs");
const syncTool = read("tools/sync-shared-css-components.mjs");
const worker = read("worker.js");

if (scripts["gaga:verify-css-source-visual-rhythm"] === "node qa/css-source-visual-rhythm-guard.mjs") {
  pass("package script gaga:verify-css-source-visual-rhythm is wired");
} else {
  fail("package.json missing gaga:verify-css-source-visual-rhythm script");
}
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-css-source-visual-rhythm", "ci:qa includes CSS visual rhythm source guard");
assertIncludes(ciGuard, "qa/css-source-visual-rhythm-guard.mjs", "CI reconciliation classifies CSS visual rhythm source guard");
assertIncludes(readinessGuard, "gaga:verify-css-source-visual-rhythm", "readiness guard runs CSS visual rhythm source guard");

for (const doc of [report, sourceOfTruth, assetArchitecture, qaCommands]) {
  assertIncludes(doc, "npm run gaga:verify-css-source-visual-rhythm", "docs include CSS visual rhythm guard command");
}

for (const category of ownershipCategories) {
  assertIncludes(report, `\`${category}\``, `CSS source report classifies ${category}`);
}
assertIncludes(report, "Mandatory CSS guards stay architecture-level", "CSS source report keeps mandatory guard scope architecture-level");
assertIncludes(report, "advisory only", "CSS source report keeps detailed style checks advisory");
assertIncludes(qaCommands, "Mandatory CSS guards are architecture-level", "QA commands keep CSS guard failures architecture-level");
assertIncludes(qaCommands, "must not block `ci:qa`", "QA commands keep detailed CSS style checks non-blocking");

for (const cssFile of activeCssFiles) {
  if (!existsFile(cssFile)) fail(`classified CSS path is missing: ${cssFile}`);
  else pass(`classified CSS path exists: ${cssFile}`);
  assertIncludes(report, `\`${cssFile}\``, `CSS source report documents ${cssFile}`);
}

const expectedActiveCss = activeCssFiles.slice().sort();
const actualActiveCss = activeCssTreeFiles();
if (JSON.stringify(actualActiveCss) === JSON.stringify(expectedActiveCss)) {
  pass("all active src/assets CSS files have explicit ownership");
} else {
  fail(`active src/assets CSS ownership mismatch: expected ${expectedActiveCss.join(", ")}; found ${actualActiveCss.join(", ")}`);
}

for (const source of syncToolInputs) {
  assertIncludes(syncTool, source, `shared CSS sync tool registers ${source}`);
}
for (const [moduleFile, componentFile] of Object.entries(generatedModuleMirrors)) {
  if (normalize(read(moduleFile)) === normalize(read(componentFile))) {
    pass(`${moduleFile} mirrors ${componentFile}`);
  } else {
    fail(`${moduleFile} must mirror ${componentFile}; run npm run gaga:sync-components`);
  }
  assertIncludes(wiringReport, `\`${moduleFile}\``, `CSS module wiring report classifies ${moduleFile}`);
}

for (const [source, output] of appCssAssetPairs) {
  assertSameFile(source, output, `CSS build path parity ${source} -> ${output}`);
}
for (const [source, output] of optionalStagedCssPairs) {
  if (existsFile(output)) assertSameFile(source, output, `CSS staged path parity ${source} -> ${output}`);
}

for (const cssFile of actualActiveCss) {
  if (forbiddenLayerPattern.test(path.basename(cssFile))) {
    fail(`forbidden CSS patch/override/emergency layer path: ${cssFile}`);
  }
}
pass("no active CSS file uses a forbidden patch/override/emergency layer name");

const unclassifiedLargeCss = findUnclassifiedLargeCss();
if (unclassifiedLargeCss.length) {
  fail(`unclassified large CSS artifacts need ownership proof: ${unclassifiedLargeCss.join(", ")}`);
} else {
  pass("no clearly unused large CSS artifact is unclassified");
}

assertNoPattern(worker, /HTMLRewriter/u, "Worker does not use HTMLRewriter as CSS/readability repair");

warn("Detailed CSS style findings stay advisory: token consistency, visual rhythm drift, selector naming, component spacing, optimization, and non-critical size warnings are not enforced by this guard.");

if (failures.length) {
  console.error("CSS SOURCE VISUAL RHYTHM GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
console.log(warnings.length ? "CSS SOURCE VISUAL RHYTHM GUARD PASS_WITH_WARNINGS" : "CSS SOURCE VISUAL RHYTHM GUARD PASS");
