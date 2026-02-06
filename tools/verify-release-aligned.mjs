import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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

const indexXml = read("index.prod.xml");
const swJs = read("public/sw.js");
const workerJs = read("src/worker.js");
const capsule = read("docs/ledger/GG_CAPSULE.md");

if (!indexXml) addError("Missing file: index.prod.xml");
if (!swJs) addError("Missing file: public/sw.js");
if (!workerJs) addError("Missing file: src/worker.js");
if (!capsule) addError("Missing file: docs/ledger/GG_CAPSULE.md");

const relFromIndexMatch = indexXml && indexXml.match(/\/assets\/v\/([^/]+)\//);
const relFromIndex = relFromIndexMatch ? relFromIndexMatch[1] : null;
note(`index.prod.xml release: ${relFromIndex || "MISSING"}`);
if (relFromIndex !== head) {
  addError(`Mismatch: index.prod.xml release=${relFromIndex || "MISSING"} expected=${head}`);
}
const indexNeeds = [`/assets/v/${head}/main.css`, `/assets/v/${head}/boot.js`];
if (indexXml && indexNeeds.some((token) => !indexXml.includes(token))) {
  addError("index.prod.xml missing pinned main.css/boot.js for HEAD");
}

const swVersion = extractVersion(swJs || "", /const\s+VERSION\s*=\s*"([^"]+)"/);
note(`sw.js VERSION: ${swVersion || "MISSING"}`);
if (swVersion !== head) {
  addError(`Mismatch: sw.js VERSION=${swVersion || "MISSING"} expected=${head}`);
}

const workerVersion = extractVersion(workerJs || "", /const\s+WORKER_VERSION\s*=\s*"([^"]+)"/);
note(`worker.js WORKER_VERSION: ${workerVersion || "MISSING"}`);
if (workerVersion !== head) {
  addError(`Mismatch: worker.js WORKER_VERSION=${workerVersion || "MISSING"} expected=${head}`);
}

const capsuleBlockMatch = capsule && capsule.match(/<!-- GG:AUTOGEN:BEGIN -->[\s\S]*?<!-- GG:AUTOGEN:END -->/);
if (!capsuleBlockMatch) {
  addError("Missing GG_CAPSULE AUTOGEN block");
}
const capsuleRel = capsuleBlockMatch
  ? extractVersion(capsuleBlockMatch[0], /RELEASE_ID:\s*([A-Za-z0-9._-]+)/)
  : null;
note(`GG_CAPSULE RELEASE_ID: ${capsuleRel || "MISSING"}`);
if (capsuleRel !== head) {
  addError(`Mismatch: GG_CAPSULE RELEASE_ID=${capsuleRel || "MISSING"} expected=${head}`);
}

const relDir = path.join(root, "public", "assets", "v", head);
const relDirExists = fs.existsSync(relDir);
note(`assets dir exists: ${relDirExists ? "yes" : "no"} (${relDir})`);
if (!relDirExists) {
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
