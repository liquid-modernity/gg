import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function lineForIndex(src, idx) {
  if (idx < 0) return 0;
  let line = 1;
  for (let i = 0; i < idx; i += 1) {
    if (src.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function extractReleaseId(indexXml) {
  const m = indexXml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css|boot\.js)/);
  return m ? m[1] : "";
}

function verifyDockSurfaceOverrides(css, label) {
  const ruleRe = /([^{}]+)\{[^{}]*\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = String(m[1] || "").trim().replace(/\s+/g, " ");
    if (!selector) continue;
    if (selector.indexOf("nav.gg-dock") === -1) continue;
    if (selector.indexOf("data-gg-surface") === -1) continue;
    const line = lineForIndex(css, m.index);
    failures.push(
      `${label}:${line} dock selector must not depend on data-gg-surface -> ${selector}`
    );
  }
}

function verifyPostcardsSkeletonCss(css, label) {
  const re = /#postcards\s*\[\s*data-gg-skeleton\s*=\s*["']on["']\s*\]\s*\{([^}]*)\}/gi;
  let m;
  while ((m = re.exec(css))) {
    const block = String(m[1] || "");
    const low = block.toLowerCase();
    const hides =
      /visibility\s*:\s*hidden/.test(low) ||
      /display\s*:\s*none/.test(low) ||
      /opacity\s*:\s*0(?:[;\s}]|$)/.test(low);
    if (hides) {
      const line = lineForIndex(css, m.index);
      failures.push(
        `${label}:${line} #postcards skeleton rule must not hide SSR content`
      );
    }
  }
}

function isSidebarRootSelector(selector) {
  const normalized = String(selector || "").trim();
  if (!normalized) return false;
  return /(?:^|[\s>+~])\.gg-blog-sidebar(?:--left|--right)?(?:[:\[].*)?$/i.test(
    normalized
  );
}

function verifySidebarWidthTokens(css, label) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selectors = String(m[1] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!selectors.some((s) => isSidebarRootSelector(s))) continue;

    const body = String(m[2] || "");
    const declRe = /(^|[;\s])width\s*:\s*([^;{}]+)/gim;
    let d;
    while ((d = declRe.exec(body))) {
      const value = String(d[2] || "").trim().toLowerCase();
      const tokenized = value.includes("var(");
      const keyword =
        value === "auto" ||
        value === "unset" ||
        value === "initial" ||
        value === "inherit";
      if (tokenized || keyword) continue;
      const line = lineForIndex(css, m.index + d.index);
      failures.push(
        `${label}:${line} width for sidebar root selector must be tokenized (found: ${value})`
      );
    }
  }
}

function verifyCssFile(relPath, label) {
  const css = readFile(relPath);
  if (!css) return;
  if (!/--gg-col-left:\s*240px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-left: 240px`);
  }
  if (!/--gg-col-main:\s*1440px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-main: 1440px`);
  }
  if (!/--gg-col-right:\s*240px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-right: 240px`);
  }
  if (!/--gg-drawer-max-vw-compact:\s*[^;]+/.test(css)) {
    failures.push(`${label}: missing layout token --gg-drawer-max-vw-compact`);
  }
  if (!/--gg-drawer-max-vw-mobile:\s*[^;]+/.test(css)) {
    failures.push(`${label}: missing layout token --gg-drawer-max-vw-mobile`);
  }
  if (
    !/\.gg-blog-layout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*var\(--gg-col-left\)\)\s+minmax\(0,\s*var\(--gg-col-main\)\)\s+minmax\(0,\s*var\(--gg-col-right\)\)/.test(
      css
    )
  ) {
    failures.push(`${label}: .gg-blog-layout must use 3-column token contract`);
  }
  verifyDockSurfaceOverrides(css, label);
  verifyPostcardsSkeletonCss(css, label);
  verifySidebarWidthTokens(css, label);
}

const indexXml = readFile("index.prod.xml");
const rel = extractReleaseId(indexXml);
if (!rel) {
  failures.push("unable to extract release id from index.prod.xml");
}

verifyCssFile("public/assets/latest/main.css", "latest main.css");
if (rel) {
  verifyCssFile(`public/assets/v/${rel}/main.css`, `pinned main.css (v/${rel})`);
}

if (failures.length) {
  console.error("VERIFY_UI_GUARDRAILS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_UI_GUARDRAILS: PASS");
