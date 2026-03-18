#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const USAGE = `Usage:
  npm run gaga:audit -- <path-to-zip>
  npm run gaga:audit -- --out qa/audit-output/custom-name <path-to-zip>
  npm run gaga:audit -- --json <path-to-zip>
  npm run gaga:audit -- --warn-only <path-to-zip>

Default behavior:
  - Fail non-zero when critical contract violations are found.
  - Write report artifacts to qa/audit-output/*.md and *.json.

Default ZIP fallback (if no ZIP path arg):
  1) dist/gg-audit.zip
  2) qa/audit-input/zip-audit.latest.zip
  3) qa/audit-input/latest.zip
  4) if exactly one ZIP exists under dist/, use it
`;

const CRITICAL_TARGETS = [
  "package.json",
  "package-lock.json",
  "wrangler.jsonc",
  "index.prod.xml",
  "src/worker.js",
  "public/manifest.webmanifest",
  "public/_headers",
  "public/robots.txt",
  "public/llms.txt",
];

const PATH_EXT_RE =
  /\.(mjs|cjs|js|sh|bash|zsh|json|jsonc|xml|yml|yaml|txt|webmanifest|md)$/i;

const NODE_OPTIONS_WITH_VALUE = new Set([
  "-e",
  "--eval",
  "-p",
  "--print",
  "-r",
  "--require",
  "--loader",
  "--import",
  "-C",
  "--conditions",
  "--input-type",
  "--redirect-warnings",
  "--test-reporter",
  "--watch-path",
]);

const SHELL_OPTIONS_WITH_VALUE = new Set([
  "--rcfile",
  "--init-file",
  "--pretty-print",
]);

function fail(message, code = 1) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  let zipArg = "";
  let outPrefix = path.resolve("qa/audit-output/zip-audit.latest");
  let jsonToStdout = false;
  let warnOnly = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--json") {
      jsonToStdout = true;
      continue;
    }
    if (arg === "--warn-only") {
      warnOnly = true;
      continue;
    }
    if (arg === "--out") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        fail("--out requires a value");
      }
      i += 1;
      outPrefix = normalizeOutPrefix(next);
      continue;
    }
    if (arg.startsWith("--")) {
      fail(`Unknown flag '${arg}'\n\n${USAGE}`);
    }
    if (zipArg) {
      fail(`Multiple ZIP paths provided ('${zipArg}' and '${arg}')\n\n${USAGE}`);
    }
    zipArg = arg;
  }

  if (!zipArg) {
    zipArg = resolveDefaultZip();
  }
  if (!zipArg) {
    fail(`ZIP path is required.\n\n${USAGE}`);
  }

  return {
    zipPath: path.resolve(zipArg),
    outPrefix,
    jsonToStdout,
    warnOnly,
  };
}

function normalizeOutPrefix(input) {
  let out = path.resolve(input);
  if (out.endsWith(".json")) out = out.slice(0, -5);
  if (out.endsWith(".md")) out = out.slice(0, -3);
  return out;
}

function resolveDefaultZip() {
  const candidates = [
    "dist/gg-audit.zip",
    "qa/audit-input/zip-audit.latest.zip",
    "qa/audit-input/latest.zip",
  ];
  for (const rel of candidates) {
    const abs = path.resolve(rel);
    if (existsSync(abs)) return abs;
  }
  const distDir = path.resolve("dist");
  if (!existsSync(distDir)) return "";
  let zips = [];
  try {
    zips = readdirSync(distDir)
      .filter((name) => name.toLowerCase().endsWith(".zip"))
      .sort();
  } catch (_) {
    return "";
  }
  if (zips.length === 1) return path.join(distDir, zips[0]);
  return "";
}

function validateZipFile(zipPath) {
  if (!existsSync(zipPath)) {
    fail(`ZIP path does not exist: ${zipPath}`);
  }
  const st = statSync(zipPath);
  if (!st.isFile()) {
    fail(`ZIP path is not a file: ${zipPath}`);
  }
  if (st.size < 4) {
    fail(`ZIP file is too small to be valid: ${zipPath}`);
  }
  const sig = readFileSync(zipPath).subarray(0, 4);
  const isPk = sig[0] === 0x50 && sig[1] === 0x4b;
  const validLead =
    isPk &&
    ((sig[2] === 0x03 && sig[3] === 0x04) ||
      (sig[2] === 0x05 && sig[3] === 0x06) ||
      (sig[2] === 0x07 && sig[3] === 0x08));
  if (!validLead) {
    fail(`Input is not a ZIP signature (PK..): ${zipPath}`);
  }
}

function runUnzip(args, options = {}) {
  try {
    return execFileSync("unzip", args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      fail("`unzip` command is required but not available in PATH");
    }
    const stderr = String(error?.stderr || "").trim();
    const stdout = String(error?.stdout || "").trim();
    const detail = stderr || stdout || String(error?.message || "unknown unzip error");
    fail(`Failed to inspect ZIP with unzip: ${detail}`);
  }
}

function testZipIntegrity(zipPath) {
  runUnzip(["-t", zipPath], { stdio: ["ignore", "pipe", "pipe"] });
}

function listZipEntries(zipPath) {
  const out = runUnzip(["-Z", "-1", zipPath]);
  return out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readZipFileText(zipPath, entryPath) {
  if (!entryPath) return "";
  try {
    return execFileSync("unzip", ["-p", zipPath, entryPath], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (_) {
    return "";
  }
}

function humanBytes(size) {
  if (!Number.isFinite(size) || size < 0) return "n/a";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const fixed = idx === 0 ? String(Math.round(value)) : value.toFixed(2);
  return `${fixed} ${units[idx]}`;
}

function getTopLevelRoots(entries) {
  const roots = new Set();
  for (const entry of entries) {
    const clean = entry.replace(/\/+$/, "");
    if (!clean) continue;
    const slash = clean.indexOf("/");
    if (slash === -1) roots.add(clean);
    else roots.add(clean.slice(0, slash));
  }
  return [...roots].sort();
}

function normalizedVariants(entry, roots) {
  const variants = new Set([entry]);
  for (const root of roots) {
    const prefix = `${root}/`;
    if (entry.startsWith(prefix)) {
      variants.add(entry.slice(prefix.length));
    }
  }
  return [...variants];
}

function buildNormalizedIndex(fileEntries, roots) {
  const index = new Map();
  for (const entry of fileEntries) {
    for (const variant of normalizedVariants(entry, roots)) {
      if (!index.has(variant)) index.set(variant, []);
      index.get(variant).push(entry);
    }
  }
  return index;
}

function firstEntryFor(index, logicalPath) {
  const found = index.get(logicalPath);
  if (!found || !found.length) return "";
  return found[0];
}

function hasPath(index, logicalPath) {
  return Boolean(firstEntryFor(index, logicalPath));
}

function listByPrefix(index, prefix) {
  const originals = new Set();
  for (const [normalized, files] of index.entries()) {
    if (!normalized.startsWith(prefix)) continue;
    for (const file of files) originals.add(file);
  }
  return [...originals].sort();
}

function detectJunk(fileEntries) {
  const junk = [];
  for (const entry of fileEntries) {
    const base = path.posix.basename(entry);
    if (
      entry.startsWith("__MACOSX/") ||
      base === ".DS_Store" ||
      base === "Thumbs.db" ||
      base === "desktop.ini" ||
      base.startsWith("._")
    ) {
      junk.push(entry);
    }
  }
  return junk.sort();
}

function stripQuotes(token) {
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return token.slice(1, -1);
  }
  return token;
}

function stripPunctuation(token) {
  return token.replace(/[),;]+$/g, "");
}

function normalizePathRef(rawToken) {
  let token = stripQuotes(String(rawToken || "").trim());
  token = stripPunctuation(token);
  token = token.replace(/^\.\/+/, "");
  return token;
}

function isCheckableRelativePath(rawToken) {
  const token = normalizePathRef(rawToken);
  if (!token) return false;
  if (token.startsWith("/") || /^[A-Za-z]:[\\/]/.test(token)) return false;
  if (token.startsWith("$") || token.includes("${")) return false;
  if (/^https?:/i.test(token)) return false;
  if (token.startsWith("-")) return false;
  if (token === "." || token === "..") return false;
  if (token.includes("/")) return true;
  return PATH_EXT_RE.test(token);
}

function looksPathLike(rawToken) {
  const token = normalizePathRef(rawToken);
  if (!token) return false;
  if (token.startsWith("$") || token.includes("${")) return false;
  if (/^https?:/i.test(token)) return false;
  if (token.includes("/")) return true;
  return PATH_EXT_RE.test(token);
}

function tokenizeShell(segment) {
  const parts = segment.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  if (!parts) return [];
  return parts.map((token) => stripQuotes(token));
}

function splitShellSegments(commandText) {
  return commandText
    .split(/\r?\n|&&|\|\||;|\|/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isEnvAssignment(token) {
  return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token);
}

function findCommandStart(tokens) {
  let idx = 0;
  while (idx < tokens.length && isEnvAssignment(tokens[idx])) idx += 1;
  return idx;
}

function extractConfigRefs(tokens) {
  const refs = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === "--config") {
      const next = tokens[i + 1];
      if (next) refs.push(next);
      i += 1;
      continue;
    }
    if (token.startsWith("--config=")) {
      refs.push(token.slice("--config=".length));
    }
  }
  return refs;
}

function findRunnerFileArg(tokens, cmdIndex) {
  const cmd = tokens[cmdIndex];
  if (!cmd) return "";
  for (let i = cmdIndex + 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith("-")) {
      if (cmd === "node") {
        if (NODE_OPTIONS_WITH_VALUE.has(token)) i += 1;
        continue;
      }
      if (cmd === "bash" || cmd === "sh" || cmd === "zsh") {
        if (token === "-c" || token === "-lc" || token === "-cl" || token === "--command") {
          return "";
        }
        if (SHELL_OPTIONS_WITH_VALUE.has(token)) i += 1;
        continue;
      }
      continue;
    }
    if (!looksPathLike(token)) return "";
    return token;
  }
  return "";
}

function extractShellRefs(commandText) {
  const npmScripts = [];
  const fileRefs = [];
  const segments = splitShellSegments(commandText);

  for (const segment of segments) {
    const tokens = tokenizeShell(segment);
    if (!tokens.length) continue;

    const cmdIndex = findCommandStart(tokens);
    if (cmdIndex >= tokens.length) continue;

    const cmd = tokens[cmdIndex];
    if (!cmd) continue;

    if (cmd === "npm" && tokens[cmdIndex + 1] === "run") {
      const scriptName = normalizePathRef(tokens[cmdIndex + 2] || "");
      if (scriptName && !scriptName.startsWith("-")) {
        npmScripts.push(scriptName);
      }
    }

    for (const cfgRef of extractConfigRefs(tokens)) {
      fileRefs.push({ runner: "flag", path: cfgRef, source: segment });
    }

    if (cmd === "node" || cmd === "bash" || cmd === "sh" || cmd === "zsh") {
      const scriptPath = findRunnerFileArg(tokens, cmdIndex);
      if (scriptPath) {
        fileRefs.push({ runner: cmd, path: scriptPath, source: segment });
      }
    } else if (cmd.startsWith("./")) {
      fileRefs.push({ runner: "exec", path: cmd, source: segment });
    }
  }

  return { npmScripts, fileRefs };
}

function extractRunBlocks(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const blocks = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(\s*)run:\s*(.*)$/);
    if (!match) continue;

    const baseIndent = match[1].length;
    const rest = match[2].trim();
    if (!rest) continue;

    if (rest === "|" || rest === ">" || rest === "|-" || rest === ">-") {
      const block = [];
      i += 1;
      for (; i < lines.length; i += 1) {
        const raw = lines[i];
        const currentIndent = raw.match(/^(\s*)/)[1].length;
        if (raw.trim() && currentIndent <= baseIndent) {
          i -= 1;
          break;
        }
        if (!raw.trim()) {
          block.push("");
          continue;
        }
        const stripIndent = Math.min(currentIndent, baseIndent + 2);
        block.push(raw.slice(stripIndent));
      }
      if (block.length) blocks.push(block.join("\n"));
      continue;
    }

    blocks.push(rest);
  }

  return blocks;
}

function parsePackageSummary(zipPath, index) {
  const packageEntry = firstEntryFor(index, "package.json");
  if (!packageEntry) {
    return {
      exists: false,
      packageName: "",
      scripts: {},
      verifyScripts: [],
      scriptFileRefs: [],
      scriptNpmRunRefs: [],
      parseError: "",
    };
  }

  const raw = readZipFileText(zipPath, packageEntry);
  if (!raw) {
    return {
      exists: true,
      packageName: "",
      scripts: {},
      verifyScripts: [],
      scriptFileRefs: [],
      scriptNpmRunRefs: [],
      parseError: "empty package.json in archive",
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const scripts =
      parsed && typeof parsed.scripts === "object" && parsed.scripts
        ? parsed.scripts
        : {};
    const scriptFileRefs = [];
    const scriptNpmRunRefs = [];

    for (const [scriptName, cmdRaw] of Object.entries(scripts)) {
      const cmd = String(cmdRaw || "");
      const extracted = extractShellRefs(cmd);
      for (const ref of extracted.fileRefs) {
        scriptFileRefs.push({
          script: scriptName,
          runner: ref.runner,
          path: ref.path,
          source: ref.source,
        });
      }
      for (const target of extracted.npmScripts) {
        scriptNpmRunRefs.push({
          script: scriptName,
          target,
          source: cmd,
        });
      }
    }

    return {
      exists: true,
      packageName: String(parsed?.name || ""),
      scripts,
      verifyScripts: Object.keys(scripts)
        .filter((name) => name.startsWith("verify:"))
        .sort(),
      scriptFileRefs,
      scriptNpmRunRefs,
      parseError: "",
    };
  } catch (error) {
    return {
      exists: true,
      packageName: "",
      scripts: {},
      verifyScripts: [],
      scriptFileRefs: [],
      scriptNpmRunRefs: [],
      parseError: `invalid JSON (${error?.message || "parse error"})`,
    };
  }
}

function parseWorkflowSummary(zipPath, index, packageScripts) {
  const workflowEntries = listByPrefix(index, ".github/workflows/");
  const files = [];
  const npmRunCalls = [];
  const workflowFileRefs = [];
  let anyCi = false;
  let anyDeployCloudflare = false;
  let anyWrangler = false;
  let anyNpmGaga = false;

  for (const entry of workflowEntries) {
    const content = readZipFileText(zipPath, entry);
    const runBlocks = extractRunBlocks(content);

    const runCi = /\bname:\s*ci\b/i.test(content) || /\bon:\s*[\s\S]*\bpush:\s*/i.test(content);
    const deployCloudflare =
      /cloudflare/i.test(content) || /\bwrangler\b/i.test(content) || /\bdeploy\b/i.test(content);
    const callWrangler = /\bwrangler\b/i.test(content);
    const callGaga = /npm\s+run\s+gaga\b/i.test(content);

    if (runCi) anyCi = true;
    if (deployCloudflare) anyDeployCloudflare = true;
    if (callWrangler) anyWrangler = true;
    if (callGaga) anyNpmGaga = true;

    for (const block of runBlocks) {
      const extracted = extractShellRefs(block);
      for (const target of extracted.npmScripts) {
        npmRunCalls.push({
          workflow: entry,
          script: target,
          source: block,
        });
      }
      for (const ref of extracted.fileRefs) {
        workflowFileRefs.push({
          workflow: entry,
          runner: ref.runner,
          path: ref.path,
          source: ref.source,
        });
      }
    }

    files.push({
      entry,
      runCi,
      deployCloudflare,
      callWrangler,
      callGaga,
      lineCount: content ? content.split(/\r?\n/).length : 0,
      runBlockCount: runBlocks.length,
    });
  }

  const missingScriptCalls = npmRunCalls.filter(
    (row) => !Object.hasOwn(packageScripts, row.script)
  );

  return {
    entries: workflowEntries,
    files,
    anyCi,
    anyDeployCloudflare,
    anyWrangler,
    anyNpmGaga,
    npmRunCalls,
    missingScriptCalls,
    workflowFileRefs,
  };
}

