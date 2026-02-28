import fs from "fs";
import path from "path";

const root = process.cwd();
const cssRel = "public/assets/latest/main.css";
const cssPath = path.join(root, cssRel);
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const corePath = path.join(root, coreRel);
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

  const tocScrollableSel = "#gg-toc .gg-toc__list";
  const tocCandidates = blocks.filter((b) => b.selector.includes(tocScrollableSel));
  if (!tocCandidates.length) {
    fail(`missing selector block: ${tocScrollableSel}`);
  } else {
    const tocOk = tocCandidates.some((b) => {
      const hasOverflowAuto = /overflow(?:-y)?\s*:\s*auto/i.test(b.body);
      const hasMinHeight = /min-height\s*:\s*0/i.test(b.body);
      return hasOverflowAuto && hasMinHeight;
    });
    if (!tocOk) {
      fail(`${tocScrollableSel} must include min-height:0 + overflow:auto`);
    }
  }

  const listSel = "#gg-left-sidebar-list";
  const listCandidates = blocks.filter((b) => b.selector.includes(listSel));
  if (!listCandidates.length) {
    fail(`missing selector block: ${listSel}`);
  } else {
    const listHasMinHeight = listCandidates.some((b) => /min-height\s*:\s*0/i.test(b.body));
    if (!listHasMinHeight) {
      fail(`${listSel} must include min-height:0`);
    }

    // New contract: listing uses a dedicated scroll zone (pages-only) instead of scrolling whole sidebar.
    const pagesSel = '#gg-left-sidebar-list [data-gg-scroll="pages"]';
    const pagesCandidates = blocks.filter((b) => b.selector.includes(pagesSel));
    const pagesOk = pagesCandidates.some((b) => {
      const hasOverflowAuto = /overflow(?:-y)?\s*:\s*auto/i.test(b.body);
      const hasMinHeight = /min-height\s*:\s*0/i.test(b.body);
      return hasOverflowAuto && hasMinHeight;
    });

    // Backward-compatible pass path: whole list is scrollable.
    const legacyOk = listCandidates.some((b) => {
      const hasOverflowAuto = /overflow(?:-y)?\s*:\s*auto/i.test(b.body);
      const hasMinHeight = /min-height\s*:\s*0/i.test(b.body);
      return hasOverflowAuto && hasMinHeight;
    });

    if (!pagesOk && !legacyOk) {
      fail(`${pagesSel} must include min-height:0 + overflow:auto (or keep legacy ${listSel} scrollable)`);
    }
  }
}

if (!fs.existsSync(corePath)) {
  fail(`missing js file: ${coreRel}`);
} else {
  const core = fs.readFileSync(corePath, "utf8");
  if (!core.includes("data-gg-sb-mode") || !core.includes("data-gg-sb-ready")) {
    fail("LeftNav slotter must expose data-gg-sb-mode + data-gg-sb-ready markers");
  }
  if (!core.includes("scheduleRepair(")) {
    fail("LeftNav slotter must include repair retry pass");
  }
  const postOrderLegacy = "orderBody=mode==='post'?['HTML4','HTML1','HTML17','HTML18','HTML19','HTML20','HTML21']";
  const postOrderCurrent = "orderBody=mode==='post'?['HTML4','HTML30','HTML31','HTML32','HTML33','HTML34','HTML35']";
  if (!core.includes(postOrderLegacy) && !core.includes(postOrderCurrent)) {
    fail("LeftNav post body order must keep Information before Interests and nav groups");
  }
}

if (failures.length) {
  console.error("VERIFY_SIDEBAR_STICKY_CONTRACT: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: sidebar sticky contract");
