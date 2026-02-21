import fs from "fs";
import path from "path";

const root = process.cwd();
const urlsRel = "docs/perf/URLS.json";
const baselineRel = "docs/perf/BASELINE.md";
const lhciRel = "lighthouse/lighthouserc.ci.js";
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

const urlsRaw = readText(urlsRel);
let payload = null;
if (urlsRaw) {
  try {
    payload = JSON.parse(urlsRaw);
  } catch (err) {
    fail(`invalid JSON in ${urlsRel}: ${err.message}`);
  }
}

const urls = payload && payload.urls && typeof payload.urls === "object" ? payload.urls : null;
if (!urls) {
  fail(`${urlsRel} missing object field: urls`);
}

const keys = ["home", "listing", "post"];
const values = {};
keys.forEach((k) => {
  const v = urls ? String(urls[k] || "").trim() : "";
  values[k] = v;
  if (!v) {
    fail(`${urlsRel} missing urls.${k}`);
    return;
  }
  if (!v.startsWith("https://")) {
    fail(`${urlsRel} urls.${k} must use https`);
  }
  if (!v.startsWith("https://www.pakrpp.com")) {
    fail(`${urlsRel} urls.${k} must start with https://www.pakrpp.com`);
  }
});

const baseline = readText(baselineRel);
if (baseline) {
  if (!/SSOT:\s*docs\/perf\/URLS\.json/i.test(baseline)) {
    fail(`${baselineRel} missing canonical SSOT line: SSOT: docs/perf/URLS.json`);
  }
  keys.forEach((k) => {
    const v = values[k];
    if (v && !baseline.includes(v)) {
      fail(`${baselineRel} missing SSOT URL: ${v}`);
    }
  });
}

const lhci = readText(lhciRel);
if (lhci) {
  if (/https:\/\/www\.pakrpp\.com/i.test(lhci)) {
    fail(`${lhciRel} contains hardcoded live URL; must read docs/perf/URLS.json only`);
  }
  if (!/docs\/perf\/URLS\.json/.test(lhci)) {
    fail(`${lhciRel} must read docs/perf/URLS.json`);
  }
  if (!/payload\s*&&\s*payload\.urls/.test(lhci) && !/\.urls\b/.test(lhci)) {
    fail(`${lhciRel} must use payload.urls.* keys`);
  }
}

if (failures.length) {
  console.error("VERIFY_PERF_URLS_SSOT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: perf URLs SSOT aligned");
