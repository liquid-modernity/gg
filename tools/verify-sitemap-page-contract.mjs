import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "docs/pages/p-sitemap.html";
const sourcePath = path.join(root, sourceRel);
const requiredLinks = [
  "/blog",
  "/p/author.html",
  "/p/tags.html",
  "/p/privacy.html",
  "/p/terms.html",
  "/p/contact.html",
];
const failures = [];

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const html = fs.readFileSync(sourcePath, "utf8");
  for (const href of requiredLinks) {
    const hrefRe = new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`, "i");
    if (!hrefRe.test(html)) {
      failures.push(`required link missing: ${href}`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_SITEMAP_PAGE_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_SITEMAP_PAGE_CONTRACT: PASS");
