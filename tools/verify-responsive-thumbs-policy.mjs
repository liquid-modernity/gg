import fs from "fs";
import path from "path";

const root = process.cwd();
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const listingRel = "public/assets/latest/modules/ui.bucket.listing.js";
const mixedRel = "public/assets/latest/modules/ui.bucket.mixed.js";
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function extractBlock(source, signature) {
  const start = source.indexOf(signature);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return "";
}

function requireBuiltGuard(block, fileLabel) {
  if (!/buildSrcset\s*\(/.test(block)) {
    fail(`${fileLabel} missing buildSrcset(...) usage`);
  }
  if (!/img\.srcset\s*=/.test(block)) {
    fail(`${fileLabel} missing img.srcset assignment`);
  }
  if (!/if\s*\(\s*built\s*&&\s*built\.srcset\s*\)/.test(block)) {
    fail(`${fileLabel} must guard srcset assignment with (built && built.srcset)`);
  }
  if (/img\.srcset\s*=/.test(block) && !/if\s*\(\s*built\s*&&\s*built\.srcset\s*\)[\s\S]{0,240}img\.srcset\s*=/.test(block)) {
    fail(`${fileLabel} has srcset assignment outside guarded block`);
  }
}

const core = read(coreRel);
if (core) {
  if (!core.includes("GG.services.images.buildSrcset")) {
    fail("core missing GG.services.images.buildSrcset");
  }
  if (!core.includes("resizeThumbUrl")) {
    fail("core missing resizeThumbUrl");
  }
  if (!core.includes("isResizableThumbUrl")) {
    fail("core missing isResizableThumbUrl");
  }
}

const listing = read(listingRel);
if (listing) {
  const addTile = extractBlock(listing, "function addTile(");
  if (!addTile) fail("listing missing addTile() block");
  else {
    requireBuiltGuard(addTile, "listing addTile");
    if (!/\[\s*320\s*,[\s\S]*\b960\b/.test(addTile)) {
      fail("listing addTile widths must include at least 320 and 960");
    }
  }
}

const mixed = read(mixedRel);
if (mixed) {
  const appendCardThumb = extractBlock(mixed, "function appendCardThumb(");
  if (!appendCardThumb) fail("mixed missing appendCardThumb() block");
  else requireBuiltGuard(appendCardThumb, "mixed appendCardThumb");
}

if (failures.length) {
  console.error("VERIFY_RESPONSIVE_THUMBS_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: responsive thumbs policy (safe-only)");
