import fs from "fs";
import path from "path";

const root = process.cwd();
const files = [
  { name: "prod", path: "index.prod.xml" },
  { name: "dev", path: "index.dev.xml" },
];

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function findTag(src, tag, className) {
  const re = className
    ? new RegExp(`<${tag}\\b[^>]*class=['"][^'"]*${className}[^'"]*['"][^>]*>`, "i")
    : new RegExp(`<${tag}\\b[^>]*>`, "i");
  const m = src.match(re);
  return m ? m[0] : "";
}

function hasAttr(tag, name) {
  return new RegExp(`\\b${name}\\s*=`, "i").test(tag);
}

let failed = false;
console.log("VERIFY_TEMPLATE_CONTRACT");

for (const f of files) {
  const src = readFile(f.path);
  if (!src) {
    console.log(`FAIL ${f.name} file missing (${f.path})`);
    failed = true;
    continue;
  }

  const bodyTag = findTag(src, "body");
  if (!bodyTag) {
    console.log(`FAIL ${f.name} <body> tag missing`);
    failed = true;
  } else {
    if (!hasAttr(bodyTag, "expr:data-gg-surface")) {
      console.log(`FAIL ${f.name} <body> missing expr:data-gg-surface`);
      failed = true;
    }
    if (!hasAttr(bodyTag, "expr:data-gg-page")) {
      console.log(`FAIL ${f.name} <body> missing expr:data-gg-page`);
      failed = true;
    }
  }

  const mainTag = findTag(src, "main", "gg-main");
  if (!mainTag) {
    console.log(`FAIL ${f.name} <main class="gg-main"> tag missing`);
    failed = true;
  } else {
    if (!hasAttr(mainTag, "expr:data-gg-surface")) {
      console.log(`FAIL ${f.name} <main> missing expr:data-gg-surface`);
      failed = true;
    }
    if (!hasAttr(mainTag, "expr:data-gg-page")) {
      console.log(`FAIL ${f.name} <main> missing expr:data-gg-page`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("VERIFY_TEMPLATE_CONTRACT: FAIL");
  process.exit(1);
}

console.log("VERIFY_TEMPLATE_CONTRACT: PASS");
