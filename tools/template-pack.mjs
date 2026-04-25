#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const sourceFile = path.resolve("index.xml");
const outDir = path.resolve("dist");
const artifactFile = path.join(outDir, "blogger-template.publish.xml");
const metaFile = path.join(outDir, "blogger-template.publish.txt");

if (!statSync(sourceFile).isFile()) {
  throw new Error(`missing template source: ${sourceFile}`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(sourceFile, artifactFile);

const artifactBuffer = readFileSync(artifactFile);
const artifactSha256 = createHash("sha256").update(artifactBuffer).digest("hex");
const generatedAtUtc = new Date().toISOString();

writeFileSync(
  metaFile,
  [
    `generated_at_utc=${generatedAtUtc}`,
    `source_file=${path.relative(process.cwd(), sourceFile)}`,
    `artifact_file=${path.relative(process.cwd(), artifactFile)}`,
    `artifact_sha256=${artifactSha256}`,
    `artifact_size_bytes=${artifactBuffer.byteLength}`,
    "publish_scope=manual_blogger_publish_only",
    "workflow_note=GitHub Actions build this artifact but do not publish it.",
  ].join("\n") + "\n",
  "utf8"
);

console.log("TEMPLATE PACK");
console.log(`source=${path.relative(process.cwd(), sourceFile)}`);
console.log(`artifact=${path.relative(process.cwd(), artifactFile)}`);
console.log(`metadata=${path.relative(process.cwd(), metaFile)}`);
console.log(`artifact_sha256=${artifactSha256}`);
console.log(`artifact_size_bytes=${artifactBuffer.byteLength}`);
