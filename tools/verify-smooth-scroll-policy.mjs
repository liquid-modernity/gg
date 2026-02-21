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
  if (/behavior\s*:\s*['"]smooth['"]/.test(source)) {
    failures.push("hardcoded smooth scroll behavior is forbidden; use GG.services.a11y.scrollBehavior()");
  }
}

if (failures.length) {
  console.error("FAIL: verify-smooth-scroll-policy");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: verify-smooth-scroll-policy");
