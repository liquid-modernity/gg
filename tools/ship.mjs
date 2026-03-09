#!/usr/bin/env node
/* tools/ship.mjs — one-command ship for vibe-coder
 * Usage:
 *   npm run ship
 *   npm run ship -- -m "TASK-0008A: css polish"
 *   npm run ship -- --verbose
 * Env:
 *   SHIP_MSG="..."  (default commit message)
 */

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

function tailLines(text, count) {
  const lines = String(text || "").split(/\r?\n/);
  const start = Math.max(0, lines.length - count);
  return lines.slice(start).join("\n");
}

function matchAny(text, patterns) {
  return patterns.some((re) => re.test(text));
}

function diagnose(label, output) {
  const out = output || "";
  if (/public\/assets\/v has \d+ release dirs \(max \d+\)/i.test(out)) {
    return {
      reason: "Release directory quota exceeded under public/assets/v.",
      steps: ["npm run ship (auto-heal prunes oldest release dirs before gates)"],
    };
  }
  if (out.includes("Release not aligned to HEAD")) {
    return {
      reason: "Mismatch between pinned release files and computed release id.",
      steps: ["npm run prep:release", "git status --porcelain", "git diff --name-only"],
    };
  }
  if (out.includes("Release requires clean tree")) {
    return {
      reason: "You ran release twice or tree became dirty before release.",
      steps: ["git status --porcelain", "npm run prep:release"],
    };
  }
  if (
    (label === "PUSH" || label === "RETRY_PUSH") &&
    matchAny(out, [/non-fast-forward/i, /fetch first/i, /failed to push/i, /rejected/i])
  ) {
    return {
      reason: "Remote main advanced.",
      steps: [
        "git pull --rebase",
        "npm run preflight:ship",
        "git add -A && git commit --amend --no-edit && git push",
      ],
    };
  }
  if (
    (label === "PUSH" || label === "RETRY_PUSH") &&
    matchAny(out, [
      /invalid username or token/i,
      /authentication failed/i,
      /password authentication is not supported/i,
      /could not read username/i,
      /device not configured/i,
    ])
  ) {
    return {
      reason: "GitHub authentication failed for HTTPS remote.",
      steps: [
        "gh auth login -h github.com -p https -w",
        "or rerun npm run ship and enter GitHub username + Personal Access Token when prompted",
        "then rerun: npm run ship",
      ],
    };
  }
  if (label === "STASH_POP" && matchAny(out, [/CONFLICT/i, /needs merge/i])) {
    return {
      reason: "Conflicts after stash pop.",
      steps: [
        "resolve conflicts",
        "git add -A && git rebase --continue",
        "npm run ship",
      ],
    };
  }
  return {
    reason: "Command failed.",
    steps: ["git status --porcelain", "git diff --name-only", "npm run ship"],
  };
}

function printFailure({ label, output }, verbose) {
  console.error(`\nFAILED AT: ${label}`);
  const diagnosis = diagnose(label, output);
  if (diagnosis.reason) {
    console.error(diagnosis.reason);
  }
  if (diagnosis.steps && diagnosis.steps.length) {
    console.error("NEXT STEPS:");
    diagnosis.steps.slice(0, 3).forEach((step) => {
      console.error(`- ${step}`);
    });
  }
  if (output) {
    if (verbose) {
      console.error("\nOUTPUT (full):\n" + output);
    } else {
      console.error("\nOUTPUT (last 40 lines):\n" + tailLines(output, 40));
    }
  }
}

function runStep(label, cmd) {
  process.stdout.write(`\n$ ${cmd}\n`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      shell: true,
      env: process.env,
      // Allow git/npm commands to ask credentials or confirmations in interactive shells.
      stdio: ["inherit", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ label, output });
      } else {
        reject({ label, code, output });
      }
    });
  });
}

function isInsideGit() {
  try {
    return sh("git rev-parse --is-inside-work-tree") === "true";
  } catch {
    return false;
  }
}

function currentBranch() {
  return sh("git rev-parse --abbrev-ref HEAD");
}

function isDirty() {
  return sh("git status --porcelain").length > 0;
}

