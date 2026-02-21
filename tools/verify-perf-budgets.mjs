import fs from "fs";
import path from "path";

const root = process.cwd();
const baselineRel = "docs/perf/BASELINE.md";
const budgetsRel = "docs/perf/BUDGETS.json";
const lockRel = "docs/perf/BUDGETS.lock.json";
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function readText(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function readJson(rel) {
  const txt = readText(rel);
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch (e) {
    fail(`invalid JSON: ${rel}`);
    return null;
  }
}

function assertPositiveNumber(val, label) {
  if (typeof val !== "number" || !isFinite(val) || val <= 0) {
    fail(`${label} must be a positive number`);
  }
}

function verifyBaseline(md) {
  if (!md) return;
  if (!/##\s+Surfaces/i.test(md)) fail("BASELINE.md missing 'Surfaces' section");
  if (!/##\s+How to Re-measure/i.test(md)) fail("BASELINE.md missing 'How to Re-measure' section");
  if (!/##\s+Interpretation Rules/i.test(md)) fail("BASELINE.md missing 'Interpretation Rules' section");

  const rowRe = /^\|\s*(HOME|LISTING|POST)\s*\|\s*(https?:\/\/[^\s|]+)\s*\|\s*(\d{1,3})\s*\|\s*(\d+)\s*\|\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*$/gim;
  const seen = new Map();
  let m;
  while ((m = rowRe.exec(md))) {
    const surface = (m[1] || "").toUpperCase();
    const url = String(m[2] || "").trim();
    const score = Number(m[3]);
    const lcp = Number(m[4]);
    const cls = Number(m[5]);
    const inp = Number(m[6]);
    const tbt = Number(m[7]);
    const transfer = Number(m[8]);
    const jsExec = Number(m[9]);

    if (score < 0 || score > 100) fail(`${surface} Lighthouse score must be 0..100`);
    if (lcp <= 0) fail(`${surface} LCP must be > 0`);
    if (cls < 0) fail(`${surface} CLS must be >= 0`);
    if (inp <= 0) fail(`${surface} INP must be > 0`);
    if (tbt < 0) fail(`${surface} TBT must be >= 0`);
    if (transfer <= 0) fail(`${surface} Transfer must be > 0`);
    if (jsExec <= 0) fail(`${surface} JS Exec must be > 0`);

    seen.set(surface, { url });
  }

  ["HOME", "LISTING", "POST"].forEach((s) => {
    if (!seen.has(s)) fail(`BASELINE.md missing row for ${s}`);
  });

  const home = seen.get("HOME")?.url || "";
  const listing = seen.get("LISTING")?.url || "";
  const post = seen.get("POST")?.url || "";

  if (!home.startsWith("https://www.pakrpp.com/")) fail("HOME URL must use https://www.pakrpp.com/");
  if (listing !== "https://www.pakrpp.com/blog") fail("LISTING URL must be exactly https://www.pakrpp.com/blog");
  if (!post.startsWith("https://www.pakrpp.com/")) fail("POST URL must use https://www.pakrpp.com/");
  if (post === home || post === listing) fail("POST URL must be a stable post URL, not HOME/LISTING");
}

function verifyBudgetShape(data, label) {
  if (!data || typeof data !== "object") {
    fail(`${label} must be an object`);
    return;
  }

  if (data.v !== 1) fail(`${label} v must be 1`);
  if (typeof data.updated !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
    fail(`${label} updated must be YYYY-MM-DD`);
  }

  const targets = data.targets;
  const ratchet = data.ratchet;
  if (!targets || typeof targets !== "object") fail(`${label} missing targets object`);
  if (!ratchet || typeof ratchet !== "object") fail(`${label} missing ratchet object`);
  if (!targets || !ratchet) return;

  const targetKeys = ["lcp_ms", "cls", "inp_ms", "tbt_ms", "transfer_kb"];
  const ratchetKeys = ["max_lcp_ms", "max_cls", "max_inp_ms", "max_tbt_ms", "max_transfer_kb"];

  targetKeys.forEach((k) => {
    if (!(k in targets)) fail(`${label} targets missing key: ${k}`);
    else assertPositiveNumber(targets[k], `${label} targets.${k}`);
  });

  ratchetKeys.forEach((k) => {
    if (!(k in ratchet)) fail(`${label} ratchet missing key: ${k}`);
    else assertPositiveNumber(ratchet[k], `${label} ratchet.${k}`);
  });
}

function verifyRatchetNoLoosen(current, locked) {
  if (!current || !locked || !current.ratchet || !locked.ratchet) return;
  const keys = ["max_lcp_ms", "max_cls", "max_inp_ms", "max_tbt_ms", "max_transfer_kb"];
  keys.forEach((k) => {
    const cur = current.ratchet[k];
    const prev = locked.ratchet[k];
    if (typeof cur !== "number" || typeof prev !== "number") return;
    if (cur > prev) {
      fail(`ratchet loosened for ${k}: ${cur} > lock ${prev}`);
    }
  });
}

const baseline = readText(baselineRel);
const budgets = readJson(budgetsRel);
const lock = readJson(lockRel);

verifyBaseline(baseline);
verifyBudgetShape(budgets, budgetsRel);
verifyBudgetShape(lock, lockRel);
verifyRatchetNoLoosen(budgets, lock);

if (failures.length) {
  console.error("VERIFY_PERF_BUDGETS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_PERF_BUDGETS: PASS");
