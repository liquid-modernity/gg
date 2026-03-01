import fs from "fs";
import path from "path";

const root = process.cwd();
const file = path.join(root, "index.prod.xml");

if (!fs.existsSync(file)) {
  console.error("VERIFY_NO_INLINE_DIAGNOSTIC_SCRIPT: FAIL");
  console.error("- index.prod.xml missing");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
const failures = [];

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

// Hard fail: legacy inline diagnostic CDATA block pattern.
const cdataScriptRe = /<script\b[^>]*>\s*(?:\/\/)?\s*<!\[CDATA\[[\s\S]*?<\/script>/gi;
let m;
while ((m = cdataScriptRe.exec(source))) {
  const snippet = m[0].slice(0, 400);
  // Scope to diagnostic-style inline blocks, not structured data.
  if (/console\.(warn|log|error)|MutationObserver|ggSbError|gg-env|slot-assert|segmented/i.test(snippet)) {
    failures.push(`index.prod.xml:${lineNumberAt(source, m.index)} inline diagnostic CDATA script detected`);
  }
}

// Guard legacy marker from prior inline diagnostics.
const legacyMarkers = [
  "[GG][LeftNav] segmented slot assertion failed",
  "sb.dataset.ggSbError='slot-assert'",
  "meta[name=\"gg-env\"]",
];
for (const marker of legacyMarkers) {
  const idx = source.indexOf(marker);
  if (idx >= 0) {
    failures.push(`index.prod.xml:${lineNumberAt(source, idx)} legacy diagnostic marker detected: ${marker}`);
  }
}

if (failures.length) {
  console.error("VERIFY_NO_INLINE_DIAGNOSTIC_SCRIPT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_NO_INLINE_DIAGNOSTIC_SCRIPT: PASS");
