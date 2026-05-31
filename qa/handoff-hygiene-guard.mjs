#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const passes = [];

const REQUIRED_GITIGNORE_MARKERS = [
  ".DS_Store",
  "__MACOSX/",
  "._*",
  "node_modules/",
  ".cache/",
  ".tmp/",
  "*.log",
  ".env",
  ".env.*",
];

const REQUIRED_DEPLOYABLE_FILES = [
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-cloudflare.yml",
  ".github/workflows/lighthouse-ci.yml",
  ".gitignore",
  "package.json",
  "QA-COMMANDS.md",
];

const REQUIRED_SCRIPT_MAP = {
  "gaga:audit": "node qa/gaga-audit.mjs",
  "gaga:audit:pack": "node qa/package-audit.mjs",
  "gaga:handoff:pack": "node tools/handoff-archive.mjs",
  "gaga:handoff:audit": "npm run gaga:handoff:pack && npm run gaga:audit -- dist/gg-handoff.zip",
  "gaga:verify-handoff-hygiene": "node qa/handoff-hygiene-guard.mjs",
};

function absolute(file) {
  return path.resolve(ROOT, file);
}

function existsFile(file) {
  const st = statSync(absolute(file), { throwIfNoEntry: false });
  return Boolean(st && st.isFile());
}

function read(file) {
  if (!existsFile(file)) {
    fail(`missing required file: ${file}`);
    return "";
  }
  return readFileSync(absolute(file), "utf8");
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

function gitLsFiles(args = []) {
  try {
    return execFileSync("git", ["ls-files", "-z", ...args], {
      cwd: ROOT,
      encoding: "buffer",
      maxBuffer: 64 * 1024 * 1024,
    })
      .toString("utf8")
      .split("\0")
      .filter(Boolean);
  } catch (error) {
    fail(`git ls-files failed: ${error.message}`);
    return [];
  }
}

function isJunkEntry(entry) {
  const parts = String(entry || "")
    .split(/[\\/]+/)
    .filter(Boolean);
  return parts.some((part) => {
    const lower = part.toLowerCase();
    return (
      lower === "__macosx" ||
      part === ".DS_Store" ||
      part.startsWith("._") ||
      lower === "thumbs.db" ||
      lower === "desktop.ini"
    );
  });
}

const gitignore = read(".gitignore");
const packageJsonText = read("package.json");
const packageJson = packageJsonText ? JSON.parse(packageJsonText) : { scripts: {} };
const scripts = packageJson.scripts || {};
const qaCommands = read("QA-COMMANDS.md");
const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
const handoffPacker = read("tools/handoff-archive.mjs");
const handoffManifest = read("task/gg_95_percent_task_pack_v3/HANDOFF-MANIFEST.md");

for (const marker of REQUIRED_GITIGNORE_MARKERS) {
  assertIncludes(gitignore, marker, `.gitignore excludes ${marker}`);
}

for (const file of REQUIRED_DEPLOYABLE_FILES) {
  if (existsFile(file)) pass(`deployable repo file exists: ${file}`);
  else fail(`deployable repo file missing: ${file}`);
}
if (existsFile("package-lock.json")) pass("package-lock.json exists for npm ci reproducibility");
else fail("package-lock.json missing while package manager is npm");

if (existsFile("wrangler.jsonc") || existsFile("wrangler.toml")) {
  pass("wrangler config exists");
} else {
  fail("wrangler config missing");
}

if (
  existsFile("ARCHITECTURE-CONTRACT.md") ||
  existsFile("ARCHITECTURE.md") ||
  existsFile("SURFACE-CONTRACT.md")
) {
  pass("architecture contract or equivalent exists");
} else {
  fail("architecture contract or equivalent missing");
}

for (const [scriptName, expected] of Object.entries(REQUIRED_SCRIPT_MAP)) {
  if (scripts[scriptName] === expected) {
    pass(`package script ${scriptName} is mapped`);
  } else {
    fail(`package script ${scriptName} must be '${expected}'`);
  }
}

assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-handoff-hygiene", "ci:qa includes handoff hygiene guard");
assertIncludes(String(scripts["gaga:verify-asset-architecture"] || ""), "node qa/asset-architecture-guard.mjs", "asset parity guard script is mapped");
assertIncludes(String(scripts["ci:qa"] || ""), "npm run gaga:verify-asset-architecture", "ci:qa includes generated artifact parity guard");

for (const marker of [
  "Handoff And Archive Hygiene Set",
  "HANDOFF_FAILURE",
  "CONTRACT_FAILURE",
  "npm run gaga:handoff:pack",
  "npm run gaga:handoff:audit",
  "npm run gaga:audit:pack",
]) {
  assertIncludes(qaCommands, marker, `QA-COMMANDS documents ${marker}`);
}

for (const marker of [
  "qa/handoff-hygiene-guard.mjs",
  "tools/handoff-archive.mjs",
  "Handoff Archives",
]) {
  assertIncludes(sourceOfTruth, marker, `SOURCE-OF-TRUTH documents ${marker}`);
}

for (const marker of [
  "git",
  "ls-files",
  "zip",
  "-X",
  "unzip",
  "HANDOFF_FAILURE",
]) {
  assertIncludes(handoffPacker, marker, `handoff packer contains ${marker}`);
}

if (/Finder/i.test(handoffPacker)) {
  fail("handoff packer must not use Finder");
} else {
  pass("handoff packer avoids Finder packaging");
}

for (const marker of [
  "task pack only",
  "not a deployable repo archive",
]) {
  assertIncludes(handoffManifest, marker, `task pack manifest declares ${marker}`);
}

const packableJunk = [
  ...gitLsFiles(),
  ...gitLsFiles(["--others", "--exclude-standard"]),
].filter(isJunkEntry);
if (packableJunk.length) {
  fail(`packable OS junk must be absent: ${packableJunk.join(", ")}`);
} else {
  pass("packable OS junk is absent");
}

if (failures.length) {
  console.error("HANDOFF HYGIENE GUARD HANDOFF_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
console.log("HANDOFF HYGIENE GUARD PASS");
