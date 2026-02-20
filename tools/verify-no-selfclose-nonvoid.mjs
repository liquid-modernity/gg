import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const tagPattern = /<(div|span|p|time|section|article|header)\b[^>]*\/\s*>/gi;
const failures = [];

function readFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing file`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function lineNumberAt(text, idx) {
  let line = 1;
  for (let i = 0; i < idx; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

for (const rel of files) {
  const src = readFile(rel);
  if (!src) continue;

  tagPattern.lastIndex = 0;
  let m;
  while ((m = tagPattern.exec(src))) {
    const line = lineNumberAt(src, m.index);
    failures.push(`${rel}:${line} contains self-closing <${m[1]}/>`);
  }
}

if (failures.length) {
  console.error("VERIFY_NO_SELFCLOSE_NONVOID: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_NO_SELFCLOSE_NONVOID: PASS");
