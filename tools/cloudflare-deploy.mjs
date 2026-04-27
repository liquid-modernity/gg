#!/usr/bin/env node

/* tools/cloudflare-deploy.mjs — GG Cloudflare deploy wrapper v10.2
 *
 * Usage:
 *   node tools/cloudflare-deploy.mjs deploy
 *   node tools/cloudflare-deploy.mjs dry-run
 *
 * This script prepares the Cloudflare bundle, runs preflight, then invokes Wrangler.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const usage = "usage: node tools/cloudflare-deploy.mjs <deploy|dry-run>";
const [, , mode = "deploy"] = process.argv;

if (mode !== "deploy" && mode !== "dry-run") {
  console.error(usage);
  process.exit(1);
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: options.capture ? "utf8" : undefined,
    env: process.env,
  });

  if (result.error) {
    console.error(`cloudflare-deploy: unable to run ${cmd}: ${result.error.message}`);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    if (options.capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    process.exit(result.status);
  }

  return result;
}

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(path.resolve(relativePath), "utf8"));
  } catch {
    return null;
  }
}

function assertExists(relativePath) {
  if (!existsSync(path.resolve(relativePath))) {
    console.error(`cloudflare-deploy: missing expected path: ${relativePath}`);
    process.exit(1);
  }
}

console.log(`CLOUDFLARE DEPLOY mode=${mode}`);

run(process.execPath, [path.resolve("tools/preflight.mjs")]);
run(process.execPath, [path.resolve("tools/cloudflare-prepare.mjs")]);

assertExists(".cloudflare-build/worker.js");
assertExists(".cloudflare-build/public/sw.js");
assertExists(".cloudflare-build/public/offline.html");
assertExists(".cloudflare-build/public/manifest.webmanifest");
assertExists(".cloudflare-build/public/__gg/flags.json");
assertExists(".cloudflare-build/public/gg-flags.json");
assertExists(".cloudflare-build/public/flags.json");

const flags = readJson(".cloudflare-build/public/__gg/flags.json");
if (flags) {
  console.log(`prepared_flags_mode=${flags.mode}`);
}

const wranglerBin = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler"
);

if (!existsSync(wranglerBin)) {
  console.error("cloudflare-deploy: local Wrangler not found. Run npm install or use npx wrangler manually.");
  process.exit(1);
}

const args = ["deploy", "--config", "wrangler.jsonc"];
if (mode === "dry-run") {
  args.push("--dry-run");
}

run(wranglerBin, args);

console.log("CLOUDFLARE DEPLOY COMPLETE");
console.log("Verify live Worker ownership:");
console.log("  curl -I https://www.pakrpp.com/__gg/health");
console.log("  curl -I https://www.pakrpp.com/view");
console.log("Expected headers:");
console.log("  X-GG-Worker: edge-governance-v10.2");
console.log("  X-GG-Edge-Mode: development|staging|production");
