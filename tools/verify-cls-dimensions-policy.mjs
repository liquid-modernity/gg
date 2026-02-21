import fs from "fs";
import path from "path";

const root = process.cwd();
const files = {
  core: "public/assets/latest/modules/ui.bucket.core.js",
  listing: "public/assets/latest/modules/ui.bucket.listing.js",
  mixed: "public/assets/latest/modules/ui.bucket.mixed.js",
  prod: "index.prod.xml",
  dev: "index.dev.xml",
};

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

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function verifyJsSetAttributeIntegers(source, rel) {
  const re = /setAttribute\(\s*['"](width|height)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(source))) {
    const value = String(m[2] || "").trim();
    if (!/^\d+$/.test(value)) {
      fail(`${rel} has non-integer ${m[1]} attribute assignment: ${value}`);
    }
  }
}

function verifyTemplateDims(xml, rel) {
  const tpl = xml.match(/<template\b[^>]*\bid=['"]gg-tpl-sc-yt-lite['"][^>]*>[\s\S]*?<\/template>/i);
  if (!tpl) {
    fail(`${rel} missing template gg-tpl-sc-yt-lite`);
    return;
  }
  const block = tpl[0];
  const img = block.match(/<img\b[^>]*>/i);
  if (!img) {
    fail(`${rel} gg-tpl-sc-yt-lite missing <img>`);
    return;
  }
  const tag = img[0];
  const width = tag.match(/\bwidth=['"]([^'"]+)['"]/i);
  const height = tag.match(/\bheight=['"]([^'"]+)['"]/i);
  if (!width) fail(`${rel} gg-tpl-sc-yt-lite <img> missing width attribute`);
  if (!height) fail(`${rel} gg-tpl-sc-yt-lite <img> missing height attribute`);
  if (width && !/^\d+$/.test(width[1])) fail(`${rel} gg-tpl-sc-yt-lite width must be integer: ${width[1]}`);
  if (height && !/^\d+$/.test(height[1])) fail(`${rel} gg-tpl-sc-yt-lite height must be integer: ${height[1]}`);

  const attrRe = /\b(?:width|height)=['"]([^'"]+)['"]/gi;
  let m;
  while ((m = attrRe.exec(block))) {
    const value = String(m[1] || "").trim();
    if (!/^\d+$/.test(value)) {
      fail(`${rel} gg-tpl-sc-yt-lite has non-integer width/height value: ${value}`);
    }
  }
}

function verifyCore(core) {
  assert(
    /services\.images\.setIntrinsicDims\s*=\s*services\.images\.setIntrinsicDims\s*\|\|\s*function\s*\(\s*el\s*,\s*w\s*,\s*h\s*\)\s*\{/.test(core),
    "core missing services.images.setIntrinsicDims helper"
  );
  assert(
    /el\.setAttribute\(\s*['"]width['"]\s*,\s*String\(W\)\s*\)/.test(core) &&
      /el\.setAttribute\(\s*['"]height['"]\s*,\s*String\(H\)\s*\)/.test(core),
    "core helper must set width/height attributes as stringified integers"
  );
  assert(
    /GG\.services\.images\.setIntrinsicDims\s*=/.test(core),
    "core missing GG.services.images.setIntrinsicDims export"
  );

  const coreImgCreate = [...core.matchAll(/var\s+img\s*=\s*document\.createElement\(['"]img['"]\)\s*;/g)];
  if (!coreImgCreate.length) fail("core missing createElement('img') occurrences for policy scan");
  coreImgCreate.forEach((m) => {
    const idx = m.index || 0;
    const snippet = core.slice(idx, idx + 380);
    if (!/setIntrinsicDims\(\s*img\s*,\s*\d+\s*,\s*\d+\s*\)/.test(snippet)) {
      fail("core has JS-created <img> without nearby setIntrinsicDims(img, w, h)");
    }
  });

  const coreIframeCreate = [...core.matchAll(/var\s+iframe\s*=\s*document\.createElement\(['"]iframe['"]\)\s*;/g)];
  if (!coreIframeCreate.length) fail("core missing createElement('iframe') occurrences for policy scan");
  coreIframeCreate.forEach((m) => {
    const idx = m.index || 0;
    const snippet = core.slice(idx, idx + 1200);
    if (!/setIntrinsicDims\(\s*iframe\s*,\s*\d+\s*,\s*\d+\s*\)/.test(snippet)) {
      fail("core has JS-created <iframe> without nearby setIntrinsicDims(iframe, w, h)");
    }
  });

  verifyJsSetAttributeIntegers(core, files.core);
}

function verifyListing(listing) {
  assert(
    /setIntrinsicDims\(\s*img\s*,\s*40\s*,\s*27\s*\)/.test(listing),
    "listing missing setIntrinsicDims(img, 40, 27)"
  );
  const addTileStart = listing.indexOf("function addTile(");
  if (addTileStart === -1) {
    fail("listing missing addTile() block");
  } else {
    const snippet = listing.slice(addTileStart, addTileStart + 2200);
    if (!/var\s+img\s*=\s*mk\(\s*["']img["']\s*\)/.test(snippet)) {
      fail("listing addTile missing JS-created <img>");
    }
    if (!/setIntrinsicDims\(\s*img\s*,\s*40\s*,\s*27\s*\)/.test(snippet)) {
      fail("listing addTile must set intrinsic dims 40/27");
    }
  }
  verifyJsSetAttributeIntegers(listing, files.listing);
}

function verifyMixed(mixed) {
  assert(
    /setIntrinsicDims\(\s*img\s*,\s*dims\[0\]\s*,\s*dims\[1\]\s*\)/.test(mixed),
    "mixed missing setIntrinsicDims(img, dims[0], dims[1])"
  );
  assert(
    /case\s+['"]youtube['"]|case\s+['"]youtubeish['"]/.test(mixed),
    "mixed ratio mapping missing youtube/youtubeish case"
  );
  assert(
    /case\s+['"]shorts['"]|case\s+['"]shortish['"]|case\s+['"]short['"]/.test(mixed),
    "mixed ratio mapping missing shorts/shortish case"
  );
  assert(
    /case\s+['"]instagram['"]|case\s+['"]instagramish['"]/.test(mixed),
    "mixed ratio mapping missing instagram/instagramish case"
  );

  const appendStart = mixed.indexOf("function appendCardThumb(");
  if (appendStart === -1) {
    fail("mixed missing appendCardThumb() block");
  } else {
    const snippet = mixed.slice(appendStart, appendStart + 2200);
    if (!/var\s+img\s*=\s*createEl\(\s*['"]img['"]\s*\)/.test(snippet)) {
      fail("mixed appendCardThumb missing JS-created <img>");
    }
    if (!/setIntrinsicDims\(\s*img\s*,\s*dims\[0\]\s*,\s*dims\[1\]\s*\)/.test(snippet)) {
      fail("mixed appendCardThumb must set intrinsic dims");
    }
  }
  verifyJsSetAttributeIntegers(mixed, files.mixed);
}

const core = read(files.core);
const listing = read(files.listing);
const mixed = read(files.mixed);
const prod = read(files.prod);
const dev = read(files.dev);

if (core) verifyCore(core);
if (listing) verifyListing(listing);
if (mixed) verifyMixed(mixed);
if (prod) verifyTemplateDims(prod, files.prod);
if (dev) verifyTemplateDims(dev, files.dev);

if (failures.length) {
  console.error("VERIFY_CLS_DIMENSIONS_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: CLS dimensions policy (img/iframe intrinsic sizes)");
