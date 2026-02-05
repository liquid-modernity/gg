import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

const prodXml = path.join(root, "index.prod.xml");
if (!fs.existsSync(prodXml)) {
  failures.push("index.prod.xml missing");
}

let releaseId = null;
if (fs.existsSync(prodXml)) {
  const xml = fs.readFileSync(prodXml, "utf8");
  const jsMatch = xml.match(/\/assets\/v\/([^/]+)\/main\.js/);
  const cssMatch = xml.match(/\/assets\/v\/([^/]+)\/main\.css/);
  if (!jsMatch) failures.push("index.prod.xml missing /assets/v/<RELEASE_ID>/main.js");
  if (!cssMatch) failures.push("index.prod.xml missing /assets/v/<RELEASE_ID>/main.css");
  if (jsMatch && cssMatch && jsMatch[1] !== cssMatch[1]) {
    failures.push(`index.prod.xml release id mismatch: js=${jsMatch[1]} css=${cssMatch[1]}`);
  }
  if (jsMatch) releaseId = jsMatch[1];
}

function ensureFile(p, label) {
  if (!fs.existsSync(p)) {
    failures.push(`${label} missing: ${p}`);
    return;
  }
  const st = fs.lstatSync(p);
  if (st.isSymbolicLink()) {
    failures.push(`${label} must not be symlink: ${p}`);
  }
}

const latestDir = path.join(root, "public", "assets", "latest");
ensureFile(path.join(latestDir, "main.js"), "latest main.js");
ensureFile(path.join(latestDir, "main.css"), "latest main.css");

if (releaseId) {
  const vDir = path.join(root, "public", "assets", "v", releaseId);
  ensureFile(path.join(vDir, "main.js"), `v/${releaseId} main.js`);
  ensureFile(path.join(vDir, "main.css"), `v/${releaseId} main.css`);
} else {
  failures.push("release id not detected from index.prod.xml");
}

if (failures.length) {
  console.error("VERIFY_ASSETS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_ASSETS: PASS");
if (releaseId) console.log(`RELEASE_ID=${releaseId}`);
