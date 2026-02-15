#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const hit = process.argv.find((a) => a.startsWith(name + "="));
  if (hit) return hit.split("=").slice(1).join("=");
  return "";
}

function normalizeBase(raw) {
  let base = String(raw || "").trim();
  if (!base) base = "https://www.pakrpp.com";
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;
  return base.replace(/\/+$/, "");
}

function fail(msg) {
  throw new Error(msg);
}

function runCurl(args, label) {
  try {
    return execFileSync("curl", args, { encoding: "utf8" });
  } catch (err) {
    const out = err && err.stderr ? String(err.stderr).trim() : "";
    fail(`${label} failed${out ? ` (${out})` : ""}`);
  }
}

function parseHeaderBlock(raw) {
  const txt = String(raw || "").replace(/\r/g, "");
  const parts = txt.split("\n\n").map((s) => s.trim()).filter(Boolean);
  let block = parts.length ? parts[parts.length - 1] : txt;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^HTTP\/\d/i.test(parts[i])) {
      block = parts[i];
      break;
    }
  }
  const lines = block.split("\n").map((s) => s.trim()).filter(Boolean);
  const statusLine = lines[0] || "";
  const statusMatch = statusLine.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})/i);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const k = line.slice(0, idx).trim().toLowerCase();
    const v = line.slice(idx + 1).trim();
    map[k] = v;
  }
  return { status, headers: map, raw: block };
}

function fetchPage(url, label) {
  const common = [
    "-sS",
    "--max-time",
    "12",
    "-H",
    "Cache-Control: no-cache",
    "-H",
    "Pragma: no-cache",
    "-H",
    "User-Agent: gg-verify-palette-a11y/1.0",
  ];
  const headerRaw = runCurl([...common, "-D", "-", "-o", "/dev/null", url], `${label} headers`);
  const parsed = parseHeaderBlock(headerRaw);
  if (!parsed.status) fail(`${label} invalid HTTP status (${url})`);
  const body = runCurl([...common, url], `${label} body`);
  return { status: parsed.status, headers: parsed.headers, body };
}

function hasAttr(tag, name) {
  return new RegExp(`${name}\\s*=`, "i").test(tag);
}

