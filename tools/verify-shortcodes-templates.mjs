import fs from "fs";
import path from "path";

const root = process.cwd();
const requiredIds = ["gg-tpl-sc-yt-lite", "gg-tpl-sc-accordion"];
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    failures.push(`missing file: ${rel}`);
    continue;
  }
  const source = fs.readFileSync(filePath, "utf8");
  for (const id of requiredIds) {
    const re = new RegExp(`<template\\b[^>]*\\bid=['"]${id}['"]`, "i");
    if (!re.test(source)) failures.push(`${rel} missing template id: ${id}`);
  }
}

if (failures.length) {
  console.error("VERIFY_SHORTCODES_TEMPLATES: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_SHORTCODES_TEMPLATES: PASS");
