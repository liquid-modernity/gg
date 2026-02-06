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

function updateCapsuleAutogen(releaseId) {
  const capsulePath = path.join("docs", "ledger", "GG_CAPSULE.md");
  if (!fs.existsSync(capsulePath)) {
    throw new Error("GG_CAPSULE missing: docs/ledger/GG_CAPSULE.md");
  }
  const begin = "<!-- GG:AUTOGEN:BEGIN -->";
  const end = "<!-- GG:AUTOGEN:END -->";
  const block =
    `${begin}\n` +
    `RELEASE_ID: ${releaseId}\n` +
    `PROD_PINNED_JS: /assets/v/${releaseId}/main.js\n` +
    `PROD_PINNED_APP: /assets/v/${releaseId}/app.js\n` +
    `PROD_PINNED_CSS: /assets/v/${releaseId}/main.css\n` +
    `${end}`;

  const src = fs.readFileSync(capsulePath, "utf8");
  let out = src;
  if (src.includes(begin) && src.includes(end)) {
    const re = new RegExp(`${begin}[\\s\\S]*?${end}`, "m");
    out = src.replace(re, block);
  } else if (src.includes("LIVE CONTRACT (must hold):")) {
    out = src.replace("LIVE CONTRACT (must hold):", `${block}\n\nLIVE CONTRACT (must hold):`);
  } else {
    out = `${src.trim()}\n\n${block}\n`;
  }
  if (out !== src) fs.writeFileSync(capsulePath, out, "utf8");
}

const envRel = process.env.RELEASE_ID ? String(process.env.RELEASE_ID).trim() : "";
const releaseId = envRel || run("git rev-parse --short HEAD");
const fullHash = run("git rev-parse HEAD");

const destDir = path.join("public", "assets", "v", releaseId);
fs.mkdirSync(destDir, { recursive: true });
const latestDir = path.join("public", "assets", "latest");
const latestCss = path.join(latestDir, "main.css");
const latestJs = path.join(latestDir, "main.js");
const latestApp = path.join(latestDir, "app.js");
const latestBoot = path.join(latestDir, "boot.js");
if (!fs.existsSync(latestCss) || !fs.existsSync(latestJs) || !fs.existsSync(latestApp)) {
  throw new Error("Latest assets missing: public/assets/latest/(main.css|main.js|app.js)");
}
if (!fs.existsSync(latestBoot)) {
  throw new Error("Latest assets missing: public/assets/latest/boot.js");
}
fs.copyFileSync(latestCss, path.join(destDir, "main.css"));
fs.copyFileSync(latestJs, path.join(destDir, "main.js"));
fs.copyFileSync(latestApp, path.join(destDir, "app.js"));
fs.copyFileSync(latestBoot, path.join(destDir, "boot.js"));

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
  /\/assets\/v\/[^/]+\/boot\.js/g,
  `/assets/v/${releaseId}/boot.js`,
  "prod boot"
);

updateCapsuleAutogen(releaseId);

console.log(`RELEASE_ID ${releaseId}`);
console.log(`FULL_HASH ${fullHash}`);
