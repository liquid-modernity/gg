import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const out = { root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root" && argv[i + 1]) {
      out.root = path.resolve(argv[++i]);
    }
  }
  return out;
}

function readNdjson(absPath) {
  if (!fs.existsSync(absPath)) return [];
  const lines = fs
    .readFileSync(absPath, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const rows = [];
  for (const line of lines) {
    try {
      rows.push(JSON.parse(line));
    } catch {
      // Ignore malformed historical rows and continue building from valid rows.
    }
  }
  return rows;
}

function esc(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(v, digits = 0) {
  if (typeof v !== "number" || !isFinite(v)) return "n/a";
  return v.toFixed(digits);
}

function metricFor(record, key, metric) {
  const list = Array.isArray(record?.results) ? record.results : [];
  const row = list.find((r) => r && r.key === key);
  if (!row) return null;
  const v = row[metric];
  return typeof v === "number" && isFinite(v) ? v : null;
}

function sparkline(values) {
  const blocks = "▁▂▃▄▅▆▇█";
  const nums = values.filter((v) => typeof v === "number" && isFinite(v));
  if (!nums.length) return "n/a";
  let min = nums[0];
  let max = nums[0];
  nums.forEach((n) => {
    if (n < min) min = n;
    if (n > max) max = n;
  });
  if (min === max) return "▅".repeat(values.length);
  return values
    .map((v) => {
      if (typeof v !== "number" || !isFinite(v)) return "·";
      const t = (v - min) / (max - min);
      const idx = Math.max(0, Math.min(7, Math.round(t * 7)));
      return blocks[idx];
    })
    .join("");
}

function surfaceCell(record, key) {
  const lcp = fmt(metricFor(record, key, "lcp_ms"), 0);
  const cls = fmt(metricFor(record, key, "cls"), 3);
  const inp = fmt(metricFor(record, key, "inp_ms"), 0);
  const tbt = fmt(metricFor(record, key, "tbt_ms"), 0);
  const kb = fmt(metricFor(record, key, "transfer_kb"), 1);
  return `LCP ${lcp} | CLS ${cls} | INP ${inp} | TBT ${tbt} | KB ${kb}`;
}

const args = parseArgs(process.argv.slice(2));
const perfDir = path.join(args.root, "perf");
const historyPath = path.join(perfDir, "history.ndjson");
const latestPath = path.join(perfDir, "latest.json");
const indexPath = path.join(perfDir, "index.html");

fs.mkdirSync(perfDir, { recursive: true });
if (!fs.existsSync(historyPath)) fs.writeFileSync(historyPath, "");

const rows = readNdjson(historyPath);
const latest = rows.length ? rows[rows.length - 1] : null;
const recent = rows.slice(-20);
const recentDesc = [...recent].reverse();

fs.writeFileSync(latestPath, `${JSON.stringify(latest || {}, null, 2)}\n`);

const keys = ["home", "listing", "post"];
const metricSpecs = [
  { id: "lcp_ms", label: "LCP ms", digits: 0 },
  { id: "cls", label: "CLS", digits: 3 },
  { id: "inp_ms", label: "INP ms", digits: 0 },
  { id: "tbt_ms", label: "TBT ms", digits: 0 },
  { id: "transfer_kb", label: "KB", digits: 1 },
];

const trendRows = [];
keys.forEach((key) => {
  metricSpecs.forEach((m) => {
    const vals = recent.map((r) => metricFor(r, key, m.id));
    const latestValue = vals.length ? vals[vals.length - 1] : null;
    trendRows.push(`
      <tr>
        <td>${esc(key)}</td>
        <td>${esc(m.label)}</td>
        <td><code>${esc(sparkline(vals))}</code></td>
        <td>${esc(fmt(latestValue, m.digits))}</td>
      </tr>
    `);
  });
});

const tableRows = recentDesc
  .map((r) => {
    const date = r?.generated_at ? esc(String(r.generated_at).replace("T", " ").replace("Z", " UTC")) : "n/a";
    const commit = esc(r?.commit || "n/a");
    const pass = r?.overall_pass ? "PASS" : "FAIL";
    const runUrl = r?.run_url ? `<a href="${esc(r.run_url)}">run</a>` : "n/a";
    return `
      <tr>
        <td>${date}</td>
        <td><code>${commit}</code></td>
        <td>${pass}</td>
        <td>${esc(surfaceCell(r, "home"))}</td>
        <td>${esc(surfaceCell(r, "listing"))}</td>
        <td>${esc(surfaceCell(r, "post"))}</td>
        <td>${runUrl}</td>
      </tr>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Perf History</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:1200px;margin:24px auto;padding:0 12px;color:#0f172a}
    h1,h2{margin:0 0 12px}
    p{margin:6px 0 16px}
    table{border-collapse:collapse;width:100%;margin:8px 0 20px}
    th,td{border:1px solid #cbd5e1;padding:8px;vertical-align:top;font-size:13px}
    th{background:#f8fafc;text-align:left}
    code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
    .muted{color:#475569}
  </style>
</head>
<body>
  <h1>Perf History</h1>
  <p class="muted">Runs stored: ${rows.length}. Last updated: ${latest?.generated_at ? esc(latest.generated_at) : "n/a"}.</p>
  <p class="muted">Latest commit: <code>${esc(latest?.commit || "n/a")}</code> | Latest run: ${latest?.run_url ? `<a href="${esc(latest.run_url)}">${esc(latest.run_url)}</a>` : "n/a"}</p>

  <h2>Last 20 Runs</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Commit</th>
        <th>Overall</th>
        <th>Home (LCP/CLS/INP/TBT/KB)</th>
        <th>Listing (LCP/CLS/INP/TBT/KB)</th>
        <th>Post (LCP/CLS/INP/TBT/KB)</th>
        <th>Run</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="7">No data yet.</td></tr>'}
    </tbody>
  </table>

  <h2>Metric Sparklines (Last 20)</h2>
  <table>
    <thead>
      <tr>
        <th>URL Key</th>
        <th>Metric</th>
        <th>Sparkline</th>
        <th>Latest</th>
      </tr>
    </thead>
    <tbody>
      ${trendRows.join("\n")}
    </tbody>
  </table>
</body>
</html>
`;

fs.writeFileSync(indexPath, html);
console.log(`PASS: perf history build -> ${path.relative(args.root, latestPath)}, ${path.relative(args.root, indexPath)}`);
