#!/usr/bin/env node

/* tools/preflight.mjs — GG release preflight v10.2
 *
 * Purpose:
 * - Validate that the repository is ready for the Edge Governance Worker.
 * - Reject stale Worker contracts such as PUBLIC_STATIC_ROUTES.
 * - Validate source syntax, flags, manifest, static asset presence, and Blogger XML markers.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();

const requiredFiles = [
  "_headers",
  "flags.json",
  "index.xml",
  "manifest.webmanifest",
  "offline.html",
  "sw.js",
  "worker.js",
  "wrangler.jsonc",
];

const recommendedFiles = [
  "ads.txt",
  "landing.html",
  "llms.txt",
  "robots.txt",
];

const recommendedDirs = [
  "gg-pwa-icon",
];

function fail(message) {
  console.error(`preflight: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`preflight warning: ${message}`);
}

function ok(message) {
  console.log(message);
}

function fileExists(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  return existsSync(absolutePath) && statSync(absolutePath).isFile();
}

function dirExists(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  return existsSync(absolutePath) && statSync(absolutePath).isDirectory();
}

function read(relativePath) {
  return readFileSync(path.resolve(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
  }
}

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    fail(label || `missing expected source marker: ${needle}`);
  }
}

function assertAnyIncludes(source, needles, label) {
  if (!needles.some((needle) => source.includes(needle))) {
    fail(label || `missing one of expected markers: ${needles.join(", ")}`);
  }
}

function syntaxCheckModule(relativePath, label) {
  const source = read(relativePath);
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "gg-syntax-check-"));
  const tempFile = path.join(tempDir, `${label}.mjs`);

  writeFileSync(tempFile, source, "utf8");

  const result = spawnSync(process.execPath, ["--check", tempFile], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  rmSync(tempDir, { recursive: true, force: true });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    fail(`${relativePath} failed syntax validation`);
  }
}

for (const file of requiredFiles) {
  if (!fileExists(file)) fail(`missing required file: ${file}`);
}

for (const file of recommendedFiles) {
  if (!fileExists(file)) warn(`recommended file is missing: ${file}`);
}

for (const dir of recommendedDirs) {
  if (!dirExists(dir)) warn(`recommended directory is missing: ${dir}`);
}

syntaxCheckModule("worker.js", "worker-syntax-check");

for (const script of [
  "tools/cloudflare-prepare.mjs",
  "tools/cloudflare-deploy.mjs",
  "tools/gaga-release.mjs",
  "tools/template-pack.mjs",
]) {
  if (fileExists(script)) syntaxCheckModule(script, path.basename(script, ".mjs"));
}

const flags = readJson("flags.json");
const allowedModes = new Set(["development", "staging", "production"]);
if (!allowedModes.has(flags.mode)) {
  fail(`flags.json mode must be development, staging, or production; found ${JSON.stringify(flags.mode)}`);
}

if (flags.mode === "production") {
  warn("flags.json mode is production. Confirm dummy content has been removed before deploy.");
}

for (const key of ["edge", "robots", "sw", "limits"]) {
  if (!flags[key] || typeof flags[key] !== "object") {
    fail(`flags.json is missing required object: ${key}`);
  }
}

const manifest = readJson("manifest.webmanifest");
if (manifest.scope !== "/") fail('manifest.webmanifest must use scope "/"');
if (!manifest.start_url) fail("manifest.webmanifest is missing start_url");
if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  warn("manifest.webmanifest should define at least 192 and 512 icons");
}

const workerSource = read("worker.js");
const requiredWorkerMarkers = [
  "edge-governance-v10",
  "STATIC_ROUTE_ASSET_MAP",
  "FLAGS_CANONICAL_PATH",
  '"/gg-flags.json"',
  '"/flags.json"',
  '"/__gg/health"',
  '"/__gg/routes"',
  '"/__gg/robots"',
  '"/__gg/headers"',
  '"/__gg/pwa"',
  "legacyViewRedirect",
  "isLegacyViewPath",
  "withResponsePolicy",
  "Service-Worker-Allowed",
  "X-GG-Worker",
  "X-GG-Edge-Mode",
  "X-GG-Route-Class",
  "X-GG-Template-Contract",
];

for (const marker of requiredWorkerMarkers) {
  assertIncludes(workerSource, marker, `worker.js is missing v10 governance marker: ${marker}`);
}

if (workerSource.includes("PUBLIC_STATIC_ROUTES")) {
  fail("worker.js still contains stale PUBLIC_STATIC_ROUTES contract");
}

assertAnyIncludes(workerSource, ["developmentRobotsTag", "noindex, nofollow, nosnippet"], "worker.js is missing development crawler lockdown policy");
assertAnyIncludes(workerSource, ["Google-Extended", "GPTBot", "OAI-SearchBot"], "worker.js is missing AI/search crawler robots policy");

const swSource = read("sw.js");
assertIncludes(swSource, "/offline.html", "sw.js is missing offline fallback URL");
assertAnyIncludes(swSource, ["/gg-flags.json", "/flags.json", "FLAGS_URL"], "sw.js is missing flags URL contract");

const offlineSource = read("offline.html");
assertAnyIncludes(offlineSource, ["data-gg-surface=\"offline\"", "data-gg-surface='offline'"], "offline.html is missing data-gg-surface=offline");
assertAnyIncludes(offlineSource, ["noindex", "robots"], "offline.html should carry noindex robots metadata");

const templateSource = read("index.xml");
if (!templateSource.includes("<html") || !templateSource.includes("<b:skin")) {
  fail("index.xml does not look like the Blogger template source");
}

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

const wranglerSource = read("wrangler.jsonc");
assertAnyIncludes(wranglerSource, [".cloudflare-build/worker.js", "main"], "wrangler.jsonc should point to the prepared Worker entry");
assertAnyIncludes(wranglerSource, [".cloudflare-build/public", "assets"], "wrangler.jsonc should include static assets directory/binding");

ok("PREFLIGHT OK");
ok(`mode=${flags.mode}`);
ok("worker_contract=edge-governance-v10");
ok("legacy_view_redirect=/view* -> /");
ok("crawler_policy=development-lockdown-unless-production");
ok("scope=release-and-cloudflare-preflight");
