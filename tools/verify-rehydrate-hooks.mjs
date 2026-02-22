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
  const applyBlock = source.match(/function apply\(html, url\)\{[\s\S]*?return true;\n\}/);

  if (!applyBlock) {
    fail("unable to locate GG.core.render.apply() block");
  } else {
    const block = applyBlock[0];
    const requiredCalls = [
      "GG.modules.ShortcodesV2.transformArea",
      "GG.modules.ShortcodesV2.bindA11y",
      "GG.modules.TOC.reset",
      "GG.modules.TOC.build",
      "GG.modules.Comments.reset",
    ];

    for (const token of requiredCalls) {
      if (!block.includes(token)) {
        fail(`missing after-swap call: ${token}`);
      }
    }

    if (!block.includes("clearRehydrateFlags(mainScope)")) {
      fail("missing done/bound flag reset call before rehydrate");
    }
    if (!block.includes("data-gg-shortcodes-done")) {
      fail("missing shortcodes done-flag reset");
    }
    if (!block.includes("data-gg-a11y-bound")) {
      fail("missing a11y bound-flag reset");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_REHYDRATE_HOOKS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: rehydrate hooks contract");
