#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const requiredScripts = [
  "ci:qa",
  "ci:cloudflare",
  "store:build",
  "store:proof",
  "gaga:template:pack",
  "gaga:verify-worker-live:strict",
  "gaga:verify-ci-reconciliation",
  "gaga:verify-85",
  "ci:85",
];

const majorGuardFiles = [
  "qa/a11y-static-guard.mjs",
  "qa/asset-architecture-guard.mjs",
  "qa/ci-reconciliation-guard.mjs",
  "qa/cleanup-regression-guard.mjs",
  "qa/comments-proof-guard.mjs",
  "qa/component-source-contract-guard.mjs",
  "qa/copy-registry-guard.mjs",
  "qa/css-source-of-truth-cleanup-guard.mjs",
  "qa/discovery-contract-guard.mjs",
  "qa/discovery-filter-taxonomy-guard.mjs",
  "qa/docs-contract-guard.mjs",
  "qa/semantic-ssr-guard.mjs",
  "qa/schema-jsonld-guard.mjs",
  "qa/registry-contract-guard.mjs",
  "qa/nav-more-contract-guard.mjs",
  "qa/preview-sheet-contract-guard.mjs",
  "qa/readiness-85-guard.mjs",
  "qa/sheet-lifecycle-contract-guard.mjs",
  "qa/sheet-runtime-overflow-viewport-guard.mjs",
  "qa/shell-interaction-guard.mjs",
  "qa/store-isolation-guard.mjs",
  "qa/store-modal-preview-reliability-guard.mjs",
  "qa/template-fingerprint.mjs",
  "qa/theme-contract-guard.mjs",
  "qa/visual-system-contract-guard.mjs",
  "qa/worker-syntax-check.mjs",
];

const advisoryFiles = [
  "qa/gaga-audit.mjs",
  "qa/generate-audit-zip.js",
  "qa/package-audit.mjs",
  "qa/verify-copy-registry.mjs",
  "qa/verify-css-map.mjs",
  "qa/verify-css-sot.mjs",
];

function rel(file) {
  return path.relative(ROOT, path.resolve(ROOT, file)).replace(/\\/g, "/");
}

