#!/usr/bin/env node

/* tools/cloudflare-prepare.mjs — GG Cloudflare bundle preparer v10.2
 *
 * Purpose:
 * - Build a deterministic .cloudflare-build directory for Wrangler.
 * - Stage worker.js as the Worker entrypoint.
 * - Stage PWA/static assets under .cloudflare-build/public.
 * - Normalize flags aliases for /__gg/flags.json, /gg-flags.json, and /flags.json.
 *
 * This script does not deploy. It only prepares the bundle.
 */

import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  STORE_ARTIFACT_CONTRACT_VERSION,
  STORE_REQUIRE_FLAT_TRANSITIONAL,
} from "../src/store/store.config.mjs";

const ROOT = process.cwd();
const buildRoot = path.resolve(ROOT, ".cloudflare-build");
const publicRoot = path.join(buildRoot, "public");

const requiredRootFiles = [
  "worker.js",
  "_headers",
  "manifest.webmanifest",
  "offline.html",
  "store.html",
  "sw.js",
  "flags.json",
];

const optionalRootFiles = [
  "ads.txt",
  "landing.html",
  "llms.txt",
  "robots.txt",
  "store.html",
  "yellowcart.html",
];

const registryFiles = [
  "gg-copy-en.json",
  "gg-copy-id.json",
  "gg-copy-manifest.json",
  "gg-copy-meta.json",
];

const optionalDirs = [
  "assets",
  "__gg/assets",
  "gg-pwa-icon",
  "store",
];

function rel(file) {
  return path.relative(ROOT, file) || ".";
}

function fail(message) {
  throw new Error(`cloudflare-prepare: ${message}`);
}

function ensureFile(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);

  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    fail(`missing required file: ${relativePath}`);
  }

  return absolutePath;
}

function optionalFile(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);

  if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
    return absolutePath;
  }

  return null;
}

function optionalDir(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    return absolutePath;
  }

  return null;
}

function readJsonFile(relativePath) {
  const absolutePath = ensureFile(relativePath);
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
  }
}

function validateFlags(flags) {
  const allowedModes = new Set(["development", "staging", "production"]);

  if (!flags || typeof flags !== "object") {
    fail("flags.json must contain a JSON object");
  }

  if (!allowedModes.has(flags.mode)) {
    fail(`flags.json mode must be development, staging, or production; found ${JSON.stringify(flags.mode)}`);
  }

  if (!flags.sw || typeof flags.sw !== "object") {
    fail("flags.json is missing sw object");
  }

  if (!flags.edge || typeof flags.edge !== "object") {
    fail("flags.json is missing edge object");
  }

  if (!flags.robots || typeof flags.robots !== "object") {
    fail("flags.json is missing robots object");
  }

  if (flags.mode === "production" && flags.sw.devAggressiveUpdate) {
    fail("flags.json sw.devAggressiveUpdate must be false in production mode");
  }

  return flags;
}

function copyIfPresent(relativePath, destinationDir) {
  const source = optionalFile(relativePath);
  if (!source) return false;

  copyFileSync(source, path.join(destinationDir, path.basename(relativePath)));
  return true;
}

function copyDirectoryIfPresent(relativePath, destinationDir) {
  const source = optionalDir(relativePath);
  if (!source) return false;

  cpSync(source, destinationDir, { recursive: true });
  return true;
}

function normalizeArtifactPath(relativePath) {
  const normalized = String(relativePath || "").trim().replace(/^\/+/, "").replace(/\\/g, "/");

  if (!normalized || normalized.startsWith("../") || normalized.includes("/../")) {
    fail(`invalid Store artifact path: ${JSON.stringify(relativePath)}`);
  }

  return normalized;
}

function copyRelativeFile(relativePath, destinationDir) {
  const normalized = normalizeArtifactPath(relativePath);
  const source = ensureFile(normalized);
  const destination = path.join(destinationDir, normalized);

  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  return normalized;
}

