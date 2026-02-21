import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  if (/innerHTML\s*=\s*['"]\s*['"]/.test(source)) {
    failures.push("empty innerHTML assignment found; use textContent='' or removeChild loop");
  }
}

if (failures.length) {
  console.error("VERIFY_NO_INNERHTML_CLEAR: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_NO_INNERHTML_CLEAR: PASS");