function getAttr(tag, name) {
  const quoted = tag.match(new RegExp(`${name}\\s*=\\s*(['"])(.*?)\\1`, "i"));
  if (quoted) return quoted[2];
  const bare = tag.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, "i"));
  if (!bare) return "";
  return String(bare[1] || "").replace(/^['"]|['"]$/g, "");
}

function findSearchInputTag(html) {
  const re = /<input\b[^>]*>/gi;
  let hit;
  while ((hit = re.exec(html))) {
    const tag = hit[0];
    if (/data-gg-dock-search-input\s*=\s*(['"]?)1\1/i.test(tag)) return tag;
  }
  return "";
}

function extractReleaseId(html) {
  const m = html.match(/\/assets\/v\/([0-9a-f]{7,40})\/(?:boot\.js|main\.css)/i);
  return m ? m[1] : "";
}

function requirePattern(src, re, label, detail) {
  if (!re.test(src)) fail(`${label} missing ${detail}`);
}

function readLocal(relPath) {
  const p = path.join(process.cwd(), relPath);
  if (!fs.existsSync(p)) fail(`missing file: ${relPath}`);
  return fs.readFileSync(p, "utf8");
}

function verifySourceContracts(searchJs, cmdJs) {
  requirePattern(searchJs, /PID\s*=\s*['"]gg-palette-list['"]/, "search module", "PID=gg-palette-list");
  requirePattern(searchJs, /setAttribute\(\s*['"]role['"]\s*,\s*['"]listbox['"]\s*\)/, "search module", "listbox role");
  requirePattern(searchJs, /role=["']option["']/, "search module", "option role template");
  requirePattern(searchJs, /gg-opt-/, "search module", "stable option id prefix");
  requirePattern(searchJs, /aria-selected=["']false["']/, "search module", "default aria-selected=false");
  requirePattern(searchJs, /setAttribute\(\s*['"]aria-selected['"]\s*,\s*['"]true['"]\s*\)/, "search module", "active option aria-selected=true");
  requirePattern(searchJs, /setAttribute\(\s*['"]aria-activedescendant['"]/, "search module", "aria-activedescendant set");
  requirePattern(searchJs, /removeAttribute\(\s*['"]aria-activedescendant['"]/, "search module", "aria-activedescendant clear");
  requirePattern(searchJs, /setAttribute\(\s*['"]aria-expanded['"]\s*,\s*['"]true['"]\s*\)/, "search module", "aria-expanded true on open");
  requirePattern(searchJs, /setAttribute\(\s*['"]aria-expanded['"]\s*,\s*['"]false['"]\s*\)/, "search module", "aria-expanded false on close");

  requirePattern(cmdJs, /getElementById\(\s*['"]gg-palette-list['"]\s*\)/, "command module", "shared listbox container");
  requirePattern(cmdJs, /role=["']option["']/, "command module", "option role template");
  requirePattern(cmdJs, /aria-selected=["']false["']/, "command module", "default aria-selected=false");
  requirePattern(cmdJs, /setAttribute\(\s*['"]aria-selected['"]\s*,\s*['"]true['"]\s*\)/, "command module", "active option aria-selected=true");
}

function verifyHtmlContract(html, label) {
  const tag = findSearchInputTag(html);
  if (!tag) fail(`${label} missing dock search input`);

  const role = (getAttr(tag, "role") || "").toLowerCase();
  if (role !== "combobox") fail(`${label} input role must be combobox`);
  if ((getAttr(tag, "aria-autocomplete") || "").toLowerCase() !== "list") {
    fail(`${label} aria-autocomplete must be list`);
  }
  const ctrl = getAttr(tag, "aria-controls");
  if (!ctrl) fail(`${label} missing aria-controls`);
  if (ctrl !== "gg-palette-list") fail(`${label} aria-controls must be gg-palette-list (got ${ctrl})`);
  if (!hasAttr(tag, "aria-activedescendant")) {
    fail(`${label} missing aria-activedescendant`);
  }
  const exp = (getAttr(tag, "aria-expanded") || "").toLowerCase();
  if (exp !== "true" && exp !== "false") {
    fail(`${label} aria-expanded must be true/false`);
  }
}

function runRepoMode() {
  const html = readLocal("index.prod.xml");
  verifyHtmlContract(html, "index.prod.xml");
  const rel = extractReleaseId(html);
  if (!rel) fail("index.prod.xml missing /assets/v/<REL>/ pin");
  const searchJs = readLocal(`public/assets/v/${rel}/modules/ui.bucket.search.js`);
  const cmdJs = readLocal(`public/assets/v/${rel}/modules/ui.bucket.cmd.js`);
  verifySourceContracts(searchJs, cmdJs);
  console.log(`PASS: palette a11y contract (mode=repo, release=${rel})`);
}

function parseFlagsRelease(jsonText) {
  let obj = null;
  try {
    obj = JSON.parse(jsonText);
  } catch (_) {
    return "";
  }
  const rel = obj && typeof obj.release === "string" ? obj.release.trim() : "";
  return /^[0-9a-f]{7,40}$/i.test(rel) ? rel : "";
}

async function main() {
  const mode = (getArg("--mode") || "live").trim().toLowerCase();
  if (!["live", "repo"].includes(mode)) {
    fail("invalid --mode (use live|repo)");
  }
  if (mode === "repo") {
    runRepoMode();
    return;
  }

  const base = normalizeBase(getArg("--base"));
  const allowMismatch =
    String(getArg("--allow-mismatch") || process.env.ALLOW_TEMPLATE_MISMATCH || "").trim() === "1";
  const pages = [
    { label: "home", path: "/" },
    { label: "blog", path: "/blog" },
  ];

  const controls = new Set();
  const releases = new Set();
  const mismatchPages = [];

  for (const page of pages) {
    const url = `${base}${page.path}?x=${Date.now()}`;
    const res = fetchPage(url, `LIVE_HTML ${page.label}`);
    const mismatch = String(res.headers["x-gg-template-mismatch"] || "").trim() === "1";
    if (res.status !== 200) {
      if (allowMismatch && mismatch && res.status === 503) {
        mismatchPages.push(page.label);
        continue;
      }
      fail(`LIVE_HTML ${page.label} status ${res.status} (${url})`);
    }

    const html = res.body;
    verifyHtmlContract(html, `LIVE_HTML ${page.label}`);
    controls.add("gg-palette-list");

    const rel = extractReleaseId(html);
    if (!rel) fail(`LIVE_HTML ${page.label} missing /assets/v/<REL>/ pin`);
    releases.add(rel);
  }

  if (controls.size) {
    if (controls.size !== 1) fail(`LIVE_HTML aria-controls mismatch across pages: ${Array.from(controls).join(", ")}`);
    const listboxId = Array.from(controls)[0];
    if (listboxId !== "gg-palette-list") {
      fail(`LIVE_HTML aria-controls must be gg-palette-list (got ${listboxId})`);
    }
  } else if (!allowMismatch) {
    fail("LIVE_HTML controls not detected");
  }

  let rel = "";
  if (releases.size > 1) {
    fail(`LIVE_HTML release mismatch across pages: ${Array.from(releases).join(", ")}`);
  } else if (releases.size === 1) {
    rel = Array.from(releases)[0];
  }

  if (!rel) {
    const flagsRes = fetchPage(`${base}/gg-flags.json?x=${Date.now()}`, "flags");
    if (flagsRes.status !== 200) fail(`flags status ${flagsRes.status}`);
    rel = parseFlagsRelease(flagsRes.body);
    if (!rel) fail("flags missing valid release");
  }

  const searchJsRes = fetchPage(`${base}/assets/v/${rel}/modules/ui.bucket.search.js?x=${Date.now()}`, "search module");
  const cmdJsRes = fetchPage(`${base}/assets/v/${rel}/modules/ui.bucket.cmd.js?x=${Date.now()}`, "command module");
  if (searchJsRes.status !== 200) fail(`search module status ${searchJsRes.status}`);
  if (cmdJsRes.status !== 200) fail(`command module status ${cmdJsRes.status}`);
  const searchJs = searchJsRes.body;
  const cmdJs = cmdJsRes.body;

  verifySourceContracts(searchJs, cmdJs);

  const mismatchNote = mismatchPages.length ? ` mismatch=${mismatchPages.join(",")}` : "";
  console.log(`PASS: palette a11y contract (base=${base}, release=${rel}${mismatchNote})`);
}

main().catch((err) => {
  console.error(`FAIL: verify-palette-a11y: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
