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

function findAllMatches(source, re) {
  const out = [];
  let match;
  while ((match = re.exec(source))) {
    out.push({ index: match.index, text: match[0] });
  }
  return out;
}

function hasNearbyGuard(source, index, requiredFragment) {
  const backStart = Math.max(0, index - 600);
  const backWindow = source.slice(backStart, index);
  const condRe = /cond\s*=\s*(['"])([\s\S]*?)\1/gi;
  let match;
  const required = requiredFragment.toLowerCase();
  while ((match = condRe.exec(backWindow))) {
    const cond = String(match[2] || "").toLowerCase();
    if (cond.includes(required)) return true;
  }
  return false;
}

const directChecks = [
  {
    label: "unsafe authorPhoto ternary",
    re: /data:post\.author\.authorPhoto\.url\s*\?:/gi,
  },
  {
    label: "unsafe lastUpdated ternary",
    re: /data:post\.lastUpdated\.iso8601\s*\?:/gi,
  },
  {
    label: "unsafe authorPhoto cond",
    re: /cond\s*=\s*(['"])data:post\.author\.authorPhoto\.url\1/gi,
  },
];

const guardedChecks = [
  {
    label: "labels.first guard missing nearby cond",
    re: /data:post\.labels\.first\.(url|name)/gi,
    required: "labels.first",
  },
  {
    label: "labels[0] guard missing nearby cond",
    re: /data:post\.labels\[0\]\.(url|name)/gi,
    required: "labels[0]",
  },
];

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: missing template file`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");

  for (const check of directChecks) {
    const matches = findAllMatches(source, check.re);
    for (const m of matches) {
      const line = lineNumberAt(source, m.index);
      failures.push(
        `${rel}:${line} ${check.label} | ${snippetAt(source, m.index)}`
      );
    }
  }

  for (const check of guardedChecks) {
    const matches = findAllMatches(source, check.re);
    for (const m of matches) {
      if (hasNearbyGuard(source, m.index, check.required)) continue;
      const line = lineNumberAt(source, m.index);
      failures.push(
        `${rel}:${line} ${check.label} (${m.text}) | ${snippetAt(source, m.index)}`
      );
    }
  }
}

if (failures.length) {
  console.error("VERIFY_BLOGGER_UNSAFE_DEREF: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_BLOGGER_UNSAFE_DEREF: PASS");
