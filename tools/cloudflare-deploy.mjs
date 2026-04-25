#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const [, , mode = "deploy"] = process.argv;

if (mode !== "deploy" && mode !== "dry-run") {
  console.error("usage: node tools/cloudflare-deploy.mjs <deploy|dry-run>");
  process.exit(1);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`cloudflare-deploy: unable to run ${cmd}: ${result.error.message}`);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

run(process.execPath, [path.resolve("tools/cloudflare-prepare.mjs")]);

const wranglerBin = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler"
);

const args = ["deploy", "--config", "wrangler.jsonc"];
if (mode === "dry-run") {
  args.push("--dry-run");
}

run(wranglerBin, args);
