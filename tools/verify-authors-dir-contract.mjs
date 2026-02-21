import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "docs/pages/p-author.html";
const sourcePath = path.join(root, sourceRel);
const failures = [];
const REQUIRED_HREF = "/p/pak-rpp.html";

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const html = fs.readFileSync(sourcePath, "utf8");
  const scriptRe =
    /<script\b(?=[^>]*\bid=["']gg-authors-dir["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptRe);

  if (!match) {
    fail('missing <script id="gg-authors-dir" type="application/json"> block');
  } else {
    const jsonRaw = String(match[1] || "").trim();
    let payload;

    try {
      payload = JSON.parse(jsonRaw);
    } catch (err) {
      fail(`gg-authors-dir JSON invalid: ${err && err.message ? err.message : String(err)}`);
    }

    const href = payload && payload.authors && payload.authors.pakrpp && payload.authors.pakrpp.href;
    if (href !== REQUIRED_HREF) {
      fail(`authors.pakrpp.href must equal "${REQUIRED_HREF}"`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_AUTHORS_DIR_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_AUTHORS_DIR_CONTRACT: PASS");
