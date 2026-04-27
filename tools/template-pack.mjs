#!/usr/bin/env node

/* tools/template-pack.mjs — GG Blogger template packer v10.2
 *
 * Purpose:
 * - Copy index.xml into dist/blogger-template.publish.xml.
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

function fail(message) {
  throw new Error(`template-pack: ${message}`);
}

function rel(file) {
  return path.relative(ROOT, file) || ".";
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
copyFileSync(sourceFile, artifactFile);

const artifactBuffer = readFileSync(artifactFile);
const artifactSha256 = createHash("sha256").update(artifactBuffer).digest("hex");
const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
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
    "publish_scope=manual_blogger_publish_only",
    "workflow_note=This script builds the Blogger XML artifact only. Cloudflare is handled separately.",
  ].join("\n") + "\n",
  "utf8"
);

console.log("TEMPLATE PACK OK");
console.log(`source=${rel(sourceFile)}`);
console.log(`artifact=${rel(artifactFile)}`);
console.log(`metadata=${rel(metaFile)}`);
console.log(`artifact_sha256=${artifactSha256}`);
console.log(`artifact_size_bytes=${artifactBuffer.byteLength}`);
