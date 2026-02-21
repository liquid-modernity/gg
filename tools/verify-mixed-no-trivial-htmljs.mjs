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
  if (/insertAdjacentHTML\s*\(/.test(src)) {
    failures.push("found forbidden insertAdjacentHTML pattern in mixed module");
  }
  if (/outerHTML\s*=/.test(src)) {
    failures.push("found forbidden outerHTML assignment in mixed module");
  }
}

if (failures.length) {
  console.error("VERIFY_MIXED_NO_TRIVIAL_HTMLJS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: mixed.js trivial htmljs blocked");
