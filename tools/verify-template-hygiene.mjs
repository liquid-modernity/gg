import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

const files = [
  { rel: "index.prod.xml", prod: true },
  { rel: "index.dev.xml", prod: false },
];

function lineNumberAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function findAll(source, re) {
  const out = [];
  let m;
  while ((m = re.exec(source))) out.push(m);
  return out;
}

function stripSkinBlocks(source) {
  return source.replace(/<b:skin><!\[CDATA\[[\s\S]*?\]\]><\/b:skin>/gi, "");
}

function hasAllowedInlineScript(attrs) {
  const lower = String(attrs || "").toLowerCase();
  const typeMatch = lower.match(/\btype\s*=\s*(['"])([^'"]+)\1/i);
  const type = typeMatch ? String(typeMatch[2] || "").toLowerCase().trim() : "";
  return type === "application/ld+json";
}

function hasAllowedProdInlineBody(body) {
  const text = String(body || "").trim();
  if (!text) return true;
  if (/^BLOG_CMT_createIframe\s*\(/.test(text)) return true;
  return false;
}

for (const entry of files) {
  const abs = path.join(root, entry.rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${entry.rel}: file missing`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");

  const selfClosingScripts = findAll(source, /<script\b[^>]*\/>/gi);
  selfClosingScripts.forEach((m) => {
    failures.push(`${entry.rel}:${lineNumberAt(source, m.index)} self-closing <script/> is invalid`);
  });

  const outsideSkin = stripSkinBlocks(source);
  const styleMatches = findAll(outsideSkin, /<style\b[^>]*>/gi);
  styleMatches.forEach((m) => {
    failures.push(`${entry.rel}:${lineNumberAt(outsideSkin, m.index)} <style> outside <b:skin> is not allowed`);
  });

  const mixedScriptMatches = findAll(source, /<script\b[^>]*\bid=['"]gg-mixed-config['"][^>]*>/gi);
  mixedScriptMatches.forEach((m) => {
    failures.push(`${entry.rel}:${lineNumberAt(source, m.index)} gg-mixed-config must use <template>, not <script>`);
  });

  const mixedTemplateMatch = source.match(
    /<b:if\s+cond='([^']*)'>\s*<template\s+id='gg-mixed-config'>/i
  );
  if (!mixedTemplateMatch) {
    failures.push(`${entry.rel}: missing homepage-gated <template id='gg-mixed-config'>`);
  } else {
    const cond = String(mixedTemplateMatch[1] || "");
    if (!/data:view\.isHomepage/.test(cond)) {
      failures.push(`${entry.rel}: gg-mixed-config gate must include data:view.isHomepage`);
    }
    if (!/\/blog/.test(cond)) {
      failures.push(`${entry.rel}: gg-mixed-config gate must exclude /blog alias`);
    }
  }

  if (entry.prod) {
    const cdataScript = findAll(
      source,
      /<script\b[^>]*>\s*(?:\/\/)?\s*<!\[CDATA\[[\s\S]*?<\/script>/gi
    );
    cdataScript.forEach((m) => {
      failures.push(
        `${entry.rel}:${lineNumberAt(source, m.index)} inline executable CDATA <script> is not allowed in prod`
      );
    });

    const inlineScripts = findAll(source, /<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
    inlineScripts.forEach((m) => {
      const attrs = String(m[1] || "");
      const body = String(m[2] || "").trim();
      const lowerAttrs = attrs.toLowerCase();
      if (/\bsrc\s*=/.test(lowerAttrs)) return;
      if (!body) return;
      if (hasAllowedInlineScript(attrs)) return;
      if (hasAllowedProdInlineBody(body)) return;
      failures.push(
        `${entry.rel}:${lineNumberAt(source, m.index)} inline executable <script> is not allowed in prod`
      );
    });
  }
}

if (failures.length) {
  console.error("VERIFY_TEMPLATE_HYGIENE: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_TEMPLATE_HYGIENE: PASS");
