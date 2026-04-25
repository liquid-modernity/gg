#!/usr/bin/env node

import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const buildRoot = path.resolve(".cloudflare-build");
const publicRoot = path.join(buildRoot, "public");

const staticFiles = [
  "_headers",
  "ads.txt",
  "landing.html",
  "llms.txt",
  "manifest.webmanifest",
  "offline.html",
  "robots.txt",
  "sw.js",
];

const registryFiles = [
  "gg-copy-en.json",
  "gg-copy-id.json",
  "gg-copy-manifest.json",
  "gg-copy-meta.json",
];

function ensureFile(relativePath) {
  const absolutePath = path.resolve(relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    throw new Error(`missing required file: ${relativePath}`);
  }
  return absolutePath;
}

function ensureDir(relativePath) {
  const absolutePath = path.resolve(relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) {
    throw new Error(`missing required directory: ${relativePath}`);
  }
  return absolutePath;
}

rmSync(buildRoot, { recursive: true, force: true });
mkdirSync(publicRoot, { recursive: true });

copyFileSync(ensureFile("worker.js"), path.join(buildRoot, "worker.js"));

for (const file of staticFiles) {
  copyFileSync(ensureFile(file), path.join(publicRoot, path.basename(file)));
}

mkdirSync(path.join(publicRoot, "__gg"), { recursive: true });
copyFileSync(ensureFile("flags.json"), path.join(publicRoot, "__gg", "flags.json"));

mkdirSync(path.join(publicRoot, "registry"), { recursive: true });
for (const file of registryFiles) {
  copyFileSync(ensureFile(file), path.join(publicRoot, "registry", path.basename(file)));
}

cpSync(ensureDir("gg-pwa-icon"), path.join(publicRoot, "gg-pwa-icon"), { recursive: true });

if (existsSync(path.resolve("assets")) && statSync(path.resolve("assets")).isDirectory()) {
  cpSync(path.resolve("assets"), path.join(publicRoot, "assets"), { recursive: true });
}

console.log("CLOUDFLARE PREPARE");
console.log(`worker=${path.relative(process.cwd(), path.join(buildRoot, "worker.js"))}`);
console.log(`assets_dir=${path.relative(process.cwd(), publicRoot)}`);
console.log("scope=cloudflare worker/assets bundle only");
