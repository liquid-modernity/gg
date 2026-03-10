import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

const anchorWrapsButton = /<a\b[^>]*>\s*<button\b/i;
const buttonWrapsAnchor = /<button\b[^>]*>\s*<a\b/i;

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`missing template file: ${rel}`);
    continue;
  }

  const src = fs.readFileSync(abs, "utf8");
  if (anchorWrapsButton.test(src)) {
    failures.push(`${rel}: found invalid nesting <a>...</a> wrapping <button>`);
  }
  if (buttonWrapsAnchor.test(src)) {
    failures.push(`${rel}: found invalid nesting <button>...</button> wrapping <a>`);
  }
}

if (failures.length) {
  console.error("VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_TEMPLATE_NO_NESTED_INTERACTIVES: PASS");
