#!/usr/bin/env node

/* tools/template-pack.mjs — GG Blogger template packer v10.4
 *
 * Purpose:
 * - Copy index.xml into dist/blogger-template.publish.xml with critical CSS in b:skin.
 * - Synchronize Blogger app source assets into both runtime staging locations:
 *   __gg/assets/* and dist/assets/*.
 * - Write metadata for manual Blogger publishing.
 *
 * This script deliberately does not deploy to Blogger and does not touch Cloudflare.
 */

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const sourceFile = path.resolve(ROOT, "index.xml");
const outDir = path.resolve(ROOT, "dist");
const artifactFile = path.join(outDir, "blogger-template.publish.xml");
const metaFile = path.join(outDir, "blogger-template.publish.txt");
const inlineCssMode =
  process.argv.includes("--full-inline-css") || process.env.GG_TEMPLATE_INLINE_CSS === "full"
    ? "full"
    : "critical";
const externalCssMode = process.env.GG_TEMPLATE_CSS_MODE === "development" ? "development" : "production";
const inlineCssSource =
  inlineCssMode === "full" ? "src/css/gg-app.source.css" : "src/css/gg-critical.source.css";
const externalCssHref =
  externalCssMode === "development" ? "/__gg/assets/css/gg-app.dev.css" : "/__gg/assets/css/gg-app.min.css";

const appAssetCopies = [
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

function fail(message) {
  throw new Error(`template-pack: ${message}`);
}

function rel(file) {
  return path.relative(ROOT, file) || ".";
}

function requireFile(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    fail(`missing required file: ${relativePath}`);
  }
  return absolutePath;
}

function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function copyAssetGroup(group) {
  const sourcePath = requireFile(group.source);
  const sourceBuffer = readFileSync(sourcePath);
  const sourceHash = sha256Buffer(sourceBuffer);
  const copied = [];

  for (const output of group.outputs) {
    const destination = path.resolve(ROOT, output);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(sourcePath, destination);
    const destinationHash = sha256Buffer(readFileSync(destination));
    if (destinationHash !== sourceHash) {
      fail(`asset copy hash mismatch: ${group.source} -> ${output}`);
    }
    copied.push(output);
  }

  return {
    source: group.source,
    hash: sourceHash,
    copied,
  };
}

function replaceBSkin(templateText, cssText) {
  const nextText = templateText.replace(
    /(<b:skin><!\[CDATA\[\n)[\s\S]*?(\n\s*\]\]><\/b:skin>)/,
    (_match, open, close) => `${open}${cssText.replace(/\s+$/u, "")}\n${close.trimStart()}`
  );

  if (nextText === templateText) {
    fail("could not replace b:skin CSS block");
  }

  return nextText;
}

function replaceExternalCssHref(templateText) {
  return templateText.replace(/\/__gg\/assets\/css\/gg-app\.(?:dev|min)\.css/g, externalCssHref);
}

if (!existsSync(sourceFile) || !statSync(sourceFile).isFile()) {
  fail(`missing template source: ${rel(sourceFile)}`);
}

const sourceText = readFileSync(sourceFile, "utf8");
const inlineCssText = readFileSync(requireFile(inlineCssSource), "utf8");

if (!sourceText.includes("<html") || !sourceText.includes("<b:skin")) {
  fail("index.xml does not look like a Blogger XML template");
}

const requiredMarkers = [
  `id='gg-shell'`,
  `id='main'`,
  `id='gg-dock'`,
  `id='gg-command-panel'`,
  `id='gg-preview-sheet'`,
  `id='gg-more-panel'`,
];

for (const marker of requiredMarkers) {
  if (!sourceText.includes(marker)) {
    fail(`index.xml is missing expected marker: ${marker}`);
  }
}

mkdirSync(outDir, { recursive: true });
const syncedAssets = appAssetCopies.map(copyAssetGroup);
const artifactText = replaceExternalCssHref(replaceBSkin(sourceText, inlineCssText));
writeFileSync(artifactFile, artifactText, "utf8");

const artifactBuffer = readFileSync(artifactFile);
const artifactSha256 = sha256Buffer(artifactBuffer);
const sourceSha256 = sha256Buffer(Buffer.from(sourceText, "utf8"));
const generatedAtUtc = new Date().toISOString();

writeFileSync(
  metaFile,
  [
    `generated_at_utc=${generatedAtUtc}`,
    `source_file=${rel(sourceFile)}`,
    `artifact_file=${rel(artifactFile)}`,
    `inline_css_mode=${inlineCssMode}`,
    `inline_css_source=${inlineCssSource}`,
    `external_css_mode=${externalCssMode}`,
    `external_css_href=${externalCssHref}`,
    `source_sha256=${sourceSha256}`,
    `artifact_sha256=${artifactSha256}`,
    `artifact_size_bytes=${artifactBuffer.byteLength}`,
    ...syncedAssets.flatMap((entry) => [
      `asset_source=${entry.source}`,
      `asset_sha256=${entry.hash}`,
      `asset_outputs=${entry.copied.join(",")}`,
    ]),
    "publish_scope=manual_blogger_publish_only",
    "rollback_note=Set GG_TEMPLATE_INLINE_CSS=full or pass --full-inline-css to inline the full app CSS again.",
    "workflow_note=This script builds the Blogger XML artifact and synchronizes app assets. Cloudflare is handled separately.",
  ].join("\n") + "\n",
  "utf8"
);

console.log("TEMPLATE PACK OK");
console.log(`source=${rel(sourceFile)}`);
console.log(`artifact=${rel(artifactFile)}`);
console.log(`metadata=${rel(metaFile)}`);
console.log(`inline_css_mode=${inlineCssMode}`);
console.log(`inline_css_source=${inlineCssSource}`);
console.log(`external_css_href=${externalCssHref}`);
for (const entry of syncedAssets) {
  console.log(`asset_source=${entry.source}`);
  console.log(`asset_outputs=${entry.copied.join(",")}`);
  console.log(`asset_sha256=${entry.hash}`);
}
console.log(`artifact_sha256=${artifactSha256}`);
console.log(`artifact_size_bytes=${artifactBuffer.byteLength}`);
