#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

const componentSources = {
  "src/css/components/gg-discovery-sheet.css": "gg-discovery-sheet",
  "src/css/components/gg-more-sheet.css": "gg-more-sheet",
  "src/css/components/gg-preview-frame.css": "gg-preview-frame",
  "src/css/components/gg-sheet-core.css": "gg-sheet-core",
  "src/css/components/gg-sheet-modal.css": "gg-sheet-modal",
  "src/css/components/gg-visual-tokens.css": "gg-visual-tokens",
};

const generatedModuleMirrors = {
  "src/css/modules/discovery.css": "src/css/components/gg-discovery-sheet.css",
  "src/css/modules/more.css": "src/css/components/gg-more-sheet.css",
  "src/css/modules/preview-frame.css": "src/css/components/gg-preview-frame.css",
  "src/css/modules/sheets.css": "src/css/components/gg-sheet-core.css",
  "src/css/modules/visual-tokens.css": "src/css/components/gg-visual-tokens.css",
};

const wiredModuleBlocks = {
  "src/css/modules/detail-toolbar.css": "module-detail-toolbar",
};

const documentedManualModules = [
  "src/css/modules/base.css",
  "src/css/modules/comments.css",
  "src/css/modules/detail-outline.css",
  "src/css/modules/detail.css",
  "src/css/modules/dock.css",
  "src/css/modules/feedback.css",
  "src/css/modules/listing.css",
  "src/css/modules/motion.css",
  "src/css/modules/responsive.css",
  "src/css/modules/shell.css",
  "src/css/modules/theme.css",
  "src/css/modules/tokens.css",
];

const expectedModuleFiles = [
  ...Object.keys(generatedModuleMirrors),
  ...Object.keys(wiredModuleBlocks),
  ...documentedManualModules,
].sort();

const expectedComponentFiles = Object.keys(componentSources).sort();

const cssAssetPairs = [
  ["src/css/gg-app.source.css", "__gg/assets/css/gg-app.dev.css"],
  ["src/css/gg-app.source.css", "__gg/assets/css/gg-app.min.css"],
  ["src/css/gg-app.source.css", "dist/assets/css/gg-app.dev.css"],
  ["src/css/gg-app.source.css", "dist/assets/css/gg-app.min.css"],
  ["src/css/gg-critical.source.css", "__gg/assets/css/gg-critical.css"],
  ["src/css/gg-critical.source.css", "dist/assets/css/gg-critical.css"],
  ["src/store/store.css", "assets/store/store.css"],
];

const optionalStagedCssPairs = [
  ["__gg/assets/css/gg-app.min.css", ".cloudflare-build/public/__gg/assets/css/gg-app.min.css"],
  ["__gg/assets/css/gg-app.dev.css", ".cloudflare-build/public/__gg/assets/css/gg-app.dev.css"],
  ["assets/store/store.css", ".cloudflare-build/public/assets/store/store.css"],
];

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

function normalize(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trim();
}

function sha(file) {
  if (!existsFile(file)) {
    fail(`missing CSS asset: ${file}`);
    return "";
  }
  return createHash("sha256").update(readFileSync(absolute(file))).digest("hex");
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
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
  else fail(`${label}: ${output} differs from ${source}`);
}

