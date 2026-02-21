import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function extractFunctionBlock(source, signature) {
  const start = source.indexOf(signature);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return "";
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const domParserCalls = source.match(/\bDOMParser\s*\(/g) || [];
  const parseFromStringCalls = source.match(/\bparseFromString\s*\(/g) || [];
  const parserBlock = extractFunctionBlock(source, "function parseHtmlDoc(");

  if (domParserCalls.length !== 1) {
    fail(`DOMParser call count must be 1, found ${domParserCalls.length}`);
  }
  if (parseFromStringCalls.length !== 1) {
    fail(`parseFromString call count must be 1, found ${parseFromStringCalls.length}`);
  }
  if (!parserBlock) {
    fail("missing parseHtmlDoc() helper block");
  } else if (!/\bparseFromString\s*\(/.test(parserBlock)) {
    fail("parseHtmlDoc() must contain parseFromString");
  }
}

if (failures.length) {
  console.error("VERIFY_CORE_DOMPARSER_SINGLETON: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: core DOMParser is singleton + budgeted");
