import fs from "fs";
import path from "path";

const root = process.cwd();
const templateFiles = ["index.prod.xml", "index.dev.xml"]
  .map((rel) => ({ rel, abs: path.join(root, rel) }))
  .filter((f) => fs.existsSync(f.abs));
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const coreAbs = path.join(root, coreRel);
const failures = [];

if (!templateFiles.length) {
  failures.push("missing template source files (index.prod.xml/index.dev.xml)");
}

const skipLinkRegex =
  /<a\b[^>]*\bclass=['"][^'"]*\bgg-skip-link\b[^'"]*['"][^>]*\bhref=['"]#gg-main['"][^>]*>|<a\b[^>]*\bhref=['"]#gg-main['"][^>]*\bclass=['"][^'"]*\bgg-skip-link\b[^'"]*['"][^>]*>/i;
const mainTabIndexRegex =
  /<main\b[^>]*\bid=['"]gg-main['"][^>]*\btabindex=['"]-1['"][^>]*>|<main\b[^>]*\btabindex=['"]-1['"][^>]*\bid=['"]gg-main['"][^>]*>/i;

let templateHasTabIndex = false;
templateFiles.forEach(({ rel, abs }) => {
  const source = fs.readFileSync(abs, "utf8");
  if (!skipLinkRegex.test(source)) {
    failures.push(`${rel}: missing skip link .gg-skip-link[href="#gg-main"]`);
  }
  if (!templateHasTabIndex && mainTabIndexRegex.test(source)) {
    templateHasTabIndex = true;
  }
});

if (!fs.existsSync(coreAbs)) {
  failures.push(`missing core module: ${coreRel}`);
}

let runtimeTabIndexGuard = false;
if (fs.existsSync(coreAbs)) {
  const core = fs.readFileSync(coreAbs, "utf8");
  const mainLookup = /getElementById\((['"])gg-main\1\)/.test(core);
  const tabIndexSet = /setAttribute\((['"])tabindex\1,\s*(['"])-1\2\)/.test(core);
  runtimeTabIndexGuard = mainLookup && tabIndexSet;
}

if (!templateHasTabIndex && !runtimeTabIndexGuard) {
  failures.push("missing #gg-main focusability safeguard (template tabindex=-1 or runtime setAttribute('tabindex','-1'))");
}

if (failures.length) {
  console.error("VERIFY_SKIP_LINK_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_SKIP_LINK_CONTRACT: PASS");
