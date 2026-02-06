import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function extractFromIndex(xml) {
  const match = xml.match(/\/assets\/v\/([^/]+)\//);
  return match ? match[1] : null;
}

function extractFromSw(sw) {
  const match = sw.match(/const\s+VERSION\s*=\s*"([^"]+)"/);
  return match ? match[1] : null;
}

function extractFromCapsule(md) {
  const begin = "<!-- GG:AUTOGEN:BEGIN -->";
  const end = "<!-- GG:AUTOGEN:END -->";
  const blockMatch = md.match(new RegExp(`${begin}[\\s\\S]*?${end}`));
  if (!blockMatch) return null;
  const relMatch = blockMatch[0].match(/RELEASE_ID:\s*([A-Za-z0-9._-]+)/);
  return relMatch ? relMatch[1] : null;
}

const indexXml = readFile("index.prod.xml");
const swJs = readFile("public/sw.js");
const capsule = readFile("docs/ledger/GG_CAPSULE.md");
const taskLog = readFile("docs/ledger/TASK_LOG.md");

const relIndex = indexXml ? extractFromIndex(indexXml) : null;
const relSw = swJs ? extractFromSw(swJs) : null;
const relCapsule = capsule ? extractFromCapsule(capsule) : null;

if (!relIndex) failures.push("index.prod.xml release id not found");
if (!relSw) failures.push("public/sw.js VERSION not found");
if (!relCapsule) failures.push("GG_CAPSULE AUTOGEN RELEASE_ID not found");

const refs = [relIndex, relSw, relCapsule].filter(Boolean);
const mismatch = refs.some((v) => v !== refs[0]);
if (mismatch) {
  failures.push(`release id mismatch: index=${relIndex || "?"} sw=${relSw || "?"} capsule=${relCapsule || "?"}`);
}

if (taskLog) {
  const lines = taskLog.split(/\r?\n/);
  const policyMarker = "POLICY CHANGE: TASK_LOG no longer records RELEASE_ID";
  let markerIdx = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].includes(policyMarker)) {
      markerIdx = i;
      break;
    }
  }
  if (markerIdx === -1) {
    failures.push("TASK_LOG policy marker missing: add entry 'POLICY CHANGE: TASK_LOG no longer records RELEASE_ID'");
  } else {
    const recent = lines.slice(markerIdx + 1);
    const hasReleaseId = recent.some((line) => /RELEASE_ID\s*:/.test(line));
    if (hasReleaseId) {
      failures.push("TASK_LOG must not contain RELEASE_ID. Use RELEASE_REF: GG_CAPSULE AUTOGEN.");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_LEDGER: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  console.error("Run: npm run build && commit updated GG_CAPSULE + index.prod.xml + sw.js + worker.js + assets/v/<id>");
  process.exit(1);
}

console.log("VERIFY_LEDGER: PASS");
console.log(`RELEASE_ID=${relCapsule}`);
