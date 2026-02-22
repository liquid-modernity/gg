import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function extractFunctionBody(source, marker) {
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
      if (ch === quote) quote = "";
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

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const marker = "services.api.fetch = services.api.fetch || function(url, type){";
  const body = extractFunctionBody(source, marker);
  if (!body) {
    fail("unable to locate services.api.fetch() block");
  } else {
    if (!/\.catch\s*\(/.test(body)) {
      fail("services.api.fetch() missing catch handler");
    }
    if (/\.catch\s*\(\s*function\s*\(\s*\)\s*\{/.test(body)) {
      fail("services.api.fetch() has catch(function(){ ... }) without error parameter");
    }
    if (/\berr\b/.test(body) && !/\.catch\s*\(\s*function\s*\(\s*err\b/.test(body)) {
      fail("services.api.fetch() references err but catch signature does not receive err");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_API_FETCH_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: api fetch catch contract");
