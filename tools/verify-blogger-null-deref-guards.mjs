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

function isAuthorPhotoUsageGuarded(source, index) {
  const backStart = Math.max(0, index - 600);
  const lookStart = Math.max(0, index - 220);
  const lookEnd = Math.min(source.length, index + 260);
  const backWindow = source.slice(backStart, index);
  const nearWindow = source.slice(lookStart, lookEnd);

  const guardCond =
    /cond\s*=\s*(['"])[\s\S]{0,280}?data:post\.author\.authorPhoto[\s\S]{0,120}?and[\s\S]{0,120}?data:post\.author\.authorPhoto\.url[\s\S]{0,280}?\1/i;
  const guardedTernary =
    /data:post\.author\.authorPhoto\s*\?\s*data:post\.author\.authorPhoto\.url/i;
  const guardedInlineAnd =
    /data:post\.author\.authorPhoto\s+and\s+data:post\.author\.authorPhoto\.url/i;

  return (
    guardCond.test(backWindow) ||
    guardedTernary.test(nearWindow) ||
    guardedInlineAnd.test(nearWindow)
  );
}

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing template file`);
    continue;
  }
  const source = fs.readFileSync(abs, "utf8");

  const featuredUnsafe = /cond\s*=\s*(['"])data:post\.featuredImage\.isResizable\1/gi;
  let match;
  while ((match = featuredUnsafe.exec(source))) {
    const line = lineNumberAt(source, match.index);
    failures.push(
      `${rel}:${line} unsafe featuredImage guard (missing data:post.featuredImage and ...) | ${snippetAt(source, match.index)}`
    );
  }

  const authorPhotoUse = /data:post\.author\.authorPhoto\.url/gi;
  while ((match = authorPhotoUse.exec(source))) {
    const index = match.index;
    if (isAuthorPhotoUsageGuarded(source, index)) continue;
    const line = lineNumberAt(source, index);
    failures.push(
      `${rel}:${line} authorPhoto.url usage missing nearby guard | ${snippetAt(source, index)}`
    );
  }
}

if (failures.length) {
  console.error("VERIFY_BLOGGER_NULL_DEREF_GUARDS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_BLOGGER_NULL_DEREF_GUARDS: PASS");
