import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.authors.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  if (source.includes("DOMParser")) fail("found forbidden token: DOMParser");
  if (source.includes("parseFromString")) fail("found forbidden token: parseFromString");
}

if (failures.length) {
  console.error("VERIFY_NO_DOMPARSER_AUTHORS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: authors module has no DOMParser");
