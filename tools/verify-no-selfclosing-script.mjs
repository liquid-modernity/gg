import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

function lineAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: file missing`);
    continue;
  }
  const source = fs.readFileSync(abs, "utf8");
  const re = /<script\b[^>]*\/\s*>/gi;
  let match;
  while ((match = re.exec(source))) {
    failures.push(`${rel}:${lineAt(source, match.index)} contains invalid self-closing <script .../> tag`);
  }
}

if (failures.length) {
  console.error("VERIFY_NO_SELFCLOSING_SCRIPT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_NO_SELFCLOSING_SCRIPT: PASS");
