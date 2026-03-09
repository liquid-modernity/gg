import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function extractBalancedBlock(source, openBraceIndex) {
  if (openBraceIndex < 0 || source.charAt(openBraceIndex) !== "{") return null;
  let depth = 0;
  let i = openBraceIndex;
  let quote = "";
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (; i < source.length; i += 1) {
    const ch = source.charAt(i);
    const next = source.charAt(i + 1);

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openBraceIndex, i + 1);
      if (depth < 0) return null;
    }
  }
  return null;
}

function extractFunctionBlock(source, fnName) {
  const re = new RegExp(`function\\s+${fnName}\\s*\\(`, "g");
  let m;
  while ((m = re.exec(source))) {
    const brace = source.indexOf("{", m.index);
    if (brace < 0) continue;
    const block = extractBalancedBlock(source, brace);
    if (block) return block;
  }
  return null;
}

function extractModuleSlice(source, marker, stopMarkers) {
  const start = source.indexOf(marker);
  if (start < 0) return null;
  let end = source.length;
  const markers = Array.isArray(stopMarkers) ? stopMarkers : [];
  for (const one of markers) {
    const idx = source.indexOf(one, start + marker.length);
    if (idx > start && idx < end) end = idx;
  }
  return source.slice(start, end);
}

function hasForbiddenPanelHtmlMutation(source) {
  return (
    /\bpanel\.(?:innerHTML|outerHTML)\s*=/.test(source) ||
    /\bpanel\.insertAdjacentHTML\s*\(/.test(source)
  );
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const infoModule = extractModuleSlice(source, "GG.modules.InfoPanel = (function", [
    "GG.modules.Panels = (function",
  ]);
  if (!infoModule) {
    fail("unable to locate GG.modules.InfoPanel module block");
  } else {
    if (!/ensurePanelSkeleton\s*\(/.test(infoModule)) {
      fail("GG.modules.InfoPanel block no longer references ensurePanelSkeleton()");
    }
    if (hasForbiddenPanelHtmlMutation(infoModule)) {
      fail("GG.modules.InfoPanel contains forbidden panel HTML mutation");
    }
  }

  const panelsModule = extractModuleSlice(source, "GG.modules.Panels = (function", [
    "})(window.GG, window, document);",
  ]);
  if (!panelsModule) {
    fail("unable to locate GG.modules.Panels module block");
  } else if (hasForbiddenPanelHtmlMutation(panelsModule)) {
    fail("GG.modules.Panels contains forbidden panel HTML mutation");
  }

  const skeletonBlock = extractFunctionBlock(source, "ensurePanelSkeleton");
  if (!skeletonBlock) {
    fail("unable to locate ensurePanelSkeleton() block");
  } else {
    if (!/renderTocSkeleton\s*\(/.test(skeletonBlock)) {
      fail("ensurePanelSkeleton() must call renderTocSkeleton()");
    }
    if (!/TOC_HINT_LOCK/.test(skeletonBlock)) {
      fail("ensurePanelSkeleton() must use TOC_HINT_LOCK hint contract");
    }
    if (hasForbiddenPanelHtmlMutation(skeletonBlock)) {
      fail("ensurePanelSkeleton() contains forbidden panel HTML mutation");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_CORE_PANEL_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: panels skeleton has no innerHTML");
