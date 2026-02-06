import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const failMessage = "Release not aligned to HEAD. Run: npm ci && npm run build && commit artifacts.";

function fail() {
  console.error(failMessage);
  process.exit(1);
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
  fail();
}
if (!head) fail();

const indexXml = read("index.prod.xml");
const swJs = read("public/sw.js");
const workerJs = read("src/worker.js");
const capsule = read("docs/ledger/GG_CAPSULE.md");

if (!indexXml || !swJs || !workerJs || !capsule) fail();

const relFromIndexMatch = indexXml.match(/\/assets\/v\/([^/]+)\//);
const relFromIndex = relFromIndexMatch ? relFromIndexMatch[1] : null;
if (relFromIndex !== head) fail();
const indexNeeds = [`/assets/v/${head}/main.css`, `/assets/v/${head}/boot.js`];
if (indexNeeds.some((token) => !indexXml.includes(token))) fail();

const swVersion = extractVersion(swJs, /const\s+VERSION\s*=\s*"([^"]+)"/);
if (swVersion !== head) fail();

const workerVersion = extractVersion(workerJs, /const\s+WORKER_VERSION\s*=\s*"([^"]+)"/);
if (workerVersion !== head) fail();

const capsuleBlockMatch = capsule.match(/<!-- GG:AUTOGEN:BEGIN -->[\s\S]*?<!-- GG:AUTOGEN:END -->/);
if (!capsuleBlockMatch) fail();
const capsuleRel = extractVersion(capsuleBlockMatch[0], /RELEASE_ID:\s*([A-Za-z0-9._-]+)/);
if (capsuleRel !== head) fail();

const relDir = path.join(root, "public", "assets", "v", head);
if (!fs.existsSync(relDir)) fail();

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
for (const rel of expectedFiles) {
  if (!fs.existsSync(path.join(relDir, rel))) {
    fail();
  }
}

console.log("VERIFY_RELEASE_ALIGNED: PASS");