function collectSignals(index, zipPath, workflowSummary) {
  const hasVersionedAssets = listByPrefix(index, "public/assets/v/").length > 0;
  const hasLatestAssets = listByPrefix(index, "public/assets/latest/").length > 0;
  const hasTemplate = hasPath(index, "index.prod.xml");
  const hasWorker = hasPath(index, "src/worker.js");
  const hasWorkflows = workflowSummary.entries.length > 0;
  const qaEntries = listByPrefix(index, "qa/");
  const hasQaFiles = qaEntries.length > 0;
  const templateWorkerWorkflowCoexist = hasTemplate && hasWorker && hasWorkflows;
  const toolsEntries = listByPrefix(index, "tools/");

  let indexProdRefersVersioned = false;
  let indexProdRefersLatest = false;
  let qaLiveSmokeHasCommentsOwnerCheck = false;
  let qaLiveSmokeTargetsCommentsPath = false;
  const indexEntry = firstEntryFor(index, "index.prod.xml");
  const liveSmokeEntry = firstEntryFor(index, "qa/live-smoke.sh");
  if (indexEntry) {
    const xml = readZipFileText(zipPath, indexEntry);
    if (xml) {
      indexProdRefersVersioned = /\/assets\/v\//i.test(xml);
      indexProdRefersLatest = /\/assets\/latest\//i.test(xml);
    }
  }
  if (liveSmokeEntry) {
    const sh = readZipFileText(zipPath, liveSmokeEntry);
    if (sh) {
      qaLiveSmokeHasCommentsOwnerCheck =
        /check_comments_owner_contract\s*\(\)/.test(sh) &&
        /check_comments_owner_contract\b/.test(sh);
      qaLiveSmokeTargetsCommentsPath =
        /COMMENTS_TARGET_PATH_0=.*\/2026\/02\/todo\.html/.test(sh) &&
        /COMMENTS_TARGET_PATH_2=.*\/2025\/10\/in-night-we-stand-in-day-we-fight\.html/.test(sh) &&
        /COMMENTS_TARGET_PATH_16=.*\/2025\/10\/tes-2\.html/.test(sh);
    }
  }

  return {
    hasVersionedAssets,
    hasLatestAssets,
    hasTemplate,
    hasWorker,
    hasWorkflows,
    hasQaFiles,
    qaEntriesCount: qaEntries.length,
    templateWorkerWorkflowCoexist,
    indexProdRefersVersioned,
    indexProdRefersLatest,
    qaLiveSmokeHasCommentsOwnerCheck,
    qaLiveSmokeTargetsCommentsPath,
    toolsEntriesCount: toolsEntries.length,
  };
}

