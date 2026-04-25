#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
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

function ok(message) {
  console.log(message);
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

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";

// ...

const syntaxTempDir = mkdtempSync(path.join(os.tmpdir(), "gg-worker-check-"));
const syntaxTempFile = path.join(syntaxTempDir, "worker-syntax-check.mjs");

writeFileSync(syntaxTempFile, workerSource, "utf8");

const syntaxCheck = spawnSync(process.execPath, ["--check", syntaxTempFile], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

rmSync(syntaxTempDir, { recursive: true, force: true });

if (syntaxCheck.status !== 0) {
  if (syntaxCheck.stderr) {
    process.stderr.write(syntaxCheck.stderr);
  }
  fail("worker.js failed syntax validation");
}

/**
 * New worker contract checks
 * We no longer require:
 * - WORKER_VERSION constant
 * - /__gg_worker_ping
 * - /gg-flags.json
 *
 * We now require:
 * - landing public/internal route handling
 * - static route set / asset serving path
 * - HTML contract annotation
 * - current template contract checks
 */

if (!workerSource.includes("LANDING_PUBLIC_PATH")) {
  fail("worker.js is missing LANDING_PUBLIC_PATH");
}

if (!workerSource.includes('"/landing"')) {
  fail('worker.js is missing the public /landing route contract');
}

if (!workerSource.includes("LANDING_INTERNAL_PATH")) {
  fail("worker.js is missing LANDING_INTERNAL_PATH");
}

if (!workerSource.includes('"/landing.html"')) {
  fail('worker.js is missing the internal /landing.html asset contract');
}

if (!workerSource.includes("PUBLIC_STATIC_ROUTES")) {
  fail("worker.js is missing PUBLIC_STATIC_ROUTES");
}

if (!workerSource.includes("/manifest.webmanifest")) {
  fail("worker.js is missing manifest route coverage");
}

if (!workerSource.includes("/offline.html")) {
  fail("worker.js is missing offline route coverage");
}

if (!workerSource.includes("/sw.js")) {
  fail("worker.js is missing sw.js route coverage");
}

if (!workerSource.includes("/flags.json")) {
  fail("worker.js is missing /flags.json route coverage");
}

if (!workerSource.includes("hasCurrentTemplateContract")) {
  fail("worker.js is missing current template contract validation");
}

if (!workerSource.includes("x-gg-template-contract")) {
  fail("worker.js is missing x-gg-template-contract header annotation");
}

const templatePath = path.resolve("index.xml");
const templateSource = readFileSync(templatePath, "utf8");

if (!templateSource.includes("<html") || !templateSource.includes("<b:skin")) {
  fail("index.xml does not look like the Blogger template source");
}

// Current template freeze markers
const templateMarkers = [
  `id='gg-shell'`,
  `id='main'`,
  `id='gg-dock'`,
  `id='gg-command-panel'`,
  `id='gg-preview-sheet'`,
  `id='gg-more-panel'`,
];

for (const marker of templateMarkers) {
  if (!templateSource.includes(marker)) {
    fail(`index.xml is missing expected template marker: ${marker}`);
  }
}

ok("PREFLIGHT OK");
ok(`worker=${path.relative(process.cwd(), workerPath)}`);
ok(`template=${path.relative(process.cwd(), templatePath)}`);
ok("worker_contract=current-template-freeze");
ok("scope=lightweight validation only");