import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.search.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const src = fs.readFileSync(sourcePath, "utf8");
  if (/\.innerHTML\b/.test(src) || /innerHTML\s*=/.test(src)) {
    failures.push("found forbidden innerHTML write/read pattern in search module");
  }
}

if (failures.length) {
  console.error("VERIFY_SEARCH_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_SEARCH_NO_INNERHTML: PASS");
