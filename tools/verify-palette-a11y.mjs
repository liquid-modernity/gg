#!/usr/bin/env node

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

async function fetchText(url, label) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": "gg-verify-palette-a11y/1.0",
      },
    });
    if (!res.ok) fail(`${label} status ${res.status} (${url})`);
    return await res.text();
  } catch (err) {
    fail(`${label} fetch failed (${err && err.message ? err.message : err})`);
  } finally {
    clearTimeout(timer);
  }
}

function requirePattern(src, re, label, detail) {
  if (!re.test(src)) fail(`${label} missing ${detail}`);
}

async function main() {
  const base = normalizeBase(getArg("--base"));
  const pages = [
    { label: "home", path: "/" },
    { label: "blog", path: "/blog" },
  ];

  const controls = new Set();
  const releases = new Set();

  for (const page of pages) {
    const url = `${base}${page.path}?x=${Date.now()}`;
    const html = await fetchText(url, `LIVE_HTML ${page.label}`);
    const tag = findSearchInputTag(html);
    if (!tag) fail(`LIVE_HTML ${page.label} missing dock search input`);

    const role = (getAttr(tag, "role") || "").toLowerCase();
    if (role !== "combobox") fail(`LIVE_HTML ${page.label} input role must be combobox`);
    if ((getAttr(tag, "aria-autocomplete") || "").toLowerCase() !== "list") {
      fail(`LIVE_HTML ${page.label} aria-autocomplete must be list`);
    }
    const ctrl = getAttr(tag, "aria-controls");
    if (!ctrl) fail(`LIVE_HTML ${page.label} missing aria-controls`);
    if (!hasAttr(tag, "aria-activedescendant")) {
      fail(`LIVE_HTML ${page.label} missing aria-activedescendant`);
    }
    const exp = (getAttr(tag, "aria-expanded") || "").toLowerCase();
    if (exp !== "true" && exp !== "false") {
      fail(`LIVE_HTML ${page.label} aria-expanded must be true/false`);
    }
    controls.add(ctrl);

    const rel = extractReleaseId(html);
    if (!rel) fail(`LIVE_HTML ${page.label} missing /assets/v/<REL>/ pin`);
    releases.add(rel);
  }

  if (controls.size !== 1) fail(`LIVE_HTML aria-controls mismatch across pages: ${Array.from(controls).join(", ")}`);
  const listboxId = Array.from(controls)[0];
  if (listboxId !== "gg-palette-list") {
    fail(`LIVE_HTML aria-controls must be gg-palette-list (got ${listboxId})`);
  }

  if (releases.size !== 1) fail(`LIVE_HTML release mismatch across pages: ${Array.from(releases).join(", ")}`);
  const rel = Array.from(releases)[0];

  const searchJsUrl = `${base}/assets/v/${rel}/modules/ui.bucket.search.js?x=${Date.now()}`;
  const cmdJsUrl = `${base}/assets/v/${rel}/modules/ui.bucket.cmd.js?x=${Date.now()}`;
  const searchJs = await fetchText(searchJsUrl, "search module");
  const cmdJs = await fetchText(cmdJsUrl, "command module");

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

  console.log(`PASS: palette a11y contract (base=${base}, release=${rel}, listbox=${listboxId})`);
}

main().catch((err) => {
  console.error(`FAIL: verify-palette-a11y: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

