import fs from "fs";
import path from "path";

const root = process.cwd();
const REQUIRED_DATE = "2026-02-21";
const agentsPath = path.join(root, "docs", "AGENTS.md");
const namingPath = path.join(root, "docs", "NAMING.md");
const failures = [];

function readIfExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function checkLastUpdated(content, label) {
  const match = content.match(/^Last updated:\s*(.+)$/m);
  if (!match) {
    failures.push(`${label} missing "Last updated" line`);
    return;
  }
  if (match[1].trim() !== REQUIRED_DATE) {
    failures.push(`${label} Last updated must be ${REQUIRED_DATE} (found: ${match[1].trim()})`);
  }
}

const naming = readIfExists(namingPath, "NAMING rulebook");
const agents = readIfExists(agentsPath, "AGENTS rulebook");

if (agents) {
  const mentionsNamingMandatory =
    /docs\/NAMING\.md[^\n]*mandatory/i.test(agents) || /mandatory[^\n]*docs\/NAMING\.md/i.test(agents);
  if (!mentionsNamingMandatory) {
    failures.push("docs/AGENTS.md must mention docs/NAMING.md as mandatory");
  }
}

if (naming) {
  checkLastUpdated(naming, "docs/NAMING.md");
}
if (agents) {
  checkLastUpdated(agents, "docs/AGENTS.md");
}

if (failures.length) {
  console.error("VERIFY_RULEBOOKS: FAIL");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("VERIFY_RULEBOOKS: PASS");
