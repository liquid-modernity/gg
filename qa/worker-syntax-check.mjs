#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const workerPath = path.resolve("src/worker.js");

let source = "";
try {
  source = readFileSync(workerPath, "utf8");
} catch (error) {
  console.error(`ERROR: unable to read ${workerPath}: ${error?.message || "unknown error"}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--check", "--input-type=module"], {
  input: source,
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});

if (result.status !== 0) {
  if (result.stderr) process.stderr.write(result.stderr);
  console.error(`ERROR: worker syntax validation failed for ${workerPath}`);
  process.exit(result.status || 1);
}

console.log(`WORKER SYNTAX OK: ${path.relative(process.cwd(), workerPath)}`);
