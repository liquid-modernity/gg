#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const USAGE = `Usage:
  node tools/handoff-archive.mjs
  node tools/handoff-archive.mjs --zip dist/gg-handoff.zip

Creates a deployable repo archive from git-visible source files. Dotfiles and
dotfolders are preserved; ignored local junk is excluded.
`;

const REQUIRED_GROUPS = [
  { label: ".github/workflows/ci.yml", paths: [".github/workflows/ci.yml"] },
  {
    label: ".github/workflows/deploy-cloudflare.yml",
    paths: [".github/workflows/deploy-cloudflare.yml"],
  },
  {
    label: ".github/workflows/lighthouse-ci.yml",
    paths: [".github/workflows/lighthouse-ci.yml"],
  },
  { label: ".gitignore", paths: [".gitignore"] },
  { label: "package.json", paths: ["package.json"] },
  { label: "package-lock.json", paths: ["package-lock.json"] },
  { label: "QA-COMMANDS.md", paths: ["QA-COMMANDS.md"] },
  {
    label: "architecture contract",
    paths: ["ARCHITECTURE-CONTRACT.md", "ARCHITECTURE.md", "SURFACE-CONTRACT.md"],
  },
  { label: "wrangler config", paths: ["wrangler.jsonc", "wrangler.toml"] },
];

function fail(message) {
  console.error(`HANDOFF_FAILURE: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let zipPath = path.resolve(ROOT, "dist/gg-handoff.zip");

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--zip") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) fail("--zip requires a value");
      zipPath = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    fail(`unknown argument: ${arg}`);
  }

  return { zipPath };
}

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    const detail =
      String(error?.stderr || "").trim() ||
      String(error?.stdout || "").trim() ||
      error.message;
    fail(`${command} ${args.join(" ")} failed: ${detail}`);
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

function listPackableFiles() {
  const raw = execFileSync("git", ["ls-files", "-z"], {
    cwd: ROOT,
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });
  const tracked = raw
    .toString("utf8")
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const untrackedRaw = execFileSync("git", ["ls-files", "-z", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });
  const untracked = untrackedRaw
    .toString("utf8")
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return [...new Set([...tracked, ...untracked])]
    .filter((entry) => {
      const absolute = path.resolve(ROOT, entry);
      const st = statSync(absolute, { throwIfNoEntry: false });
      return st && st.isFile();
    })
    .sort();
}

function assertRequired(entries) {
  const entrySet = new Set(entries);
  const missing = REQUIRED_GROUPS.filter(
    (group) => !group.paths.some((candidate) => entrySet.has(candidate))
  );
  if (missing.length) {
    fail(`deployable archive source is missing: ${missing.map((item) => item.label).join(", ")}`);
  }
}

function listZipEntries(zipPath) {
  const out = run("unzip", ["-Z", "-1", zipPath]);
  return out
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .sort();
}

function main() {
  const { zipPath } = parseArgs(process.argv.slice(2));
  const entries = listPackableFiles();
  if (!entries.length) fail("git ls-files returned no packable files");

  const junkSource = entries.filter(isJunkEntry);
  if (junkSource.length) {
    fail(`packable macOS/OS junk must be removed before packing: ${junkSource.join(", ")}`);
  }

  assertRequired(entries);

  mkdirSync(path.dirname(zipPath), { recursive: true });
  rmSync(zipPath, { force: true });

  run("zip", ["-q", "-X", zipPath, "-@"], {
    input: `${entries.join("\n")}\n`,
    stdio: ["pipe", "ignore", "pipe"],
  });
  run("unzip", ["-t", zipPath], { stdio: ["ignore", "ignore", "pipe"] });

  const zipEntries = listZipEntries(zipPath);
  const junkZip = zipEntries.filter(isJunkEntry);
  if (junkZip.length) fail(`archive contains macOS/OS junk: ${junkZip.join(", ")}`);

  assertRequired(zipEntries);

  console.log("HANDOFF PACK PASS");
  console.log(`- zip: ${zipPath}`);
  console.log(`- entries: ${zipEntries.length}`);
}

main();
