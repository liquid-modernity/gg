#!/usr/bin/env node
/* tools/release.js — single source of truth for release id */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}

function replaceAllOrThrow(file, pattern, replacement, label) {
  const src = fs.readFileSync(file, "utf8");
  pattern.lastIndex = 0;
  if (!pattern.test(src)) {
    throw new Error(`Pattern not found for ${label} in ${file}`);
  }
  pattern.lastIndex = 0;
  const out = src.replace(pattern, replacement);
  if (out !== src) fs.writeFileSync(file, out, "utf8");
}

const envRel = process.env.RELEASE_ID ? String(process.env.RELEASE_ID).trim() : "";
const releaseId = envRel || run("git rev-parse --short HEAD");
const fullHash = run("git rev-parse HEAD");

const destDir = path.join("public", "assets", "v", releaseId);
fs.mkdirSync(destDir, { recursive: true });
const latestDir = path.join("public", "assets", "latest");
const latestCss = path.join(latestDir, "main.css");
const latestJs = path.join(latestDir, "main.js");
if (!fs.existsSync(latestCss) || !fs.existsSync(latestJs)) {
  throw new Error("Latest assets missing: public/assets/latest/main.(css|js)");
}
fs.copyFileSync(latestCss, path.join(destDir, "main.css"));
fs.copyFileSync(latestJs, path.join(destDir, "main.js"));

replaceAllOrThrow(
  "public/sw.js",
  /const VERSION = \"[^\"]+\";/,
  `const VERSION = \"${releaseId}\";`,
  "sw version"
);

replaceAllOrThrow(
  "src/worker.js",
  /const WORKER_VERSION = \"[^\"]+\";/,
  `const WORKER_VERSION = \"${releaseId}\";`,
  "worker version"
);

replaceAllOrThrow(
  "index.prod.xml",
  /\/assets\/v\/[^/]+\/main\.css/g,
  `/assets/v/${releaseId}/main.css`,
  "prod css"
);

replaceAllOrThrow(
  "index.prod.xml",
  /\/assets\/v\/[^/]+\/main\.js/g,
  `/assets/v/${releaseId}/main.js`,
  "prod js"
);

console.log(`RELEASE_ID ${releaseId}`);
console.log(`FULL_HASH ${fullHash}`);
