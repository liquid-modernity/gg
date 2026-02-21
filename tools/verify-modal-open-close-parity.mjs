import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];
let modalOpenCount = 0;
let modalCloseCount = 0;

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const modalOpenMatches = source.match(/\.modalOpen\s*\(/g) || [];
  const modalCloseMatches = source.match(/\.modalClose\s*\(/g) || [];
  modalOpenCount = modalOpenMatches.length;
  modalCloseCount = modalCloseMatches.length;

  if (modalOpenMatches.length > 0 && modalCloseMatches.length === 0) {
    failures.push("modalOpen calls found without any modalClose call");
  }

  if (!/function\s+closeActiveModalForRoute\s*\(/.test(source)) {
    failures.push("missing closeActiveModalForRoute() function");
  }

  if (!/router\.onNavigate\s*=\s*function\s*\([^)]*\)\s*\{[\s\S]{0,600}?closeActiveModalForRoute\s*\(/.test(source)) {
    failures.push("router.onNavigate is not wired to closeActiveModalForRoute()");
  }

  if (!/router\.onPopState\s*=\s*function\s*\([^)]*\)\s*\{[\s\S]{0,600}?closeActiveModalForRoute\s*\(/.test(source)) {
    failures.push("router.onPopState is not wired to closeActiveModalForRoute()");
  }

}

if (failures.length) {
  console.error(
    `VERIFY_MODAL_OPEN_CLOSE_PARITY: FAIL modalOpen=${modalOpenCount} modalClose=${modalCloseCount}`
  );
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log(
  `VERIFY_MODAL_OPEN_CLOSE_PARITY: PASS modalOpen=${modalOpenCount} modalClose=${modalCloseCount}`
);
