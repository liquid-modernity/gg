#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const USAGE = `Usage:
  npm run gaga:audit:pack -- <task-id>
  npm run gaga:audit:pack -- <task-id> --zip dist/gg-audit.zip

Requirements:
  - qa/audit-output/<task-id>.json must exist
  - the JSON must include a non-empty "zip_entries" array
  - every listed entry must exist locally
`;

function fail(message, code = 1) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  let taskId = "";
  let zipPath = path.resolve("dist/gg-audit.zip");

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--zip") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) fail("--zip requires a value");
      zipPath = path.resolve(next);
      i += 1;
      continue;
    }
    if (arg.startsWith("--")) fail(`Unknown flag '${arg}'\n\n${USAGE}`);
    if (taskId) fail(`Multiple task ids provided ('${taskId}' and '${arg}')`);
    taskId = arg.trim();
  }

  if (!taskId) fail(`Task id is required.\n\n${USAGE}`);
  return { taskId, zipPath };
}

function normalizeEntries(entries) {
  const seen = new Set();
  const out = [];
  for (const raw of entries) {
    const value = String(raw || "").trim().replace(/^\.\/+/, "");
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function listZipEntries(zipPath) {
  const out = execFileSync("unzip", ["-Z", "-1", zipPath], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const taskJsonPath = path.resolve(`qa/audit-output/${args.taskId}.json`);
  if (!existsSync(taskJsonPath)) {
    fail(`Missing task manifest JSON: ${taskJsonPath}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(taskJsonPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${taskJsonPath}: ${error?.message || "parse error"}`);
  }

  const zipEntries = normalizeEntries(manifest?.zip_entries || []);
  if (!zipEntries.length) {
    fail(`Task manifest '${taskJsonPath}' is missing a non-empty zip_entries array`);
  }

  const missingLocal = zipEntries.filter((entry) => !existsSync(path.resolve(entry)));
  if (missingLocal.length) {
    fail(`Task ZIP entries missing locally: ${missingLocal.join(", ")}`);
  }

  mkdirSync(path.dirname(args.zipPath), { recursive: true });
  rmSync(args.zipPath, { force: true });

  execFileSync("zip", ["-q", args.zipPath, ...zipEntries], {
    stdio: "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });

  execFileSync("unzip", ["-t", args.zipPath], {
    stdio: "inherit",
    maxBuffer: 64 * 1024 * 1024,
  });

  const actualEntries = listZipEntries(args.zipPath);
  const expectedEntries = [...zipEntries].sort();

  const missingInZip = expectedEntries.filter((entry) => !actualEntries.includes(entry));
  const extraInZip = actualEntries.filter((entry) => !expectedEntries.includes(entry));

  if (missingInZip.length || extraInZip.length) {
    fail(
      `ZIP entry mismatch. Missing: ${missingInZip.join(", ") || "none"} | Extra: ${
        extraInZip.join(", ") || "none"
      }`
    );
  }

  console.log(`AUDIT PACK OK`);
  console.log(`- task: ${args.taskId}`);
  console.log(`- zip: ${args.zipPath}`);
  console.log(`- entries: ${expectedEntries.length}`);
  for (const entry of expectedEntries) {
    console.log(`  - ${entry}`);
  }
}

main();
