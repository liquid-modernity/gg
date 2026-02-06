import fs from "fs";
import path from "path";

const root = process.cwd();
const budgetPath = path.join(root, "tools", "critical-inline-budget.json");

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function extractHead(xml) {
  const m = xml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : null;
}

function sumStyleBlocks(head, limitIdx) {
  const segment = head.slice(0, limitIdx);
  let total = 0;
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(segment))) {
    total += Buffer.byteLength(m[1] || "", "utf8");
  }
  return total;
}

function sumSkinCdata(xml) {
  let total = 0;
  const re = /<b:skin><!\[CDATA\[([\s\S]*?)\]\]><\/b:skin>/gi;
  let m;
  while ((m = re.exec(xml))) {
    total += Buffer.byteLength(m[1] || "", "utf8");
  }
  return total;
}

function computeTotals(xml, label) {
  const head = extractHead(xml);
  if (!head) {
    throw new Error(`${label}: <head> not found`);
  }
  const idx = head.search(/main\.css/);
  const limitIdx = idx === -1 ? head.length : idx;
  const styleBytes = sumStyleBlocks(head, limitIdx);
  const skinBytes = sumSkinCdata(xml);
  return { styleBytes, skinBytes, total: styleBytes + skinBytes };
}

if (!fs.existsSync(budgetPath)) {
  console.error("ERROR: tools/critical-inline-budget.json missing");
  process.exit(1);
}

const budget = JSON.parse(fs.readFileSync(budgetPath, "utf8"));
const prodMax = budget.max_bytes_prod;
const devMax = budget.max_bytes_dev;

if (typeof prodMax !== "number" || typeof devMax !== "number") {
  console.error("ERROR: invalid max_bytes_prod/max_bytes_dev in tools/critical-inline-budget.json");
  process.exit(1);
}

const prodXml = readFile("index.prod.xml");
const devXml = readFile("index.dev.xml");
if (!prodXml || !devXml) {
  console.error("ERROR: index.prod.xml or index.dev.xml missing");
  process.exit(1);
}

let prod;
let dev;
try {
  prod = computeTotals(prodXml, "prod");
  dev = computeTotals(devXml, "dev");
} catch (e) {
  console.error(`ERROR: ${e.message || e}`);
  process.exit(1);
}

const rows = [
  { name: "prod", total: prod.total, budget: prodMax, style: prod.styleBytes, skin: prod.skinBytes },
  { name: "dev", total: dev.total, budget: devMax, style: dev.styleBytes, skin: dev.skinBytes },
];

console.log("VERIFY_INLINE_CSS");
rows.forEach((r) => {
  console.log(`${r.name}: inline_bytes=${r.total} (style=${r.style}, skin=${r.skin}) budget=${r.budget}`);
});

const fail = rows.find((r) => r.total > r.budget);
if (fail) {
  console.error(`ERROR: inline CSS budget exceeded for ${fail.name}: ${fail.total} > ${fail.budget}`);
  process.exit(1);
}

console.log("VERIFY_INLINE_CSS: PASS");
