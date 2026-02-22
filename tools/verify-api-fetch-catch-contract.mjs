import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(message) {
  failures.push(message);
}

function extractFunctionBody(source, markerRegex) {
  const match = markerRegex.exec(source);
  if (!match) return "";

  const start = match.index;
  const open = source.indexOf("{", start);
  if (open === -1) return "";

  let depth = 0;
  let quote = "";
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
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

function hasErrCatchSignature(body) {
  const rx =
    /\.catch\s*\(\s*(?:function\s*\(([^)]*)\)|\(([^)]*)\)\s*=>|([A-Za-z_$][\w$]*)\s*=>)/g;
  let match;
  while ((match = rx.exec(body))) {
    const params = String(match[1] || match[2] || match[3] || "").trim();
    if (/(^|[\s,])err($|[\s,])/i.test(params)) return true;
  }
  return false;
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const marker =
    /services\.api\.fetch\s*=\s*(?:services\.api\.fetch\s*\|\|\s*)?function\s*\(\s*url\s*,\s*type\s*\)\s*\{/;
  const body = extractFunctionBody(source, marker);

  if (!body) {
    fail("unable to locate services.api.fetch block");
  } else {
    if (/\.catch\s*\(\s*function\s*\(\s*\)\s*\{/.test(body)) {
      fail("services.api.fetch contains catch(function(){ ... }) without err parameter");
    }

    const hasErrRef = /\berr\b/.test(body);
    const hasErrParam = hasErrCatchSignature(body);

    if (!hasErrParam) {
      fail("services.api.fetch catch signature must receive err");
    }
    if (hasErrRef && !hasErrParam) {
      fail("services.api.fetch references err but catch signature does not receive err");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_API_FETCH_CATCH_CONTRACT: FAIL");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("VERIFY_API_FETCH_CATCH_CONTRACT: PASS");
