import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

function lineNumberAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function snippetAt(source, index, radius = 140) {
  const start = Math.max(0, index - radius);
  const end = Math.min(source.length, index + radius);
  return source
    .slice(start, end)
    .replace(/\s+/g, " ")
    .trim();
}

const banned = /labels\.first\.|labels\[0\]\./gi;

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing template file`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");
  let match;
  while ((match = banned.exec(source))) {
    const index = match.index;
    failures.push(
      `${rel}:${lineNumberAt(source, index)} banned token "${match[0]}" | ${snippetAt(source, index)}`
    );
  }
}

if (failures.length) {
  console.error("VERIFY_BLOGGER_LABEL_FIRST_INDEX_BAN: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_BLOGGER_LABEL_FIRST_INDEX_BAN: PASS");
