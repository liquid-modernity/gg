#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const htmlFiles = ["index.xml", "landing.html", "store.html"];
const cssFiles = ["src/css/gg-app.source.css", "landing.html", "src/store/store.css"];
const jsFiles = ["src/js/gg-app.source.js", "landing.html", "src/store/store-discovery.js"];

function read(file) {
  return readFileSync(path.join(ROOT, file), "utf8");
}

function parseJson(file) {
  return JSON.parse(read(file));
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function stripScriptsStyles(source) {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}

function stripTemplates(source) {
  return source.replace(/<template\b[\s\S]*?<\/template>/gi, "");
}

function parseAttrs(tag) {
  const attrs = new Map();
  const source = tag.replace(/^<\s*\/?\s*[\w:-]+/, "").replace(/\/?\s*>$/, "");
  const pattern = /([:\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = pattern.exec(source))) {
    attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function attr(attrs, name) {
  return attrs.get(name.toLowerCase());
}

function hasAttr(attrs, name) {
  return attrs.has(name.toLowerCase());
}

function openingTags(source, selectorAttr) {
  const pattern = /<([a-z][\w:-]*)\b[^>]*>/gi;
  const tags = [];
  let match;
  while ((match = pattern.exec(source))) {
    if (match[0].startsWith("</")) continue;
    const attrs = parseAttrs(match[0]);
    if (selectorAttr && !hasAttr(attrs, selectorAttr)) continue;
    tags.push({ tag: match[1].toLowerCase(), raw: match[0], attrs, index: match.index });
  }
  return tags;
}

function elementBlocks(source, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi");
  return Array.from(source.matchAll(pattern), (match) => {
    const opening = match[0].match(new RegExp(`^<${tagName}\\b[^>]*>`, "i"))?.[0] || "";
    return { raw: match[0], opening, attrs: parseAttrs(opening), index: match.index };
  });
}

function elementById(source, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<([a-z][\\w:-]*)\\b(?=[^>]*\\bid=(["'])${escaped}\\2)[^>]*>`, "i");
  const match = source.match(pattern);
  if (!match) return null;
  return {
    tag: match[1].toLowerCase(),
    raw: match[0],
    attrs: parseAttrs(match[0]),
    index: match.index,
  };
}

function textContentForName(block) {
  return block
    .replace(/<[^>]*\baria-hidden=(["'])true\1[^>]*>[\s\S]*?<\/[^>]+>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/g, " ")
    .replace(/&#8230;|&hellip;/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAccessibleName(block, attrs) {
  if ((attr(attrs, "aria-label") || attr(attrs, "expr:aria-label") || "").trim()) return true;
  if ((attr(attrs, "aria-labelledby") || attr(attrs, "expr:aria-labelledby") || "").trim()) return true;
  if (hasAttr(attrs, "data-copy-aria") || hasAttr(attrs, "data-gg-copy-aria-label")) return true;
  if (/class=(["'])[^"']*\bgg-visually-hidden\b/i.test(block)) return true;
  return textContentForName(block).length > 0;
}

function assertTagIsButton(label, item) {
  if (item.tag !== "button") fail(`${label} must be a button: ${item.raw}`);
  else pass(label);
}

function assertControlsTarget(file, source, item) {
  const controls = attr(item.attrs, "aria-controls");
  if (!controls || /[\s{]/.test(controls)) return;
  if (elementById(source, controls)) pass(`${file}: aria-controls target exists: ${controls}`);
  else fail(`${file}: aria-controls target missing: ${controls}`);
}

function assertButtonType(file, item) {
  if (item.tag !== "button") return;
  if (attr(item.attrs, "type") === "button") pass(`${file}: button has type=button`);
  else if (hasAttr(item.attrs, "expr:type")) warn(`${file}: dynamic button type not statically checked: ${item.raw}`);
  else if (hasAttr(item.attrs, "expr:aria-label") || /\bsharing-button\b/.test(attr(item.attrs, "class") || "")) {
    warn(`${file}: native Blogger/dynamic button type not statically enforced: ${item.raw}`);
  }
  else fail(`${file}: button missing type=button: ${item.raw}`);
}

function assertSheetSemantics(file, source) {
  const stripped = stripScriptsStyles(source);
  const sheets = openingTags(stripped).filter((item) => /\bgg-sheet\b/.test(attr(item.attrs, "class") || ""));
  if (!sheets.length) {
    fail(`${file}: no gg-sheet roots found`);
    return;
  }
  pass(`${file}: gg-sheet roots found count=${sheets.length}`);
  for (const sheet of sheets) {
    const id = attr(sheet.attrs, "id") || "(no-id)";
    const windowSource = stripped.slice(sheet.index, sheet.index + 5000);
    const rootDialog = attr(sheet.attrs, "role") === "dialog";
    const childDialog = /role=(["'])dialog\1/i.test(windowSource);
    const hasDialog = rootDialog || childDialog;
    const modalOnRoot = attr(sheet.attrs, "aria-modal") === "true";
    const modalInChild = /aria-modal=(["'])true\1/i.test(windowSource);
    const labelOnRoot = !!attr(sheet.attrs, "aria-labelledby");
    const labelInChild = /aria-labelledby=(["'])[^"']+\1/i.test(windowSource);
    if (hasDialog && (modalOnRoot || modalInChild) && (labelOnRoot || labelInChild)) {
      pass(`${file}: ${id} has dialog semantics`);
    } else {
      fail(`${file}: ${id} missing role=dialog, aria-modal=true, or aria-labelledby`);
    }
    if (hasAttr(sheet.attrs, "hidden")) {
      if (attr(sheet.attrs, "aria-hidden") === "true" && hasAttr(sheet.attrs, "inert")) {
        pass(`${file}: ${id} closed state uses hidden + aria-hidden + inert`);
      } else {
        fail(`${file}: ${id} hidden sheet must also set aria-hidden=true and inert`);
      }
    }
  }
}

function assertStaticButtons(file, source) {
  const stripped = stripTemplates(stripScriptsStyles(source));
  for (const block of elementBlocks(stripped, "button")) {
    const attrs = block.attrs;
    assertButtonType(file, { tag: "button", attrs, raw: block.opening });
    if (!hasAccessibleName(block.raw, attrs)) {
      fail(`${file}: button missing accessible name: ${block.opening}`);
    } else {
      pass(`${file}: button has accessible name`);
    }
    if (attr(attrs, "aria-controls")) {
      assertControlsTarget(file, stripped, { attrs, raw: block.opening });
      if (!hasAttr(attrs, "aria-expanded") && !hasAttr(attrs, "aria-selected")) {
        fail(`${file}: aria-controls button must expose aria-expanded or aria-selected: ${block.opening}`);
      } else {
        pass(`${file}: aria-controls button exposes state`);
      }
    }
  }
}

function assertControlAttrs(file, source) {
  const stripped = stripScriptsStyles(source);
  for (const attrName of ["data-gg-close", "data-gg-drag-handle"]) {
    for (const item of openingTags(stripped, attrName)) assertTagIsButton(`${file}: ${attrName} control`, item);
  }
  for (const item of openingTags(stripped, "data-gg-theme-option")) {
    assertTagIsButton(`${file}: theme option`, item);
    if (hasAttr(item.attrs, "aria-pressed")) pass(`${file}: theme option exposes aria-pressed`);
    else fail(`${file}: theme option missing aria-pressed: ${item.raw}`);
  }
  for (const attrName of [
    "data-gg-command-tab",
    "data-discovery-filter",
    "data-store-discovery-kind",
    "data-store-filter",
    "data-store-intent",
    "data-store-price-band",
    "data-store-sort",
  ]) {
    for (const item of openingTags(stripped, attrName)) {
      assertTagIsButton(`${file}: ${attrName} chip/control`, item);
      if (hasAttr(item.attrs, "aria-pressed") || hasAttr(item.attrs, "aria-selected")) {
        pass(`${file}: ${attrName} exposes pressed/selected state`);
      } else {
        fail(`${file}: ${attrName} missing aria-pressed or aria-selected: ${item.raw}`);
      }
    }
  }
}

function assertReducedMotion() {
  for (const file of cssFiles) {
    const source = read(file);
    if (source.includes("@media (prefers-reduced-motion: reduce)") && source.includes("transition-duration")) {
      pass(`${file}: reduced motion CSS exists`);
    } else {
      fail(`${file}: missing reduced motion CSS contract`);
    }
  }
}

function assertKeyboardAndFocusContracts() {
  const contracts = [
    {
      file: "src/js/gg-app.source.js",
      required: ["event.key === 'Escape'", "trapFocusWhileOpen", "state.panelLastTrigger.focus", "aria-expanded"],
    },
    {
      file: "landing.html",
      required: ["event.key === 'Escape'", "state.lastFocus.focus", "aria-expanded", "data-gg-drag-handle"],
    },
    {
      file: "src/store/store-discovery.js",
      required: ["event.key === 'Escape'", "function trapFocus", "restoreFocus", "syncPanelTriggerState", "aria-expanded"],
    },
  ];
  for (const contract of contracts) {
    const source = read(contract.file);
    for (const marker of contract.required) {
      if (source.includes(marker)) pass(`${contract.file}: keyboard/focus marker ${marker}`);
      else fail(`${contract.file}: missing keyboard/focus marker ${marker}`);
    }
  }
}

function assertWiring() {
  const packageJson = parseJson("package.json");
  const scripts = packageJson.scripts || {};
  const qaCommands = read("QA-COMMANDS.md");
  const sourceOfTruth = read("SOURCE-OF-TRUTH.md");
  const ciGuard = read("qa/ci-reconciliation-guard.mjs");
  if (scripts["gaga:verify-a11y-static"] === "node qa/a11y-static-guard.mjs") {
    pass("package script gaga:verify-a11y-static is wired");
  } else {
    fail("package script gaga:verify-a11y-static must run node qa/a11y-static-guard.mjs");
  }
  if (String(scripts["ci:qa"] || "").includes("npm run gaga:verify-a11y-static")) pass("ci:qa includes a11y static guard");
  else fail("ci:qa must include npm run gaga:verify-a11y-static");
  if (qaCommands.includes("npm run gaga:verify-a11y-static") && qaCommands.includes("qa/a11y-static-guard.mjs")) {
    pass("QA-COMMANDS documents a11y static guard");
  } else {
    fail("QA-COMMANDS must document a11y static guard");
  }
  if (sourceOfTruth.includes("qa/a11y-static-guard.mjs")) pass("SOURCE-OF-TRUTH documents a11y static guard");
  else fail("SOURCE-OF-TRUTH must document a11y static guard");
  if (ciGuard.includes('"qa/a11y-static-guard.mjs"')) pass("CI reconciliation classifies a11y static guard");
  else fail("CI reconciliation major guard list must include qa/a11y-static-guard.mjs");
}

for (const file of htmlFiles) {
  const source = read(file);
  assertSheetSemantics(file, source);
  assertStaticButtons(file, source);
  assertControlAttrs(file, source);
}

assertReducedMotion();
assertKeyboardAndFocusContracts();
assertWiring();

if (failures.length) {
  console.error("A11Y STATIC GUARD CONTRACT_FAILURE");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const message of passes) console.log(`PASS ${message}`);
if (warnings.length) {
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  console.log("A11Y STATIC GUARD PASS_WITH_WARNINGS");
} else {
  console.log("A11Y STATIC GUARD PASS");
}
