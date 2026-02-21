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

  const tapToken = css.match(/--gg-tap-min\s*:\s*([0-9]*\.?[0-9]+)px\b/i);
  if (!tapToken) {
    fail("missing token: --gg-tap-min");
  } else {
    const value = Number.parseFloat(tapToken[1]);
    if (!Number.isFinite(value) || value < 44) {
      fail(`--gg-tap-min must be >= 44px (found ${tapToken[1]}px)`);
    }
  }

  const required = [
    {
      label: ".gg-tree-toggle",
      selectorRe: /(^|[^\w-])\.gg-tree-toggle(?![\w-])/i,
    },
    {
      label: ".gg-post-card__tool",
      selectorRe: /(^|[^\w-])\.gg-post-card__tool(?![\w-])/i,
    },
    {
      label: ".gg-post__tool",
      selectorRe: /(^|[^\w-])\.gg-post__tool(?![\w-])/i,
    },
    {
      label: ".gg-lt__collapse",
      selectorRe: /(^|[^\w-])\.gg-lt__collapse(?![\w-])/i,
    },
    {
      label: ".gg-lt__panelbtn",
      selectorRe: /(^|[^\w-])\.gg-lt__panelbtn(?![\w-])/i,
    },
    {
      label: ".gg-pi__toggle",
      selectorRe: /(^|[^\w-])\.gg-pi__toggle(?![\w-])/i,
    },
    {
      label: ".gg-toc__toggle",
      selectorRe: /(^|[^\w-])\.gg-toc__toggle(?![\w-])/i,
    },
    {
      label: ".gg-share-sheet__close-btn",
      selectorRe: /(^|[^\w-])\.gg-share-sheet__close-btn(?![\w-])/i,
    },
    {
      label: "nav.gg-dock .gg-dock__search input",
      selectorRe: /nav\.gg-dock\s+\.gg-dock__search\s+input(?![\w-])/i,
    },
  ];

  const state = new Map(
    required.map((item) => [item.label, { seen: false, hasTapMin: false }])
  );

  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const selectorRaw = String(m[1] || "");
    const selector = selectorRaw.replace(/\s+/g, " ").trim();
    const body = String(m[2] || "");

    for (const item of required) {
      if (!item.selectorRe.test(selector)) continue;

      const info = state.get(item.label);
      info.seen = true;
      if (/--gg-tap-min/.test(body)) info.hasTapMin = true;

      const pxValueRe = /\b(?:min-)?(?:width|height)\s*:\s*([0-9]*\.?[0-9]+)px\b/gi;
      let px;
      while ((px = pxValueRe.exec(body))) {
        const value = Number.parseFloat(px[1]);
        if (Number.isFinite(value) && value < 44) {
          fail(`${item.label}: found <44px size declaration (${px[0].trim()})`);
        }
      }
    }
  }

  for (const item of required) {
    const info = state.get(item.label);
    if (!info.seen) {
      fail(`${item.label}: selector block not found`);
      continue;
    }
    if (!info.hasTapMin) {
      fail(`${item.label}: rule block missing --gg-tap-min`);
    }
  }
}

if (failures.length) {
  console.error("VERIFY_TAP_TARGETS: FAIL");
  failures.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log("PASS: tap targets contract (44px)");
