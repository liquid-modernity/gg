import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const root = process.cwd();
const AUTOGEN_BEGIN = "<!-- GG:AUTOGEN:BEGIN -->";
const AUTOGEN_END = "<!-- GG:AUTOGEN:END -->";
const AUTOGEN_BLOCK =
  `${AUTOGEN_BEGIN}\n` +
  `RELEASE_ID: __REL__\n` +
  `PROD_PINNED_JS: /assets/v/__REL__/main.js\n` +
  `PROD_PINNED_APP: /assets/v/__REL__/app.js\n` +
  `PROD_PINNED_CSS: /assets/v/__REL__/main.css\n` +
  `${AUTOGEN_END}`;

function toRelPath(p) {
  return path.relative(root, p).replace(/\\/g, "/");
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Missing dir: ${dir}`);
  }
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function normalizeIndex(xml) {
  let out = xml.replace(/\/assets\/v\/[^/]+\//g, "/assets/v/__REL__/");
  out = out.replace(
    /(<meta[^>]+name=['"]gg-release['"][^>]*content=)(['"])[^'"]*\2/gi,
    "$1$2__REL__$2"
  );
  out = out.replace(
    /(<div(?=[^>]*id=['"]gg-fingerprint['"])[^>]*data-release=)(['"])[^'"]*\2/gi,
    "$1$2__REL__$2"
  );
  return out;
}

function normalizeSw(sw) {
  return sw.replace(/const\s+VERSION\s*=\s*"[^"]+"/, 'const VERSION="__REL__"');
}

function normalizeWorker(worker) {
  return worker.replace(/const\s+WORKER_VERSION\s*=\s*"[^"]+"/, 'const WORKER_VERSION="__REL__"');
}

function normalizeCapsule(md) {
  if (md.includes(AUTOGEN_BEGIN) && md.includes(AUTOGEN_END)) {
    const re = new RegExp(`${AUTOGEN_BEGIN}[\\s\\S]*?${AUTOGEN_END}`, "m");
    return md.replace(re, AUTOGEN_BLOCK);
  }
  if (md.includes("LIVE CONTRACT (must hold):")) {
    return md.replace("LIVE CONTRACT (must hold):", `${AUTOGEN_BLOCK}\n\nLIVE CONTRACT (must hold):`);
  }
  return `${md.trim()}\n\n${AUTOGEN_BLOCK}\n`;
}

function readText(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing file: ${rel}`);
  }
  return fs.readFileSync(p, "utf8");
}

export function computeReleaseId() {
  const inputs = new Map();

  const latestDir = path.join(root, "public", "assets", "latest");
  const latestFiles = listFiles(latestDir);
  for (const file of latestFiles) {
    const rel = toRelPath(file);
    inputs.set(rel, fs.readFileSync(file, "utf8"));
  }

  inputs.set("index.prod.xml", normalizeIndex(readText("index.prod.xml")));
  inputs.set("public/sw.js", normalizeSw(readText("public/sw.js")));
  inputs.set("src/worker.js", normalizeWorker(readText("src/worker.js")));
  inputs.set("docs/ledger/GG_CAPSULE.md", normalizeCapsule(readText("docs/ledger/GG_CAPSULE.md")));

  const hash = crypto.createHash("sha256");
  const keys = Array.from(inputs.keys()).sort();
  for (const key of keys) {
    const content = inputs.get(key);
    hash.update(key);
    hash.update("\0");
    hash.update(content);
  }
  return hash.digest("hex").slice(0, 7);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    console.log(computeReleaseId());
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  }
}
