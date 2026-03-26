#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const USAGE = `Usage:
  npm run gaga:audit:pack -- <task-id>
  npm run gaga:audit:pack -- <task-id> --zip dist/gg-audit.zip
  node qa/package-audit.mjs <task-id>
  node qa/package-audit.mjs <task-id> --zip dist/gg-audit.zip
  npm run gaga:audit:pack -- --latest

Requirements:
  - qa/audit-output/<task-id>.json must exist
  - the JSON task field must match the requested task id
  - the JSON must include a non-empty "zip_entries" array
  - the JSON must include workflow refs, live smoke refs, freeze note, and accepted limitations
  - every listed entry must exist locally
`;

function fail(message, code = 1) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function parseManifestFile(jsonPath) {
  try {
    return JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch {
    return null;
  }
}

function isPackableManifestCandidate(manifest) {
  if (!manifest || typeof manifest !== "object") return false;
  const task = String(manifest.task || "").trim();
  const zipEntries = Array.isArray(manifest.zip_entries) ? manifest.zip_entries : [];
  if (!task || !zipEntries.length) return false;
  const changedFiles = Array.isArray(manifest.changed_files) ? manifest.changed_files : [];
  if (!changedFiles.length) return false;
  return true;
}

function detectLatestTaskId() {
  const auditDir = path.resolve("qa/audit-output");
  if (!existsSync(auditDir)) {
    fail(`Missing audit output directory: ${auditDir}`);
  }

  const names = readdirSync(auditDir).filter((name) => name.endsWith(".json"));
  const candidates = [];

  for (const name of names) {
    const jsonPath = path.join(auditDir, name);
    const fileTaskId = name.replace(/\.json$/i, "").trim();
    if (!fileTaskId) continue;
    const st = statSync(jsonPath, { throwIfNoEntry: false });
    if (!st || !st.isFile()) continue;

    const manifest = parseManifestFile(jsonPath);
    if (!isPackableManifestCandidate(manifest)) continue;

    const taskId = String(manifest.task || "").trim();
    if (!taskId) continue;

    candidates.push({
      taskId: fileTaskId,
      manifestTask: taskId,
      jsonPath,
      mtimeMs: Number(st.mtimeMs || 0),
    });
  }

  if (!candidates.length) {
    fail(
      "No packable task manifest found in qa/audit-output. Provide explicit task id, e.g. npm run gaga:audit:pack -- <task-id>."
    );
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs || a.taskId.localeCompare(b.taskId));
  return candidates[0].taskId;
}

function parseArgs(argv) {
  let taskId = "";
  let zipPath = path.resolve("dist/gg-audit.zip");
  let latest = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--latest") {
      latest = true;
      continue;
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

  if (!taskId && !latest) {
    fail(
      `Task id is required. Refusing implicit latest-manifest packing.\n\n${USAGE}`
    );
  }
  if (!taskId && latest) {
    taskId = detectLatestTaskId();
    console.log(`INFO: Using latest manifest task '${taskId}' (--latest explicit).`);
  }
  return { taskId, zipPath, latest };
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

function canonicalTaskToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
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

function collectPackableManifests() {
  const auditDir = path.resolve("qa/audit-output");
  if (!existsSync(auditDir)) return [];

  const names = readdirSync(auditDir).filter((name) => name.endsWith(".json"));
  const out = [];
  for (const name of names) {
    const jsonPath = path.join(auditDir, name);
    const st = statSync(jsonPath, { throwIfNoEntry: false });
    if (!st || !st.isFile()) continue;

    const manifest = parseManifestFile(jsonPath);
    if (!isPackableManifestCandidate(manifest)) continue;

    const fileTaskId = name.replace(/\.json$/i, "").trim();
    const manifestTask = String(manifest.task || "").trim();
    if (!fileTaskId || !manifestTask) continue;

    out.push({
      fileTaskId,
      manifestTask,
      jsonPath,
    });
  }
  return out;
}

function resolveManifestPath(taskArg) {
  const raw = String(taskArg || "").trim();
  if (!raw) fail("Task id cannot be empty.");

  const directCandidates = [
    path.resolve(raw),
    path.resolve(`${raw}.json`),
    path.resolve("qa/audit-output", raw),
    path.resolve("qa/audit-output", `${raw}.json`),
  ];

  for (const candidate of directCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const token = canonicalTaskToken(raw);
  const matches = collectPackableManifests().filter((item) => {
    return (
      canonicalTaskToken(item.fileTaskId) === token ||
      canonicalTaskToken(item.manifestTask) === token
    );
  });

  if (matches.length === 1) {
    return matches[0].jsonPath;
  }
  if (matches.length > 1) {
    fail(
      `Ambiguous task id '${raw}'. Multiple manifests match: ${matches
        .map((m) => path.relative(process.cwd(), m.jsonPath))
        .join(", ")}`
    );
  }

  fail(
    `No manifest found for '${raw}'. Use explicit task id, e.g. TASK-P0.RELEASE-PIPELINE.CLOSURE.10X.`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const taskJsonPath = resolveManifestPath(args.taskId);
  if (!existsSync(taskJsonPath)) {
    fail(`Missing task manifest JSON: ${taskJsonPath}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(taskJsonPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${taskJsonPath}: ${error?.message || "parse error"}`);
  }

  const manifestTask = String(manifest?.task || "");
  if (!manifestTask) {
    fail(`Task manifest '${taskJsonPath}' is missing the 'task' field`);
  }
  const requestedToken = canonicalTaskToken(args.taskId);
  const manifestFileToken = canonicalTaskToken(path.basename(taskJsonPath, ".json"));
  if (requestedToken !== canonicalTaskToken(manifestTask) && requestedToken !== manifestFileToken) {
    fail(
      `Task manifest '${taskJsonPath}' mismatch: requested '${args.taskId}', saw '${manifestTask}'`
    );
  }

  const zipEntries = normalizeEntries(manifest?.zip_entries || []);
  if (!zipEntries.length) {
    fail(`Task manifest '${taskJsonPath}' is missing a non-empty zip_entries array`);
  }

  const changedFiles = Array.isArray(manifest?.changed_files) ? manifest.changed_files : [];
  if (!changedFiles.length) {
    fail(`Task manifest '${taskJsonPath}' is missing changed_files entries`);
  }
  if (!String(manifest?.workflows?.ci?.url || "") || !String(manifest?.workflows?.deploy?.url || "")) {
    fail(`Task manifest '${taskJsonPath}' is missing CI/Deploy workflow URLs`);
  }
  if (!String(manifest?.live_smoke?.log || "")) {
    fail(`Task manifest '${taskJsonPath}' is missing live smoke log path`);
  }
  if (!String(manifest?.live_smoke?.status || "")) {
    fail(`Task manifest '${taskJsonPath}' is missing live smoke status`);
  }
  if (!manifest?.freeze_mode?.enabled || !String(manifest?.freeze_mode?.note || "").trim()) {
    fail(`Task manifest '${taskJsonPath}' is missing freeze_mode confirmation`);
  }
  const acceptedLimitations = Array.isArray(manifest?.accepted_limitations)
    ? manifest.accepted_limitations.filter((item) => String(item || "").trim())
    : [];
  if (!acceptedLimitations.length) {
    fail(`Task manifest '${taskJsonPath}' is missing accepted_limitations entries`);
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
  console.log(`- task: ${manifestTask}`);
  console.log(`- manifest: ${path.relative(process.cwd(), taskJsonPath)}`);
  console.log(`- zip: ${args.zipPath}`);
  console.log(`- entries: ${expectedEntries.length}`);
  for (const entry of expectedEntries) {
    console.log(`  - ${entry}`);
  }
}

main();
