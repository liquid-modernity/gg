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
  if (!source.includes("router._a11yRoutePatched")) {
    failures.push("missing one-time route a11y patch flag: router._a11yRoutePatched");
  }
  if (!(source.includes("getElementById('gg-main')") || source.includes('getElementById("gg-main")'))) {
    failures.push("missing #gg-main focus target lookup");
  }
  if (!source.includes("preventScroll:true")) {
    failures.push("missing preventScroll:true focus call");
  }
  if (!source.includes("GG.services.a11y.announce")) {
    failures.push("missing GG.services.a11y.announce route announcement");
  }
}

if (failures.length) {
  console.error("VERIFY_ROUTE_A11Y_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("VERIFY_ROUTE_A11Y_CONTRACT: PASS");
