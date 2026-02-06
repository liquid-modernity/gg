import fs from "fs";
import path from "path";

const root = process.cwd();
const gitDir = path.join(root, ".git");
const hooksDir = path.join(gitDir, "hooks");
const hookPath = path.join(hooksDir, "pre-push");

if (!fs.existsSync(gitDir)) {
  console.error("ERROR: .git directory not found. Run from repo root.");
  process.exit(1);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hook = `#!/bin/sh
set -e
npm run verify:release
`;

fs.writeFileSync(hookPath, hook, { encoding: "utf8" });
fs.chmodSync(hookPath, 0o755);

console.log(`Installed pre-push hook: ${hookPath}`);
