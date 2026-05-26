#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

function absolute(file) {
  return path.resolve(ROOT, file);
}

function existsFile(file) {
  return existsSync(absolute(file)) && statSync(absolute(file)).isFile();
}

function existsPath(file) {
  return existsSync(absolute(file));
}

function read(file) {
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute(file), "utf8");
}

function gitLsFiles(args = []) {
  try {
    return execFileSync("git", ["ls-files", ...args], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split(/\r?\n/u)
      .filter(Boolean);
  } catch (error) {
    fail(`git ls-files failed: ${error.message}`);
    return [];
  }
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function assertIncludes(source, needle, label) {
  if (source.includes(needle)) pass(label);
  else fail(`${label}: missing ${needle}`);
}

function assertNoPattern(source, pattern, label) {
  if (pattern.test(source)) fail(label);
  else pass(label);
}

const repoMap = read("REPO-STRUCTURE.md");
const report = read("REPO-TIDY-REPORT.md");
const gitignore = read(".gitignore");
const packageJsonText = read("package.json");
const packageJson = packageJsonText ? JSON.parse(packageJsonText) : { scripts: {} };
const scripts = packageJson.scripts || {};
const ciGuard = read("qa/ci-reconciliation-guard.mjs");
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const indexXml = read("index.xml");

for (const marker of [
  "`src/`",
  "`assets/`",
  "`__gg/`",
  "`dist/`",
  "`.cloudflare-build/`",
  "`store/`",
  "`registry/`",
  "`qa/`",
  "`tools/`",
  "`task/`",
  "root reports and maintenance docs",
]) {
  assertIncludes(repoMap, marker, `REPO-STRUCTURE classifies ${marker}`);
}

for (const marker of [
  "Before status summary",
  "After status summary",
  "Moved Files",
  "Deleted Files",
  ".gitignore Changes",
  "Runtime Folders Intentionally Not Moved",
  "QA Commands",
]) {
  assertIncludes(report, marker, `REPO-TIDY-REPORT documents ${marker}`);
}

for (const marker of [".DS_Store", "__MACOSX/", "*.zip", "*.bak", "*.bak.*"]) {
  assertIncludes(gitignore, marker, `.gitignore ignores ${marker}`);
}

const trackedFiles = gitLsFiles();
const trackedClutter = trackedFiles.filter((file) =>
  /(^|\/)\.DS_Store$/u.test(file) ||
  file.startsWith("__MACOSX/") ||
  /(^|\/)__MACOSX\//u.test(file) ||
  /(^|\/)[^/]+\.(?:bak|bak\.[^/]+|tmp|old)$/iu.test(file) ||
  /(^|\/)[^/]+\.zip$/iu.test(file)
);
if (trackedClutter.length) {
  fail(`tracked OS/archive/backup clutter must be absent: ${trackedClutter.join(", ")}`);
} else {
  pass("tracked OS/archive/backup clutter is absent");
}

const staleDeletedFiles = [
  ["_headers", ".bak.", "20260504-164650"].join(""),
  ["_headers", ".bak.clean-", "20260504-165904"].join(""),
  ["index", ".html", ".css", ".js", ".xml"].join(""),
];

for (const stale of staleDeletedFiles) {
  if (existsPath(stale) || trackedFiles.includes(stale)) fail(`known stale file returned: ${stale}`);
  else pass(`known stale file is absent: ${stale}`);
}

for (const runtimePath of [
  "src",
  "assets",
  "__gg",
  "dist",
  "store",
  "qa",
  "tools",
  "registry",
  "index.xml",
  "landing.html",
  "store.html",
  "worker.js",
  "_headers",
  "robots.txt",
  "manifest.webmanifest",
]) {
  if (existsPath(runtimePath)) pass(`runtime path remains in place: ${runtimePath}`);
  else fail(`runtime path missing or moved: ${runtimePath}`);
}

if (scripts["gaga:verify-repo-structure-tidy"] === "node qa/repo-structure-tidy-guard.mjs") {
  pass("package script gaga:verify-repo-structure-tidy is wired");
} else {
  fail("package.json missing gaga:verify-repo-structure-tidy script");
}
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-repo-structure-tidy", "ci:qa includes repo tidy guard");
assertIncludes(ciGuard, "qa/repo-structure-tidy-guard.mjs", "CI reconciliation classifies repo tidy guard");
assertIncludes(qaCommands, "npm run gaga:verify-repo-structure-tidy", "QA-COMMANDS documents repo tidy guard");
assertIncludes(qaCommands, "qa/repo-structure-tidy-guard.mjs", "QA-COMMANDS lists repo tidy guard");
assertIncludes(sourceOfTruth, "REPO-STRUCTURE.md", "SOURCE-OF-TRUTH documents repo map");
assertIncludes(sourceOfTruth, "REPO-TIDY-REPORT.md", "SOURCE-OF-TRUTH documents repo tidy report");
assertIncludes(sourceOfTruth, "qa/repo-structure-tidy-guard.mjs", "SOURCE-OF-TRUTH documents repo tidy guard");

assertNoPattern(indexXml, /data:schemaPosts/, "Blog1-safe schema: data:schemaPosts is absent");
assertNoPattern(
  indexXml,
  /id=['"]gg-root-jsonld['"][\s\S]*?data:posts\s+filter\s*\(p\s*=&gt;/i,
  "Blog1-safe schema: root schema has no filtered data:posts loop"
);

if (failures.length) {
  console.error("REPO STRUCTURE TIDY GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("REPO STRUCTURE TIDY GUARD PASS");
