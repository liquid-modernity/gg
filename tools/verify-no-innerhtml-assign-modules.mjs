import fs from "fs";
import path from "path";

const root = process.cwd();
const targets = [
  "public/assets/latest/modules/ui.bucket.listing.js",
  "public/assets/latest/modules/ui.bucket.post.js",
  "public/assets/latest/modules/ui.bucket.cmd.js",
];
const reAssign = /\binnerHTML\s*=\s*/g;
const failures = [];

function lineOf(source, index) {
  if (index < 0) return 1;
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing file`);
    continue;
  }
  const source = fs.readFileSync(abs, "utf8");
  reAssign.lastIndex = 0;
  let match;
  while ((match = reAssign.exec(source))) {
    failures.push(`${rel}:${lineOf(source, match.index)} innerHTML assignment is forbidden`);
  }
}

if (failures.length) {
  console.error("VERIFY_NO_INNERHTML_ASSIGN_MODULES: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_NO_INNERHTML_ASSIGN_MODULES: PASS");
