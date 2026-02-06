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
  const bootMatch = xml.match(/\/assets\/v\/([^/]+)\/boot\.js/);
  const cssMatch = xml.match(/\/assets\/v\/([^/]+)\/main\.css/);
  if (!bootMatch) failures.push("index.prod.xml missing /assets/v/<RELEASE_ID>/boot.js");
  if (!cssMatch) failures.push("index.prod.xml missing /assets/v/<RELEASE_ID>/main.css");
  if (bootMatch && cssMatch && bootMatch[1] !== cssMatch[1]) {
    failures.push(`index.prod.xml release id mismatch: boot=${bootMatch[1]} css=${cssMatch[1]}`);
  }
  if (bootMatch) releaseId = bootMatch[1];
  if (!releaseId && cssMatch) releaseId = cssMatch[1];
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
ensureFile(path.join(latestDir, "boot.js"), "latest boot.js");
ensureFile(path.join(latestDir, "core.js"), "latest core.js");
ensureFile(path.join(latestDir, "app.js"), "latest app.js");
const latestModulesDir = path.join(latestDir, "modules");
if (!fs.existsSync(latestModulesDir)) {
  failures.push("latest modules dir missing: public/assets/latest/modules");
}

if (releaseId) {
  const vDir = path.join(root, "public", "assets", "v", releaseId);
  ensureFile(path.join(vDir, "main.js"), `v/${releaseId} main.js`);
  ensureFile(path.join(vDir, "main.css"), `v/${releaseId} main.css`);
  ensureFile(path.join(vDir, "boot.js"), `v/${releaseId} boot.js`);
  ensureFile(path.join(vDir, "core.js"), `v/${releaseId} core.js`);
  ensureFile(path.join(vDir, "app.js"), `v/${releaseId} app.js`);
  const vModulesDir = path.join(vDir, "modules");
  if (!fs.existsSync(vModulesDir)) {
    failures.push(`v/${releaseId} modules dir missing: ${vModulesDir}`);
  } else if (fs.existsSync(latestModulesDir)) {
    const latestModules = fs.readdirSync(latestModulesDir).filter((f) => f.endsWith(".js"));
    if (!latestModules.length) {
      failures.push("latest modules dir has no .js files");
    }
    latestModules.forEach((name) => {
      ensureFile(path.join(vModulesDir, name), `v/${releaseId} module ${name}`);
    });
  }
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
