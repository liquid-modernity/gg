import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRel = "public/assets/latest/modules/ui.bucket.core.js";
const sourcePath = path.join(root, sourceRel);
const failures = [];

if (!fs.existsSync(sourcePath)) {
  failures.push(`missing source file: ${sourceRel}`);
} else {
  const src = fs.readFileSync(sourcePath, "utf8");
  const checks = [
    { ok: src.includes("GG.services.a11y.modalOpen"), msg: "missing modalOpen usage" },
    { ok: src.includes("GG.services.a11y.modalClose"), msg: "missing modalClose usage" },
    { ok: src.includes("aria-modal"), msg: "missing aria-modal assignment" },
    { ok: src.includes("role','dialog'") || src.includes('role","dialog"') || src.includes('role="dialog"'), msg: "missing dialog role assignment" },
    { ok: src.includes("focusTrap("), msg: "missing focusTrap integration" },
    { ok: src.includes("Escape"), msg: "missing Escape close handling" },
    { ok: src.includes("restore") || src.includes("activeModalTrigger"), msg: "missing restore focus logic marker" }
  ];
  checks.forEach((c) => { if (!c.ok) failures.push(c.msg); });
}

if (failures.length) {
  console.error("VERIFY_OVERLAY_MODAL_CONTRACT: FAIL");
  failures.forEach((m) => console.error(`- ${m}`));
  process.exit(1);
}

console.log("VERIFY_OVERLAY_MODAL_CONTRACT: PASS");
