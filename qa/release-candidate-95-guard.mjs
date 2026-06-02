#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];
const strictRelease = /^(?:1|true|yes)$/iu.test(String(process.env.GG_RC95_STRICT_RELEASE || ""));

function absolute(file) {
  return path.resolve(ROOT, file);
}

function read(file) {
  const target = absolute(file);
  if (!existsSync(target)) {
    failures.push(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(target, "utf8");
}

function readJson(file) {
  const source = read(file);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch (error) {
    failures.push(`invalid JSON in ${file}: ${error.message}`);
    return {};
  }
}

function pass(message) {
  passes.push(message);
}

function warn(message) {
  warnings.push(message);
}

function fail(message) {
  failures.push(message);
}

function assertIncludes(source, needle, label) {
  if (String(source || "").includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function assertOrder(source, orderedNeedles, label) {
  let previous = -1;
  for (const needle of orderedNeedles) {
    const current = source.indexOf(needle);
    if (current < 0) {
      fail(`${label}: missing ${needle}`);
      return;
    }
    if (current <= previous) {
      fail(`${label}: ${needle} is out of order`);
      return;
    }
    previous = current;
  }
  pass(label);
}

function assertFile(file, label) {
  const target = absolute(file);
  if (!existsSync(target)) {
    fail(`${label}: missing ${file}`);
    return;
  }
  if (!statSync(target).isFile()) {
    fail(`${label}: not a file ${file}`);
    return;
  }
  pass(label);
}

const packageJson = readJson("package.json");
const scripts = packageJson.scripts || {};
const packageScriptsText = Object.values(scripts).join("\n");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const rcReport = read("RELEASE-CANDIDATE-95-REPORT.md");
const readinessReport = read("READINESS-85-REPORT.md");
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const deployWorkflow = read(".github/workflows/deploy-cloudflare.yml");
const ciWorkflow = read(".github/workflows/ci.yml");
const lighthouseWorkflow = read(".github/workflows/lighthouse-ci.yml");
const worker = read("worker.js");
const flags = readJson("flags.json");

if (scripts["gaga:verify-95"] === "node qa/release-candidate-95-guard.mjs") {
  pass("package script gaga:verify-95 is wired");
} else {
  fail("package.json missing gaga:verify-95 script");
}
assertIncludes(String(scripts["ci:95"] || ""), "npm run ci:85", "ci:95 includes ci:85");
assertIncludes(String(scripts["ci:95"] || ""), "npm run gaga:verify-95", "ci:95 includes release candidate guard");
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-95", "ci:qa includes release candidate guard");
assertIncludes(String(scripts["ci:85"] || ""), "npm run ci:cloudflare", "ci:85 includes Cloudflare CI");
assertIncludes(String(scripts["ci:85"] || ""), "npm run gaga:verify-85", "ci:85 includes readiness guard");
assertIncludes(String(scripts["ci:cloudflare"] || ""), "npm run ci:store", "ci:cloudflare includes Store CI");
assertIncludes(String(scripts["ci:cloudflare"] || ""), "npm run ci:qa", "ci:cloudflare includes aggregate QA");
assertIncludes(String(scripts["ci:cloudflare"] || ""), "bash -n qa/live-smoke-worker.sh", "ci:cloudflare checks live smoke shell syntax");

for (const scriptName of [
  "build",
  "ci:qa",
  "ci:store",
  "ci:cloudflare",
  "ci:85",
  "ci:95",
  "deploy:cloudflare:prepared",
  "gaga:verify-worker-live:strict",
]) {
  if (scripts[scriptName]) pass(`package.json has ${scriptName}`);
  else fail(`package.json missing required release script: ${scriptName}`);
}

const requiredGuardFiles = [
  "qa/docs-contract-guard.mjs",
  "qa/ci-reconciliation-guard.mjs",
  "qa/handoff-hygiene-guard.mjs",
  "qa/content-source-boundary-guard.mjs",
  "qa/unified-data-contract-guard.mjs",
  "qa/controller-core-adapters-guard.mjs",
  "qa/semantic-ssr-guard.mjs",
  "qa/semantic-readable-content-guard.mjs",
  "qa/schema-jsonld-guard.mjs",
  "qa/registry-contract-guard.mjs",
  "qa/a11y-static-guard.mjs",
  "qa/asset-architecture-guard.mjs",
  "qa/css-source-visual-rhythm-guard.mjs",
  "qa/lazy-interaction-budget-guard.mjs",
  "qa/global-sheet-contract-guard.mjs",
  "qa/sheet-gesture-close-guard.mjs",
  "qa/readiness-85-guard.mjs",
  "qa/release-candidate-95-guard.mjs",
  "qa/worker-syntax-check.mjs",
];

for (const file of requiredGuardFiles) {
  assertFile(file, `required guard exists ${file}`);
  assertIncludes(packageScriptsText, file, `required guard is package-wired ${file}`);
}

assertIncludes(ciGuard, "qa/release-candidate-95-guard.mjs", "CI reconciliation classifies RC95 guard");
assertIncludes(ciGuard, "gaga:verify-95", "CI reconciliation checks RC95 script");
assertIncludes(ciGuard, "ci:95", "CI reconciliation checks RC95 aggregate");

for (const command of [
  "npm ci",
  "npm run build",
  "npm run ci:qa",
  "npm run ci:store",
  "npm run ci:cloudflare",
  "npm run ci:85",
  "npm run gaga:verify-95",
  "npm run ci:95",
]) {
  assertIncludes(qaCommands, command, `QA-COMMANDS documents ${command}`);
  assertIncludes(rcReport, command, `RC95 report documents ${command}`);
}

for (const command of [
  "npm run ci:cloudflare",
  "npm run deploy:cloudflare:prepared",
  "npm run gaga:verify-worker-live:strict",
]) {
  assertIncludes(deployWorkflow, command, `deploy workflow includes ${command}`);
  assertIncludes(qaCommands, command, `QA-COMMANDS documents deploy command ${command}`);
  assertIncludes(rcReport, command, `RC95 report documents deploy command ${command}`);
}

assertOrder(
  deployWorkflow,
  [
    "actions/checkout",
    "actions/setup-node",
    "npm ci",
    "npm run ci:cloudflare",
    "npm run deploy:cloudflare:prepared",
    "npm run gaga:verify-worker-live:strict",
  ],
  "deploy workflow order is checkout -> setup -> npm ci -> ci:cloudflare -> prepared deploy -> strict live smoke"
);
assertIncludes(ciWorkflow, "npm ci", "CI workflow installs with npm ci");
assertIncludes(ciWorkflow, "npm run ci:cloudflare", "CI workflow runs aggregate Cloudflare CI");
assertIncludes(lighthouseWorkflow, "continue-on-error: true", "Lighthouse workflow remains advisory/non-blocking");

for (const marker of [
  "blockers vs advisory warnings",
  "advisory unless strict release mode is explicit",
  "Production/indexing flags were not switched",
  "Manual production checklist",
  "Worker remains governance/static routing only",
]) {
  assertIncludes(rcReport, marker, `RC95 report documents ${marker}`);
}
assertIncludes(sourceOfTruth, "RELEASE-CANDIDATE-95-REPORT.md", "SOURCE-OF-TRUTH documents RC95 report");
assertIncludes(sourceOfTruth, "npm run gaga:verify-95", "SOURCE-OF-TRUTH documents RC95 guard command");
assertIncludes(readinessReport, "npm run ci:95", "readiness report points to RC95 final gate");

assertNoPattern(worker, /HTMLRewriter/u, "Worker does not use HTMLRewriter");
assertNoPattern(worker, /readability repair|schema repair|CMS repair/iu, "Worker does not advertise content repair ownership");

for (const file of [
  "index.xml",
  "src/js/gg-app.source.js",
  "src/css/gg-app.source.css",
  "src/css/gg-critical.source.css",
  "src/registry/gg-source-boundary.registry.js",
  "registry/copy/gg-copy-en.json",
  "registry/copy/gg-copy-id.json",
]) {
  assertFile(file, `source boundary file exists ${file}`);
}

for (const file of [
  "dist/blogger-template.publish.xml",
  "dist/blogger-template.publish.txt",
  "__gg/assets/css/gg-app.dev.css",
  "__gg/assets/js/gg-app.dev.js",
  "store/data/manifest.json",
  "store/data/build-report.json",
  ".cloudflare-build/worker.js",
]) {
  assertFile(file, `generated/staged artifact exists after build ${file}`);
}

const developmentIndexingLocked =
  flags.mode !== "production" ||
  flags?.robots?.developmentLockdown === true ||
  flags?.robots?.blockSearchBots === true ||
  flags?.robots?.blockAiBots === true;

if (developmentIndexingLocked) {
  const message = "ADVISORY_WARNING route=all check=production-indexing current=development-lockdown blocking=production-indexing-only";
  if (strictRelease) fail(`${message} strictRelease=true`);
  else warn(message);
} else {
  pass("production indexing flags are open");
}

warn("ADVISORY_WARNING route=all check=budgets current=tracked blocking=advisory-unless-strict-release");

for (const message of passes) console.log(`PASS ${message}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);

if (failures.length) {
  console.error("RELEASE CANDIDATE 95 GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(warnings.length ? "RELEASE CANDIDATE 95 GUARD PASS_WITH_WARNINGS" : "RELEASE CANDIDATE 95 GUARD PASS");
