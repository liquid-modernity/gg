#!/usr/bin/env node
/* tools/release.js — single source of truth for release id */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}

function ensureCleanTree() {
  const allowDirty = String(process.env.ALLOW_DIRTY_RELEASE || "").trim() === "1";
  if (allowDirty) return;
  const status = run("git status --porcelain");
  if (status) {
    throw new Error(
      "Release requires clean tree. Commit first. Set ALLOW_DIRTY_RELEASE=1 only for emergency."
    );
  }
}

function filesEqual(a, b) {
  const bufA = fs.readFileSync(a);
  const bufB = fs.readFileSync(b);
  if (bufA.length !== bufB.length) return false;
  return bufA.equals(bufB);
}

function diffExistingRelease({ destDir, latestDir, latestModulesDir }) {
  if (!fs.existsSync(destDir)) return [];
  const diffs = [];
  const baseFiles = ["main.css", "main.js", "app.js", "core.js", "boot.js"];
  baseFiles.forEach((name) => {
    const latestPath = path.join(latestDir, name);
    const destPath = path.join(destDir, name);
    if (!fs.existsSync(destPath)) {
      diffs.push(`${name} missing in ${destDir}`);
      return;
    }
    if (!filesEqual(latestPath, destPath)) {
      diffs.push(`${name} differs from latest`);
    }
  });

  const latestModules = fs.readdirSync(latestModulesDir).filter((f) => f.endsWith(".js")).sort();
  const destModulesDir = path.join(destDir, "modules");
  if (!fs.existsSync(destModulesDir)) {
    diffs.push("modules/ missing in release");
    return diffs;
  }
  const destModules = fs.readdirSync(destModulesDir).filter((f) => f.endsWith(".js")).sort();
  if (JSON.stringify(latestModules) !== JSON.stringify(destModules)) {
    diffs.push("modules/ file list differs from latest");
    return diffs;
  }
  latestModules.forEach((name) => {
    const latestPath = path.join(latestModulesDir, name);
    const destPath = path.join(destModulesDir, name);
    if (!filesEqual(latestPath, destPath)) {
      diffs.push(`modules/${name} differs from latest`);
    }
  });
  return diffs;
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

function readCapsuleReleaseId() {
  const capsulePath = path.join("docs", "ledger", "GG_CAPSULE.md");
  if (!fs.existsSync(capsulePath)) return "";
  const src = fs.readFileSync(capsulePath, "utf8");
  const match = src.match(/RELEASE_ID:\s*([0-9a-f]+)/i);
  return match ? match[1] : "";
}

function pruneAssetReleases({ releaseId, prevReleaseId, keepReleases }) {
  const vRoot = path.join("public", "assets", "v");
  if (!fs.existsSync(vRoot)) return;
  let keepCount = Number.isFinite(keepReleases) ? keepReleases : 2;
  if (keepCount < 1) keepCount = 1;
  // Keep list history isn't available yet; only support current + previous for now.
  if (keepCount > 2) {
    keepCount = 2;
    console.warn("KEEP_RELEASES>2 not supported yet; keeping current + previous only.");
  }
  const keep = new Set([releaseId]);
  if (keepCount > 1 && prevReleaseId && prevReleaseId !== releaseId) {
    keep.add(prevReleaseId);
  }
  const entries = fs.readdirSync(vRoot, { withFileTypes: true });
  entries.forEach((entry) => {
    if (!entry.isDirectory()) return;
    const name = entry.name;
    if (!name || name.startsWith(".")) return;
    if (keep.has(name)) return;
    fs.rmSync(path.join(vRoot, name), { recursive: true, force: true });
  });
}

ensureCleanTree();

const KEEP_RELEASES = Number(process.env.KEEP_RELEASES || "2");
const envRel = process.env.RELEASE_ID ? String(process.env.RELEASE_ID).trim() : "";
const releaseId = envRel || run("node tools/compute-release-id.mjs");
const fullHash = run("git rev-parse HEAD");
const prevReleaseId = readCapsuleReleaseId();

const destDir = path.join("public", "assets", "v", releaseId);
const latestDir = path.join("public", "assets", "latest");
const latestCss = path.join(latestDir, "main.css");
const latestJs = path.join(latestDir, "main.js");
const latestApp = path.join(latestDir, "app.js");
const latestCore = path.join(latestDir, "core.js");
const latestModulesDir = path.join(latestDir, "modules");
const latestBoot = path.join(latestDir, "boot.js");
if (!fs.existsSync(latestCss) || !fs.existsSync(latestJs) || !fs.existsSync(latestApp) || !fs.existsSync(latestCore)) {
  throw new Error("Latest assets missing: public/assets/latest/(main.css|main.js|app.js|core.js)");
}
if (!fs.existsSync(latestBoot)) {
  throw new Error("Latest assets missing: public/assets/latest/boot.js");
}
if (!fs.existsSync(latestModulesDir)) {
  throw new Error("Latest assets missing: public/assets/latest/modules");
}

const destExists = fs.existsSync(destDir);
let skipCopy = false;
if (destExists) {
  const diffs = diffExistingRelease({ destDir, latestDir, latestModulesDir });
  if (diffs.length) {
    throw new Error(
      `Release ${releaseId} already exists with different contents. Refusing to overwrite. ` +
        diffs[0]
    );
  }
  skipCopy = true;
}

if (!skipCopy) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(latestCss, path.join(destDir, "main.css"));
  fs.copyFileSync(latestJs, path.join(destDir, "main.js"));
  fs.copyFileSync(latestApp, path.join(destDir, "app.js"));
  fs.copyFileSync(latestCore, path.join(destDir, "core.js"));
  fs.copyFileSync(latestBoot, path.join(destDir, "boot.js"));
  const destModules = path.join(destDir, "modules");
  fs.mkdirSync(destModules, { recursive: true });
  const moduleFiles = fs.readdirSync(latestModulesDir).filter((f) => f.endsWith(".js"));
  if (!moduleFiles.length) {
    throw new Error("Latest assets missing: public/assets/latest/modules/*.js");
  }
  moduleFiles.forEach((f) => {
    fs.copyFileSync(path.join(latestModulesDir, f), path.join(destModules, f));
  });
}

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

replaceAllOrThrow(
  "index.prod.xml",
  /(<meta[^>]+name=['"]gg-release['"][^>]*content=)(['"])[^'"]*\2/gi,
  `$1$2${releaseId}$2`,
  "prod gg-release meta"
);

replaceAllOrThrow(
  "index.prod.xml",
  /(<div(?=[^>]*id=['"]gg-fingerprint['"])[^>]*data-release=)(['"])[^'"]*\2/gi,
  `$1$2${releaseId}$2`,
  "prod gg-fingerprint data-release"
);

updateCapsuleAutogen(releaseId);
pruneAssetReleases({ releaseId, prevReleaseId, keepReleases: KEEP_RELEASES });

console.log(`RELEASE_ID ${releaseId}`);
console.log(`FULL_HASH ${fullHash}`);
