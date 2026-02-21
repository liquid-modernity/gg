import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  if (source.includes("tmp.innerHTML =") || source.includes("tmp.innerHTML=")) {
    fail("found forbidden assignment: tmp.innerHTML = ...");
  }
}

if (failures.length) {
  console.error("VERIFY_COMMENTS_GATE_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: comments gate has no innerHTML");
