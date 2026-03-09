import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { computeReleaseId } from "./compute-release-id.mjs";

const root = process.cwd();
const details = [];
const errors = [];

function note(line) {
  details.push(line);
}

function addError(line) {
  errors.push(line);
}

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

function extractVersion(source, regex) {
  const match = source && source.match(regex);
  return match ? match[1] : null;
}

function extractPinnedAsset(source, filePattern) {
  const re = new RegExp(`/assets/v/([^/]+)/${filePattern}\\?v=([A-Za-z0-9._-]+)`, "i");
  const match = source && source.match(re);
  if (!match) return null;
  return { release: match[1], version: match[2] };
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

let head = "";
try {
  head = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch (_) {
  console.error("Release not aligned to HEAD (details above).");
  process.exit(1);
}
if (!head) {
  console.error("Release not aligned to HEAD (details above).");
  process.exit(1);
}
note(`HEAD: ${head}`);

let expectedRel = "";
try {
  expectedRel = computeReleaseId();
} catch (err) {
  addError(err && err.message ? err.message : "computeReleaseId failed");
}
note(`expected release id: ${expectedRel || "MISSING"}`);

const indexXml = read("index.prod.xml");
const swJs = read("public/sw.js");
const workerJs = read("src/worker.js");
const headersTxt = read("public/_headers");

if (!indexXml) addError("Missing file: index.prod.xml");
if (!swJs) addError("Missing file: public/sw.js");
if (!workerJs) addError("Missing file: src/worker.js");
if (!headersTxt) addError("Missing file: public/_headers");

const indexAssetReleases = indexXml
  ? uniq(Array.from(indexXml.matchAll(/\/assets\/v\/([^/]+)\//g), (m) => m[1]))
  : [];
const relFromIndex = indexAssetReleases[0] || null;
note(`index.prod.xml asset releases: ${indexAssetReleases.join(",") || "MISSING"}`);
if (expectedRel && indexAssetReleases.length !== 1) {
  addError(`index.prod.xml must use exactly one /assets/v/<release>/ token (found ${indexAssetReleases.length})`);
}
if (expectedRel && relFromIndex !== expectedRel) {
  addError(`Mismatch: index.prod.xml release=${relFromIndex || "MISSING"} expected=${expectedRel}`);
}
const relMeta = extractVersion(indexXml || "", /<meta(?=[^>]*name=['"]gg-release['"])[^>]*content=['"]([^'"]+)['"]/i);
const relFp = extractVersion(indexXml || "", /<div(?=[^>]*id=['"]gg-fingerprint['"])[^>]*data-release=['"]([^'"]+)['"]/i);
note(`index.prod.xml meta gg-release: ${relMeta || "MISSING"}`);
note(`index.prod.xml #gg-fingerprint data-release: ${relFp || "MISSING"}`);
if (expectedRel && relMeta !== expectedRel) {
  addError(`Mismatch: index.prod.xml gg-release meta=${relMeta || "MISSING"} expected=${expectedRel}`);
}
if (expectedRel && relFp !== expectedRel) {
  addError(`Mismatch: index.prod.xml gg-fingerprint=${relFp || "MISSING"} expected=${expectedRel}`);
}

const assetVerMarker = extractVersion(indexXml || "", /GG_ASSET_VER:\s*([A-Za-z0-9._-]+)/i);
const cssPinned = extractPinnedAsset(indexXml || "", "main\\.css");
const bootPinned = extractPinnedAsset(indexXml || "", "boot\\.js");
note(`index.prod.xml GG_ASSET_VER: ${assetVerMarker || "MISSING"}`);
note(`index.prod.xml main.css pinned: ${cssPinned ? `${cssPinned.release}@${cssPinned.version}` : "MISSING"}`);
note(`index.prod.xml boot.js pinned: ${bootPinned ? `${bootPinned.release}@${bootPinned.version}` : "MISSING"}`);

if (!cssPinned) {
  addError("index.prod.xml missing /assets/v/<release>/main.css?v=<asset_version>");
}
if (!bootPinned) {
  addError("index.prod.xml missing /assets/v/<release>/boot.js?v=<asset_version>");
}
if (cssPinned && bootPinned) {
  if (cssPinned.release !== bootPinned.release) {
    addError(
      `Mismatch: pinned asset release differs (main.css=${cssPinned.release} boot.js=${bootPinned.release})`
    );
  }
  if (cssPinned.version !== bootPinned.version) {
    addError(
      `Mismatch: pinned asset version differs (main.css=${cssPinned.version} boot.js=${bootPinned.version})`
    );
  }
}
if (expectedRel && cssPinned && cssPinned.release !== expectedRel) {
  addError(`Mismatch: main.css release=${cssPinned.release} expected=${expectedRel}`);
}
if (expectedRel && bootPinned && bootPinned.release !== expectedRel) {
  addError(`Mismatch: boot.js release=${bootPinned.release} expected=${expectedRel}`);
}
if (assetVerMarker && cssPinned && cssPinned.version !== assetVerMarker) {
  addError(
    `Mismatch: GG_ASSET_VER=${assetVerMarker} but main.css?v=${cssPinned.version}`
  );
}
if (assetVerMarker && bootPinned && bootPinned.version !== assetVerMarker) {
  addError(
    `Mismatch: GG_ASSET_VER=${assetVerMarker} but boot.js?v=${bootPinned.version}`
  );
}

const swVersion = extractVersion(swJs || "", /const\s+VERSION\s*=\s*"([^"]+)"/);
note(`sw.js VERSION: ${swVersion || "MISSING"}`);
if (expectedRel && swVersion !== expectedRel) {
  addError(`Mismatch: sw.js VERSION=${swVersion || "MISSING"} expected=${expectedRel}`);
}

const workerVersion = extractVersion(workerJs || "", /const\s+WORKER_VERSION\s*=\s*"([^"]+)"/);
note(`worker.js WORKER_VERSION: ${workerVersion || "MISSING"}`);
if (expectedRel && workerVersion !== expectedRel) {
  addError(`Mismatch: worker.js WORKER_VERSION=${workerVersion || "MISSING"} expected=${expectedRel}`);
}

const hasWorkerVersionStamp = /h\.set\("X-GG-Worker-Version",\s*WORKER_VERSION\)/.test(workerJs || "");
if (!hasWorkerVersionStamp) {
  addError("worker.js stamp must set X-GG-Worker-Version from WORKER_VERSION");
}
const hasAssetsStamp = /h\.set\("X-GG-Assets",\s*WORKER_VERSION\)/.test(workerJs || "");
if (!hasAssetsStamp) {
  addError("worker.js stamp must set X-GG-Assets from WORKER_VERSION");
}
const hasLegacyRescue = /X-GG-Asset-Rescue|rescuePath/.test(workerJs || "");
if (hasLegacyRescue) {
  addError("worker.js still contains legacy /assets/v/* missing fallback to /assets/latest/*");
}

const workerAllowRaw = extractVersion(workerJs || "", /const\s+TEMPLATE_ALLOWED_RELEASES\s*=\s*(\[[^\]]*\])/);
let workerAllow = [];
if (workerAllowRaw) {
  try {
    workerAllow = JSON.parse(workerAllowRaw);
  } catch (_) {
    addError(`worker.js TEMPLATE_ALLOWED_RELEASES is not valid JSON array: ${workerAllowRaw}`);
  }
}
note(`worker.js TEMPLATE_ALLOWED_RELEASES: ${JSON.stringify(workerAllow)}`);
if (!workerAllow.length) {
  addError("worker.js TEMPLATE_ALLOWED_RELEASES missing/empty");
} else {
  if (workerAllow.length !== 1) {
    addError(`worker.js TEMPLATE_ALLOWED_RELEASES must contain one active release (found ${workerAllow.length})`);
  }
  if (expectedRel && workerAllow[0] !== expectedRel) {
    addError(`worker.js TEMPLATE_ALLOWED_RELEASES[0]=${workerAllow[0]} expected=${expectedRel}`);
  }
}

const headerAssetTokens = headersTxt
  ? uniq(Array.from(headersTxt.matchAll(/^\s*X-GG-Assets:\s*([A-Za-z0-9._-]+)\s*$/gim), (m) => m[1]))
  : [];
note(`public/_headers X-GG-Assets tokens: ${headerAssetTokens.join(",") || "MISSING"}`);
if (!headerAssetTokens.length) {
  addError("public/_headers missing X-GG-Assets");
} else {
  if (headerAssetTokens.length !== 1) {
    addError(`public/_headers must expose one X-GG-Assets token (found ${headerAssetTokens.length})`);
  }
  if (expectedRel && headerAssetTokens[0] !== expectedRel) {
    addError(`Mismatch: public/_headers X-GG-Assets=${headerAssetTokens[0]} expected=${expectedRel}`);
  }
}

const relDir = expectedRel ? path.join(root, "public", "assets", "v", expectedRel) : "";
const relDirExists = expectedRel ? fs.existsSync(relDir) : false;
note(`assets dir exists: ${relDirExists ? "yes" : "no"} (${relDir || "MISSING"})`);
if (expectedRel && !relDirExists) {
  addError(`Missing dir: ${relDir}`);
}

const expectedFiles = [
  "main.css",
  "boot.js",
  "main.js",
  "app.js",
  "core.js",
  "modules/pwa.js",
  "modules/ui.js",
  "modules/ui.bucket.core.js",
  "modules/ui.bucket.listing.js",
  "modules/ui.bucket.post.js",
  "modules/ui.bucket.poster.js",
  "modules/ui.bucket.search.js",
];
const missingFiles = [];
if (relDirExists) {
  for (const rel of expectedFiles) {
    if (!fs.existsSync(path.join(relDir, rel))) {
      missingFiles.push(rel);
    }
  }
}
if (missingFiles.length) {
  addError(`Missing files in ${relDir}: ${missingFiles.join(", ")}`);
}

if (errors.length) {
  details.forEach((line) => console.error(line));
  errors.forEach((line) => console.error(line));
  console.error("Release not aligned to HEAD (details above).");
  process.exit(1);
}

console.log("VERIFY_RELEASE_ALIGNED: PASS");