function listCssFiles(dir) {
  return readdirSync(absolute(dir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => `${dir}/${entry.name}`)
    .sort();
}

function generatedBlock(source, marker) {
  const pattern = new RegExp(
    `/\\* BEGIN GENERATED: ${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\*/\\n([\\s\\S]*?)\\n/\\* END GENERATED: ${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\*/`,
    "g"
  );
  const matches = Array.from(source.matchAll(pattern));
  if (matches.length !== 1) {
    fail(`src/css/gg-app.source.css must contain exactly one generated ${marker} block; found ${matches.length}`);
    return "";
  }
  return matches[0][1];
}

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
const appCss = read("src/css/gg-app.source.css");
const syncTool = read("tools/sync-shared-css-components.mjs");
const report = read("CSS-MODULE-BUNDLE-WIRING-REPORT.md");
const cssSotReport = read("CSS-SOURCE-OF-TRUTH-REPORT.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const assetArchitecture = read("ASSET-ARCHITECTURE.md");
const qaCommands = read("QA-COMMANDS.md");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");

const actualModules = listCssFiles("src/css/modules");
const actualComponents = listCssFiles("src/css/components");

if (JSON.stringify(actualModules) === JSON.stringify(expectedModuleFiles)) {
  pass("all CSS modules have an explicit wiring status");
} else {
  fail(`CSS module status list mismatch: expected ${expectedModuleFiles.join(", ")}; found ${actualModules.join(", ")}`);
}

if (JSON.stringify(actualComponents) === JSON.stringify(expectedComponentFiles)) {
  pass("all CSS components have an explicit wiring status");
} else {
  fail(`CSS component status list mismatch: expected ${expectedComponentFiles.join(", ")}; found ${actualComponents.join(", ")}`);
}

for (const [file, marker] of Object.entries(componentSources)) {
  assertIncludes(syncTool, file, `sync tool reads component ${file}`);
  assertIncludes(report, `\`${file}\``, `wiring report classifies ${file}`);
  assertIncludes(report, "CANONICAL_SOURCE", "wiring report uses canonical source classification");
  if (!normalize(read(file))) fail(`component source is empty: ${file}`);
}

for (const [moduleFile, componentFile] of Object.entries(generatedModuleMirrors)) {
  assertIncludes(syncTool, moduleFile, `sync tool writes generated module mirror ${moduleFile}`);
  if (normalize(read(moduleFile)) === normalize(read(componentFile))) {
    pass(`${moduleFile} mirrors ${componentFile}`);
  } else {
    fail(`${moduleFile} must mirror ${componentFile}; run npm run gaga:sync-components`);
  }
  assertIncludes(report, `\`${moduleFile}\``, `wiring report classifies ${moduleFile}`);
  assertIncludes(report, "GENERATED_OUTPUT", "wiring report uses generated output classification");
}

for (const [moduleFile, marker] of Object.entries(wiredModuleBlocks)) {
  assertIncludes(syncTool, moduleFile, `sync tool reads wired module ${moduleFile}`);
  assertIncludes(syncTool, marker, `sync tool writes marker ${marker}`);
  if (normalize(generatedBlock(appCss, marker)) === normalize(read(moduleFile))) {
    pass(`${moduleFile} generated block matches app CSS`);
  } else {
    fail(`${moduleFile} generated block differs from src/css/gg-app.source.css`);
  }
  assertIncludes(report, `\`${moduleFile}\``, `wiring report classifies ${moduleFile}`);
  assertIncludes(report, "detail-toolbar decision: wired", "wiring report records detail-toolbar decision");
}

for (const moduleFile of documentedManualModules) {
  assertIncludes(report, `\`${moduleFile}\``, `wiring report classifies ${moduleFile}`);
  assertIncludes(report, "ADVISORY_OR_MANUAL", "wiring report uses advisory/manual classification");
  assertIncludes(cssSotReport, `\`${moduleFile}\``, `CSS source-of-truth report classifies ${moduleFile}`);
}

for (const [source, output] of cssAssetPairs) {
  assertSameFile(source, output, `CSS generated asset parity ${source} -> ${output}`);
}
for (const [source, output] of optionalStagedCssPairs) {
  if (existsFile(output)) assertSameFile(source, output, `CSS staged asset parity ${source} -> ${output}`);
}

if (scripts["gaga:verify-css-module-wiring"] === "node qa/css-module-bundle-wiring-guard.mjs") {
  pass("package script gaga:verify-css-module-wiring is wired");
} else {
  fail("package.json missing gaga:verify-css-module-wiring script");
}
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-css-module-wiring", "ci:qa includes CSS module wiring guard");
assertIncludes(ciGuard, "qa/css-module-bundle-wiring-guard.mjs", "CI reconciliation classifies CSS module wiring guard");
assertIncludes(qaCommands, "npm run gaga:verify-css-module-wiring", "QA-COMMANDS documents CSS module wiring guard");
assertIncludes(sourceOfTruth, "qa/css-module-bundle-wiring-guard.mjs", "SOURCE-OF-TRUTH documents CSS module wiring guard");
assertIncludes(assetArchitecture, "CSS-MODULE-BUNDLE-WIRING-REPORT.md", "ASSET-ARCHITECTURE documents CSS module wiring report");
assertIncludes(cssSotReport, "src/css/modules/detail-toolbar.css", "CSS source-of-truth report mentions detail-toolbar");

const indexXml = read("index.xml");
assertNoPattern(indexXml, /data:schemaPosts/, "Blog1-safe schema: data:schemaPosts is absent");
assertNoPattern(
  indexXml,
  /id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/i,
  "Blog1-safe schema: root schema has no filtered data:posts loop"
);

if (failures.length) {
  console.error("CSS MODULE BUNDLE WIRING GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("CSS MODULE BUNDLE WIRING GUARD PASS");
