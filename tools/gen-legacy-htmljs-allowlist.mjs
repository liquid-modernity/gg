#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const MODULE_DIR = path.join(ROOT, "public", "assets", "latest", "modules");
const UPDATED = "2026-02-21";
const DENY_PATTERNS = [
  "innerHTML\\s*=",
  "insertAdjacentHTML\\s*\\(",
  "outerHTML\\s*=",
  "document\\.write\\s*\\(",
  "Range\\s*\\(\\)\\.createContextualFragment",
  "DOMParser\\s*\\(",
];
const TEMPLATE_PATTERN = "`[^`]*<[^`]+>`";

function parseArgs(argv) {
  const out = { annotate: false, write: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--annotate") {
      out.annotate = true;
      continue;
    }
    if (arg === "--write" && argv[i + 1]) {
      out.write = argv[i + 1];
      i += 1;
      continue;
    }
  }
  return out;
}

function relFromRoot(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function collectMatches(fileRel, source) {
  const matches = [];
  for (const pattern of DENY_PATTERNS) {
    const re = new RegExp(pattern, "g");
    let m;
    while ((m = re.exec(source))) {
      matches.push({
        file: fileRel,
        pattern,
        line: lineNumberAt(source, m.index),
        index: m.index,
      });
    }
  }
  const tplRe = new RegExp(TEMPLATE_PATTERN, "g");
  let t;
  while ((t = tplRe.exec(source))) {
    matches.push({
      file: fileRel,
      pattern: TEMPLATE_PATTERN,
      line: lineNumberAt(source, t.index),
      index: t.index,
    });
  }
  matches.sort((a, b) => (a.index - b.index) || a.pattern.localeCompare(b.pattern));
  return matches;
}

function withLegacyIds(matches) {
  let n = 1;
  return matches.map((m) => ({
    ...m,
    id: `LEGACY-${String(n++).padStart(4, "0")}`,
  }));
}

function injectAnnotations(fileAbs, matchesForFile) {
  if (!matchesForFile.length) return;

  const source = fs.readFileSync(fileAbs, "utf8");
  const endsWithNewline = source.endsWith("\n");
  const lines = source.split(/\r?\n/);
  const byLine = new Map();

  for (const m of matchesForFile) {
    if (!byLine.has(m.line)) byLine.set(m.line, []);
    byLine.get(m.line).push(m.id);
  }

  const sortedLines = Array.from(byLine.keys()).sort((a, b) => b - a);
  for (const lineNo of sortedLines) {
    const ids = byLine.get(lineNo);
    const marker = `// @gg-allow-html-in-js ${ids.map((id) => `LEGACY:${id}`).join(" ")}`;
    const idx = lineNo - 1;
    const prevIdx = idx - 1;
    const prevLine = prevIdx >= 0 ? lines[prevIdx] : "";

    if (/@gg-allow-html-in-js/.test(prevLine)) {
      const merged = new Set(prevLine.match(/LEGACY:[A-Za-z0-9_-]+/g) || []);
      ids.forEach((id) => merged.add(`LEGACY:${id}`));
      lines[prevIdx] = `// @gg-allow-html-in-js ${Array.from(merged).join(" ")}`;
      continue;
    }

    lines.splice(idx, 0, marker);
  }

  const nextSource = lines.join("\n") + (endsWithNewline ? "\n" : "");
  fs.writeFileSync(fileAbs, nextSource);
}

function ensureDir(p) {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(MODULE_DIR)) {
    console.error(`Missing modules dir: ${relFromRoot(MODULE_DIR)}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MODULE_DIR)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .map((name) => path.join(MODULE_DIR, name));

  const rawMatches = [];
  for (const abs of files) {
    const rel = relFromRoot(abs);
    const source = fs.readFileSync(abs, "utf8");
    rawMatches.push(...collectMatches(rel, source));
  }

  const matches = withLegacyIds(rawMatches);
  if (args.annotate) {
    const fileMap = new Map();
    for (const m of matches) {
      if (!fileMap.has(m.file)) fileMap.set(m.file, []);
      fileMap.get(m.file).push(m);
    }
    for (const [fileRel, list] of fileMap.entries()) {
      injectAnnotations(path.join(ROOT, fileRel), list);
    }
  }

  const allow = matches.map((m) => ({
    id: m.id,
    file: m.file,
    pattern: m.pattern,
    note: "baseline legacy",
    introduced_by: "baseline",
  }));

  const output = {
    v: 1,
    updated: UPDATED,
    rules: {
      deny_patterns: DENY_PATTERNS,
      html_template_string_pattern: TEMPLATE_PATTERN,
    },
    allow,
  };

  const json = `${JSON.stringify(output, null, 2)}\n`;
  if (args.write) {
    const target = path.isAbsolute(args.write) ? args.write : path.join(ROOT, args.write);
    ensureDir(target);
    fs.writeFileSync(target, json);
  }
  process.stdout.write(json);
}

main();
