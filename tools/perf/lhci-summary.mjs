import fs from "fs";
import path from "path";

const root = process.cwd();
const reportDir = path.join(root, ".lighthouseci");

function walkReports(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkReports(abs, out);
      return;
    }
    if (entry.isFile() && /\.report\.json$/i.test(entry.name)) {
      out.push(abs);
    }
  });
  return out;
}

function n(v, digits = 0) {
  if (typeof v !== "number" || !isFinite(v)) return "n/a";
  return Number(v).toFixed(digits);
}

function esc(v) {
  return String(v || "").replace(/\|/g, "\\|").trim();
}

const reports = walkReports(reportDir).sort();
if (!reports.length) {
  const msg = "LHCI Summary: no .report.json files found in .lighthouseci";
  console.log(msg);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${msg}\n`);
  }
  process.exit(0);
}

const header = [
  "## Lighthouse CI (Live)",
  "",
  "| URL | Perf Score | LCP (ms) | CLS | INP (ms) | TBT (ms) | Transfer (KB) |",
  "|---|---:|---:|---:|---:|---:|---:|",
];
const lines = [];

reports.forEach((abs) => {
  const raw = fs.readFileSync(abs, "utf8");
  const lhr = JSON.parse(raw);
  const audits = lhr.audits || {};
  const perfScoreRaw =
    lhr.categories && lhr.categories.performance && typeof lhr.categories.performance.score === "number"
      ? lhr.categories.performance.score
      : null;

  const perfScore = perfScoreRaw == null ? "n/a" : n(perfScoreRaw * 100, 0);
  const finalUrl = esc(lhr.finalUrl || lhr.requestedUrl || path.basename(abs));
  const lcp = n(audits["largest-contentful-paint"]?.numericValue, 0);
  const cls = n(audits["cumulative-layout-shift"]?.numericValue, 3);
  const inp = n(audits["interaction-to-next-paint"]?.numericValue, 0);
  const tbt = n(audits["total-blocking-time"]?.numericValue, 0);
  const transferBytes = audits["total-byte-weight"]?.numericValue;
  const transfer = typeof transferBytes === "number" && isFinite(transferBytes) ? n(transferBytes / 1024, 1) : "n/a";

  lines.push(`| ${finalUrl} | ${perfScore} | ${lcp} | ${cls} | ${inp} | ${tbt} | ${transfer} |`);
});

const md = `${header.join("\n")}\n${lines.join("\n")}\n`;
process.stdout.write(`${md}\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}
