import fs from "fs";
import path from "path";

const root = process.cwd();
const allowlistRel = "docs/contracts/LEGACY_HTML_IN_JS_ALLOWLIST.json";
const allowlistPath = path.join(root, allowlistRel);
const failures = [];

if (!fs.existsSync(allowlistPath)) {
  failures.push(`missing allowlist file: ${allowlistRel}`);
} else {
  let payload = null;
  try {
    payload = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
  } catch (err) {
    failures.push(`invalid JSON in ${allowlistRel}: ${err && err.message ? err.message : String(err)}`);
  }

  if (payload) {
    const allow = Array.isArray(payload.allow) ? payload.allow : null;
    if (!allow) {
      failures.push("allowlist must contain array field: allow");
    }
    const maxAllow = payload.max_allow;
    if (!Number.isInteger(maxAllow) || maxAllow < 0) {
      failures.push("allowlist must contain non-negative integer field: max_allow");
    }
    if (allow && Number.isInteger(maxAllow) && allow.length > maxAllow) {
      failures.push(`allowlist growth detected: allow=${allow.length} exceeds max_allow=${maxAllow}`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_LEGACY_ALLOWLIST_RATCHET: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_LEGACY_ALLOWLIST_RATCHET: PASS");