function uniqueBy(items, keyFn) {
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function buildFindings({
  criticalMissing,
  junkEntries,
  packageSummary,
  workflowSummary,
  signals,
  index,
}) {
  const warnings = [];
  const criticalFailures = [];

  const missingScriptFiles = uniqueBy(
    packageSummary.scriptFileRefs
      .filter((row) => isCheckableRelativePath(row.path))
      .map((row) => ({
        ...row,
        normalizedPath: normalizePathRef(row.path),
        exists: hasPath(index, normalizePathRef(row.path)),
      }))
      .filter((row) => !row.exists),
    (row) => `${row.script}|${row.normalizedPath}|${row.runner}`
  );

  const missingScriptTargets = uniqueBy(
    packageSummary.scriptNpmRunRefs.filter(
      (row) => !Object.hasOwn(packageSummary.scripts, row.target)
    ),
    (row) => `${row.script}|${row.target}`
  );

  const missingWorkflowFiles = uniqueBy(
    workflowSummary.workflowFileRefs
      .filter((row) => isCheckableRelativePath(row.path))
      .map((row) => ({
        ...row,
        normalizedPath: normalizePathRef(row.path),
        exists: hasPath(index, normalizePathRef(row.path)),
      }))
      .filter((row) => !row.exists),
    (row) => `${row.workflow}|${row.normalizedPath}|${row.runner}`
  );

  const missingWorkflowScripts = uniqueBy(
    workflowSummary.missingScriptCalls,
    (row) => `${row.workflow}|${row.script}`
  );

  const deadLegacyRefs = uniqueBy(
    [
      ...missingScriptFiles
        .filter((row) => row.normalizedPath.startsWith("tools/"))
        .map((row) => ({
          where: "package",
          owner: row.script,
          path: row.normalizedPath,
          runner: row.runner,
        })),
      ...missingWorkflowFiles
        .filter((row) => row.normalizedPath.startsWith("tools/"))
        .map((row) => ({
          where: "workflow",
          owner: row.workflow,
          path: row.normalizedPath,
          runner: row.runner,
        })),
    ],
    (row) => `${row.where}|${row.owner}|${row.path}|${row.runner}`
  );

  if (criticalMissing.length) {
    for (const missing of criticalMissing) {
      criticalFailures.push(`Missing required file in ZIP: ${missing}`);
    }
  }

  if (packageSummary.parseError) {
    criticalFailures.push(`package.json parse error: ${packageSummary.parseError}`);
  }

  for (const row of missingScriptFiles) {
    criticalFailures.push(
      `package.json script '${row.script}' references missing file '${row.normalizedPath}' (${row.runner})`
    );
  }

  for (const row of missingScriptTargets) {
    criticalFailures.push(
      `package.json script '${row.script}' calls missing npm script '${row.target}'`
    );
  }

  for (const row of missingWorkflowScripts) {
    criticalFailures.push(
      `workflow '${row.workflow}' calls missing npm script '${row.script}'`
    );
  }

  for (const row of missingWorkflowFiles) {
    criticalFailures.push(
      `workflow '${row.workflow}' references missing file '${row.normalizedPath}' (${row.runner})`
    );
  }

  for (const row of deadLegacyRefs) {
    criticalFailures.push(
      `legacy dead reference (${row.where}) '${row.owner}' -> '${row.path}' (${row.runner})`
    );
  }

  if (junkEntries.length) {
    warnings.push(
      `Archive contains junk entries: ${junkEntries.slice(0, 8).join(", ")}${
        junkEntries.length > 8 ? " ..." : ""
      }`
    );
  }

  if (signals.toolsEntriesCount > 0) {
    warnings.push(
      `Archive contains legacy tools/* files (${signals.toolsEntriesCount} entries).`
    );
  }

  if (signals.hasLatestAssets && signals.hasVersionedAssets && !signals.indexProdRefersVersioned) {
    warnings.push(
      "Both public/assets/latest and public/assets/v exist without clear version pin in index.prod.xml."
    );
  }
  if (hasPath(index, "qa/live-smoke.sh") && !signals.qaLiveSmokeHasCommentsOwnerCheck) {
    warnings.push("qa/live-smoke.sh is missing a rendered comments owner contract check.");
  }
  if (signals.qaLiveSmokeHasCommentsOwnerCheck && !signals.qaLiveSmokeTargetsCommentsPath) {
    warnings.push("qa/live-smoke.sh does not target the 0/2/16 comments owner proof matrix.");
  }

  return {
    warnings,
    criticalFailures,
    details: {
      missingCriticalFiles: criticalMissing,
      missingScriptFiles,
      missingScriptTargets,
      missingWorkflowScripts,
      missingWorkflowFiles,
      deadLegacyRefs,
    },
  };
}

function renderMarkdown(report) {
  const yesNo = (value) => (value ? "yes" : "no");
  const lines = [];
  lines.push("# ZIP Audit Report");
  lines.push("");
  lines.push(`- Enforcement mode: ${report.enforcement.mode}`);
  lines.push(`- Result: ${report.enforcement.result}`);
  lines.push(
    `- Counts: ${report.warnings.length} warning(s), ${report.criticalFailures.length} critical failure(s)`
  );
  lines.push("");
  lines.push("## A. Archive Basics");
  lines.push(`- Path: \`${report.input.path}\``);
  lines.push(`- Size: ${report.input.sizeBytes} bytes (${report.input.sizeHuman})`);
  lines.push(
    `- Top-level roots: ${
      report.archive.topLevelRoots.length
        ? report.archive.topLevelRoots.map((s) => `\`${s}\``).join(", ")
        : "_none_"
    }`
  );
  lines.push(`- File count: ${report.archive.fileCount}`);
  lines.push(
    `- Junk entries: ${
      report.archive.junkEntries.length
        ? report.archive.junkEntries.map((s) => `\`${s}\``).join(", ")
        : "_none_"
    }`
  );
  lines.push("");
  lines.push("## B. Critical File Presence");
  for (const row of report.criticalFiles) {
    lines.push(
      `- ${row.exists ? "[ok]" : "[missing]"} \`${row.path}\`${
        row.entry ? ` -> \`${row.entry}\`` : ""
      }`
    );
  }
  lines.push("");
  lines.push("## C. Package / Script Summary");
  if (!report.package.exists) {
    lines.push("- package.json: missing");
  } else if (report.package.parseError) {
    lines.push(`- package.json parse error: ${report.package.parseError}`);
  } else {
    lines.push(`- package name: ${report.package.name || "_missing_"}`);
    lines.push(`- script count: ${report.package.scriptCount}`);
    for (const key of ["gaga", "gaga:dry", "gaga:audit", "build", "ship"]) {
      lines.push(`- script \`${key}\`: ${yesNo(report.package.scriptPresence[key])}`);
    }
    lines.push(
      `- verify:* scripts: ${
        report.package.verifyScripts.length
          ? report.package.verifyScripts.map((s) => `\`${s}\``).join(", ")
          : "_none_"
      }`
    );
  }
  lines.push("");
  lines.push("## D. Workflow Summary");
  lines.push(`- workflow files: ${report.workflows.entries.length}`);
  for (const wf of report.workflows.files) {
    lines.push(
      `- \`${wf.entry}\` | ci:${yesNo(wf.runCi)} deploy:${yesNo(wf.deployCloudflare)} wrangler:${yesNo(
        wf.callWrangler
      )} npm-run-gaga:${yesNo(wf.callGaga)} run-blocks:${wf.runBlockCount}`
    );
  }
  lines.push(`- any CI workflow signal: ${yesNo(report.workflows.anyCi)}`);
  lines.push(
    `- any Cloudflare deploy signal: ${yesNo(report.workflows.anyDeployCloudflare)}`
  );
  lines.push(`- any Wrangler call: ${yesNo(report.workflows.anyWrangler)}`);
  lines.push(`- any npm run gaga call: ${yesNo(report.workflows.anyNpmGaga)}`);
  lines.push("");
  lines.push("## E. BLOG GAGA-ish Signals");
  lines.push(`- has public/assets/v/: ${yesNo(report.signals.hasVersionedAssets)}`);
  lines.push(`- has public/assets/latest/: ${yesNo(report.signals.hasLatestAssets)}`);
  lines.push(`- has index.prod.xml: ${yesNo(report.signals.hasTemplate)}`);
  lines.push(`- has src/worker.js: ${yesNo(report.signals.hasWorker)}`);
  lines.push(`- has .github/workflows/: ${yesNo(report.signals.hasWorkflows)}`);
  lines.push(
    `- has qa/* files: ${yesNo(report.signals.hasQaFiles)} (${report.signals.qaEntriesCount})`
  );
  lines.push(
    `- template + worker + workflows co-exist: ${yesNo(
      report.signals.templateWorkerWorkflowCoexist
    )}`
  );
  lines.push(
    `- qa/live-smoke comments owner check: ${yesNo(report.signals.qaLiveSmokeHasCommentsOwnerCheck)}`
  );
  lines.push(
    `- qa/live-smoke targets 0/2/16 comments matrix: ${yesNo(report.signals.qaLiveSmokeTargetsCommentsPath)}`
  );
  lines.push(
    `- index.prod.xml references /assets/v/: ${yesNo(report.signals.indexProdRefersVersioned)}`
  );
  lines.push(
    `- index.prod.xml references /assets/latest/: ${yesNo(report.signals.indexProdRefersLatest)}`
  );
  lines.push("");
  lines.push("## F. Warnings");
  if (!report.warnings.length) lines.push("- none");
  else for (const warning of report.warnings) lines.push(`- ${warning}`);
  lines.push("");
  lines.push("## G. Critical Failures");
  if (!report.criticalFailures.length) lines.push("- none");
  else for (const failure of report.criticalFailures) lines.push(`- ${failure}`);
  lines.push("");
  lines.push(`Report generated at: ${report.generatedAt}`);
  return `${lines.join("\n")}\n`;
}

