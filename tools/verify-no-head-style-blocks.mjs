import fs from "fs";
import path from "path";

const root = process.cwd();
const file = path.join(root, "index.prod.xml");

if (!fs.existsSync(file)) {
  console.error("VERIFY_NO_HEAD_STYLE_BLOCKS: FAIL");
  console.error("- index.prod.xml missing");
  process.exit(1);
}

const source = fs.readFileSync(file, "utf8");
const failures = [];

const headMatch = source.match(/<head>([\s\S]*?)<\/head>/i);
if (!headMatch) {
  failures.push("index.prod.xml: missing <head> block");
} else {
  const head = headMatch[1];
  const headWithoutSkin = head.replace(/<b:skin><!\[CDATA\[[\s\S]*?\]\]><\/b:skin>/gi, "");
  const styleRe = /<style\b[^>]*>/gi;
  let m;
  while ((m = styleRe.exec(headWithoutSkin))) {
    failures.push("index.prod.xml: <style> found in <head> outside <b:skin>");
  }
}

if (failures.length) {
  console.error("VERIFY_NO_HEAD_STYLE_BLOCKS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_NO_HEAD_STYLE_BLOCKS: PASS");
