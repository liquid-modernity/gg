#!/usr/bin/env node

/* tools/template-pack.mjs — GG Blogger template packer v10.3
 *
 * Purpose:
 * - Copy index.xml into dist/blogger-template.publish.xml.
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

if (!existsSync(sourceFile) || !statSync(sourceFile).isFile()) {
  fail(`missing template source: ${rel(sourceFile)}`);
}

const sourceText = readFileSync(sourceFile, "utf8");

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
copyFileSync(sourceFile, artifactFile);

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
    `source_sha256=${sourceSha256}`,
    `artifact_sha256=${artifactSha256}`,
    `artifact_size_bytes=${artifactBuffer.byteLength}`,
    ...syncedAssets.flatMap((entry) => [
      `asset_source=${entry.source}`,
      `asset_sha256=${entry.hash}`,
      `asset_outputs=${entry.copied.join(",")}`,
    ]),
    "publish_scope=manual_blogger_publish_only",
    "workflow_note=This script builds the Blogger XML artifact and synchronizes app assets. Cloudflare is handled separately.",
  ].join("\n") + "\n",
  "utf8"
);

console.log("TEMPLATE PACK OK");
console.log(`source=${rel(sourceFile)}`);
console.log(`artifact=${rel(artifactFile)}`);
console.log(`metadata=${rel(metaFile)}`);
for (const entry of syncedAssets) {
  console.log(`asset_source=${entry.source}`);
  console.log(`asset_outputs=${entry.copied.join(",")}`);
  console.log(`asset_sha256=${entry.hash}`);
}
console.log(`artifact_sha256=${artifactSha256}`);
console.log(`artifact_size_bytes=${artifactBuffer.byteLength}`);
