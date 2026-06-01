#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const commandChecks = [
  ["docs contract", "npm", ["run", "gaga:verify-docs-contract"]],
  ["CI reconciliation", "npm", ["run", "gaga:verify-ci-reconciliation"]],
  ["semantic SSR", "npm", ["run", "gaga:verify-semantic-ssr"]],
  ["semantic readable content", "npm", ["run", "gaga:verify-semantic-readable-content"]],
  ["schema JSON-LD", "npm", ["run", "gaga:verify-schema-jsonld"]],
  ["registry contract", "npm", ["run", "gaga:verify-registry-contract"]],
  ["a11y static", "npm", ["run", "gaga:verify-a11y-static"]],
  ["asset architecture", "npm", ["run", "gaga:verify-asset-architecture"]],
  ["cleanup regression", "npm", ["run", "gaga:verify-cleanup"]],
  ["comments proof", "npm", ["run", "gaga:verify-comments-proof"]],
  ["global sheet contract", "npm", ["run", "gaga:verify-global-sheet-contract"]],
  ["copy registry", "node", ["qa/copy-registry-guard.mjs"]],
  ["nav-more", "npm", ["run", "gaga:verify-nav-more"]],
  ["discovery contract", "npm", ["run", "gaga:verify-discovery-contract"]],
  ["discovery filters", "npm", ["run", "gaga:verify-discovery-filters"]],
  ["store isolation", "npm", ["run", "gaga:verify-store-isolation"]],
  ["theme", "npm", ["run", "gaga:verify-theme"]],
  ["shell", "npm", ["run", "gaga:verify-shell"]],
  ["preview sheet", "npm", ["run", "gaga:verify-preview-sheet"]],
  ["store proof", "npm", ["run", "store:proof"]],
  ["template fingerprint", "node", ["qa/template-fingerprint.mjs", "--check"]],
  ["worker syntax", "node", ["qa/worker-syntax-check.mjs"]],
  ["live smoke script syntax", "bash", ["-n", "qa/live-smoke-worker.sh"]],
];

const majorGuardFiles = [
  "qa/comments-proof-guard.mjs",
  "qa/nav-more-contract-guard.mjs",
  "qa/discovery-contract-guard.mjs",
  "qa/discovery-filter-taxonomy-guard.mjs",
  "qa/store-isolation-guard.mjs",
  "qa/theme-contract-guard.mjs",
  "qa/shell-interaction-guard.mjs",
  "qa/preview-sheet-contract-guard.mjs",
  "qa/semantic-ssr-guard.mjs",
  "qa/semantic-readable-content-guard.mjs",
  "qa/schema-jsonld-guard.mjs",
  "qa/registry-contract-guard.mjs",
  "qa/a11y-static-guard.mjs",
  "qa/asset-architecture-guard.mjs",
  "qa/cleanup-regression-guard.mjs",
  "qa/global-sheet-contract-guard.mjs",
  "qa/template-fingerprint.mjs",
  "qa/worker-syntax-check.mjs",
];

const sizeBudgets = [
  ["src/css/gg-critical.source.css", 14 * 1024, 10 * 1024, "critical CSS"],
  ["src/css/gg-app.source.css", 120 * 1024, 90 * 1024, "Blogger external CSS source"],
  ["src/js/gg-app.source.js", 450 * 1024, 400 * 1024, "Blogger app JS source"],
  ["src/store/store.css", 90 * 1024, 75 * 1024, "Store CSS source"],
  ["assets/store/store-core.js", 20 * 1024, 15 * 1024, "Store core JS asset"],
  ["assets/store/store-discovery.js", 190 * 1024, 150 * 1024, "Store discovery JS asset"],
  ["store/data/manifest.json", 80 * 1024, 60 * 1024, "Store manifest"],
];

function absolute(file) {
  return path.resolve(ROOT, file);
}

function existsFile(file) {
  return existsSync(absolute(file)) && statSync(absolute(file)).isFile();
}

function read(file) {
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute(file), "utf8");
}

