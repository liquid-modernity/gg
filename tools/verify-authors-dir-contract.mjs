import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "docs/pages/p-author.html";
const sourcePath = path.join(root, sourceRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function extractAuthorsMap(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  if (payload.authors && typeof payload.authors === "object" && !Array.isArray(payload.authors)) {
    return payload.authors;
  }

  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "v" || key === "aliases" || key === "items") continue;
    out[key] = value;
  }
  return out;
}

function isValidProfileHref(href) {
  return typeof href === "string" && /^\/p\/.+\.html$/.test(href.trim());
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source file: ${sourceRel}`);
} else {
  const html = fs.readFileSync(sourcePath, "utf8");

  const scriptBlockMatch = html.match(/<script\b[^>]*\bid=["']gg-authors-dir["'][^>]*>[\s\S]*?<\/script>/i);

  if (!scriptBlockMatch) {
    fail('missing <script id="gg-authors-dir"> block');
  } else {
    const scriptBlock = scriptBlockMatch[0];
    const openTag = scriptBlock.match(/^<script\b[^>]*>/i)?.[0] || "";
    if (!/\btype=["']application\/json["']/i.test(openTag)) {
      fail('gg-authors-dir script must use type="application/json"');
    }

    const jsonRaw = scriptBlock
      .replace(/^<script\b[^>]*>/i, "")
      .replace(/<\/script>\s*$/i, "")
      .trim();
    let payload = null;

    try {
      payload = JSON.parse(jsonRaw);
    } catch (err) {
      fail(`gg-authors-dir JSON invalid: ${err && err.message ? err.message : String(err)}`);
    }

    if (payload) {
      const authorsMap = extractAuthorsMap(payload);
      if (!authorsMap || typeof authorsMap !== "object" || Array.isArray(authorsMap)) {
        fail("authors map missing or invalid in gg-authors-dir JSON");
      } else if (!Object.prototype.hasOwnProperty.call(authorsMap, "pakrpp")) {
        fail('required key "pakrpp" missing in gg-authors-dir JSON');
      } else {
        const pakrpp = authorsMap.pakrpp;
        let href = "";
        if (typeof pakrpp === "string") {
          href = pakrpp;
        } else if (pakrpp && typeof pakrpp === "object") {
          href = String(pakrpp.href || pakrpp.url || "").trim();
        }

        if (!isValidProfileHref(href)) {
          fail('pakrpp href must start with "/p/" and end with ".html"');
        }
      }
    }
  }

  const fallbackUl = html.match(/<ul\b[^>]*>[\s\S]*?<\/ul>/i);
  if (!fallbackUl) {
    fail("fallback <ul> list missing");
  } else if (!/href=["']\/p\/[^"']+\.html["']/i.test(fallbackUl[0])) {
    fail("fallback <ul> must contain profile links with /p/*.html href");
  }
}

if (failures.length) {
  console.error("VERIFY_AUTHORS_DIR_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_AUTHORS_DIR_CONTRACT: PASS");
