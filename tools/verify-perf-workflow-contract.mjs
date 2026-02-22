import fs from "fs";
import path from "path";

const root = process.cwd();
const requiredFiles = [
  ".github/workflows/perf-lighthouse.yml",
  "lighthouse/lighthouserc.ci.js",
  "tools/perf/lhci-summary.mjs",
  "tools/perf/lhci-trend.mjs",
];
const failures = [];

function fail(msg) {
  failures.push(msg);
}

requiredFiles.forEach((rel) => {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing file: ${rel}`);
  }
});

const workflowRel = ".github/workflows/perf-lighthouse.yml";
const workflowAbs = path.join(root, workflowRel);
if (fs.existsSync(workflowAbs)) {
  const src = fs.readFileSync(workflowAbs, "utf8");
  if (!/workflow_run\s*:/i.test(src)) fail("workflow missing trigger: workflow_run");
  if (!/schedule\s*:/i.test(src)) fail("workflow missing trigger: schedule");
  if (!/workflow_dispatch\s*:/i.test(src)) fail("workflow missing trigger: workflow_dispatch");
  if (!/Deploy to Cloudflare Workers/i.test(src)) {
    fail("workflow_run must reference deploy workflow name: Deploy to Cloudflare Workers");
  }
  if (!/lighthouse\/lighthouserc\.ci\.js/i.test(src)) fail("workflow missing LHCI configPath usage");
  if (!/tools\/perf\/lhci-summary\.mjs/i.test(src)) fail("workflow missing summary step");
  if (!/tools\/perf\/lhci-trend\.mjs/i.test(src)) fail("workflow missing trend step");
  const hasArtifactUpload = /actions\/upload-artifact@/i.test(src);
  const hasTreoshUploadArtifacts = /uploadArtifacts\s*:\s*true/i.test(src);
  if (!hasArtifactUpload && !hasTreoshUploadArtifacts) {
    fail("workflow must upload Lighthouse artifacts (upload-artifact or treosh uploadArtifacts)");
  }
  if (!/\.lighthouseci\/trend\.json/i.test(src)) {
    fail("workflow must upload .lighthouseci/trend.json artifact");
  }
  if (!/name:\s*Upload Lighthouse artifacts[\s\S]*?include-hidden-files:\s*true/i.test(src)) {
    fail("workflow must set include-hidden-files: true for Upload Lighthouse artifacts");
  }
  if (!/name:\s*Upload Lighthouse trend JSON[\s\S]*?include-hidden-files:\s*true/i.test(src)) {
    fail("workflow must set include-hidden-files: true for Upload Lighthouse trend JSON");
  }
}

if (failures.length) {
  console.error("VERIFY_PERF_WORKFLOW_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_PERF_WORKFLOW_CONTRACT: PASS");