function extractStoreBuildReport() {
  const storeSource = readFileSync(ensureFile("store.html"), "utf8");
  const match = storeSource.match(/<script\b(?=[^>]*\bid=["']store-build-report["'])[^>]*>([\s\S]*?)<\/script>/i);

  if (!match) fail("store.html missing script#store-build-report");

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(`store.html script#store-build-report is not valid JSON: ${error.message}`);
  }
}

function storeArtifactContractPaths(report) {
  const contract = report?.artifactContract;
  if (!contract || typeof contract !== "object") {
    fail("store build report missing artifactContract; run npm run store:build");
  }
  if (String(contract.version || "") !== STORE_ARTIFACT_CONTRACT_VERSION) {
    fail(`store artifactContract version is ${contract.version || "missing"}, expected ${STORE_ARTIFACT_CONTRACT_VERSION}`);
  }
  if (Boolean(contract.flatTransitionalRequired) !== STORE_REQUIRE_FLAT_TRANSITIONAL) {
    fail(`store artifactContract flatTransitionalRequired is ${Boolean(contract.flatTransitionalRequired)}, expected ${STORE_REQUIRE_FLAT_TRANSITIONAL}; run npm run store:build`);
  }

  const paths = new Set([
    contract.rootArtifact || "store.html",
    contract.manifestArtifact || "store/data/manifest.json",
    ...(Array.isArray(contract.assetArtifacts) ? contract.assetArtifacts : []),
    ...(Array.isArray(contract.canonicalNestedArtifacts) ? contract.canonicalNestedArtifacts : []),
  ]);

  if (STORE_REQUIRE_FLAT_TRANSITIONAL) {
    for (const entry of Array.isArray(contract.flatTransitionalArtifacts) ? contract.flatTransitionalArtifacts : []) {
      paths.add(entry);
    }
  }

  return Array.from(paths).map((entry) => normalizeArtifactPath(entry)).sort();
}

function copyStoreArtifactsFromContract(destinationDir) {
  const report = extractStoreBuildReport();
  const copied = [];

  for (const relativePath of storeArtifactContractPaths(report)) {
    copied.push(copyRelativeFile(relativePath, destinationDir));
  }

  return copied;
}

for (const file of requiredRootFiles) {
  ensureFile(file);
}

const flags = validateFlags(readJsonFile("flags.json"));

rmSync(buildRoot, { recursive: true, force: true });
mkdirSync(publicRoot, { recursive: true });
mkdirSync(path.join(publicRoot, "__gg"), { recursive: true });

copyFileSync(ensureFile("worker.js"), path.join(buildRoot, "worker.js"));

for (const file of ["_headers", "manifest.webmanifest", "offline.html", "sw.js"]) {
  copyFileSync(ensureFile(file), path.join(publicRoot, path.basename(file)));
}

for (const file of optionalRootFiles) {
  copyIfPresent(file, publicRoot);
}

const flagsPayload = `${JSON.stringify(flags, null, 2)}\n`;
const flagOutputs = [
  path.join(publicRoot, "__gg", "flags.json"),
  path.join(publicRoot, "gg-flags.json"),
  path.join(publicRoot, "flags.json"),
];

for (const output of flagOutputs) {
  writeFileSync(output, flagsPayload, "utf8");
}

const canonicalFlagsBytes = readFileSync(flagOutputs[0]);
for (const output of flagOutputs.slice(1)) {
  if (!canonicalFlagsBytes.equals(readFileSync(output))) {
    fail(`generated flags aliases are not byte-identical: ${rel(flagOutputs[0])} vs ${rel(output)}`);
  }
}

const registryRoot = path.join(publicRoot, "registry");
mkdirSync(registryRoot, { recursive: true });
for (const file of registryFiles) {
  const source = optionalFile(file);
  if (source) {
    copyFileSync(source, path.join(registryRoot, path.basename(file)));
  }
}

for (const dir of optionalDirs) {
  const destination = path.join(publicRoot, dir);
  copyDirectoryIfPresent(dir, destination);
}

copyStoreArtifactsFromContract(publicRoot);

const manifest = readJsonFile("manifest.webmanifest");
if (manifest.scope !== "/") {
  fail(`manifest.webmanifest scope must be "/"; found ${JSON.stringify(manifest.scope)}`);
}

console.log("CLOUDFLARE PREPARE OK");
console.log(`mode=${flags.mode}`);
console.log(`worker=${rel(path.join(buildRoot, "worker.js"))}`);
console.log(`assets_dir=${rel(publicRoot)}`);
console.log(`flags=${rel(path.join(publicRoot, "__gg", "flags.json"))}`);
console.log("aliases=/gg-flags.json,/flags.json");
console.log("scope=cloudflare-worker-assets-bundle");
