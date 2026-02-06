import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

const core = readFile("public/assets/latest/core.js");
if (!core) {
  console.error("VERIFY_ROUTER_CONTRACT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  if (start === -1) return "";
  const end = src.indexOf(endToken, start);
  if (end === -1) return src.slice(start);
  return src.slice(start, end);
}

const handleBlock = sliceBetween(core, "router.handleClick", "router.navigate");
if (!handleBlock) failures.push("router.handleClick block not found");
if (handleBlock && /requestUi|loadUi/.test(handleBlock)) {
  failures.push("router.handleClick must not call requestUi/loadUi");
}
if (handleBlock && !/\._shouldIntercept/.test(handleBlock)) {
  failures.push("router.handleClick must call router._shouldIntercept");
}

const shouldMatch = core.match(/router\._shouldIntercept[\s\S]*?};/);
if (!shouldMatch) {
  failures.push("router._shouldIntercept missing");
} else {
  const body = shouldMatch[0];
  if (!body.includes("/assets/")) failures.push("router._shouldIntercept must deny /assets/*");
  const endpoints = ["/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.json", "/manifest.webmanifest"];
  endpoints.forEach((e) => {
    if (!body.includes(e)) failures.push(`router._shouldIntercept missing denylist for ${e}`);
  });
  const exts = [
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
    ".json", ".xml", ".txt", ".map", ".woff", ".woff2", ".ttf",
  ];
  let found = 0;
  exts.forEach((ext) => {
    if (body.includes(ext)) found += 1;
  });
  if (found < 5) failures.push("router._shouldIntercept must check at least 5 static extensions");
}

const lines = core.split(/\r?\n/);
lines.forEach((line, idx) => {
  if (line.includes("[GG.router]")) {
    if (!(line.includes("isDev()") || line.includes("GG_DEBUG"))) {
      failures.push(`router log not dev-only at core.js:${idx + 1}`);
    }
  }
});

if (failures.length) {
  console.error("VERIFY_ROUTER_CONTRACT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_ROUTER_CONTRACT: PASS");
