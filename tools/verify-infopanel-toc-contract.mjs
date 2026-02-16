import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function extractReleaseId(indexXml) {
  const m = indexXml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css|boot\.js)/);
  return m ? m[1] : "";
}

function verifyCore(core, label) {
  if (!core) {
    failures.push(`${label} missing or empty`);
    return;
  }

  const requiredTokens = [
    "data-gg-slot=\"toc\"",
    "data-gg-slot=\"toc-hint\"",
    "var TOC_CAP",
    "var TOC_TTL_MS",
    "var TOC_LRU_MAX",
    "var TOC_HINT_LOCK",
    "function abortToc",
    "AbortController",
    "signal:",
    "querySelector('.post-body",
  ];

  requiredTokens.forEach((token) => {
    if (!core.includes(token)) {
      failures.push(`${label}: missing token "${token}"`);
    }
  });

  const lockSkeletonHits = (
    core.match(/renderTocSkeleton\(4,\s*(?:'Lock this card to load headings\.'|TOC_HINT_LOCK)\)/g) ||
    []
  ).length;
  if (lockSkeletonHits < 3) {
    failures.push(
      `${label}: expected at least 3 lock-state TOC skeleton calls (found ${lockSkeletonHits})`
    );
  }

  const abortCalls = (core.match(/abortToc\(/g) || []).length;
  if (abortCalls < 3) {
    failures.push(`${label}: expected abortToc usage in multiple states (found ${abortCalls})`);
  }

  if (!/Math\.min\(\s*headings\.length\s*,\s*TOC_CAP\s*\)/.test(core)) {
    failures.push(`${label}: missing heading cap expression with TOC_CAP`);
  }
}

const indexXml = readFile("index.prod.xml");
const rel = extractReleaseId(indexXml);
if (!rel) failures.push("unable to extract release id from index.prod.xml");

verifyCore(readFile("public/assets/latest/modules/ui.bucket.core.js"), "latest ui.bucket.core.js");
if (rel) {
  verifyCore(
    readFile(`public/assets/v/${rel}/modules/ui.bucket.core.js`),
    `pinned ui.bucket.core.js (v/${rel})`
  );
}

if (failures.length) {
  console.error("VERIFY_INFOPANEL_TOC_CONTRACT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_INFOPANEL_TOC_CONTRACT: PASS");
