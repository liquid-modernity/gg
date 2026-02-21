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
  if (/LEGACY-0032|LEGACY-0036/.test(source)) {
    fail("legacy ids LEGACY-0032/LEGACY-0036 must be removed from core module");
  }
  const regionMatch = source.match(/GG\.modules\.ShortcodesV2[\s\S]*?GG\.modules\.Skeleton/);
  if (!regionMatch) {
    fail("unable to locate ShortcodesV2 region");
  } else {
    const region = regionMatch[0];
    if (/el\.innerHTML\s*=\s*html/.test(region)) {
      fail("forbidden pattern found in shortcodes region: el.innerHTML = html");
    }
    if (/\.innerHTML\s*=\s*[^;\n]*\.innerHTML\.replace\(/.test(region)) {
      fail("forbidden pattern found in shortcodes region: .innerHTML = .innerHTML.replace(...)");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_SHORTCODES_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: shortcodes has no innerHTML writes");
