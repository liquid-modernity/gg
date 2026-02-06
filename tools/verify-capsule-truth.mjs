import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = process.cwd();

export function verifyCapsuleTruth({ rootDir = root } = {}) {
  const failures = [];
  const capsulePath = path.join(rootDir, "docs/ledger/GG_CAPSULE.md");
  const corePath = path.join(rootDir, "public/assets/latest/core.js");

  if (!fs.existsSync(capsulePath)) {
    failures.push("GG_CAPSULE missing: docs/ledger/GG_CAPSULE.md");
    return { ok: false, failures };
  }
  if (!fs.existsSync(corePath)) {
    failures.push("core.js missing: public/assets/latest/core.js");
    return { ok: false, failures };
  }

  const capsule = fs.readFileSync(capsulePath, "utf8");
  if (/no auto-init UI/i.test(capsule)) {
    const core = fs.readFileSync(corePath, "utf8");
    if (/requestUi\(['"]idle['"]\)/.test(core)) {
      failures.push("GG_CAPSULE claims no auto-init UI, but core.js calls requestUi('idle').");
    }
  }

  return { ok: failures.length === 0, failures };
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const result = verifyCapsuleTruth();
  if (!result.ok) {
    console.error("VERIFY_CAPSULE_TRUTH: FAIL");
    result.failures.forEach((f) => console.error(`- ${f}`));
    process.exit(1);
  }
  console.log("VERIFY_CAPSULE_TRUTH: PASS");
}
