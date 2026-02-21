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
  if (source.includes("target.innerHTML = source.innerHTML")) {
    fail("found forbidden direct swap: target.innerHTML = source.innerHTML");
  }

  const applyMatch = source.match(/function apply\([\s\S]*?return true;\n\}/);
  if (!applyMatch) {
    fail("unable to locate apply() block");
  } else {
    const applyBlock = applyMatch[0];
    if (/target\.innerHTML\s*=/.test(applyBlock)) {
      fail("apply() block still contains target.innerHTML assignment");
    }
    const swapMatch = applyBlock.match(/var doSwap\s*=\s*function\(\)\{[\s\S]*?\n\s*\};/);
    if (!swapMatch) {
      fail("unable to locate doSwap() block inside apply()");
    } else if (/target\.innerHTML\s*=/.test(swapMatch[0])) {
      fail("doSwap() block still contains target.innerHTML assignment");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_CORE_SWAP_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: core swap has no innerHTML");
