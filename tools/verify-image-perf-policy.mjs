import fs from "fs";
import path from "path";

const root = process.cwd();
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
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return "";
}

const listing = read(listingRel);
if (listing) {
  const addTile = extractBlock(listing, "function addTile(");
  if (!addTile) {
    fail("listing: missing addTile() block");
  } else {
    if (!/img\.decoding\s*=\s*["']async["']/.test(addTile)) {
      fail("listing addTile must set img.decoding='async'");
    }
    if (!/fetchpriority|fetchPriority/.test(addTile)) {
      fail("listing addTile must set fetchpriority/fetchPriority");
    }
    if (!/loading\s*=\s*["']eager["']/.test(addTile) && !/setAttribute\(\s*["']loading["']\s*,\s*["']eager["']\s*\)/.test(addTile)) {
      fail("listing addTile must contain eager loading path");
    }
    const hasLazy = /loading\s*=\s*["']lazy["']/.test(addTile) || /setAttribute\(\s*["']loading["']\s*,\s*["']lazy["']\s*\)/.test(addTile);
    const hasEager = /loading\s*=\s*["']eager["']/.test(addTile) || /setAttribute\(\s*["']loading["']\s*,\s*["']eager["']\s*\)/.test(addTile);
    if (hasLazy && !hasEager) {
      fail("listing addTile still only uses lazy loading");
    }
  }
}

const mixed = read(mixedRel);
if (mixed) {
  const appendCardThumb = extractBlock(mixed, "function appendCardThumb(");
  if (!appendCardThumb) {
    fail("mixed: missing appendCardThumb() block");
  } else if (!/decoding["']?\s*,\s*["']async["']|img\.decoding\s*=\s*["']async["']/.test(appendCardThumb)) {
    fail("mixed appendCardThumb must set decoding='async'");
  }
}

if (failures.length) {
  console.error("VERIFY_IMAGE_PERF_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: image perf policy");
