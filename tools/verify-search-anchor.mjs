#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

const searchJs = read("public/assets/latest/modules/ui.bucket.search.js");
if (!searchJs) failures.push("missing public/assets/latest/modules/ui.bucket.search.js");

const prodXml = read("index.prod.xml");
if (!prodXml) failures.push("missing index.prod.xml");

if (searchJs) {
  if (!/data-mode/.test(searchJs)) failures.push("search module missing data-mode anchor flag");
  if (!/getBoundingClientRect/.test(searchJs)) failures.push("search module missing dock rect measurement");
  if (!/visualViewport/.test(searchJs) && !/addEventListener\\(['\"]resize['\"]/.test(searchJs)) {
    failures.push("search module missing resize/visualViewport handler");
  }
}

if (prodXml) {
  if (!/class=['\"][^'\"]*gg-dock/.test(prodXml)) failures.push("index.prod.xml missing gg-dock");
  if (!/data-gg-module=['\"]dock['\"]/.test(prodXml)) failures.push("index.prod.xml missing data-gg-module=\"dock\"");
  if (!/id=['\"]gg-dialog['\"]/.test(prodXml)) failures.push("index.prod.xml missing #gg-dialog");
}

if (failures.length) {
  console.error("VERIFY_SEARCH_ANCHOR: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_SEARCH_ANCHOR: PASS");
