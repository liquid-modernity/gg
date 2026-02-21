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
  const regionMatchers = [
    {
      name: "info-panel-module",
      re: /GG\.modules\.InfoPanel\s*=\s*\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);/,
    },
    {
      name: "panels-module",
      re: /GG\.modules\.Panels\s*=\s*\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);/,
    },
  ];

  let foundRegion = false;
  for (const region of regionMatchers) {
    const match = source.match(region.re);
    if (!match) continue;
    foundRegion = true;
    if (/panel\.innerHTML\s*=/.test(match[0])) {
      fail(`${region.name} contains forbidden panel.innerHTML assignment`);
    }
  }

  if (!foundRegion) {
    fail("unable to locate panels/info-panel module region");
  }

  const skeletonMatch = source.match(/function ensurePanelSkeleton\(\)\{[\s\S]*?renderTocSkeleton\(6,\s*TOC_HINT_LOCK\);\n\}/);
  if (!skeletonMatch) {
    fail("unable to locate ensurePanelSkeleton() block");
  } else if (/panel\.innerHTML\s*=/.test(skeletonMatch[0])) {
    fail("ensurePanelSkeleton() still contains panel.innerHTML assignment");
  }
}

if (failures.length) {
  console.error("VERIFY_CORE_PANEL_NO_INNERHTML: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: panels skeleton has no innerHTML");
