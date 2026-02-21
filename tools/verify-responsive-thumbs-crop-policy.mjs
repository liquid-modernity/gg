import fs from "fs";
import path from "path";
import vm from "vm";

const root = process.cwd();
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const coreAbs = path.join(root, coreRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function extractFunctionAssignment(source, signature) {
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
      if (depth === 0) {
        const semi = source.indexOf(";", i);
        return semi === -1 ? source.slice(start, i + 1) : source.slice(start, semi + 1);
      }
    }
  }
  return "";
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

if (!fs.existsSync(coreAbs)) {
  fail(`missing file: ${coreRel}`);
} else {
  const source = fs.readFileSync(coreAbs, "utf8");

  if (source.includes("useCrop = !!keepCrop || hadCrop")) {
    fail("core still contains forced crop expression: useCrop = !!keepCrop || hadCrop");
  }

  if (/useCrop\s*=\s*[^;\n]*keepCrop[^;\n]*\|\|/m.test(source)) {
    fail("core contains crop logic where keepCrop can force -c via OR condition");
  }

  if (!/var\s+preserve\s*=\s*\(\s*keepCrop\s*!==\s*false\s*\)\s*;/.test(source)) {
    fail("core missing preserve default logic: var preserve = (keepCrop !== false)");
  }

  if (!/var\s+useCrop\s*=\s*preserve\s*&&\s*hadCrop\s*;/.test(source)) {
    fail("core missing safe crop logic: var useCrop = preserve && hadCrop");
  }

  const isResizableSnippet = extractFunctionAssignment(
    source,
    "services.images.isResizableThumbUrl = services.images.isResizableThumbUrl || function(url){"
  );
  const resizeSnippet = extractFunctionAssignment(
    source,
    "services.images.resizeThumbUrl = services.images.resizeThumbUrl || function(url, size, keepCrop){"
  );

  if (!isResizableSnippet) {
    fail("unable to extract isResizableThumbUrl function for crop behavior checks");
  }
  if (!resizeSnippet) {
    fail("unable to extract resizeThumbUrl function for crop behavior checks");
  }

  if (!failures.length) {
    const context = { services: { images: {} } };
    vm.runInNewContext(`${isResizableSnippet}\n${resizeSnippet}`, context);
    const resize = context.services?.images?.resizeThumbUrl;
    if (typeof resize !== "function") {
      fail("resizeThumbUrl runtime extraction failed");
    } else {
      const noCropPath = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi/s320/thumb.jpg";
      const noCropPathOut = resize(noCropPath, 640, true) || "";
      assert(/\/s640\//.test(noCropPathOut), "no-crop path URL should be resized to /s640/");
      assert(!/\/s640-c\//.test(noCropPathOut), "no-crop path URL must not be forced to /s640-c/");

      const noCropEq = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi/thumb.jpg=s320";
      const noCropEqOut = resize(noCropEq, 640, true) || "";
      assert(/=s640(?=$|[?#&])/.test(noCropEqOut), "no-crop equals URL should be resized to =s640");
      assert(!/=s640-c(?=$|[?#&])/.test(noCropEqOut), "no-crop equals URL must not be forced to =s640-c");

      const hadCropPath = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi/s320-c/thumb.jpg";
      const hadCropPathOut = resize(hadCropPath, 640, true) || "";
      assert(/\/s640-c\//.test(hadCropPathOut), "existing crop path URL should preserve -c");

      const hadCropEq = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi/thumb.jpg=s320-c";
      const hadCropEqOut = resize(hadCropEq, 640, true) || "";
      assert(/=s640-c(?=$|[?#&])/.test(hadCropEqOut), "existing crop equals URL should preserve -c");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_RESPONSIVE_THUMBS_CROP_POLICY: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: responsive thumbs does not force -c");
