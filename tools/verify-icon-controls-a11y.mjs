import fs from "fs";
import path from "path";

const root = process.cwd();
const templateRel = "index.prod.xml";
const coreRel = "public/assets/latest/modules/ui.bucket.core.js";
const templateAbs = path.join(root, templateRel);
const coreAbs = path.join(root, coreRel);
const failures = [];
const suspects = [];

let checkedCandidates = 0;
let labeled = 0;

function lineOf(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function normalizeText(text) {
  return (text || "")
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(?:x[0-9a-f]+|\d+);/gi, " ")
    .replace(/&[a-z][a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attrValue(attrs, name) {
  const re = new RegExp(`${name}\\s*=\\s*(['"])([^'"]*)\\1`, "i");
  const m = String(attrs || "").match(re);
  return m ? m[2] : "";
}

function hasName(attrs, inner) {
  if (/\baria-label\s*=/.test(attrs) || /\baria-labelledby\s*=/.test(attrs)) return true;
  return normalizeText(inner).length > 0;
}

if (!fs.existsSync(templateAbs)) {
  failures.push(`missing template file: ${templateRel}`);
}

if (!fs.existsSync(coreAbs)) {
  failures.push(`missing core module: ${coreRel}`);
}

if (fs.existsSync(templateAbs)) {
  const template = fs.readFileSync(templateAbs, "utf8");

  const buttonRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  for (const match of template.matchAll(buttonRe)) {
    const attrs = match[1] || "";
    const inner = match[2] || "";
    checkedCandidates += 1;
    if (hasName(attrs, inner)) {
      labeled += 1;
      continue;
    }
    suspects.push(`${templateRel}:${lineOf(template, match.index)} unlabeled <button> candidate`);
  }

  const roleButtonRe = /<(a|div|span)\b([^>]*)\brole=['"]button['"]([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of template.matchAll(roleButtonRe)) {
    const attrs = `${match[2] || ""} ${match[3] || ""}`;
    const inner = match[4] || "";
    checkedCandidates += 1;
    if (hasName(attrs, inner)) {
      labeled += 1;
      continue;
    }
    suspects.push(`${templateRel}:${lineOf(template, match.index)} unlabeled role=button candidate`);
  }

  const overlayCloseRules = [
    { cls: "gg-share-sheet__close-btn", label: "share-sheet close button" },
    { cls: "cmt2-help__close", label: "comments-help close button" }
  ];
  overlayCloseRules.forEach((rule) => {
    const re = new RegExp(`<button\\b[^>]*class=['"][^'"]*${rule.cls}[^'"]*['"][^>]*>`, "i");
    const m = template.match(re);
    if (!m) {
      failures.push(`${templateRel}: missing ${rule.label} (${rule.cls})`);
      return;
    }
    const aria = attrValue(m[0], "aria-label").trim();
    if (!aria || !/(close|tutup|keluar|dismiss)/i.test(aria)) {
      failures.push(`${templateRel}: ${rule.label} must have aria-label with Close/localized equivalent`);
    }
  });
}

if (fs.existsSync(coreAbs)) {
  const source = fs.readFileSync(coreAbs, "utf8");
  const createMatches = [...source.matchAll(/([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*createElement\((['"])button\2\)/g)];

  createMatches.forEach((match, idx) => {
    const varName = match[1];
    const start = match.index ?? 0;
    const nextStart = idx + 1 < createMatches.length ? (createMatches[idx + 1].index ?? source.length) : source.length;
    const segment = source.slice(start, Math.min(source.length, Math.max(start + 320, nextStart)));
    const escaped = varName.replace(/[$]/g, "\\$");
    const hasAriaLabel = new RegExp(`\\b${escaped}\\.setAttribute\\((['"])(aria-label|aria-labelledby)\\1`, "i").test(segment);
    const hasText = new RegExp(`\\b${escaped}\\.(textContent|innerText)\\s*=\\s*[^;]+;`).test(segment);
    const isCandidate =
      new RegExp(`\\b${escaped}\\.className\\s*=\\s*(['"]).*(icon|tool|toggle|close|fab|btn).*\\1`, "i").test(segment) ||
      new RegExp(`\\b${escaped}\\.setAttribute\\((['"])data-gg-action\\1`, "i").test(segment) ||
      new RegExp(`\\b${escaped}\\.setAttribute\\((['"])type\\1\\s*,\\s*(['"])button\\2`, "i").test(segment);

    if (!isCandidate) return;
    checkedCandidates += 1;
    if (hasAriaLabel || hasText) {
      labeled += 1;
      return;
    }
    suspects.push(`${coreRel}:${lineOf(source, start)} createElement('button') without accessible name assignment`);
  });
}

const unlabeledSuspects = suspects.length;
if (failures.length || unlabeledSuspects > 0) {
  console.error(
    `VERIFY_ICON_CONTROLS_A11Y: FAIL checkedCandidates=${checkedCandidates} labeled=${labeled} unlabeledSuspects=${unlabeledSuspects}`
  );
  failures.forEach((msg) => console.error(`- ${msg}`));
  suspects.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log(
  `VERIFY_ICON_CONTROLS_A11Y: PASS checkedCandidates=${checkedCandidates} labeled=${labeled} unlabeledSuspects=${unlabeledSuspects}`
);
