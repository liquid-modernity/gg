import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) {
    failures.push(`${relPath}: file missing`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function lineAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function extractReleaseId(indexXml) {
  if (!indexXml) return "";
  const m =
    indexXml.match(/\/assets\/v\/([A-Za-z0-9._-]+)\/boot\.js/i) ||
    indexXml.match(/\/assets\/v\/([A-Za-z0-9._-]+)\/main\.css/i);
  return m && m[1] ? m[1] : "";
}

const indexXml = readFile("index.prod.xml");
const releaseId = extractReleaseId(indexXml);
if (!releaseId) failures.push("index.prod.xml: unable to extract pinned release id");

const targets = [
  { rel: "public/assets/latest/modules/ui.bucket.core.js", label: "latest core" },
  { rel: "public/assets/latest/modules/ui.bucket.listing.js", label: "latest listing" },
  { rel: "public/assets/latest/modules/ui.bucket.search.js", label: "latest search" },
];

if (releaseId) {
  targets.push(
    {
      rel: `public/assets/v/${releaseId}/modules/ui.bucket.core.js`,
      label: `pinned core (v/${releaseId})`,
    },
    {
      rel: `public/assets/v/${releaseId}/modules/ui.bucket.listing.js`,
      label: `pinned listing (v/${releaseId})`,
    },
    {
      rel: `public/assets/v/${releaseId}/modules/ui.bucket.search.js`,
      label: `pinned search (v/${releaseId})`,
    }
  );
}

const checks = [
  { re: /=>/g, reason: "arrow function token (=>) is not ES5" },
  { re: /\bconst\b/g, reason: "`const` declaration is not ES5" },
  { re: /\blet\b/g, reason: "`let` declaration is not ES5" },
  { re: /\basync\s+function\b/g, reason: "`async function` is not ES5" },
  { re: /\bawait\b/g, reason: "`await` token is not ES5" },
];

for (const target of targets) {
  const source = readFile(target.rel);
  if (!source) continue;
  for (const check of checks) {
    check.re.lastIndex = 0;
    let match;
    let hitCount = 0;
    while ((match = check.re.exec(source))) {
      hitCount += 1;
      failures.push(
        `${target.rel}:${lineAt(source, match.index)} ${target.label}: ${check.reason}`
      );
      if (hitCount >= 5) {
        failures.push(`${target.rel}: additional ${check.reason} hits omitted`);
        break;
      }
      if (!match[0]) break;
    }
  }
}

if (failures.length) {
  console.error("VERIFY_RUNTIME_ES5_COMPAT: FAIL");
  failures.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log(
  `VERIFY_RUNTIME_ES5_COMPAT: PASS (release=${releaseId || "unknown"}, files=${targets.length})`
);
