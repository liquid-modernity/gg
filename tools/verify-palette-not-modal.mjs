import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const source = fs.readFileSync(sourcePath, "utf8");
  const lines = source.split(/\r?\n/);
  const paletteLines = [];
  const modalCallLines = [];

  lines.forEach((line, idx) => {
    if (/gg-palette-list/.test(line)) paletteLines.push(idx + 1);
    if (/GG\.services\.a11y\.modalOpen\s*\(/.test(line)) modalCallLines.push(idx + 1);
  });

  paletteLines.forEach((pLine) => {
    const nearby = modalCallLines.find((mLine) => Math.abs(mLine - pLine) <= 80);
    if (nearby) {
      failures.push(
        `${sourceRel}:${pLine} palette marker is too close to modalOpen call at line ${nearby}`
      );
    }
  });

  const modalOpenStart = source.indexOf("A.modalOpen = A.modalOpen || function");
  const modalOpenEnd = source.indexOf("A.init = A.init || function", modalOpenStart + 1);
  if (modalOpenStart === -1 || modalOpenEnd === -1) {
    failures.push("missing modalOpen function block boundaries");
  } else {
    const block = source.slice(modalOpenStart, modalOpenEnd);
    const guardId = /modalEl\.id\s*===\s*['"]gg-palette-list['"]/.test(block);
    const guardListbox = /role\s*===\s*['"]listbox['"]/.test(block);
    const guardReturn = /return\s+false;/.test(block);
    const idxGuard = block.search(/modalEl\.id\s*===\s*['"]gg-palette-list['"]|role\s*===\s*['"]listbox['"]/);
    const idxDialogRole = block.indexOf("modalEl.setAttribute('role','dialog')");

    if (!guardId || !guardListbox || !guardReturn) {
      failures.push("modalOpen guard for gg-palette-list/listbox is missing");
    } else if (idxGuard === -1 || idxDialogRole === -1 || idxGuard > idxDialogRole) {
      failures.push("modalOpen guard exists but is not enforced before dialog role assignment");
    }
  }
}

if (failures.length) {
  console.error("VERIFY_PALETTE_NOT_MODAL: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_PALETTE_NOT_MODAL: PASS");
