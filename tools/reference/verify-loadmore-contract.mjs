import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.listing.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const blockMatch = source.match(/G\.modules\.listingLoadMore\s*=\s*G\.modules\.listingLoadMore\s*\|\|\s*\(function\(\)\{[\s\S]*?return \{ init: init, rehydrate: rehydrate \};\s*\}\)\(\);/);

  if (!blockMatch) {
    fail("unable to locate listingLoadMore module block");
  } else {
    const block = blockMatch[0];

    if (!/dataset\.ggBoundLoadMore\s*!==\s*['"]1['"]/.test(block)) {
      fail("missing idempotent bind guard via dataset.ggBoundLoadMore");
    }

    if (!/function\s+rehydrate\s*\(/.test(block) || !/function\s+init\s*\(/.test(block)) {
      fail("missing init/rehydrate entrypoints");
    }

    if (!/blog-pager-older-link/.test(block) || !/blog-pager/.test(block)) {
      fail("missing canonical pager selector usage (.blog-pager-older-link)");
    }

    if (!/appendChild\s*\(/.test(block) || !/cloneNode\s*\(\s*true\s*\)/.test(block)) {
      fail("missing DOM append path (appendChild + cloneNode)");
    }

    if (/innerHTML\s*=|\.innerHTML\b/.test(block)) {
      fail("loadmore block still uses innerHTML");
    }
  }

  if (!/G\.modules\.LoadMore\.rehydrate\s*=\s*function\(/.test(source)) {
    fail("missing GG.modules.LoadMore.rehydrate bridge");
  }
}

if (failures.length) {
  console.error("VERIFY_LOADMORE_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: loadmore contract");
