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

  if (!source.includes("GG.modules.Comments")) {
    fail("missing GG.modules.Comments module");
  }
  if (!/ensureLoaded\s*\(/.test(source)) {
    fail("missing ensureLoaded() implementation");
  }

  const commentsAction = source.match(/if\(act === 'comments'\)\{[\s\S]*?return;\n\}/);
  if (!commentsAction) {
    fail("unable to locate comments button handler block");
  } else if (!/toggleComments\(/.test(commentsAction[0])) {
    fail("comments button handler does not route through toggleComments()");
  }

  const toggleBlock = source.match(/function toggleComments\(triggerBtn\)\{[\s\S]*?\n\}/);
  if (!toggleBlock) {
    fail("unable to locate toggleComments() function");
  } else if (!/ensureLoaded\(/.test(toggleBlock[0])) {
    fail("comments button path does not call GG.modules.Comments.ensureLoaded()");
  }

  if (!source.includes("data-gg-comments-loaded")) {
    fail("missing data-gg-comments-loaded state flag handling");
  }
}

if (failures.length) {
  console.error("VERIFY_COMMENTS_SINGLE_CTA: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: comments single-cta contract");
