import fs from "fs";
import path from "path";

const root = process.cwd();
const files = ["index.prod.xml", "index.dev.xml"];
const failures = [];

function read(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`${rel}: file missing`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

for (const rel of files) {
  const source = read(rel);
  if (!source) continue;

  const badScript = source.match(/<script\b[^>]*\bid=['"]gg-mixed-config['"][^>]*>/i);
  if (badScript) {
    failures.push(`${rel}: gg-mixed-config must not use <script>`);
  }

  const gatedTemplate = source.match(/<b:if\s+cond='([^']*)'>\s*<template\s+id='gg-mixed-config'>/i);
  if (!gatedTemplate) {
    failures.push(`${rel}: missing homepage-gated <template id='gg-mixed-config'>`);
    continue;
  }

  const cond = String(gatedTemplate[1] || "");
  if (!/data:view\.isHomepage/.test(cond)) {
    failures.push(`${rel}: gg-mixed-config gate must include data:view.isHomepage`);
  }

  const configMatch = source.match(
    /<template[^>]*id=['"]gg-mixed-config['"][^>]*>\s*<!\[CDATA\[\s*([\s\S]*?)\s*\]\]>\s*<\/template>/i
  );
  if (!configMatch) {
    failures.push(`${rel}: gg-mixed-config template must wrap JSON in CDATA`);
    continue;
  }
  try {
    const cfg = JSON.parse(String(configMatch[1] || "{}"));
    if (String(cfg.source || "").toLowerCase() !== "dom") {
      failures.push(`${rel}: gg-mixed-config source must be \"dom\"`);
    }
    if (Array.isArray(cfg.sections) && cfg.sections.length) {
      failures.push(`${rel}: gg-mixed-config sections must be removed (DOM is SSOT)`);
    }
  } catch (err) {
    failures.push(`${rel}: gg-mixed-config JSON invalid (${err && err.message ? err.message : "parse error"})`);
  }
}

if (failures.length) {
  console.error("VERIFY_MIXED_CONFIG_GATED: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_MIXED_CONFIG_GATED: PASS");
