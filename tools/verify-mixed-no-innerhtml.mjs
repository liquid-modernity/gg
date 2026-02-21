import fs from "fs";
import path from "path";

const root = process.cwd();
const targetRel = "public/assets/latest/modules/ui.bucket.mixed.js";
const targetPath = path.join(root, targetRel);
const failures = [];

if (!fs.existsSync(targetPath)) {
  failures.push(`missing source file: ${targetRel}`);
} else {
  const src = fs.readFileSync(targetPath, "utf8");
  if (/\.innerHTML\b/.test(src) || /innerHTML\s*=/.test(src)) {
    failures.push("found forbidden innerHTML pattern in mixed module");
  }
}

if (failures.length) {
  console.error("VERIFY_MIXED_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: mixed.js has no innerHTML");
