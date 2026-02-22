import fs from "fs";
import path from "path";

const root = process.cwd();
const templateFiles = ["index.prod.xml", "index.dev.xml"];
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function mustContainBlock(src, rel, id) {
  const re = new RegExp(`<b:includable\\s+id=['"]${id}['"][\\s\\S]*?<\\/b:includable>`, "i");
  const match = src.match(re);
  if (!match) {
    fail(`${rel}: missing includable ${id}`);
    return "";
  }
  return match[0];
}

for (const rel of templateFiles) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing template file: ${rel}`);
    continue;
  }

  const src = fs.readFileSync(abs, "utf8");
  const postCard = mustContainBlock(src, rel, "postCard");
  const postDetail = mustContainBlock(src, rel, "postDetail");

  if (postCard) {
    if (!/gg-postmeta/i.test(postCard)) fail(`${rel}: postCard missing .gg-postmeta node`);
    if (!/data-author/i.test(postCard)) fail(`${rel}: postCard .gg-postmeta missing data-author`);
    if (!/data-tags/i.test(postCard)) fail(`${rel}: postCard .gg-postmeta missing data-tags`);
    if (!/data-updated/i.test(postCard)) fail(`${rel}: postCard .gg-postmeta missing data-updated`);
  }

  if (postDetail) {
    if (!/gg-postmeta/i.test(postDetail)) fail(`${rel}: postDetail missing .gg-postmeta node`);
    if (!/data-author/i.test(postDetail)) fail(`${rel}: postDetail .gg-postmeta missing data-author`);
    if (!/data-tags/i.test(postDetail)) fail(`${rel}: postDetail .gg-postmeta missing data-tags`);
    if (!/data-updated/i.test(postDetail)) fail(`${rel}: postDetail .gg-postmeta missing data-updated`);
  }
}

const coreAbs = path.join(root, coreRel);
if (!fs.existsSync(coreAbs)) {
  fail(`missing source file: ${coreRel}`);
} else {
  const core = fs.readFileSync(coreAbs, "utf8");
  if (!core.includes("services.postmeta.getFromContext")) {
    fail("core missing services.postmeta.getFromContext implementation");
  }
  if (!core.includes("GG.services.postmeta")) {
    fail("core missing GG.services.postmeta export");
  }
  if (!core.includes("querySelector('.gg-postmeta')")) {
    fail("core missing canonical .gg-postmeta query");
  }
}

if (failures.length) {
  console.error("VERIFY_POSTMETA_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_POSTMETA_CONTRACT: PASS");
