#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function readFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function extractBlock(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  let quote = "";
  let esc = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === quote) {
        quote = "";
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return "";
}

function indexOfFirst(body, needles) {
  let idx = -1;
  for (const n of needles) {
    const i = body.indexOf(n);
    if (i !== -1 && (idx === -1 || i < idx)) idx = i;
  }
  return idx;
}

function verifyDoSwapContract(source, rel, marker) {
  const body = extractBlock(source, marker);
  if (!body) {
    fail(`${rel}: unable to locate doSwap block`);
    return;
  }

  const fragIdx = indexOfFirst(body, [
    "cloneSwapContent(",
    "buildSwapFragment(",
    "createDocumentFragment("
  ]);
  if (fragIdx === -1) {
    fail(`${rel}: doSwap missing fragment builder call`);
  }

  const clearMatchers = [
    { re: /\b(?:target|t)\.innerHTML\s*=/g, label: "innerHTML clear/assign" },
    { re: /\b(?:target|t)\.textContent\s*=\s*['"]\s*['"]/g, label: "textContent clear" }
  ];
  for (const m of clearMatchers) {
    for (const hit of body.matchAll(m.re)) {
      if (fragIdx !== -1 && hit.index < fragIdx) {
        fail(`${rel}: doSwap clears target before fragment is built (${m.label})`);
      }
    }
  }

  if (/\b(?:target|t)\.innerHTML\s*=/.test(body)) {
    fail(`${rel}: doSwap still uses innerHTML assignment`);
  }
  if (!/replaceWithFragment\s*\(|replaceChildren\s*\(/.test(body)) {
    fail(`${rel}: doSwap missing replaceChildren/replaceWithFragment atomic swap path`);
  }
  if (!/\bcatch\s*\(/.test(body) || !/\bfinally\s*\{/.test(body)) {
    fail(`${rel}: doSwap must use try/catch/finally`);
  }
  if (!/classList\.remove\(['"]is-loading['"]\)/.test(body)) {
    fail(`${rel}: doSwap finally must remove loading class`);
  }
}

const targets = [
  {
    rel: "public/assets/latest/core.js",
    marker: "var doSwap=function(){"
  },
  {
    rel: "public/assets/latest/modules/ui.bucket.core.js",
    marker: "var doSwap = function(){"
  }
];

for (const t of targets) {
  const source = readFile(t.rel);
  if (!source) continue;
  verifyDoSwapContract(source, t.rel, t.marker);
  if (!source.includes("Failed to load, retry")) {
    fail(`${t.rel}: missing toast copy "Failed to load, retry"`);
  }
}

if (failures.length) {
  console.error("VERIFY_RENDER_ATOMIC_SWAP: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: render atomic swap failsafe");
