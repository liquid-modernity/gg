import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "docs/pages/p-tags.html";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const html = fs.readFileSync(sourcePath, "utf8");
  const scriptRe =
    /<script\b(?=[^>]*\bid=["']gg-tags-dir["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptRe);

  if (!match) {
    fail('missing <script id="gg-tags-dir" type="application/json"> block');
  } else {
    const jsonRaw = String(match[1] || "").trim();
    let payload;

    try {
      payload = JSON.parse(jsonRaw);
    } catch (err) {
      fail(`gg-tags-dir JSON invalid: ${err && err.message ? err.message : String(err)}`);
    }

    if (payload && !Object.prototype.hasOwnProperty.call(payload, "v")) {
      fail("gg-tags-dir JSON must include field v");
    }

    const tags = payload && payload.tags;
    if (!tags || typeof tags !== "object" || Array.isArray(tags)) {
      fail("gg-tags-dir JSON must include non-empty object: tags");
    } else if (Object.keys(tags).length === 0) {
      fail("gg-tags-dir tags must be non-empty");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_TAGS_DIR_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_TAGS_DIR_CONTRACT: PASS");
