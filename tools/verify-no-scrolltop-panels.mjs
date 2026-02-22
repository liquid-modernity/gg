import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const blockMatch = source.match(/GG\.modules\.Panels\s*=\s*\(function\s*\(\)\s*\{[\s\S]*?return\s*\{\s*init:\s*init,\s*setLeft:\s*setLeft,\s*setRight:\s*setRight\s*\};[\s\S]*?\}\)\(\);/);

  if (!blockMatch) {
    fail("unable to locate GG.modules.Panels module block");
  } else {
    const block = blockMatch[0];

    if (/scrollTo\s*\(\s*\{[\s\S]*?\btop\s*:\s*0\b/.test(block)) {
      fail("Panels module contains scrollTo({ top: 0 ... })");
    }

    if (!/preventScroll\s*:\s*true/.test(block)) {
      fail("Panels module missing preventScroll focus usage");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_NO_SCROLLTOP_PANELS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: panels no scrolltop contract");