function printHumanSummary(report) {
  const missing = report.criticalFiles.filter((row) => !row.exists).map((row) => row.path);
  console.log("ZIP AUDIT");
  console.log(`- input: ${report.input.path}`);
  console.log(`- enforcement: ${report.enforcement.mode}`);
  console.log(`- result: ${report.enforcement.result}`);
  console.log(`- size: ${report.input.sizeBytes} bytes (${report.input.sizeHuman})`);
  console.log(`- roots: ${report.archive.topLevelRoots.join(", ") || "(none)"}`);
  console.log(`- file count: ${report.archive.fileCount}`);
  console.log(`- critical missing files: ${missing.length ? missing.join(", ") : "none"}`);
  console.log(`- workflows: ${report.workflows.entries.length}`);
  console.log(`- scripts: ${report.package.scriptCount}`);
  console.log(`- warnings: ${report.warnings.length}`);
  if (report.warnings.length) {
    for (const warning of report.warnings) {
      console.log(`  - ${warning}`);
    }
  }
  console.log(`- critical failures: ${report.criticalFailures.length}`);
  if (report.criticalFailures.length) {
    for (const failure of report.criticalFailures) {
      console.log(`  - ${failure}`);
    }
  }
  console.log(`- markdown: ${report.output.mdPath}`);
  console.log(`- json: ${report.output.jsonPath}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  validateZipFile(args.zipPath);
  testZipIntegrity(args.zipPath);

  const st = statSync(args.zipPath);
  const entries = listZipEntries(args.zipPath);
  const fileEntries = entries.filter((entry) => !entry.endsWith("/"));
  const topLevelRoots = getTopLevelRoots(entries);
  const index = buildNormalizedIndex(fileEntries, topLevelRoots);
  const junkEntries = detectJunk(fileEntries);

  const criticalFiles = CRITICAL_TARGETS.map((logicalPath) => ({
    path: logicalPath,
    exists: hasPath(index, logicalPath),
    entry: firstEntryFor(index, logicalPath),
  }));
  const workflowEntries = listByPrefix(index, ".github/workflows/");
  criticalFiles.push({
    path: ".github/workflows/*",
    exists: workflowEntries.length > 0,
    entry: workflowEntries.length ? workflowEntries[0] : "",
  });
  const criticalMissing = criticalFiles
    .filter((row) => !row.exists)
    .map((row) => row.path);

  const packageSummary = parsePackageSummary(args.zipPath, index);
  const workflowSummary = parseWorkflowSummary(
    args.zipPath,
    index,
    packageSummary.scripts
  );
  const signals = collectSignals(index, args.zipPath, workflowSummary);

  const findings = buildFindings({
    criticalMissing,
    junkEntries,
    packageSummary,
    workflowSummary,
    signals,
    index,
  });

  const outputPrefix = args.outPrefix;
  const outputDir = path.dirname(outputPrefix);
  mkdirSync(outputDir, { recursive: true });
  const mdPath = `${outputPrefix}.md`;
  const jsonPath = `${outputPrefix}.json`;

  const shouldFail = findings.criticalFailures.length > 0 && !args.warnOnly;
  const result = shouldFail ? "FAIL" : "PASS";
  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      path: args.zipPath,
      sizeBytes: st.size,
      sizeHuman: humanBytes(st.size),
    },
    archive: {
      topLevelRoots,
      fileCount: fileEntries.length,
      totalEntries: entries.length,
      junkEntries,
    },
    criticalFiles,
    package: {
      exists: packageSummary.exists,
      name: packageSummary.packageName,
      parseError: packageSummary.parseError,
      scriptCount: Object.keys(packageSummary.scripts).length,
      scriptPresence: {
        gaga: Object.hasOwn(packageSummary.scripts, "gaga"),
        "gaga:dry": Object.hasOwn(packageSummary.scripts, "gaga:dry"),
        "gaga:audit": Object.hasOwn(packageSummary.scripts, "gaga:audit"),
        build: Object.hasOwn(packageSummary.scripts, "build"),
        ship: Object.hasOwn(packageSummary.scripts, "ship"),
      },
      verifyScripts: packageSummary.verifyScripts,
      scripts: packageSummary.scripts,
      scriptFileRefs: packageSummary.scriptFileRefs,
      scriptNpmRunRefs: packageSummary.scriptNpmRunRefs,
    },
    workflows: workflowSummary,
    signals,
    warnings: findings.warnings,
    criticalFailures: findings.criticalFailures,
    contractFindings: findings.details,
    enforcement: {
      mode: args.warnOnly ? "warn-only" : "fail-on-critical",
      result,
      failed: shouldFail,
    },
    output: {
      mdPath,
      jsonPath,
    },
  };

  const md = renderMarkdown(report);
  writeFileSync(mdPath, md, "utf8");
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (args.jsonToStdout) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    printHumanSummary(report);
  }

  if (shouldFail) {
    process.exit(2);
  }
}

main();