function readReleaseIdFromCapsule() {
  try {
    const capsule = fs.readFileSync("docs/ledger/GG_CAPSULE.md", "utf8");
    const block = capsule.match(/AUTOGEN:BEGIN[\s\S]*?AUTOGEN:END/);
    const scope = block ? block[0] : capsule;
    const match = scope.match(/RELEASE_ID:\s*([A-Za-z0-9._-]+)/);
    if (match) {
      return match[1];
    }
  } catch {}

  try {
    const xml = fs.readFileSync("index.prod.xml", "utf8");
    const match = xml.match(/\/assets\/v\/([A-Za-z0-9._-]+)\//);
    if (match) {
      return match[1];
    }
  } catch {}

  return "";
}

function parseArgs() {
  const args = process.argv.slice(2);
  let msg = process.env.SHIP_MSG || "release: update artifacts";
  let verbose = false;
  let maxReleaseDirs = Number(process.env.SHIP_MAX_RELEASE_DIRS || 5);
  if (!Number.isFinite(maxReleaseDirs) || maxReleaseDirs < 1) {
    maxReleaseDirs = 5;
  }
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-m" || args[i] === "--message") && args[i + 1]) {
      msg = args[i + 1];
      i++;
      continue;
    }
    if (args[i] === "--verbose") {
      verbose = true;
    }
    if (args[i] === "--max-release-dirs" && args[i + 1]) {
      const parsed = Number(args[i + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        maxReleaseDirs = parsed;
      }
      i++;
      continue;
    }
  }
  return { msg, verbose, maxReleaseDirs };
}

function ensureNoMergeInProgress() {
  // If rebase/merge in progress, bail
  try {
    sh("git rev-parse -q --verify REBASE_HEAD");
    throw new Error("Rebase in progress. Resolve it first, then re-run npm run ship.");
  } catch {}
  try {
    sh("git rev-parse -q --verify MERGE_HEAD");
    throw new Error("Merge in progress. Resolve it first, then re-run npm run ship.");
  } catch {}
}

async function stageAndCommit(msg, amend, label, verbose) {
  try {
    await runStep(label, "git add -A");
  } catch (err) {
    printFailure(err, verbose);
    process.exit(1);
  }
  if (!isDirty()) {
    console.log("Nothing to commit.");
    return null;
  }
  const cmd = amend
    ? "git commit --amend --no-edit"
    : `git commit -m "${msg.replace(/"/g, '\\"')}"`;
  try {
    await runStep(label, cmd);
  } catch (err) {
    printFailure(err, verbose);
    process.exit(1);
  }
  try {
    return sh("git rev-parse --short HEAD");
  } catch {
    return null;
  }
}

async function tryPush(label, pushCmd) {
  try {
    await runStep(label, pushCmd);
    return { ok: true };
  } catch (err) {
    return { ok: false, err };
  }
}

function listReleaseDirs() {
  const base = path.resolve("public/assets/v");
  if (!fs.existsSync(base)) return [];
  const dirs = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const full = path.join(base, entry.name);
      let mtimeMs = 0;
      try {
        mtimeMs = fs.statSync(full).mtimeMs;
      } catch {}
      return { name: entry.name, full, mtimeMs };
    });
  dirs.sort((a, b) => b.mtimeMs - a.mtimeMs || b.name.localeCompare(a.name));
  return dirs;
}

function autoHealReleaseDirs(maxKeep) {
  const dirs = listReleaseDirs();
  if (dirs.length <= maxKeep) {
    console.log(`AUTO_HEAL: release dirs ${dirs.length}/${maxKeep} OK`);
    return [];
  }

  const keep = new Set();
  const pinned = readReleaseIdFromCapsule();
  if (pinned) keep.add(pinned);

  for (const dir of dirs) {
    if (keep.size >= maxKeep) break;
    keep.add(dir.name);
  }

  const toRemove = dirs.filter((dir) => !keep.has(dir.name));
  for (const dir of toRemove) {
    fs.rmSync(dir.full, { recursive: true, force: true });
  }

  if (toRemove.length) {
    console.log(
      `AUTO_HEAL: pruned ${toRemove.length} old release dir(s): ${toRemove.map((d) => d.name).join(", ")}`
    );
  }
  return toRemove.map((d) => d.name);
}

