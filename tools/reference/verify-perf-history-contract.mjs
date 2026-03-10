import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

const requiredFiles = [
  "tools/perf/perf-history-append.mjs",
  "tools/perf/perf-history-build.mjs",
  "docs/perf/PERF_HISTORY.md",
  ".github/workflows/perf-lighthouse.yml",
];

requiredFiles.forEach((rel) => {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing file: ${rel}`);
  }
});

const wf = read(".github/workflows/perf-lighthouse.yml");
if (wf) {
  if (!/contents:\s*write/i.test(wf)) {
    fail("workflow must set permissions.contents=write for perf-history push");
  }
  if (!/perf-history/i.test(wf)) {
    fail("workflow must reference perf-history branch");
  }
  if (!/tools\/perf\/perf-history-append\.mjs/i.test(wf)) {
    fail("workflow missing perf-history-append step");
  }
  if (!/tools\/perf\/perf-history-build\.mjs/i.test(wf)) {
    fail("workflow missing perf-history-build step");
  }
  if (!/git\s+push\s+origin\s+perf-history/i.test(wf)) {
    fail("workflow must push perf-history branch");
  }
  if (!/history\.ndjson\s+did\s+not\s+grow/i.test(wf)) {
    fail("workflow missing append-only growth guard for history.ndjson");
  }
}

if (failures.length) {
  console.error("VERIFY_PERF_HISTORY_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_PERF_HISTORY_CONTRACT: PASS");
