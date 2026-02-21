import fs from "fs";
import path from "path";

const root = process.cwd();
const targets = [
  "public/assets/latest/modules/ui.bucket.channel.js",
  "public/assets/latest/modules/ui.bucket.mixed.js",
  "public/assets/latest/modules/ui.bucket.authors.js",
];
const checks = [
  {
    label: "empty-innerHTML-clear",
    re: /innerHTML\s*=\s*['"]\s*['"]/g,
  },
  {
    label: "insertAdjacentHTML",
    re: /insertAdjacentHTML\s*\(/g,
  },
  {
    label: "outerHTML-assign",
    re: /outerHTML\s*=/g,
  },
];

const failures = [];

function lineOf(src, idx) {
  if (idx < 0) return 1;
  let line = 1;
  for (let i = 0; i < idx; i += 1) {
    if (src.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing file`);
    continue;
  }
  const src = fs.readFileSync(abs, "utf8");
  for (const check of checks) {
    check.re.lastIndex = 0;
    let m;
    while ((m = check.re.exec(src))) {
      failures.push(`${rel}:${lineOf(src, m.index)} forbidden ${check.label}`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_PHASE4_NO_TRIVIAL_HTMLJS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("PASS: phase4 trivial htmljs blocked");
