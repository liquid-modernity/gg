import fs from "fs";
import path from "path";
import zlib from "zlib";

const root = process.cwd();
const budgetsPath = path.join(root, "tools", "perf-budgets.json");

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function extractReleaseId(xml) {
  const m = xml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css)/);
  return m ? m[1] : null;
}

if (!fs.existsSync(budgetsPath)) {
  console.error("ERROR: tools/perf-budgets.json missing");
  process.exit(1);
}

const budgets = JSON.parse(fs.readFileSync(budgetsPath, "utf8"));
const assets = Array.isArray(budgets.assets) ? budgets.assets : [];
if (!assets.length) {
  console.error("ERROR: tools/perf-budgets.json has no assets");
  process.exit(1);
}

const indexXml = readFile("index.prod.xml");
const releaseId = extractReleaseId(indexXml);
if (!releaseId) {
  console.error("ERROR: unable to extract release id from index.prod.xml");
  process.exit(1);
}

function resolvePath(p) {
  return p.replace(/<REL>|<RELEASE_ID>/g, releaseId);
}

function formatNum(n) {
  return typeof n === "number" ? String(n) : "-";
}

const results = [];
let failure = null;

for (const asset of assets) {
  const id = asset.id || asset.path || "(unknown)";
  const relPath = asset.path ? resolvePath(asset.path) : null;
  if (!relPath) {
    const msg = `${id} missing path`;
    results.push({ id, ok: false, raw: "-", gzip: "-", budgetRaw: "-", budgetGzip: "-", note: msg });
    failure = failure || msg;
    continue;
  }

  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) {
    const msg = `${id} missing file ${relPath}`;
    results.push({ id, ok: false, raw: "-", gzip: "-", budgetRaw: asset.max_raw, budgetGzip: asset.max_gzip, note: msg });
    failure = failure || msg;
    continue;
  }

  const buf = fs.readFileSync(abs);
  const raw = buf.length;
  const gzip = zlib.gzipSync(buf).length;

  let ok = true;
  let note = "ok";

  if (typeof asset.max_raw !== "number") {
    ok = false;
    note = `${id} missing max_raw budget`;
    failure = failure || note;
  } else if (raw > asset.max_raw) {
    ok = false;
    note = `${id} raw ${raw} > budget ${asset.max_raw}`;
    failure = failure || `Budget regression: ${id} exceeded raw budget (${raw} > ${asset.max_raw})`;
  }

  if (ok && typeof asset.max_gzip === "number" && gzip > asset.max_gzip) {
    ok = false;
    note = `${id} gzip ${gzip} > budget ${asset.max_gzip}`;
    failure = failure || `Budget regression: ${id} exceeded gzip budget (${gzip} > ${asset.max_gzip})`;
  }

  results.push({
    id,
    ok,
    raw,
    gzip,
    budgetRaw: asset.max_raw,
    budgetGzip: asset.max_gzip,
    note,
  });
}

console.log(`VERIFY_BUDGETS: RELEASE_ID=${releaseId}`);

const headers = ["asset", "raw", "gzip", "budget_raw", "budget_gzip", "OK"];
const rows = results.map((r) => [
  r.id,
  formatNum(r.raw),
  formatNum(r.gzip),
  formatNum(r.budgetRaw),
  formatNum(r.budgetGzip),
  r.ok ? "OK" : "FAIL",
]);

const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const pad = (s, w) => s + " ".repeat(Math.max(0, w - s.length));

console.log(headers.map((h, i) => pad(h, widths[i])).join(" | "));
console.log(widths.map((w) => "-".repeat(w)).join("-|-"));
rows.forEach((r) => {
  console.log(r.map((c, i) => pad(c, widths[i])).join(" | "));
});

if (failure) {
  console.error(failure.startsWith("Budget regression:") ? failure : `Budget regression: ${failure}`);
  process.exit(1);
}

console.log("VERIFY_BUDGETS: PASS");
