import fs from "fs";
import path from "path";

const root = process.cwd();
const xmlFiles = ["index.prod.xml", "index.dev.xml"];
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function templateBlock(source, id) {
  const re = new RegExp(
    `<template\\b[^>]*\\bid=['"]${id}['"][^>]*>([\\s\\S]*?)<\\/template>`,
    "i",
  );
  const m = source.match(re);
  return m ? m[1] : "";
}

for (const rel of xmlFiles) {
  const source = read(rel);
  if (!source) continue;
  const yt = templateBlock(source, "gg-tpl-sc-yt-lite");
  const acc = templateBlock(source, "gg-tpl-sc-accordion");
  if (!yt) {
    fail(`${rel} missing template gg-tpl-sc-yt-lite`);
  } else {
    if (!/role=['"]button['"]/i.test(yt)) fail(`${rel} yt-lite missing role=\"button\"`);
    if (!/tabindex=['"]0['"]/i.test(yt)) fail(`${rel} yt-lite missing tabindex=\"0\"`);
  }
  if (!acc) {
    fail(`${rel} missing template gg-tpl-sc-accordion`);
  } else {
    if (!/data-gg-acc-toggle=['"]1['"]/i.test(acc)) fail(`${rel} accordion missing data-gg-acc-toggle`);
    if (!/data-gg-acc-body=['"]1['"]/i.test(acc)) fail(`${rel} accordion missing data-gg-acc-body`);
  }
}

const core = read(coreRel);
if (core) {
  if (!core.includes("ShortcodesV2.bindA11y")) fail("core missing ShortcodesV2.bindA11y wiring");
  if (!core.includes("aria-controls")) fail("core missing accordion aria-controls assignment");
  if (!core.includes("Play video")) fail("core missing Play video baseline label");
  if (!core.includes("Enter")) fail("core missing Enter keyboard handling");
  if (!core.includes("key === ' '") && !core.includes("Spacebar") && !core.includes("Space")) {
    fail("core missing Space keyboard handling");
  }
}

if (failures.length) {
  console.error("VERIFY_SHORTCODES_A11Y_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: shortcodes a11y contract");
