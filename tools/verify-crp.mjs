import fs from "fs";
import path from "path";

const root = process.cwd();
const files = [
  { name: "prod", path: "index.prod.xml" },
  { name: "dev", path: "index.dev.xml" },
];

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function stripNoscript(src) {
  return src.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
}

function decodeEntities(src) {
  return src
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function hasMainJs(src) {
  return /\/assets\/[^"']+\/main\.js/.test(src);
}

function hasBootDefer(src) {
  return /<script(?=[^>]*boot\.js)(?=[^>]*\bdefer\b)[^>]*>/i.test(src);
}

function hasMainCssPreload(src) {
  return /<link(?=[^>]*rel=['"]preload['"])(?=[^>]*as=['"]style['"])(?=[^>]*main\.css)(?=[^>]*onload=['"][^'"]*rel=["']stylesheet["'][^'"]*['"])[^>]*>/i.test(src);
}

function getAttr(tag, name) {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(['"])(.*?)\\1`, "i");
  const m = tag.match(re);
  return m ? m[2] : "";
}

function hasFontsStylesheetOutsideNoscript(src) {
  const cleaned = stripNoscript(src);
  const links = cleaned.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const href = getAttr(tag, "href");
    if (!href || href.indexOf("fonts.googleapis.com") === -1) continue;
    const rel = (getAttr(tag, "rel") || "").toLowerCase();
    if (rel === "stylesheet") return true;
  }
  return false;
}

function hasFontsPreconnect(src) {
  return /<link(?=[^>]*fonts\.gstatic\.com)(?=[^>]*rel=['"]preconnect['"])[^>]*>/i.test(src);
}

function runChecks(name, src) {
  const results = [];
  if (!src) {
    results.push({ ok: false, label: "file", note: `${name}: missing file` });
    return results;
  }
  results.push({ ok: !hasMainJs(src), label: "no-main-js", note: "no direct main.js in HTML" });
  results.push({ ok: hasBootDefer(src), label: "boot-defer", note: "boot.js present and defer" });
  results.push({ ok: hasMainCssPreload(src), label: "css-preload", note: "main.css loaded via preload+onload" });
  results.push({ ok: !hasFontsStylesheetOutsideNoscript(src), label: "fonts-nonblocking", note: "fonts.googleapis.com not rel=stylesheet outside noscript" });
  results.push({ ok: hasFontsPreconnect(src), label: "fonts-preconnect", note: "fonts.gstatic.com preconnect present" });
  return results;
}

let failed = false;
console.log("VERIFY_CRP");

for (const f of files) {
  const src = decodeEntities(stripNoscript(readFile(f.path)));
  const checks = runChecks(f.name, src);
  checks.forEach((c) => {
    const status = c.ok ? "OK" : "FAIL";
    console.log(`${status} ${f.name} ${c.label} - ${c.note}`);
    if (!c.ok) failed = true;
  });
}

if (failed) {
  console.error("VERIFY_CRP: FAIL");
  process.exit(1);
}

console.log("VERIFY_CRP: PASS");