function read(file) {
  const absolute = path.resolve(ROOT, file);
  if (!existsSync(absolute)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function readIfExists(file) {
  const absolute = path.resolve(ROOT, file);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : "";
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function scriptIncludes(scripts, scriptName, needle) {
  return String(scripts[scriptName] || "").includes(needle);
}

function allPackageScriptText(scripts) {
  return Object.values(scripts).map((value) => String(value || "")).join("\n");
}

function listQaExecutables() {
  const qaRoot = path.resolve(ROOT, "qa");
  if (!existsSync(qaRoot)) return [];
  return readdirSync(qaRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `qa/${entry.name}`)
    .filter((file) => /\.(?:mjs|js)$/u.test(file))
    .sort();
}

function workflowRuns(source) {
  return Array.from(source.matchAll(/^\s*run:\s*(.+?)\s*$/gmu), (match) => match[1].trim());
}

function indexOfRun(source, needle) {
  const index = source.indexOf(needle);
  return index < 0 ? Number.POSITIVE_INFINITY : index;
}

const packageJsonText = read("package.json");
const packageJson = packageJsonText ? JSON.parse(packageJsonText) : { scripts: {} };
const scripts = packageJson.scripts || {};
const packageScriptsText = allPackageScriptText(scripts);
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");

for (const scriptName of requiredScripts) {
  if (!scripts[scriptName]) fail(`package.json missing required script: ${scriptName}`);
  else pass(`package.json has ${scriptName}`);
}

if (!scriptIncludes(scripts, "gaga:verify-ci-reconciliation", "node qa/ci-reconciliation-guard.mjs")) {
  fail("gaga:verify-ci-reconciliation must run node qa/ci-reconciliation-guard.mjs");
} else {
  pass("gaga:verify-ci-reconciliation points at qa/ci-reconciliation-guard.mjs");
}

if (!scriptIncludes(scripts, "ci:qa", "npm run gaga:verify-ci-reconciliation")) {
  fail("ci:qa must include npm run gaga:verify-ci-reconciliation");
} else {
  pass("ci:qa includes CI reconciliation guard");
}

if (!scriptIncludes(scripts, "ci:cloudflare", "npm run ci:qa")) {
  fail("ci:cloudflare must include npm run ci:qa");
} else {
  pass("ci:cloudflare includes aggregate ci:qa");
}

if (!scriptIncludes(scripts, "ci:cloudflare", "npm run ci:store")) {
  fail("ci:cloudflare must include npm run ci:store");
} else {
  pass("ci:cloudflare includes aggregate ci:store");
}

if (!scriptIncludes(scripts, "gaga:verify-85", "node qa/readiness-85-guard.mjs")) {
  fail("gaga:verify-85 must run node qa/readiness-85-guard.mjs");
} else {
  pass("gaga:verify-85 points at qa/readiness-85-guard.mjs");
}

if (!scriptIncludes(scripts, "ci:qa", "npm run gaga:verify-85")) {
  fail("ci:qa must include npm run gaga:verify-85");
} else {
  pass("ci:qa includes final readiness guard");
}

if (!scriptIncludes(scripts, "ci:85", "npm run ci:cloudflare") || !scriptIncludes(scripts, "ci:85", "npm run gaga:verify-85")) {
  fail("ci:85 must run npm run ci:cloudflare and npm run gaga:verify-85");
} else {
  pass("ci:85 is aggregate-driven through ci:cloudflare and readiness guard");
}

for (const file of majorGuardFiles) {
  if (!existsSync(path.resolve(ROOT, file))) {
    fail(`missing major guard: ${file}`);
    continue;
  }
  if (!packageScriptsText.includes(file)) {
    fail(`major guard is not referenced by package.json scripts: ${file}`);
  } else {
    pass(`major guard is wired through package.json: ${file}`);
  }
}

const advisoryDoc = `${qaCommands}\n${sourceOfTruth}`;
for (const file of advisoryFiles) {
  if (!existsSync(path.resolve(ROOT, file))) continue;
  if (packageScriptsText.includes(file)) {
    pass(`advisory/manual QA file also has package coverage: ${file}`);
    continue;
  }
  if (!advisoryDoc.includes(file)) {
    fail(`QA executable is neither wired nor documented advisory/manual: ${file}`);
  } else {
    pass(`QA executable documented as advisory/manual: ${file}`);
  }
}

for (const file of listQaExecutables()) {
  if (majorGuardFiles.includes(file) || advisoryFiles.includes(file) || packageScriptsText.includes(file)) continue;
  if (!qaCommands.includes(file) && !sourceOfTruth.includes(file)) {
    warn(`QA executable is not classified by this guard: ${file}`);
  }
}

for (const marker of [
  "Mandatory Guards",
  "Advisory And Manual QA",
  "Read-Only Guards",
  "Mutating Build Tools",
]) {
  if (!qaCommands.includes(marker) && !sourceOfTruth.includes(marker)) {
    fail(`documentation missing required CI reconciliation section marker: ${marker}`);
  }
}

const ciWorkflow = readIfExists(".github/workflows/ci.yml");
if (ciWorkflow) {
  const ciRuns = workflowRuns(ciWorkflow);
  if (!ciWorkflow.includes("npm run ci:cloudflare")) {
    fail(".github/workflows/ci.yml must call npm run ci:cloudflare");
  } else {
    pass("ci.yml calls aggregate ci:cloudflare");
  }
  for (const stale of ["npm run build", "npm run ci:qa"]) {
    if (ciRuns.includes(stale)) {
      fail(`ci.yml duplicates aggregate command outside ci:cloudflare: ${stale}`);
    }
  }
  if (/test -f\s+/.test(ciWorkflow)) {
    fail("ci.yml contains manual artifact test list; keep artifact checks inside aggregate scripts/guards");
  }
}

const deployWorkflow = readIfExists(".github/workflows/deploy-cloudflare.yml");
if (deployWorkflow) {
  const deployRuns = workflowRuns(deployWorkflow);
  const verifyIndex = indexOfRun(deployWorkflow, "npm run ci:cloudflare");
  const deployIndex = Math.min(
    indexOfRun(deployWorkflow, "npm run deploy:cloudflare:prepared"),
    indexOfRun(deployWorkflow, "node tools/cloudflare-deploy.mjs deploy")
  );
  const smokeIndex = indexOfRun(deployWorkflow, "npm run gaga:verify-worker-live:strict");

  if (!deployWorkflow.includes("npm run ci:cloudflare")) {
    fail("deploy-cloudflare.yml must verify with npm run ci:cloudflare before deploy");
  }
  if (!deployWorkflow.includes("npm run gaga:verify-worker-live:strict")) {
    fail("deploy-cloudflare.yml must run strict live smoke after deploy");
  }
  if (verifyIndex > deployIndex) {
    fail("deploy-cloudflare.yml deploys before npm run ci:cloudflare verification");
  } else {
    pass("deploy-cloudflare.yml verifies before deploy");
  }
  if (smokeIndex < deployIndex) {
    fail("deploy-cloudflare.yml live smoke must run after deploy");
  } else {
    pass("deploy-cloudflare.yml live-smokes after deploy");
  }
  for (const stale of ["npm run build", "npm run ci:qa"]) {
    if (deployRuns.includes(stale)) {
      fail(`deploy-cloudflare.yml duplicates aggregate command outside ci:cloudflare: ${stale}`);
    }
  }
  if (deployWorkflow.includes("npm run gaga:cf:deploy") || deployWorkflow.includes("npm run deploy:cloudflare\n")) {
    fail("deploy-cloudflare.yml must deploy the prepared artifact path, not a build-before-deploy script");
  }
}

if (scripts["deploy:cloudflare:prepared"]) {
  if (!scriptIncludes(scripts, "deploy:cloudflare:prepared", "node tools/cloudflare-deploy.mjs deploy")) {
    fail("deploy:cloudflare:prepared must run node tools/cloudflare-deploy.mjs deploy");
  } else {
    pass("deploy:cloudflare:prepared uses prepared Cloudflare deploy wrapper");
  }
}

if (failures.length) {
  console.error("CI RECONCILIATION GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  console.log("CI RECONCILIATION GUARD PASS_WITH_WARNINGS");
} else {
  console.log("CI RECONCILIATION GUARD PASS");
}
