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

const ROOT = process.cwd();
const buildRoot = path.resolve(ROOT, ".cloudflare-build");
const publicRoot = path.join(buildRoot, "public");

const requiredRootFiles = [
  "worker.js",
  "_headers",
  "manifest.webmanifest",
  "offline.html",
  "sw.js",
  "flags.json",
];

const optionalRootFiles = [
  "ads.txt",
  "landing.html",
  "llms.txt",
  "robots.txt",
];

const registryFiles = [
  "gg-copy-en.json",
  "gg-copy-id.json",
  "gg-copy-manifest.json",
  "gg-copy-meta.json",
];

const optionalDirs = [
  "assets",
  "gg-pwa-icon",
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
writeFileSync(path.join(publicRoot, "__gg", "flags.json"), flagsPayload, "utf8");
writeFileSync(path.join(publicRoot, "gg-flags.json"), flagsPayload, "utf8");
writeFileSync(path.join(publicRoot, "flags.json"), flagsPayload, "utf8");

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
