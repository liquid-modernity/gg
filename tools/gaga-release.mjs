#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const DEFAULT_COMMIT_MESSAGE = "chore(release): ship latest GG changes";

const usage = `Usage:
  node tools/gaga-release.mjs preflight
  node tools/gaga-release.mjs ship [--dry-run] [--message "<commit message>"]

Local flow stays lightweight:
- build Blogger artifact
- run lightweight preflight
- commit/push

GitHub Actions handles Cloudflare deploy and Lighthouse.`;

function fail(message) {
  throw new Error(message);
}

function run(cmd, args, { inherit = false, allowFailure = false } = {}) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    fail(`unable to run "${cmd}": ${result.error.message}`);
  }

  if (!allowFailure && result.status !== 0) {
    if (!inherit) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    fail(`command failed (${cmd} ${args.join(" ")})`);
  }

  return result;
}

function runGit(args, options) {
  return run("git", args, options);
}

function readGit(args) {
  return runGit(args).stdout.trim();
}

function readGitRaw(args) {
  return runGit(args).stdout;
}

function assertGitInstalled() {
  runGit(["--version"]);
}

function assertOnMainBranch() {
  const branch = readGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== "main") {
    fail(`current branch must be "main" (found "${branch}")`);
  }
}

function assertOriginExists() {
  const remote = readGit(["remote", "get-url", "origin"]);
  if (!remote) {
    fail('git remote "origin" is not configured');
  }
  return remote;
}

function hasStagedChanges() {
  const result = runGit(["diff", "--cached", "--quiet"], { allowFailure: true });
  if (result.status === 0) return false;
  if (result.status === 1) return true;
  fail("unable to evaluate staged changes");
}

function readStatusLines() {
  const status = readGitRaw(["status", "--porcelain=v1", "--untracked-files=all"]);
  return status.split(/\r?\n/).filter(Boolean);
}

function classifyStatusLines(lines) {
  const staged = [];
  const unstaged = [];

  for (const line of lines) {
    const indexState = line[0] || " ";
    const worktreeState = line[1] || " ";
    if (indexState !== " " && indexState !== "?") {
      staged.push(line);
    }
    if (worktreeState !== " " || line.startsWith("??")) {
      unstaged.push(line);
    }
  }

  return { staged, unstaged };
}

function printStatusLines(label, lines) {
  if (!lines.length) return;
  console.error(label);
  for (const line of lines) {
    console.error(`  ${line}`);
  }
}

function assertSafeStagedShip() {
  const status = classifyStatusLines(readStatusLines());

  if (!status.staged.length && !status.unstaged.length) {
    return "empty";
  }

  if (status.unstaged.length) {
    console.error("Release is staged-only. Refusing to auto-stage working-tree changes.");
    printStatusLines("Unstaged/untracked changes:", status.unstaged);
    console.error("");
    console.error("Fix:");
    console.error("  1. Stage only intended release files: git add <path> ...");
    console.error("  2. Remove, ignore, or stash unrelated files.");
    console.error("  3. Re-run: npm run gaga");
    fail("unsafe dirty worktree for staged-only release");
  }

  if (!hasStagedChanges()) {
    fail("no staged changes to ship. Stage intended files first: git add <path> ...");
  }

  return "staged";
}

function parseGithubActionsUrl(remoteUrl) {
  const trimmed = String(remoteUrl || "").trim();
  if (!trimmed) return null;

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}/${sshMatch[2]}/actions`;
  }

  const httpsMatch = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/i);
  if (httpsMatch) {
    return `https://github.com/${httpsMatch[1]}/${httpsMatch[2]}/actions`;
  }

  return null;
}

function runTemplatePack() {
  run(process.execPath, ["tools/template-pack.mjs"], { inherit: true });
}

function runPreflight() {
  run(process.execPath, ["tools/preflight.mjs"], { inherit: true });
}

function parseOptions(argv) {
  const options = {
    dryRun: false,
    message: process.env.GAGA_COMMIT_MESSAGE || "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--message" || arg === "-m") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        fail("missing value for --message");
      }
      options.message = value;
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(usage);
      process.exit(0);
    }
    fail(`unknown option: ${arg}\n\n${usage}`);
  }

  return options;
}

function printStagedChanges() {
  const staged = readGit(["diff", "--cached", "--name-status"]);
  if (!staged) return;
  console.log("Staged changes selected for release:");
  console.log(staged);
}

function stageCommitAndPush({ dryRun, message, originUrl }) {
  const commitMessage = (message || "").trim() || DEFAULT_COMMIT_MESSAGE;
  const shipState = assertSafeStagedShip();

  if (shipState === "empty") {
    console.log("No changes detected. Nothing to ship.");
    return;
  }

  runTemplatePack();
  runPreflight();
  printStagedChanges();

  if (dryRun) {
    console.log("Dry run complete. Staged changes are ready to ship but were not committed/pushed.");
    return;
  }

  runGit(["commit", "-m", commitMessage], { inherit: true });
  runGit(["push", "origin", "main"], { inherit: true });

  console.log("");
  console.log("Push complete.");
  console.log("GitHub Actions CI, Cloudflare deploy, and Lighthouse stay in the cloud path.");
  const actionsUrl = parseGithubActionsUrl(originUrl);
  if (actionsUrl) {
    console.log(`Inspect runs: ${actionsUrl}`);
  } else {
    console.log("Inspect runs: GitHub repository > Actions");
  }
}

function main() {
  const [, , subcommand = "ship", ...argv] = process.argv;

  if (subcommand === "--help" || subcommand === "-h") {
    console.log(usage);
    return;
  }

  if (subcommand === "preflight") {
    runTemplatePack();
    runPreflight();
    return;
  }

  if (subcommand !== "ship") {
    fail(`unknown subcommand: ${subcommand}\n\n${usage}`);
  }

  assertGitInstalled();
  assertOnMainBranch();
  const originUrl = assertOriginExists();
  const options = parseOptions(argv);

  stageCommitAndPush({
    dryRun: options.dryRun,
    message: options.message,
    originUrl,
  });
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`gaga-release: ${message}`);
  process.exit(1);
}
