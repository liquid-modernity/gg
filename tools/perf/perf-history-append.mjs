import fs from "fs";
import path from "path";

const root = process.cwd();

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--trend" && argv[i + 1]) {
      out.trend = argv[++i];
      continue;
    }
    if (a === "--out" && argv[i + 1]) {
      out.out = argv[++i];
      continue;
    }
  }
  return out;
}

function asIso(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function shortSha(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  return raw.slice(0, 7);
}

function normalizeResult(item) {
  return {
    key: item?.key || "",
    finalUrl: item?.finalUrl || "",
    performance: item?.performance ?? null,
    lcp_ms: item?.lcp_ms ?? null,
    cls: item?.cls ?? null,
    inp_ms: item?.inp_ms ?? null,
    tbt_ms: item?.tbt_ms ?? null,
    transfer_kb: item?.transfer_kb ?? null,
    ratchet: {
      pass: !!item?.ratchet?.pass,
      reasons: Array.isArray(item?.ratchet?.reasons) ? item.ratchet.reasons : [],
    },
  };
}

const args = parseArgs(process.argv.slice(2));
const trendPath = path.resolve(root, args.trend || ".lighthouseci/trend.json");
const outPath = path.resolve(root, args.out || ".lighthouseci/history-record.json");

if (!fs.existsSync(trendPath)) {
  console.error(`FAIL: missing trend file: ${trendPath}`);
  process.exit(1);
}

let trend = null;
try {
  trend = JSON.parse(fs.readFileSync(trendPath, "utf8"));
} catch (err) {
  console.error(`FAIL: invalid trend JSON: ${err?.message || err}`);
  process.exit(1);
}

const results = Array.isArray(trend?.results) ? trend.results.map(normalizeResult) : [];
if (!results.length) {
  console.error("FAIL: trend.json has no results");
  process.exit(1);
}

const envSha = shortSha(process.env.GITHUB_SHA);
const trendSha = shortSha(trend?.commit);
const commit = envSha || trendSha || "unknown";
const generatedAt = asIso(trend?.generated_at) || new Date().toISOString();

const runId = String(process.env.GITHUB_RUN_ID || "").trim();
const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && runId
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`
    : null;

const overallPass = results.every((r) => !!r.ratchet?.pass);

const record = {
  generated_at: generatedAt,
  commit,
  urls: trend?.urls || {},
  results,
  ratchet: trend?.ratchet || {},
  overall_pass: overallPass,
  run_url: runUrl,
};

const line = JSON.stringify(record);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${line}\n`);
process.stdout.write(`${line}\n`);
