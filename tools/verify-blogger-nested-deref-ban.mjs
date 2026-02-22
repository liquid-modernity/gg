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

const checks = [
  {
    label: "unsafe authorPhoto nested deref fallback",
    re: /authorPhoto\.url\s*\?:/gi,
  },
  {
    label: "unsafe author profileUrl nested deref fallback",
    re: /author\.profileUrl\s*\?:/gi,
  },
  {
    label: "unsafe lastUpdated nested deref fallback",
    re: /lastUpdated\.iso8601\s*\?:/gi,
  },
  {
    label: "unsafe authorPhoto url condition",
    re: /cond\s*=\s*(['"])data:post\.author\.authorPhoto\.url\1/gi,
  },
  {
    label: "unsafe featuredImage isResizable condition",
    re: /cond\s*=\s*(['"])data:post\.featuredImage\.isResizable\1/gi,
  },
  {
    label: "unsafe author profileUrl condition",
    re: /cond\s*=\s*(['"])data:post\.author\.profileUrl\1/gi,
  },
  {
    label: "unsafe author aboutMe condition missing author guard",
    re: /cond\s*=\s*(['"])data:post\.author\.aboutMe\s+and\s+data:view\.isPost\1/gi,
  },
];

function hasNearbyLocationGuard(source, index) {
  const start = Math.max(0, index - 320);
  const end = Math.min(source.length, index + 320);
  const window = source.slice(start, end);
  return /cond\s*=\s*(['"])[\s\S]{0,260}?data:post\.location\s+and[\s\S]{0,260}?data:post\.location\.mapsUrl[\s\S]{0,260}?\1/i.test(window);
}

function hasNearbyAuthorProfileGuard(source, index) {
  const start = Math.max(0, index - 320);
  const end = Math.min(source.length, index + 320);
  const window = source.slice(start, end);
  return /cond\s*=\s*(['"])[\s\S]{0,260}?data:post\.author\s+and[\s\S]{0,260}?data:post\.author\.profileUrl[\s\S]{0,260}?\1/i.test(window);
}

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing template file`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");

  for (const check of checks) {
    let match;
    while ((match = check.re.exec(source))) {
      const index = match.index;
      failures.push(
        `${rel}:${lineNumberAt(source, index)} ${check.label} | ${snippetAt(source, index)}`
      );
    }
  }

  const locationUse = /data:post\.location\.mapsUrl/gi;
  let locationMatch;
  while ((locationMatch = locationUse.exec(source))) {
    const index = locationMatch.index;
    if (hasNearbyLocationGuard(source, index)) continue;
    failures.push(
      `${rel}:${lineNumberAt(source, index)} unsafe location.mapsUrl usage without nearby location guard | ${snippetAt(source, index)}`
    );
  }

  const authorProfileHref = /expr:href\s*=\s*(['"])data:post\.author\.profileUrl\1/gi;
  let authorProfileMatch;
  while ((authorProfileMatch = authorProfileHref.exec(source))) {
    const index = authorProfileMatch.index;
    if (hasNearbyAuthorProfileGuard(source, index)) continue;
    failures.push(
      `${rel}:${lineNumberAt(source, index)} unsafe author.profileUrl href without nearby author/profileUrl guard | ${snippetAt(source, index)}`
    );
  }
}

if (failures.length) {
  console.error("VERIFY_BLOGGER_NESTED_DEREF_BAN: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_BLOGGER_NESTED_DEREF_BAN: PASS");
