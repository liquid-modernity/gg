import fs from "fs";
import path from "path";

const root = process.cwd();
const templateFiles = ["index.prod.xml", "index.dev.xml"];
const cssRel = "public/assets/latest/main.css";
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function decodeEntities(src) {
  return String(src || "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function getAttr(tag, name) {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(['"])(.*?)\\1`, "i");
  const m = String(tag || "").match(re);
  return m ? m[2] : "";
}

const css = read(cssRel);
const decodedTemplates = templateFiles.map((rel) => ({ rel, src: decodeEntities(read(rel)) }));

const fontFaceBlocks = (css.match(/@font-face\s*\{[\s\S]*?\}/gi) || []);
fontFaceBlocks.forEach((block, idx) => {
  const m = block.match(/font-display\s*:\s*([a-z-]+)\s*;/i);
  if (!m) {
    fail(`@font-face #${idx + 1} missing font-display`);
    return;
  }
  const value = String(m[1] || "").toLowerCase();
  if (value !== "swap" && value !== "optional") {
    fail(`@font-face #${idx + 1} font-display must be swap/optional, got: ${value}`);
  }
});

const customFontSignals =
  /fonts\.googleapis\.com|fonts\.gstatic\.com|Material Symbols Rounded|@font-face/i.test(
    `${decodedTemplates.map((it) => it.src).join("\n")}\n${css}`
  );

const preloadHrefs = new Set();
decodedTemplates.forEach(({ rel, src }) => {
  const links = src.match(/<link\b[^>]*>/gi) || [];
  let filePreloadCount = 0;
  links.forEach((tag) => {
    const relAttr = (getAttr(tag, "rel") || "").toLowerCase();
    const asAttr = (getAttr(tag, "as") || "").toLowerCase();
    const typeAttr = (getAttr(tag, "type") || "").toLowerCase();
    const hrefAttr = getAttr(tag, "href");
    if (relAttr !== "preload" || asAttr !== "font") return;
    if (typeAttr !== "font/woff2") {
      fail(`${rel} font preload must use type='font/woff2'`);
      return;
    }
    if (!/\.woff2(?:[?#]|$)/i.test(hrefAttr || "")) {
      fail(`${rel} font preload href must target .woff2`);
      return;
    }
    filePreloadCount += 1;
    preloadHrefs.add(hrefAttr);
  });
  if (customFontSignals && filePreloadCount < 1) {
    fail(`${rel} missing critical font preload (as=font, type=font/woff2)`);
  }
});

if (preloadHrefs.size > 2) {
  fail(`too many critical font preloads: ${preloadHrefs.size} (max 2)`);
}

if (customFontSignals && preloadHrefs.size < 1) {
  fail("custom font usage detected but no critical woff2 preload found");
}

if (failures.length) {
  console.error("VERIFY_FONT_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: font policy");
