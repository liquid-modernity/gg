#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

const staleFiles = [
  "_headers.bak.20260504-164650",
  "_headers.bak.clean-20260504-165904",
  "index.html.css.js.xml",
];

const cssModules = [
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
];

const cssComponents = {
  "gg-visual-tokens": "src/css/components/gg-visual-tokens.css",
  "gg-sheet-core": "src/css/components/gg-sheet-core.css",
  "gg-sheet-modal": "src/css/components/gg-sheet-modal.css",
  "gg-preview-frame": "src/css/components/gg-preview-frame.css",
  "gg-more-sheet": "src/css/components/gg-more-sheet.css",
  "gg-discovery-sheet": "src/css/components/gg-discovery-sheet.css",
};

const generatedModuleMirrors = {
  "src/css/modules/sheets.css": "src/css/components/gg-sheet-core.css",
  "src/css/modules/more.css": "src/css/components/gg-more-sheet.css",
  "src/css/modules/discovery.css": "src/css/components/gg-discovery-sheet.css",
  "src/css/modules/visual-tokens.css": "src/css/components/gg-visual-tokens.css",
  "src/css/modules/preview-frame.css": "src/css/components/gg-preview-frame.css",
};

const appAssetGroups = [
  {
    source: "src/css/gg-app.source.css",
    outputs: [
      "__gg/assets/css/gg-app.dev.css",
      "__gg/assets/css/gg-app.min.css",
      "dist/assets/css/gg-app.dev.css",
      "dist/assets/css/gg-app.min.css",
    ],
  },
  {
    source: "src/css/gg-critical.source.css",
    outputs: ["__gg/assets/css/gg-critical.css", "dist/assets/css/gg-critical.css"],
  },
  {
    source: "src/js/gg-app.source.js",
    outputs: [
      "__gg/assets/js/gg-app.dev.js",
      "__gg/assets/js/gg-app.min.js",
      "dist/assets/js/gg-app.dev.js",
      "dist/assets/js/gg-app.min.js",
    ],
  },
];

const storeAssetPairs = [
  ["src/store/store.css", "assets/store/store.css"],
  ["src/store/store-core.js", "assets/store/store-core.js"],
  ["src/store/store.js", "assets/store/store.js"],
];

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

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