function parseJson(file) {
  const source = read(file);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
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

function assertFile(file, label = file) {
  if (existsFile(file)) pass(`${label} exists`);
  else fail(`${label} missing: ${file}`);
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertPattern(source, pattern, label) {
  if (pattern.test(source)) pass(label);
  else fail(label);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

function commandString(command, args) {
  return [command, ...args].join(" ");
}

function tailOutput(output) {
  return String(output || "")
    .split(/\r?\n/u)
    .filter(Boolean)
    .slice(-12)
    .join("\n");
}

function runCheck(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  const renderedCommand = commandString(command, args);

  if (result.error) {
    fail(`${label}: failed to run ${renderedCommand}: ${result.error.message}`);
    return;
  }

  if (result.status !== 0) {
    fail(`${label}: ${renderedCommand} exited ${result.status}\n${tailOutput(output)}`);
    return;
  }

  pass(`${label}: ${renderedCommand} passed`);
  if (/PASS_WITH_WARNINGS|^WARN\b/mu.test(output)) {
    warn(`${label}: completed with documented warnings`);
  }
}

function checkSizeBudget(file, maxBytes, warnBytes, label) {
  if (!existsFile(file)) {
    fail(`${label}: missing ${file}`);
    return;
  }
  const size = statSync(absolute(file)).size;
  if (size > maxBytes) {
    fail(`${label}: ${file} is ${size} bytes, over ${maxBytes} byte readiness budget`);
    return;
  }
  pass(`${label}: ${file} is ${size} bytes within readiness budget ${maxBytes}`);
  if (size > warnBytes) warn(`${label}: ${file} is ${size} bytes, above advisory budget ${warnBytes}`);
}

function checkFlags(flags) {
  const mode = String(flags.mode || "");
  const robots = flags.robots || {};
  const sw = flags.sw || {};
  const edge = flags.edge || {};

  if (!["development", "staging", "production"].includes(mode)) {
    fail(`flags.json mode must be development, staging, or production; got ${mode || "missing"}`);
    return;
  }
  pass(`flags.json mode is ${mode}`);

  if (edge.canonicalHost === true && edge.httpsRedirect === true) pass("edge canonical host and HTTPS redirects are enabled");
  else fail("edge canonicalHost and httpsRedirect must stay enabled for crawlable production routes");

  if (mode !== "production") {
    if (robots.developmentLockdown !== true) fail(`${mode} mode must keep robots.developmentLockdown=true`);
    else pass(`${mode} mode keeps robots.developmentLockdown=true`);
    if (robots.blockSearchBots !== true) fail(`${mode} mode must keep robots.blockSearchBots=true`);
    else pass(`${mode} mode keeps search bot blocking active`);
    if (robots.blockAiBots !== true) fail(`${mode} mode must keep robots.blockAiBots=true`);
    else pass(`${mode} mode keeps AI/training bot blocking active`);
    if (sw.devAggressiveUpdate !== true) warn(`${mode} mode usually keeps sw.devAggressiveUpdate=true for fast artifact turnover`);
    else pass(`${mode} mode keeps service worker aggressive update active`);
    warn(`${mode} mode intentionally blocks production indexing until production flags are switched`);
    return;
  }

  if (robots.developmentLockdown === true) fail("production mode must not keep robots.developmentLockdown=true");
  else pass("production mode does not use development robots lockdown");
  if (robots.blockSearchBots === true) fail("production mode must not keep robots.blockSearchBots=true");
  else pass("production mode allows normal search crawlers");
  if (sw.devAggressiveUpdate === true) fail("production mode must not keep sw.devAggressiveUpdate=true");
  else pass("production mode does not use development service worker aggressive update");
}

for (const file of majorGuardFiles) assertFile(file, `major guard ${file}`);

const packageJson = parseJson("package.json");
const scripts = packageJson.scripts || {};
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const report = read("READINESS-85-REPORT.md");
const worker = read("worker.js");
const headers = read("_headers");
const robotsTxt = read("robots.txt");
const flags = parseJson("flags.json");
const indexXml = read("index.xml");
const landingHtml = read("landing.html");
const storeHtml = read("store.html");

assertIncludes(scripts["gaga:verify-85"] || "", "node qa/readiness-85-guard.mjs", "package.json wires gaga:verify-85");
assertIncludes(scripts["ci:85"] || "", "npm run ci:cloudflare", "package.json ci:85 runs ci:cloudflare");
assertIncludes(scripts["ci:85"] || "", "npm run gaga:verify-85", "package.json ci:85 runs readiness guard");
assertIncludes(scripts["ci:qa"] || "", "npm run gaga:verify-85", "ci:qa includes readiness guard");
assertIncludes(qaCommands, "npm run gaga:verify-85", "QA-COMMANDS documents readiness guard");
assertIncludes(qaCommands, "npm run ci:85", "QA-COMMANDS documents ci:85 aggregate");
assertIncludes(sourceOfTruth, "qa/readiness-85-guard.mjs", "SOURCE-OF-TRUTH documents readiness guard");
assertIncludes(sourceOfTruth, "READINESS-85-REPORT.md", "SOURCE-OF-TRUTH documents readiness report");

for (const marker of [
  "what is complete",
  "what is advisory",
  "known warnings",
  "intentionally deferred items",
  "what blocks production indexing",
  "what must be checked before production mode",
]) {
  assertIncludes(report.toLowerCase(), marker, `READINESS-85-REPORT documents ${marker}`);
}

checkFlags(flags);

assertIncludes(worker, "function developmentRobotsTag()", "Worker keeps explicit development robots tag");
assertIncludes(worker, "function productionIndexableHtmlRobotsTag()", "Worker keeps explicit production indexable tag");
assertIncludes(worker, "if (flags.mode !== \"production\") return developmentRobotsTag();", "Worker noindex lockdown is limited to non-production");
assertIncludes(worker, "[ROOT_LISTING_LEGACY_ROUTE, \"landing\", \"store\", \"post\", \"static-page\"]", "Worker production indexable route set includes root, landing, store, post, and page detail");
assertIncludes(worker, "return \"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1\";", "Worker production HTML routes can emit index/follow");
assertIncludes(worker, "function buildRobotsTxt(request, flags)", "Worker owns generated robots.txt");
assertIncludes(worker, "Sitemap: ${sitemapUrl}", "Worker robots.txt keeps sitemap visibility");
assertIncludes(worker, "diagnosticsFlagsForMode(flags, normalizeMode(url.searchParams.get(\"mode\")))", "Worker diagnostics can simulate production header policy");
assertIncludes(worker, "routePolicyPreview(targetUrl.toString(), previewFlags)", "Worker header diagnostics preview route policy");
assertIncludes(worker, "const LANDING_PUBLIC_PATH = \"/landing\";", "Worker route truth keeps /landing public path");
assertIncludes(worker, "if (path === \"/\") return ROOT_LISTING_LEGACY_ROUTE;", "Worker route truth keeps / as Blog/root listing");
assertIncludes(worker, "if (path === LANDING_PUBLIC_PATH || path === LANDING_INTERNAL_PATH) return \"landing\";", "Worker route truth keeps /landing as Home route");
assertNoPattern(worker, /textResponse\([^)]*<\s*(?:html|body|main|article)\b/iu, "Worker does not author healthy-route HTML UI via textResponse");
assertNoPattern(worker, /jsonResponse\([^)]*<\s*(?:html|body|main|article)\b/iu, "Worker does not author healthy-route HTML UI via jsonResponse");

assertIncludes(headers, "# PakRPP static asset headers — development-safe baseline", "_headers declares development-safe static policy");
assertIncludes(headers, "/robots.txt", "_headers includes robots.txt fallback policy");
assertPattern(headers, /\/robots\.txt[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow/i, "_headers noindexes static robots fallback in development");
assertPattern(headers, /\/__gg\/\*[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow/i, "_headers noindexes diagnostics/static __gg fallback");
assertIncludes(robotsTxt, "Sitemap: https://www.pakrpp.com/sitemap.xml", "static robots.txt keeps sitemap URL");
if (String(flags.mode || "") !== "production" && /User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(robotsTxt)) {
  warn("static robots.txt is permissive, but development route truth is Worker-generated robots.txt plus _headers noindex fallback");
}

assertIncludes(`${sourceOfTruth}\n${qaCommands}\n${report}`, "Home(/landing) -> Blog(/) -> current", "docs preserve breadcrumb route truth");
assertIncludes(indexXml, "<link expr:href='data:view.url.canonical ?: data:blog.homepageUrl' rel='canonical'/>", "Blogger view canonical remains source-owned");
assertIncludes(landingHtml, "https://www.pakrpp.com/landing", "landing static HTML carries canonical route identity");
assertIncludes(storeHtml, "https://www.pakrpp.com/store", "store static HTML carries canonical route identity");
assertNoPattern(indexXml, /data:schemaPosts/i, "Blog1-safe root schema does not use data:schemaPosts");
assertNoPattern(indexXml, /id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/i, "Blog1-safe root schema does not use filtered data:posts ItemList");
assertNoPattern(`${indexXml}\n${landingHtml}\n${storeHtml}`, /\b(?:ai-only|geo-only|llms\.txt)\b/i, "HTML templates do not add AI-only discoverability markup");

for (const [file, maxBytes, warnBytes, label] of sizeBudgets) {
  checkSizeBudget(file, maxBytes, warnBytes, label);
}
warn("Lighthouse remains advisory during development; scheduled workflow is non-blocking");

for (const [label, command, args] of commandChecks) {
  runCheck(label, command, args);
}

if (failures.length) {
  console.error("READINESS 85 GUARD CONTRACT_FAILURE");
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
  console.log("READINESS 85 GUARD PASS_WITH_WARNINGS");
} else {
  console.log("READINESS 85 GUARD PASS");
}
