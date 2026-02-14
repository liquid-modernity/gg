import fs from "fs";
import path from "path";

const root = process.cwd();
const auditDir = path.join(root, "docs", "audit");

const rules = [
  {
    id: "release-id-static",
    label: "Static Release ID",
    re: /Release ID:\s*[0-9a-f]{7,}\b/i,
  },
  {
    id: "assets-v-static",
    label: "Static /assets/v/<hash>/ path",
    re: /\/assets\/v\/[0-9a-f]{7,}\//i,
  },
];

const failures = [];

if (!fs.existsSync(auditDir)) {
  console.error("VERIFY_AUDIT_DOCS: FAIL");
  console.error("- docs/audit missing");
  process.exit(1);
}

const files = fs.readdirSync(auditDir).filter((f) => f.endsWith(".md")).sort();
if (!files.length) {
  console.error("VERIFY_AUDIT_DOCS: FAIL");
  console.error("- docs/audit contains no .md files");
  process.exit(1);
}

for (const file of files) {
  const full = path.join(auditDir, file);
  const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
  lines.forEach((line, idx) => {
    rules.forEach((rule) => {
      rule.re.lastIndex = 0;
      if (rule.re.test(line)) {
        failures.push(`${file}:${idx + 1}: ${rule.label} -> ${line.trim()}`);
      }
    });
  });
}

if (failures.length) {
  console.error("VERIFY_AUDIT_DOCS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_AUDIT_DOCS: PASS");
