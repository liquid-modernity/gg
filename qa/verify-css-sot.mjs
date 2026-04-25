#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/css-source-of-truth.md");
const INDEX_PATH = path.join(ROOT, "index.xml");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const LATEST_CSS = path.join(ROOT, "public/assets/latest/main.css");

const EXPECTED_MODE = "temporary-runtime-bridge";
const EXPECTED_PIPELINE = "absent";

const SKIP_DIRS = new Set([
  ".git",
  ".tmp",
  ".audit-report",
  ".wrangler",
  "dist",
  "node_modules",
  "public",
  "qa/audit-input",
  "qa/audit-output",
]);

const CSS_BUILD_RE =
  /\b(postcss|sass|less|stylus|tailwind|lightningcss|cssnano|vite|webpack)\b|src\/styles|styles\/index\.css/i;

const fail = (message) => {
  console.error(`CSS SOT FAIL: ${message}`);
  process.exit(1);
};

const rel = (file) => path.relative(ROOT, file).replace(/\\/g, "/");

const readText = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    fail(`unable to read ${rel(file)}: ${error?.message || "read error"}`);
  }
};

const marker = (text, name) => {
  const re = new RegExp(`^${name}:\\s*(.+?)\\s*$`, "m");
  const match = text.match(re);
  return match ? match[1].trim() : "";
};

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

const findActiveRelease = () => {
  const xml = readText(INDEX_PATH);
  const releases = [
    ...xml.matchAll(/\/assets\/v\/([^/]+)\/main\.css(?:[?"'])/g),
  ].map((match) => match[1]);
  const unique = [...new Set(releases)];
  if (unique.length !== 1) {
    fail(
      `index.xml must reference exactly one active versioned main.css release, found: ${
        unique.join(", ") || "none"
      }`
    );
  }
  return unique[0];
};

const shouldSkipDir = (dir) => {
  const normalized = rel(dir);
  return SKIP_DIRS.has(normalized);
};

const collectUnexpectedSourceCss = (dir, out = []) => {
  if (!existsSync(dir) || shouldSkipDir(dir)) return out;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectUnexpectedSourceCss(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".css")) continue;
    const relative = rel(full);
    if (relative.startsWith("docs/")) continue;
    out.push(relative);
  }
  return out;
};

const assertNoCssBuildScript = () => {
  const pkg = JSON.parse(readText(PACKAGE_PATH));
  const scripts = pkg && typeof pkg === "object" && pkg.scripts ? pkg.scripts : {};
  const offenders = [];
  for (const [name, value] of Object.entries(scripts)) {
    const command = String(value || "");
    if (name === "gaga:verify-css-sot") continue;
    if (CSS_BUILD_RE.test(command)) offenders.push(`${name}: ${command}`);
  }
  if (offenders.length) {
    fail(
      `CSS pipeline is documented as absent, but package scripts look like CSS build steps: ${offenders.join(
        " | "
      )}`
    );
  }
};

const assertAbsentPipeline = () => {
  const srcStyles = path.join(ROOT, "src/styles");
  const srcStylesStat = existsSync(srcStyles) ? statSync(srcStyles) : null;
  if (srcStylesStat && srcStylesStat.isDirectory()) {
    fail("CSS pipeline is documented as absent, but src/styles exists");
  }
  const unexpected = collectUnexpectedSourceCss(ROOT).sort();
  if (unexpected.length) {
    fail(
      `CSS pipeline is documented as absent, but source-like CSS files exist outside runtime assets: ${unexpected.join(
        ", "
      )}`
    );
  }
  assertNoCssBuildScript();
};

const main = () => {
  if (!existsSync(DOC_PATH)) fail("missing docs/css-source-of-truth.md");
  const doc = readText(DOC_PATH);
  const activeRelease = findActiveRelease();
  const activeCss = path.join(ROOT, `public/assets/v/${activeRelease}/main.css`);

  const mode = marker(doc, "CSS_SOT_MODE");
  const classification = marker(doc, "CSS_PIPELINE_CLASSIFICATION");
  const authoringTruth = marker(doc, "CSS_AUTHORING_TRUTH");
  const runtimeMirror = marker(doc, "CSS_RUNTIME_MIRROR");
  const pipeline = marker(doc, "CSS_GENERATION_PIPELINE");

  if (mode !== EXPECTED_MODE) {
    fail(`expected CSS_SOT_MODE=${EXPECTED_MODE}, found ${mode || "missing"}`);
  }
  if (classification !== EXPECTED_PIPELINE) {
    fail(`expected CSS_PIPELINE_CLASSIFICATION=${EXPECTED_PIPELINE}, found ${classification || "missing"}`);
  }
  if (authoringTruth !== "public/assets/v/<active-release>/main.css") {
    fail(`unexpected CSS_AUTHORING_TRUTH marker: ${authoringTruth || "missing"}`);
  }
  if (runtimeMirror !== "public/assets/latest/main.css") {
    fail(`unexpected CSS_RUNTIME_MIRROR marker: ${runtimeMirror || "missing"}`);
  }
  if (pipeline !== "none") {
    fail(`expected CSS_GENERATION_PIPELINE=none, found ${pipeline || "missing"}`);
  }

  if (!existsSync(activeCss)) fail(`active authoring bridge missing: ${rel(activeCss)}`);
  if (!existsSync(LATEST_CSS)) fail("runtime mirror missing: public/assets/latest/main.css");

  const activeHash = sha256(activeCss);
  const latestHash = sha256(LATEST_CSS);
  if (activeHash !== latestHash) {
    fail(
      `runtime mirror drift: ${rel(activeCss)} sha256=${activeHash} != ${rel(LATEST_CSS)} sha256=${latestHash}`
    );
  }

  assertAbsentPipeline();

  console.log("CSS SOT OK");
  console.log(`- mode: ${mode}`);
  console.log(`- pipeline: ${classification}`);
  console.log(`- active_release: ${activeRelease}`);
  console.log(`- authoring_truth: ${rel(activeCss)}`);
  console.log(`- runtime_mirror: ${rel(LATEST_CSS)}`);
  console.log(`- sha256: ${activeHash}`);
};

main();
