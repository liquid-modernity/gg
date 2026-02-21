import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const reportDir = path.join(root, ".lighthouseci");
const outPath = path.join(reportDir, "trend.json");
const budgetsPath = path.join(root, "docs/perf/BUDGETS.json");
const urlsPath = path.join(root, "docs/perf/URLS.json");

function readJson(absPath, label) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`missing ${label}: ${absPath}`);
  }
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

function walkReports(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkReports(abs, out);
      return;
    }
    if (entry.isFile() && /\.report\.json$/i.test(entry.name)) out.push(abs);
  });
  return out;
}

function normalizeUrl(url) {
  try {
    const u = new URL(String(url || "").trim());
    const pathname = u.pathname === "/" ? "/" : u.pathname.replace(/\/+$/, "");
    return `${u.origin}${pathname}`;
  } catch {
    return "";
  }
}

function median(nums) {
  const values = (nums || []).filter((v) => typeof v === "number" && isFinite(v)).sort((a, b) => a - b);
  if (!values.length) return null;
  const mid = Math.floor(values.length / 2);
  if (values.length % 2) return values[mid];
  return (values[mid - 1] + values[mid]) / 2;
}

function round(value, digits = 0) {
  if (typeof value !== "number" || !isFinite(value)) return null;
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

function format(value, digits = 0) {
  if (value == null || typeof value !== "number" || !isFinite(value)) return "n/a";
  return value.toFixed(digits);
}

function getShortSha() {
  const envSha = String(process.env.GITHUB_SHA || "").trim();
  if (envSha) return envSha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function toResult(key, url, rows, ratchet) {
  const performance = round(median(rows.map((r) => r.performance)), 3);
  const lcp = round(median(rows.map((r) => r.lcp_ms)), 0);
  const cls = round(median(rows.map((r) => r.cls)), 3);
  const inp = round(median(rows.map((r) => r.inp_ms)), 0);
  const tbt = round(median(rows.map((r) => r.tbt_ms)), 0);
  const transferKb = round(median(rows.map((r) => r.transfer_kb)), 1);

  const reasons = [];
  if (!rows.length) reasons.push("missing LHR report");
  if (lcp == null) reasons.push("LCP missing");
  if (cls == null) reasons.push("CLS missing");
  if (tbt == null) reasons.push("TBT missing");
  if (transferKb == null) reasons.push("transfer bytes missing");

  if (lcp != null && lcp > ratchet.max_lcp_ms) {
    reasons.push(`lcp_ms ${lcp} > ${ratchet.max_lcp_ms}`);
  }
  if (cls != null && cls > ratchet.max_cls) {
    reasons.push(`cls ${cls} > ${ratchet.max_cls}`);
  }
  if (inp != null && inp > ratchet.max_inp_ms) {
    reasons.push(`inp_ms ${inp} > ${ratchet.max_inp_ms}`);
  }
  if (tbt != null && tbt > ratchet.max_tbt_ms) {
    reasons.push(`tbt_ms ${tbt} > ${ratchet.max_tbt_ms}`);
  }
  if (transferKb != null && transferKb > ratchet.max_transfer_kb) {
    reasons.push(`transfer_kb ${transferKb} > ${ratchet.max_transfer_kb}`);
  }

  const finalUrl = rows[0]?.finalUrl || url;
  const inpNote = inp == null ? ["inp_ms n/a (not failing)"] : [];
  const hardFailReasons = reasons.filter((r) => !r.startsWith("missing ") && !r.startsWith("inp_ms n/a"));

  return {
    key,
    finalUrl,
    performance,
    lcp_ms: lcp,
    cls,
    inp_ms: inp,
    tbt_ms: tbt,
    transfer_kb: transferKb,
    ratchet: {
      pass: hardFailReasons.length === 0 && !reasons.some((r) => r.startsWith("missing ")),
      reasons: [...reasons, ...inpNote],
    },
  };
}

const budgets = readJson(budgetsPath, "BUDGETS.json");
const urlsPayload = readJson(urlsPath, "URLS.json");
const ratchet = budgets && budgets.ratchet ? budgets.ratchet : {};
const urls = urlsPayload && urlsPayload.urls ? urlsPayload.urls : {};
const keys = ["home", "listing", "post"];

keys.forEach((key) => {
  if (!urls[key]) {
    throw new Error(`missing URLS.json urls.${key}`);
  }
});

const reportFiles = walkReports(reportDir).sort();
if (!reportFiles.length) {
  throw new Error("no Lighthouse reports found under .lighthouseci");
}

const keyByUrl = new Map(keys.map((k) => [normalizeUrl(urls[k]), k]));
const grouped = new Map(keys.map((k) => [k, []]));

reportFiles.forEach((abs) => {
  const lhr = JSON.parse(fs.readFileSync(abs, "utf8"));
  const audits = lhr.audits || {};
  const finalUrl = String(lhr.finalUrl || lhr.requestedUrl || "").trim();
  const norm = normalizeUrl(finalUrl);
  const key = keyByUrl.get(norm);
  if (!key) return;

  const score = lhr.categories?.performance?.score;
  const row = {
    finalUrl,
    performance: typeof score === "number" ? score : null,
    lcp_ms: audits["largest-contentful-paint"]?.numericValue ?? null,
    cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    inp_ms: audits["interaction-to-next-paint"]?.numericValue ?? null,
    tbt_ms: audits["total-blocking-time"]?.numericValue ?? null,
    transfer_kb:
      typeof audits["total-byte-weight"]?.numericValue === "number"
        ? audits["total-byte-weight"].numericValue / 1024
        : null,
  };
  grouped.get(key).push(row);
});

const results = keys.map((key) => toResult(key, urls[key], grouped.get(key) || [], ratchet));
const payload = {
  v: 1,
  generated_at: new Date().toISOString(),
  commit: getShortSha(),
  urls,
  results,
  ratchet,
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

const tableHeader = [
  "## Lighthouse Trend (Ratchet Delta)",
  "",
  "| Key | URL | Perf | LCP ms | CLS | INP ms | TBT ms | KB | Ratchet | Reasons |",
  "|---|---|---:|---:|---:|---:|---:|---:|---|---|",
];
const tableRows = results.map((r) => {
  const status = r.ratchet.pass ? "PASS" : "FAIL";
  const reasons = (r.ratchet.reasons || []).join("; ") || "-";
  return `| ${r.key} | ${r.finalUrl} | ${format(r.performance, 3)} | ${format(r.lcp_ms, 0)} | ${format(r.cls, 3)} | ${format(r.inp_ms, 0)} | ${format(r.tbt_ms, 0)} | ${format(r.transfer_kb, 1)} | ${status} | ${reasons} |`;
});
const md = `${tableHeader.join("\n")}\n${tableRows.join("\n")}\n`;

process.stdout.write(`${md}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}

console.log(`PASS: lhci trend artifact -> ${path.relative(root, outPath)}`);