async function main() {
  const { msg, verbose, maxReleaseDirs } = parseArgs();
  const pullRebaseCmd = (process.env.SHIP_PULL_REBASE_CMD || "git pull --rebase").trim();
  const pushCmd = (process.env.SHIP_PUSH_CMD || "git push").trim();
  const preflightCmd = (process.env.SHIP_PREFLIGHT_CMD || "npm run preflight:ship").trim();

  if (!pullRebaseCmd) {
    console.error("ERROR: SHIP_PULL_REBASE_CMD resolved to empty command.");
    process.exit(1);
  }
  if (!pushCmd) {
    console.error("ERROR: SHIP_PUSH_CMD resolved to empty command.");
    process.exit(1);
  }
  if (!preflightCmd) {
    console.error("ERROR: SHIP_PREFLIGHT_CMD resolved to empty command.");
    process.exit(1);
  }

  if (!isInsideGit()) {
    console.error("ERROR: Not inside a git repository.");
    process.exit(1);
  }

  ensureNoMergeInProgress();

  const branch = currentBranch();
  if (branch !== "main") {
    console.error(`ERROR: You are on branch "${branch}". Switch to main first.`);
    process.exit(1);
  }

  let stashed = false;
  let releaseCommitSha = null;

  // 1) Autostash if dirty, so pull --rebase can run
  if (isDirty()) {
    try {
      await runStep("AUTOSTASH", 'git stash push -u -m "ship-autostash"');
      stashed = true;
    } catch (err) {
      printFailure(err, verbose);
      process.exit(1);
    }
  }

  // 2) Pull --rebase
  try {
    await runStep("PULL_REBASE", pullRebaseCmd);
  } catch (err) {
    printFailure(err, verbose);
    process.exit(1);
  }

  // 3) Pop stash back (if any)
  if (stashed) {
    try {
      await runStep("STASH_POP", "git stash pop");
    } catch (err) {
      printFailure(err, verbose);
      process.exit(1);
    }
  }

  // 3.5) Auto-heal release directory quota before checks/build.
  autoHealReleaseDirs(maxReleaseDirs);

  // 4) Final preflight gate before any commit/push side effects.
  try {
    await runStep("PREFLIGHT_FINAL", preflightCmd);
  } catch (err) {
    printFailure(err, verbose);
    process.exit(1);
  }

  // 5) Commit release artifacts (and any staged work) only after final preflight is green.
  releaseCommitSha = await stageAndCommit(msg, false, "COMMIT", verbose);

  // 6) Push; if rejected, retry once with rebase + preflight + amend + push.
  const pushResult = await tryPush("PUSH", pushCmd);
  if (pushResult.ok) {
    // continue to summary
  } else {
    const pushOutput = (pushResult.err && pushResult.err.output) || "";
    if (!matchAny(pushOutput, [/non-fast-forward/i, /fetch first/i, /failed to push/i, /rejected/i])) {
      printFailure(pushResult.err, verbose);
      process.exit(1);
    }

    console.log("\n⚠️ push rejected. Retrying once (rebase + preflight:ship + amend) ...");
    ensureNoMergeInProgress();
    try {
      await runStep("RETRY_PULL_REBASE", pullRebaseCmd);
    } catch (err) {
      printFailure(err, verbose);
      process.exit(1);
    }
    autoHealReleaseDirs(maxReleaseDirs);
    try {
      await runStep("RETRY_PREFLIGHT_FINAL", preflightCmd);
    } catch (err) {
      printFailure(err, verbose);
      process.exit(1);
    }

    if (isDirty()) {
      const amendedSha = await stageAndCommit(msg, true, "RETRY_AMEND", verbose);
      if (amendedSha) {
        releaseCommitSha = amendedSha;
      }
    }

    const retryPush = await tryPush("RETRY_PUSH", pushCmd);
    if (!retryPush.ok) {
      printFailure(retryPush.err, verbose);
      process.exit(1);
    }
  }

  const releaseId = readReleaseIdFromCapsule() || "unknown";
  const finalStatus = sh("git status --porcelain");
  const finalClean = finalStatus.length === 0;

  console.log("\nSHIP SUMMARY");
  console.log(`RELEASE_ID: ${releaseId}`);
  console.log(`RELEASE_COMMIT: ${releaseCommitSha || "none"}`);
  console.log(`FINAL_TREE: ${finalClean ? "clean" : "dirty"}`);

  if (!finalClean) {
    if (finalStatus) {
      console.error("\nFINAL STATUS (porcelain):");
      console.error(finalStatus);
    }
    console.error("ERROR: ship ended with dirty working tree.");
    process.exit(1);
  }

  console.log("\n✅ ship: done");
}

main();
