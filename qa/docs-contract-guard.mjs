#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const requiredDocs = {
  "AGENTS.md": [
    "project purpose",
    "surface route meaning",
    "hard no-touch areas",
    "source vs generated files",
    "how to run qa",
    "blogger xml",
    "cloudflare worker",
    "store static build",
    "comments",
    "sheets and previews",
    "commit and checkpoint policy",
  ],
  "ARCHITECTURE.md": [
    "blogger xml ssr role",
    "cloudflare worker role",
    "static assets role",
    "store static artifact role",
    "landing static route role",
    "registry and copy role",
    "qa guard role",
  ],
  "SURFACE-CONTRACT.md": [
    "/landing = home",
    "/        = blog",
    "/store   = store",
    "`/` route contract",
    "`/landing` route contract",
    "`/store` route contract",
    "post detail contract",
    "page detail contract",
    "label, search, and archive treatment",
  ],
  "SOURCE-OF-TRUTH.md": [
    "source files",
    "generated files",
    "deployment artifacts",
    "must not be edited manually",
    "how to rebuild",
  ],
  "QA-COMMANDS.md": [
    "standard local contract set",
    "cloudflare deploy preparation set",
    "cloudflare deploy set",
    "live smoke set",
    "npm run ci:qa",
    "npm run ci:cloudflare",
  ],
};

const globalMarkers = [
  "Blogger",
  "Cloudflare Worker",
  "edit generated",
  "Blogger native comments",
  "Home(/landing) -> Blog(/) -> current",
];

const failures = [];
const passes = [];

function read(file) {
  if (!existsSync(file)) {
    failures.push(`missing required document: ${file}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

for (const [file, markers] of Object.entries(requiredDocs)) {
  const source = read(file);
  const normalized = source.toLowerCase();
  if (!source) continue;

  for (const marker of markers) {
    if (!normalized.includes(marker.toLowerCase())) {
      failures.push(`${file}: missing required contract marker: ${marker}`);
    }
  }

  passes.push(`${file}: required sections present`);
}

const combined = Object.keys(requiredDocs).map((file) => read(file)).join("\n");
const normalizedCombined = combined.toLowerCase();
for (const marker of globalMarkers) {
  if (!normalizedCombined.includes(marker.toLowerCase())) {
    failures.push(`docs: missing global architecture marker: ${marker}`);
  }
}

const packageJson = read("package.json");
if (packageJson) {
  if (!packageJson.includes('"gaga:verify-docs-contract"')) {
    failures.push("package.json: missing gaga:verify-docs-contract script");
  }
  if (!packageJson.includes("npm run gaga:verify-docs-contract")) {
    failures.push("package.json: ci:qa must include docs contract guard");
  }
}

if (failures.length) {
  console.error("DOCS CONTRACT GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const pass of passes) console.log(`PASS ${pass}`);
console.log("DOCS CONTRACT GUARD PASS");
