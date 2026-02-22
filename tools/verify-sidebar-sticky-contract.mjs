import fs from "fs";
import path from "path";

const root = process.cwd();
const cssRel = "public/assets/latest/main.css";
const cssPath = path.join(root, cssRel);
const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!fs.existsSync(cssPath)) {
  fail(`missing css file: ${cssRel}`);
} else {
  const css = fs.readFileSync(cssPath, "utf8");
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  const blocks = [];
  let match;
  while ((match = blockRe.exec(css))) {
    blocks.push({
      selector: String(match[1] || "").trim(),
      body: String(match[2] || "").trim(),
    });
  }

  const sidebarBlocks = blocks.filter((b) => b.selector.includes("gg-blog-sidebar"));
  if (!sidebarBlocks.length) {
    fail("unable to find .gg-blog-sidebar css blocks");
  }

  const fixedSidebar = sidebarBlocks.find((b) => /position\s*:\s*fixed/i.test(b.body));
  if (fixedSidebar) {
    fail("sidebar still uses position: fixed");
  }

  const hasSticky = sidebarBlocks.some((b) => /position\s*:\s*sticky/i.test(b.body));
  if (!hasSticky) {
    fail("missing position: sticky on sidebar contract");
  }

  const requiredScrollable = ["#gg-left-sidebar-list", "#gg-toc .gg-toc__list"];
  for (const sel of requiredScrollable) {
    const candidates = blocks.filter((b) => b.selector.includes(sel));
    if (!candidates.length) {
      fail(`missing selector block: ${sel}`);
      continue;
    }
    const ok = candidates.some((b) => {
      const hasOverflowAuto = /overflow(?:-y)?\s*:\s*auto/i.test(b.body);
      const hasMinHeight = /min-height\s*:\s*0/i.test(b.body);
      return hasOverflowAuto && hasMinHeight;
    });
    if (!ok) {
      fail(`${sel} must include min-height:0 + overflow:auto`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_SIDEBAR_STICKY_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: sidebar sticky contract");