function hashFile(file) {
  if (!existsFile(file)) {
    fail(`missing generated/source asset: ${file}`);
    return "";
  }
  return createHash("sha256").update(readFileSync(absolute(file))).digest("hex");
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function rootJsonLdBlock(source) {
  const marker = source.match(/<script[^>]+id=['"]gg-root-jsonld['"][^>]*>/i);
  if (!marker || marker.index === undefined) return "";
  const closeIndex = source.indexOf("</script>", marker.index);
  if (closeIndex < 0) return source.slice(marker.index);
  return source.slice(marker.index, closeIndex + "</script>".length);
}

function assertSameHash(source, output, label) {
  const sourceHash = hashFile(source);
  const outputHash = hashFile(output);
  if (!sourceHash || !outputHash) return;
  if (sourceHash === outputHash) pass(label);
  else fail(`${label}: ${output} differs from ${source}; run the owning build`);
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

function activeReferenceFiles() {
  const roots = [
    "package.json",
    "index.xml",
    "landing.html",
    "store.html",
    "worker.js",
    "_headers",
    "src",
    "assets",
    "tools",
    "qa",
    "docs",
    "ASSET-ARCHITECTURE.md",
    "SOURCE-OF-TRUTH.md",
    "QA-COMMANDS.md",
  ];
  const files = [];
  for (const root of roots) {
    if (!existsSync(absolute(root))) continue;
    if (statSync(absolute(root)).isDirectory()) files.push(...walkFiles(root));
    else files.push(root);
  }
  return files.filter((file) => {
    if (file === "qa/css-source-of-truth-cleanup-guard.mjs") return false;
    if (file.startsWith("docs/archive/")) return false;
    if (file.startsWith("qa/perf-baseline/")) return false;
    return /\.(?:json|mjs|js|css|html|xml|md|txt|sh|webmanifest|jsonc)$/u.test(file) || file === "_headers";
  });
}

for (const staleFile of staleFiles) {
  if (existsFile(staleFile)) fail(`known stale file returned: ${staleFile}`);
  else pass(`known stale file is absent: ${staleFile}`);
}

for (const file of activeReferenceFiles()) {
  const text = readFileSync(absolute(file), "utf8");
  for (const staleFile of staleFiles) {
    if (text.includes(staleFile)) fail(`active file references deleted stale path ${staleFile}: ${file}`);
  }
}
pass("active build/runtime/source/docs files do not reference deleted stale files");

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
if (scripts["gaga:verify-css-sot-cleanup"] === "node qa/css-source-of-truth-cleanup-guard.mjs") {
  pass("package script gaga:verify-css-sot-cleanup is wired");
} else {
  fail("package.json missing gaga:verify-css-sot-cleanup script");
}
if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-css-sot-cleanup")) {
  pass("ci:qa includes CSS source-of-truth cleanup guard");
} else {
  fail("ci:qa must include npm run gaga:verify-css-sot-cleanup");
}

const report = read("CSS-SOURCE-OF-TRUTH-REPORT.md");
for (const cssModule of cssModules) {
  if (!existsFile(cssModule)) {
    fail(`documented CSS module is missing: ${cssModule}`);
    continue;
  }
  if (report.includes(`\`${cssModule}\``)) pass(`CSS module classified: ${cssModule}`);
  else fail(`CSS-SOURCE-OF-TRUTH-REPORT.md does not classify ${cssModule}`);
}
for (const componentPath of Object.values(cssComponents)) {
  if (!existsFile(componentPath)) fail(`CSS component source missing: ${componentPath}`);
  else if (report.includes(`\`${componentPath}\``)) pass(`CSS component classified: ${componentPath}`);
  else fail(`CSS-SOURCE-OF-TRUTH-REPORT.md does not classify ${componentPath}`);
}
for (const [modulePath, componentPath] of Object.entries(generatedModuleMirrors)) {
  if (normalize(read(modulePath)) === normalize(read(componentPath))) {
    pass(`${modulePath} mirrors ${componentPath}`);
  } else {
    fail(`${modulePath} must mirror ${componentPath}; run npm run gaga:sync-components`);
  }
}

const syncTool = read("tools/sync-shared-css-components.mjs");
for (const [name, componentPath] of Object.entries(cssComponents)) {
  assertIncludes(syncTool, componentPath, `sync tool reads ${name}`);
}

for (const group of appAssetGroups) {
  for (const output of group.outputs) {
    assertSameHash(group.source, output, `generated app asset parity for ${group.source}`);
  }
}
for (const [source, output] of storeAssetPairs) {
  if (normalize(read(source)) === normalize(read(output))) pass(`Store runtime asset matches ${source}`);
  else fail(`${output} differs from ${source}; run npm run store:build`);
}

const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const assetArchitecture = read("ASSET-ARCHITECTURE.md");
const qaCommands = read("QA-COMMANDS.md");
for (const role of ["src/", "assets/", "__gg/", "dist/", ".cloudflare-build/"]) {
  assertIncludes(sourceOfTruth, role, `SOURCE-OF-TRUTH documents ${role}`);
  assertIncludes(assetArchitecture, role, `ASSET-ARCHITECTURE documents ${role}`);
}
for (const doc of [sourceOfTruth, assetArchitecture, qaCommands, report]) {
  assertIncludes(doc, "npm run gaga:verify-css-sot-cleanup", "docs include CSS SOT cleanup guard command");
}

const indexXml = read("index.xml");
const rootSchema = rootJsonLdBlock(indexXml);
assertNoPattern(indexXml, /data:schemaPosts/, "Blog1-safe schema: data:schemaPosts is absent");
assertNoPattern(
  rootSchema,
  /data:posts\s+filter\s*\(p\s*=&gt;/i,
  "Blog1-safe schema: root schema has no filtered data:posts loop"
);
assertNoPattern(
  rootSchema,
  /ItemList[\s\S]*?data:posts/i,
  "Blog1-safe schema: root schema has no dynamic ItemList from data:posts"
);

if (failures.length) {
  console.error("CSS SOURCE OF TRUTH CLEANUP GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("CSS SOURCE OF TRUTH CLEANUP GUARD PASS");
