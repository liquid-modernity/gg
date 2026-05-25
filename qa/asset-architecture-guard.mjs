#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const APP_ASSET_GROUPS = [
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

const STORE_ASSET_PAIRS = [
  ["src/store/store.css", "assets/store/store.css", "Store CSS asset"],
  ["src/store/store-core.js", "assets/store/store-core.js", "Store core JS asset"],
  ["src/store/store.js", "assets/store/store.js", "Store legacy JS asset"],
];

function rel(file) {
  return path.relative(ROOT, path.resolve(ROOT, file)).replace(/\\/g, "/");
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function pass(message) {
  passes.push(message);
}

function existsFile(file) {
  const absolute = path.resolve(ROOT, file);
  return existsSync(absolute) && statSync(absolute).isFile();
}

function read(file) {
  const absolute = path.resolve(ROOT, file);
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function readIfExists(file) {
  return existsFile(file) ? readFileSync(path.resolve(ROOT, file), "utf8") : "";
}

function parseJson(file) {
  const source = read(file);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
    return {};
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hashFile(file) {
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return sha256(readFileSync(path.resolve(ROOT, file)));
}

function normalizeTextFile(value) {
  return String(value || "").replace(/\r\n?/g, "\n").trimEnd() + "\n";
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertFile(file, label = file) {
  if (existsFile(file)) pass(`${label} exists`);
  else fail(`${label} missing: ${file}`);
}

function assertSameHash(source, output, label) {
  const sourceHash = hashFile(source);
  const outputHash = hashFile(output);
  if (!sourceHash || !outputHash) return;
  if (sourceHash === outputHash) pass(`${label}: ${output} matches ${source}`);
  else fail(`${label}: ${output} does not match ${source}`);
}

function assertSameText(sourceText, output, label) {
  if (!existsFile(output)) {
    fail(`${label}: missing ${output}`);
    return;
  }
  const outputText = readFileSync(path.resolve(ROOT, output), "utf8");
  const sourceHash = sha256(sourceText);
  const outputHash = sha256(outputText);
  if (sourceHash === outputHash) pass(`${label}: ${output} matches generated source text`);
  else fail(`${label}: ${output} does not match generated source text`);
}

function replaceBSkin(templateText, cssText) {
  let replaced = false;
  const nextText = templateText.replace(
    /(<b:skin><!\[CDATA\[\n)[\s\S]*?(\n\s*\]\]><\/b:skin>)/,
    (_match, open, close) => {
      replaced = true;
      return `${open}${cssText.replace(/\s+$/u, "")}\n${close.trimStart()}`;
    }
  );

  if (!replaced) fail("index.xml does not contain replaceable b:skin block");
  return nextText;
}

function replaceExternalCssHref(templateText) {
  return templateText.replace(/\/__gg\/assets\/css\/gg-app\.(?:dev|min)\.css/g, "/__gg/assets/css/gg-app.min.css");
}

function assertBloggerPublishParity(indexXml, criticalCss) {
  const artifact = read("dist/blogger-template.publish.xml");
  if (!artifact) return;
  const expected = replaceExternalCssHref(replaceBSkin(indexXml, criticalCss));
  if (sha256(expected) === sha256(artifact)) pass("Blogger publish artifact matches index.xml plus critical CSS");
  else fail("dist/blogger-template.publish.xml is stale relative to index.xml/src/css/gg-critical.source.css; run npm run gaga:template:pack");

  const metadata = read("dist/blogger-template.publish.txt");
  assertIncludes(metadata, "inline_css_source=src/css/gg-critical.source.css", "template metadata records critical CSS source");
  assertIncludes(metadata, "external_css_href=/__gg/assets/css/gg-app.min.css", "template metadata records production external CSS href");
  for (const group of APP_ASSET_GROUPS) {
    assertIncludes(metadata, `asset_source=${group.source}`, `template metadata records ${group.source}`);
    assertIncludes(metadata, `asset_outputs=${group.outputs.join(",")}`, `template metadata records outputs for ${group.source}`);
  }
}

function assertStoreDiscoveryFresh(manifest, buildReport) {
  const source = read("src/store/store-discovery.js");
  const output = read("assets/store/store-discovery.js");
  if (!source || !output) return;

  if (source.includes("var STORE_CATEGORY_CONFIG = {};") && !output.includes("var STORE_CATEGORY_CONFIG = {};")) {
    pass("Store discovery asset replaces placeholder category config");
  } else {
    fail("assets/store/store-discovery.js must contain generated Store category config");
  }

  const categories = Array.isArray(manifest.categories) ? manifest.categories : [];
  for (const category of categories) {
    if (output.includes(`"${category.key}"`) && output.includes(`"labelKey"`)) {
      pass(`Store discovery asset includes category ${category.key}`);
    } else {
      fail(`assets/store/store-discovery.js missing category config for ${category.key}`);
    }
  }

  const firstProduct = Array.isArray(manifest.items) ? manifest.items[0] : null;
  if (firstProduct?.slug && output.includes(`slug: ${JSON.stringify(firstProduct.slug)}`)) {
    pass("Store discovery LCP seed matches first manifest product slug");
  } else {
    fail("assets/store/store-discovery.js LCP seed does not match first manifest product slug");
  }
  if (firstProduct?.name && output.includes(`name: ${JSON.stringify(firstProduct.name)}`)) {
    pass("Store discovery LCP seed matches first manifest product name");
  } else {
    fail("assets/store/store-discovery.js LCP seed does not match first manifest product name");
  }

  const assetArtifacts = Array.isArray(buildReport?.artifactContract?.assetArtifacts)
    ? buildReport.artifactContract.assetArtifacts
    : [];
  for (const artifact of ["assets/store/store.css", "assets/store/store-core.js", "assets/store/store-discovery.js", "assets/store/store.js"]) {
    if (assetArtifacts.includes(artifact)) pass(`Store artifact contract lists ${artifact}`);
    else fail(`Store artifact contract missing ${artifact}`);
  }
}

function assertStoreArtifacts(buildReport) {
  const contract = buildReport?.artifactContract || {};
  if (contract.rootArtifact === "store.html") pass("Store artifact contract owns store.html");
  else fail("Store artifact contract rootArtifact must be store.html");

  if (contract.manifestArtifact === "store/data/manifest.json") pass("Store artifact contract owns manifest path");
  else fail("Store artifact contract manifestArtifact must be store/data/manifest.json");

  if (contract.buildReportArtifact === "store/data/build-report.json") pass("Store artifact contract owns build report path");
  else fail("Store artifact contract buildReportArtifact must be store/data/build-report.json");

  const artifactPaths = [
    contract.rootArtifact,
    contract.manifestArtifact,
    contract.buildReportArtifact,
    ...(Array.isArray(contract.assetArtifacts) ? contract.assetArtifacts : []),
    ...(Array.isArray(contract.canonicalNestedArtifacts) ? contract.canonicalNestedArtifacts : []),
    ...(contract.flatTransitionalRequired && Array.isArray(contract.flatTransitionalArtifacts)
      ? contract.flatTransitionalArtifacts
      : []),
  ].filter(Boolean);

  for (const artifact of artifactPaths) assertFile(artifact, `Store artifact ${artifact}`);

  if (existsFile("dist/store/data/manifest.json")) {
    assertSameText(read("store/data/manifest.json"), "dist/store/data/manifest.json", "dist Store manifest");
  } else {
    warn("dist/store/data/manifest.json is absent; store:build will regenerate it when needed");
  }
  if (existsFile("dist/store/data/build-report.json")) {
    assertSameText(read("store/data/build-report.json"), "dist/store/data/build-report.json", "dist Store build report");
  } else {
    warn("dist/store/data/build-report.json is absent; store:build will regenerate it when needed");
  }
}

function assertCloudflareStagingParity() {
  const buildRoot = ".cloudflare-build";
  if (!existsSync(path.resolve(ROOT, buildRoot))) {
    warn(".cloudflare-build is absent; npm run ci:cloudflare/node tools/cloudflare-prepare.mjs verifies deployment staging");
    return;
  }

  const pairs = [
    ["worker.js", ".cloudflare-build/worker.js", "Cloudflare Worker staging"],
    ["store.html", ".cloudflare-build/public/store.html", "Cloudflare Store root staging"],
    ["landing.html", ".cloudflare-build/public/landing.html", "Cloudflare landing staging"],
    ["flags.json", ".cloudflare-build/public/__gg/flags.json", "Cloudflare flags staging"],
    ["__gg/assets/css/gg-app.min.css", ".cloudflare-build/public/__gg/assets/css/gg-app.min.css", "Cloudflare Blogger CSS staging"],
    ["__gg/assets/js/gg-app.dev.js", ".cloudflare-build/public/__gg/assets/js/gg-app.dev.js", "Cloudflare Blogger JS staging"],
    ["assets/store/store.css", ".cloudflare-build/public/assets/store/store.css", "Cloudflare Store CSS staging"],
    ["assets/store/store-core.js", ".cloudflare-build/public/assets/store/store-core.js", "Cloudflare Store JS staging"],
    ["assets/store/store-discovery.js", ".cloudflare-build/public/assets/store/store-discovery.js", "Cloudflare Store discovery staging"],
    ["store/data/manifest.json", ".cloudflare-build/public/store/data/manifest.json", "Cloudflare Store manifest staging"],
    ["store/data/build-report.json", ".cloudflare-build/public/store/data/build-report.json", "Cloudflare Store report staging"],
  ];

  for (const [source, output, label] of pairs) assertSameHash(source, output, label);
  assertSameHash(".cloudflare-build/public/__gg/flags.json", ".cloudflare-build/public/gg-flags.json", "Cloudflare flags alias");
  assertSameHash(".cloudflare-build/public/__gg/flags.json", ".cloudflare-build/public/flags.json", "Cloudflare flags root alias");
}

function assertDocsAndWiring() {
  const packageJson = parseJson("package.json");
  const scripts = packageJson.scripts || {};
  const qaCommands = read("QA-COMMANDS.md");
  const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
  const assetDoc = read("ASSET-ARCHITECTURE.md");

  if (scripts["gaga:verify-asset-architecture"] === "node qa/asset-architecture-guard.mjs") {
    pass("package script gaga:verify-asset-architecture is wired");
  } else {
    fail("package.json missing gaga:verify-asset-architecture script");
  }
  if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-asset-architecture")) {
    pass("ci:qa includes asset architecture guard");
  } else {
    fail("ci:qa must include npm run gaga:verify-asset-architecture");
  }
  if (qaCommands.includes("npm run gaga:verify-asset-architecture")) {
    pass("QA-COMMANDS documents asset architecture guard");
  } else {
    fail("QA-COMMANDS.md must document npm run gaga:verify-asset-architecture");
  }
  if (sourceOfTruth.includes("qa/asset-architecture-guard.mjs")) {
    pass("SOURCE-OF-TRUTH documents asset architecture guard");
  } else {
    fail("SOURCE-OF-TRUTH.md must document qa/asset-architecture-guard.mjs");
  }

  for (const marker of [
    "source files",
    "generated files",
    "template-pack",
    "store-build",
    "cloudflare-prepare",
    "critical css",
    "external css",
    "route asset map",
    "production",
  ]) {
    if (assetDoc.toLowerCase().includes(marker)) pass(`ASSET-ARCHITECTURE documents ${marker}`);
    else fail(`ASSET-ARCHITECTURE.md missing marker: ${marker}`);
  }
}

const indexXml = read("index.xml");
const criticalCss = read("src/css/gg-critical.source.css");
const storeHtml = read("store.html");
const manifest = parseJson("store/data/manifest.json");
const buildReport = parseJson("store/data/build-report.json");

assertFile("src/css/gg-critical.source.css", "critical CSS source");
assertFile("src/store/store.critical.css", "Store critical CSS source");

for (const group of APP_ASSET_GROUPS) {
  for (const output of group.outputs) assertSameHash(group.source, output, `app asset parity for ${group.source}`);
}

assertIncludes(indexXml, "/__gg/assets/css/gg-app.min.css", "index.xml links external production Blogger CSS");
assertIncludes(indexXml, "/__gg/assets/js/gg-app.dev.js", "index.xml links Blogger app JS asset");
assertIncludes(storeHtml, 'href="/assets/store/store.css"', "store.html links external Store CSS");
assertIncludes(storeHtml, 'src="/assets/store/store-core.js"', "store.html links Store core JS asset");
assertIncludes(storeHtml, 'data-store-discovery-src="/assets/store/store-discovery.js"', "store.html links Store discovery JS asset");

for (const [source, output, label] of STORE_ASSET_PAIRS) {
  assertSameText(normalizeTextFile(read(source)), output, label);
}

assertStoreDiscoveryFresh(manifest, buildReport);
assertStoreArtifacts(buildReport);
assertBloggerPublishParity(indexXml, criticalCss);
assertCloudflareStagingParity();
assertDocsAndWiring();

if (indexXml.includes("data:schemaPosts")) {
  fail("index.xml must not reintroduce data:schemaPosts in Blog1 root schema");
} else {
  pass("Blog1 root schema avoids data:schemaPosts");
}
if (/id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/i.test(indexXml)) {
  fail("index.xml root schema must not build filtered data:posts ItemList until proven Blogger-safe");
} else {
  pass("Blog1 root schema avoids filtered data:posts ItemList");
}

if (failures.length) {
  console.error("ASSET ARCHITECTURE GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  console.log("ASSET ARCHITECTURE GUARD PASS_WITH_WARNINGS");
} else {
  console.log("ASSET ARCHITECTURE GUARD PASS");
}
