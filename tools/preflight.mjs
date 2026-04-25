#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const requiredFiles = [
  "_headers",
  "ads.txt",
  "flags.json",
  "gg-copy-en.json",
  "gg-copy-id.json",
  "gg-copy-manifest.json",
  "gg-copy-meta.json",
  "index.xml",
  "landing.html",
  "llms.txt",
  "manifest.webmanifest",
  "offline.html",
  "robots.txt",
  "sw.js",
  "worker.js",
  "wrangler.jsonc",
];

const requiredDirs = ["gg-pwa-icon"];

function fail(message) {
  console.error(`preflight: ${message}`);
  process.exit(1);
}

function resolveWorkerVersion(source) {
  const match = source.match(/const\s+WORKER_VERSION\s*=\s*(['"])([^'"]+)\1/);
  return match ? String(match[2] || "").trim() : "";
}

for (const relativePath of requiredFiles) {
  const absolutePath = path.resolve(relativePath);
  if (!existsSync(absolutePath)) {
    fail(`missing required file: ${relativePath}`);
  }
}

for (const relativePath of requiredDirs) {
  const absolutePath = path.resolve(relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) {
    fail(`missing required directory: ${relativePath}`);
  }
}

const workerPath = path.resolve("worker.js");
const workerSource = readFileSync(workerPath, "utf8");
const workerVersion = resolveWorkerVersion(workerSource);

if (!workerVersion) {
  fail("unable to resolve WORKER_VERSION from worker.js");
}

const syntaxCheck = spawnSync(process.execPath, ["--check", "--input-type=module"], {
  input: workerSource,
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});

if (syntaxCheck.status !== 0) {
  if (syntaxCheck.stderr) {
    process.stderr.write(syntaxCheck.stderr);
  }
  fail("worker.js failed syntax validation");
}

if (!workerSource.includes("/__gg_worker_ping")) {
  fail("worker.js is missing the /__gg_worker_ping route");
}

if (!workerSource.includes("/gg-flags.json")) {
  fail("worker.js is missing the /gg-flags.json route");
}

const templatePath = path.resolve("index.xml");
const templateSource = readFileSync(templatePath, "utf8");

if (!templateSource.includes("<html") || !templateSource.includes("<b:skin")) {
  fail("index.xml does not look like the Blogger template source");
}

console.log("PREFLIGHT OK");
console.log(`worker=${path.relative(process.cwd(), workerPath)}`);
console.log(`worker_version=${workerVersion}`);
console.log(`template=${path.relative(process.cwd(), templatePath)}`);
console.log("scope=lightweight validation only");
