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
  const checks = [
    { label: "main.setAttribute('inert')", re: /main\.setAttribute\(\s*['"]inert['"]/ },
    { label: "setMainInert(", re: /\bsetMainInert\s*\(/ },
    { label: "main.setAttribute('aria-hidden')", re: /main\.setAttribute\(\s*['"]aria-hidden['"]/ },
  ];

  for (const check of checks) {
    if (check.re.test(source)) failures.push(`forbidden pattern found: ${check.label}`);
  }
}

if (failures.length) {
  console.error("FAIL: verify-panels-inert-safety");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: verify-panels-inert-safety");
