import fs from "fs";
import path from "path";

const root = process.cwd();
const allowlistRel = "docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json";
const allowlistPath = path.join(root, allowlistRel);
const modulesDir = path.join(root, "public", "assets", "latest", "modules");
const violations = [];

function fail(msg) {
  violations.push(msg);
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function collectMatches(source, patterns, templatePattern) {
  const matches = [];
  for (const pattern of patterns) {
    const re = new RegExp(pattern, "g");
    let m;
    while ((m = re.exec(source))) {
      matches.push({
        pattern,
        index: m.index,
        line: lineNumberAt(source, m.index),
      });
    }
  }
  const tplRe = new RegExp(templatePattern, "g");
  let t;
  while ((t = tplRe.exec(source))) {
    matches.push({
      pattern: templatePattern,
      index: t.index,
      line: lineNumberAt(source, t.index),
    });
  }
  matches.sort((a, b) => (a.index - b.index) || a.pattern.localeCompare(b.pattern));
  return matches;
}

function extractIds(text) {
  if (!text || !/@gg-allow-html-in-js/.test(text)) return [];
  const out = [];
  for (const m of text.matchAll(/LEGACY:([A-Za-z0-9_-]+)/g)) out.push(m[1]);
  return out;
}

if (!fs.existsSync(allowlistPath)) {
  fail(`missing allowlist: ${allowlistRel}`);
}
if (!fs.existsSync(modulesDir)) {
  fail(`missing modules dir: ${path.relative(root, modulesDir)}`);
}

let allowlist = null;
if (!violations.length) {
  try {
    allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
  } catch (err) {
    fail(`allowlist JSON invalid: ${err && err.message ? err.message : String(err)}`);
  }
}

if (!violations.length) {
  if (!allowlist || allowlist.v !== 1) fail("allowlist.v must be 1");
  if (!allowlist || allowlist.updated !== "2026-02-21") fail('allowlist.updated must be "2026-02-21"');
  if (!allowlist || !allowlist.rules) fail("allowlist.rules missing");
  if (!allowlist || !Array.isArray(allowlist.allow)) fail("allowlist.allow must be an array");
}

let denyPatterns = [];
let templatePattern = "";
const allowById = new Map();
const usedIds = new Set();
let totalMatches = 0;
let allowlistedMatches = 0;

if (!violations.length) {
  denyPatterns = Array.isArray(allowlist.rules.deny_patterns) ? allowlist.rules.deny_patterns : [];
  templatePattern = String(allowlist.rules.html_template_string_pattern || "");
  if (!denyPatterns.length) fail("rules.deny_patterns must be non-empty");
  if (!templatePattern) fail("rules.html_template_string_pattern missing");

  for (const entry of allowlist.allow) {
    if (!entry || typeof entry !== "object") {
      fail("allowlist entry must be object");
      continue;
    }
    const id = String(entry.id || "");
    const file = String(entry.file || "");
    const pattern = String(entry.pattern || "");
    if (!/^LEGACY-[A-Za-z0-9_-]+$/.test(id)) fail(`invalid allow id: ${id || "(empty)"}`);
    if (!file) fail(`allow ${id || "(unknown)"} missing file`);
    if (!pattern) fail(`allow ${id || "(unknown)"} missing pattern`);
    if (allowById.has(id)) fail(`duplicate allow id: ${id}`);
    allowById.set(id, entry);
  }
}

if (!violations.length) {
  const files = fs
    .readdirSync(modulesDir)
    .filter((name) => name.endsWith(".js"))
    .sort();
  const relFiles = files.map((name) => path.join("public", "assets", "latest", "modules", name).replace(/\\/g, "/"));
  if (!relFiles.includes("public/assets/latest/modules/ui.bucket.core.js")) {
    fail("required target missing: public/assets/latest/modules/ui.bucket.core.js");
  }

  const annoFirstUse = new Map();

  for (const fileRel of relFiles) {
    const fileAbs = path.join(root, fileRel);
    const source = fs.readFileSync(fileAbs, "utf8");
    const lines = source.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const ids = extractIds(lines[i]);
      if (!ids.length) continue;
      for (const id of ids) {
        const loc = `${fileRel}:${i + 1}`;
        if (annoFirstUse.has(id)) {
          fail(`${loc} duplicate LEGACY id annotation reuse: ${id} (first: ${annoFirstUse.get(id)})`);
          continue;
        }
        annoFirstUse.set(id, loc);
      }
    }

    const matches = collectMatches(source, denyPatterns, templatePattern);
    totalMatches += matches.length;

    for (const match of matches) {
      const sameLine = lines[match.line - 1] || "";
      const prevLine = lines[match.line - 2] || "";
      const annotationIds = Array.from(new Set([...extractIds(sameLine), ...extractIds(prevLine)]));
      if (!annotationIds.length) {
        fail(`${fileRel}:${match.line} missing annotation for pattern ${match.pattern}`);
        continue;
      }

      const orderedIds = annotationIds
        .slice()
        .sort((a, b) => Number(usedIds.has(a)) - Number(usedIds.has(b)));

      let picked = null;
      for (const id of orderedIds) {
        const allow = allowById.get(id);
        if (!allow) continue;
        if (usedIds.has(id)) {
          fail(`${fileRel}:${match.line} duplicate LEGACY id reuse: ${id}`);
          continue;
        }
        if (allow.file !== fileRel) continue;
        if (allow.pattern !== match.pattern) continue;
        picked = id;
        break;
      }

      if (!picked) {
        fail(`${fileRel}:${match.line} annotation/allowlist mismatch for pattern ${match.pattern}`);
        continue;
      }

      usedIds.add(picked);
      allowlistedMatches += 1;
    }
  }

  for (const [id] of allowById.entries()) {
    if (!usedIds.has(id)) fail(`unused allowlist id: ${id}`);
  }
}

const summary = `total_matches=${totalMatches} allowlisted_matches=${allowlistedMatches} violations=${violations.length}`;
if (violations.length) {
  console.error("VERIFY_NO_NEW_HTML_IN_JS: FAIL");
  violations.forEach((msg) => console.error(`- ${msg}`));
  console.error(summary);
  process.exit(1);
}

console.log(`VERIFY_NO_NEW_HTML_IN_JS: PASS ${summary}`);
