import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    failures.push(`missing file: ${rel}`);
    return "";
  }
  return fs.readFileSync(abs, "utf8");
}

function lineForIndex(src, idx) {
  if (idx < 0) return 0;
  let line = 1;
  for (let i = 0; i < idx; i += 1) {
    if (src.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function extractReleaseId(indexXml) {
  const m = indexXml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css|boot\.js)/);
  return m ? m[1] : "";
}

function verifyDockSurfaceOverrides(css, label) {
  const ruleRe = /([^{}]+)\{[^{}]*\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = String(m[1] || "").trim().replace(/\s+/g, " ");
    if (!selector) continue;
    if (selector.indexOf("nav.gg-dock") === -1) continue;
    if (selector.indexOf("data-gg-surface") === -1) continue;
    const line = lineForIndex(css, m.index);
    failures.push(
      `${label}:${line} dock selector must not depend on data-gg-surface -> ${selector}`
    );
  }
}

function verifyPostcardsSkeletonCss(css, label) {
  const re = /#postcards\s*\[\s*data-gg-skeleton\s*=\s*["']on["']\s*\]\s*\{([^}]*)\}/gi;
  let m;
  while ((m = re.exec(css))) {
    const block = String(m[1] || "");
    const low = block.toLowerCase();
    const hides =
      /visibility\s*:\s*hidden/.test(low) ||
      /display\s*:\s*none/.test(low) ||
      /opacity\s*:\s*0(?:[;\s}]|$)/.test(low);
    if (hides) {
      const line = lineForIndex(css, m.index);
      failures.push(
        `${label}:${line} #postcards skeleton rule must not hide SSR content`
      );
    }
  }
}

function verifyMixedRatioContract(css, label) {
  if (!/--gg-mixed-ratio\s*:\s*[^;]+;/.test(css)) {
    failures.push(`${label}: missing --gg-mixed-ratio token`);
  }
  const usage = [...css.matchAll(/aspect-ratio\s*:\s*var\(--gg-mixed-ratio\)/g)];
  if (usage.length !== 1) {
    failures.push(
      `${label}: mixed ratio must be applied in exactly one selector (found ${usage.length})`
    );
  }
  if (/\.gg-mixed__thumb\s*\{[^}]*aspect-ratio\s*:/.test(css)) {
    failures.push(`${label}: .gg-mixed__thumb must not hard-code aspect-ratio`);
  }
  if (/\.gg-newsdeck__thumb\s*\{[^}]*aspect-ratio\s*:/.test(css)) {
    failures.push(`${label}: .gg-newsdeck__thumb must not hard-code aspect-ratio`);
  }
}

function verifyListingFlowContract(css, label) {
  const listingAttr = String.raw`\[data-gg-surface\s*=\s*(?:["'])?listing(?:["'])?\]`;
  const mainBlockRe = new RegExp(
    String.raw`main\.gg-main${listingAttr}\s+\.gg-blog-main\s*\{([\s\S]*?)\}`,
    "i"
  );
  const mainBlockMatch = css.match(mainBlockRe);
  if (!mainBlockMatch) {
    failures.push(`${label}: missing listing flow rule for .gg-blog-main`);
  } else {
    const mainBlock = String(mainBlockMatch[1] || "");
    if (!/display\s*:\s*block\b/i.test(mainBlock)) {
      failures.push(`${label}: listing .gg-blog-main must be display:block`);
    }
    if (/\bdisplay\s*:\s*(?:grid|inline-grid|flex|inline-flex)\b/i.test(mainBlock)) {
      failures.push(`${label}: listing .gg-blog-main must not use grid/flex`);
    }
  }

  const postcardsBlockRe = new RegExp(
    String.raw`main\.gg-main${listingAttr}\s+\.gg-blog-main\s+#postcards\s*\{([\s\S]*?)\}`,
    "i"
  );
  const postcardsBlockMatch = css.match(postcardsBlockRe);
  if (!postcardsBlockMatch) {
    failures.push(`${label}: missing listing grid rule for #postcards`);
  } else {
    const postcardsBlock = String(postcardsBlockMatch[1] || "");
    if (!/\bdisplay\s*:\s*grid\b/i.test(postcardsBlock)) {
      failures.push(`${label}: listing #postcards must be display:grid`);
    }
  }
}

function verifyClampBoundsPx(css, label) {
  const clampRe = /clamp\(\s*([+-]?\d*\.?\d+)px\s*,[\s\S]*?,\s*([+-]?\d*\.?\d+)px\s*\)/gi;
  let m;
  while ((m = clampRe.exec(css))) {
    const min = Number.parseFloat(m[1]);
    const max = Number.parseFloat(m[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) continue;
    if (min > max) {
      const line = lineForIndex(css, m.index);
      const expr = String(m[0] || "").replace(/\s+/g, " ").trim();
      failures.push(
        `${label}:${line} clamp min>max is invalid (${min}px > ${max}px): ${expr}`
      );
    }
  }
}

function verifyRailLayoutContract(css, label) {
  const baseMatch = css.match(/\.gg-mixed__rail\s*\{([\s\S]*?)\}/i);
  if (!baseMatch) {
    failures.push(`${label}: missing .gg-mixed__rail base rule`);
    return;
  }
  const baseBody = String(baseMatch[1] || "");
  if (!/\bgrid-auto-flow\s*:\s*column\b/i.test(baseBody)) {
    failures.push(`${label}: .gg-mixed__rail must set grid-auto-flow: column`);
  }
  if (!/\boverflow-x\s*:\s*auto\b/i.test(baseBody)) {
    failures.push(`${label}: .gg-mixed__rail must set overflow-x: auto`);
  }

  const railKinds = ["youtube", "shorts", "podcast", "popular", "rail"];
  railKinds.forEach((kind) => {
    const kindRe = new RegExp(
      `\\.gg-mixed\\[data-type=['"]${kind}['"]\\]\\s+\\.gg-mixed__rail\\s*(?:,|\\{)`,
      "i"
    );
    if (!kindRe.test(css)) {
      failures.push(`${label}: missing rail selector for data-type="${kind}"`);
    }
  });
}

function verifyIndexContracts(indexXml) {
  if (/Page\s+\d+\s+Custom/i.test(indexXml)) {
    failures.push(`index.prod.xml: legacy "Page X Custom" title still present`);
  }
  if (/THE MIXED-MEDIA LAYOUT/i.test(indexXml)) {
    failures.push(`index.prod.xml: debug heading "THE MIXED-MEDIA LAYOUT" must not appear`);
  }

  const blogWidget = indexXml.match(/<b:widget id=['"]Blog1['"][\s\S]*?<\/b:widget>/i);
  const blogScope = blogWidget ? blogWidget[0] : indexXml;
  if (!/id=['"]postcards['"]/i.test(blogScope)) {
    failures.push(`index.prod.xml: Blog1 must render #postcards container`);
  }
  const capMatch = blogScope.match(/data:view\.isSingleItem\s+or\s+data:i\s*&lt;\s*(\d+)/i);
  if (!capMatch) {
    failures.push(`index.prod.xml: Blog1 SSR cap missing in postcards loop`);
  } else {
    const cap = parseInt(capMatch[1], 10);
    if (!Number.isFinite(cap) || cap !== 9) {
      failures.push(`index.prod.xml: Blog1 SSR postcards cap must be exactly 9 (found ${capMatch[1]})`);
    }
  }
  const numPostsMatch = blogScope.match(
    /<b:widget-setting name=['"]numPosts['"]>(\d+)<\/b:widget-setting>/i
  );
  if (!numPostsMatch) {
    failures.push(`index.prod.xml: Blog1 numPosts setting missing`);
  } else {
    const numPosts = parseInt(numPostsMatch[1], 10);
    if (!Number.isFinite(numPosts) || numPosts < 9) {
      failures.push(`index.prod.xml: Blog1 numPosts must be >= 9 (found ${numPostsMatch[1]})`);
    }
  }
}

function extractSectionBlock(indexXml, id) {
  const re = new RegExp(
    `<section\\b(?=[^>]*id=['"]${id}['"])[^>]*>[\\s\\S]*?<\\/section>`,
    "i"
  );
  const m = indexXml.match(re);
  return m ? m[0] : "";
}

function hasClass(tag, className) {
  const m = String(tag || "").match(/\bclass\s*=\s*(['"])([^'"]*)\1/i);
  if (!m || !m[2]) return false;
  return String(m[2])
    .split(/\s+/)
    .filter(Boolean)
    .includes(className);
}

function findDivByClass(source, className) {
  const html = String(source || "");
  const openRe = /<div\b[^>]*>/gi;
  let open;
  while ((open = openRe.exec(html))) {
    const openTag = open[0];
    if (!hasClass(openTag, className)) continue;
    const openStart = open.index;
    const openEnd = openRe.lastIndex;
    const selfClosing = /\/\s*>$/.test(openTag);
    if (selfClosing) {
      return {
        openTag,
        innerHtml: "",
        openStart,
        openEnd,
        closeStart: openEnd,
        closeEnd: openEnd,
      };
    }
    const tokenRe = /<\/?div\b[^>]*>/gi;
    tokenRe.lastIndex = openEnd;
    let depth = 1;
    let token;
    let closeStart = -1;
    let closeEnd = -1;
    while ((token = tokenRe.exec(html))) {
      const tag = token[0];
      const isClose = /^<\//.test(tag);
      const isSelfClose = /\/\s*>$/.test(tag);
      if (isClose) depth -= 1;
      else if (!isSelfClose) depth += 1;
      if (depth === 0) {
        closeStart = token.index;
        closeEnd = tokenRe.lastIndex;
        break;
      }
    }
    if (closeStart < 0 || closeEnd < 0) return null;
    return {
      openTag,
      innerHtml: html.slice(openEnd, closeStart),
      openStart,
      openEnd,
      closeStart,
      closeEnd,
    };
  }
  return null;
}

function countPlaceholders(fragment) {
  return (
    String(fragment || "").match(
      /<article\b[^>]*\bclass\s*=\s*['"][^'"]*\bgg-mixed__card--placeholder\b[^'"]*['"]/gi
    ) || []
  ).length;
}

function verifyMixedSectionSkeleton(indexXml, section) {
  const block = extractSectionBlock(indexXml, section.id);
  if (!block) {
    failures.push(`index.prod.xml: missing section block ${section.id}`);
    return;
  }
  const grid = findDivByClass(block, "gg-mixed__grid");
  const rail = findDivByClass(block, "gg-mixed__rail");
  if (!grid) failures.push(`index.prod.xml: ${section.id} missing .gg-mixed__grid`);
  if (!rail) failures.push(`index.prod.xml: ${section.id} missing .gg-mixed__rail`);

  if (section.layout === "grid") {
    const count = countPlaceholders(grid ? grid.innerHtml : "");
    if (count !== section.max) {
      failures.push(
        `index.prod.xml: ${section.id} grid placeholder count must be ${section.max} (found ${count})`
      );
    }
  } else if (section.layout === "rail") {
    const railTag = String(rail && rail.openTag ? rail.openTag : "");
    if (!railTag) {
      failures.push(`index.prod.xml: ${section.id} missing rail tag`);
    } else if (/\bhidden(?:\s*=\s*['"][^'"]*['"])?\b/i.test(railTag)) {
      failures.push(`index.prod.xml: ${section.id} rail must not be hidden in SSR`);
    }
    const count = countPlaceholders(rail ? rail.innerHtml : "");
    if (count !== section.max) {
      failures.push(
        `index.prod.xml: ${section.id} rail placeholder count must be ${section.max} (found ${count})`
      );
    }
  }
}

function verifyNewsdeckSkeleton(indexXml, id) {
  const block = extractSectionBlock(indexXml, id);
  if (!block) {
    failures.push(`index.prod.xml: missing NEWSISH block ${id}`);
    return;
  }
  const grid = findDivByClass(block, "gg-mixed__grid");
  if (!grid) {
    failures.push(`index.prod.xml: ${id} missing .gg-mixed__grid`);
    return;
  }
  const gridInner = String(grid.innerHtml || "");
  const deckCount = (
    gridInner.match(/<div\b[^>]*\bclass\s*=\s*['"][^'"]*\bgg-newsdeck\b[^'"]*['"]/gi) || []
  ).length;
  if (deckCount < 1) {
    failures.push(`index.prod.xml: ${id} must render .gg-newsdeck SSR skeleton`);
  }
  const colCount = (
    gridInner.match(/<div\b[^>]*\bclass\s*=\s*['"][^'"]*\bgg-newsdeck__col\b[^'"]*['"]/gi) || []
  ).length;
  if (colCount !== 3) {
    failures.push(`index.prod.xml: ${id} NEWSDECK must have 3 SSR columns (found ${colCount})`);
  }
  const itemCount = (
    gridInner.match(
      /<article\b[^>]*\bclass\s*=\s*['"][^'"]*\bgg-newsdeck__item\b[^'"]*\bgg-newsdeck__item--placeholder\b[^'"]*['"]/gi
    ) || []
  ).length;
  if (itemCount !== 9) {
    failures.push(`index.prod.xml: ${id} NEWSDECK must have 9 SSR placeholder items (found ${itemCount})`);
  }
}

function verifySectionTagContract(indexXml, id, opts) {
  const parts = [`(?=[^>]*id=['"]${id}['"])`];
  if (opts.kind) parts.push(`(?=[^>]*data-gg-kind=['"]${opts.kind}['"])`);
  if (opts.type) parts.push(`(?=[^>]*data-type=['"]${opts.type}['"])`);
  if (opts.max != null) parts.push(`(?=[^>]*data-gg-max=['"]${opts.max}['"])`);
  if (opts.cols != null) parts.push(`(?=[^>]*data-gg-cols=['"]${opts.cols}['"])`);
  if (opts.defer === true) parts.push(`(?=[^>]*data-gg-defer=['"]1['"])`);
  if (opts.disabled === true) parts.push(`(?=[^>]*data-gg-disabled=['"]1['"])`);
  const re = new RegExp(`<section${parts.join("")}[^>]*>`, "i");
  if (!re.test(indexXml)) {
    failures.push(
      `index.prod.xml: section ${id} contract mismatch` +
        ` (expected kind=${opts.kind || "-"} type=${opts.type || "-"} max=${opts.max ?? "-"} cols=${opts.cols ?? "-"} defer=${opts.defer ? "1" : "-"} disabled=${opts.disabled ? "1" : "-"})`
    );
  }
}

function parseMixedConfig(indexXml) {
  const m = indexXml.match(
    /<script[^>]*id=['"]gg-mixed-config['"][^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/i
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (_) {
    return null;
  }
}

function verifyMixedContracts(indexXml) {
  const required = [
    { id: "gg-mixed-featuredstrip", kind: "featured", type: "rail", max: 5, layout: "rail" },
    { id: "gg-mixed-newsish-1", kind: "newsish", type: "newsdeck", cols: 3, max: 3, layout: "newsdeck" },
    { id: "gg-mixed-bookish", kind: "bookish", type: "bookish", max: 4, layout: "grid" },
    { id: "gg-mixed-youtubeish", kind: "youtubeish", type: "youtube", max: 3, layout: "rail", defer: true },
    { id: "gg-mixed-shortish", kind: "shortish", type: "shorts", max: 5, layout: "rail", defer: true },
    { id: "gg-mixed-newsish-2", kind: "newsish", type: "newsdeck", cols: 3, max: 3, layout: "newsdeck", defer: true },
    { id: "gg-mixed-podcastish", kind: "podcastish", type: "podcast", max: 6, layout: "rail", defer: true },
  ];

  required.forEach((section) => {
    verifySectionTagContract(indexXml, section.id, section);
    if (section.layout === "newsdeck") verifyNewsdeckSkeleton(indexXml, section.id);
    else verifyMixedSectionSkeleton(indexXml, section);
  });

  const disabledLegacy = [
    "gg-mixed-instagramish",
    "gg-mixed-newsish-3",
    "gg-mixed-newsish-4",
    "gg-mixed-pinterestish",
  ];
  disabledLegacy.forEach((id) => {
    if (new RegExp(`<section\\b(?=[^>]*id=['"]${id}['"])`, "i").test(indexXml)) {
      verifySectionTagContract(indexXml, id, { disabled: true });
    }
  });

  const config = parseMixedConfig(indexXml);
  if (!config || !Array.isArray(config.sections)) {
    failures.push(`index.prod.xml: gg-mixed-config missing/invalid JSON`);
    return;
  }
  const sectionsById = new Map(
    config.sections
      .filter((s) => s && s.id)
      .map((s) => [String(s.id), s])
  );

  const sectionOrder = config.sections
    .map((s) => (s && s.id ? String(s.id) : ""))
    .filter(Boolean);
  const expectedOrder = [
    "gg-mixed-featuredstrip",
    "gg-mixed-newsish-1",
    "gg-mixed-bookish",
    "gg-mixed-youtubeish",
    "gg-mixed-shortish",
    "gg-mixed-newsish-2",
    "gg-mixed-podcastish",
  ];
  if (sectionOrder.length < expectedOrder.length) {
    failures.push(`index.prod.xml: gg-mixed-config section order missing required entries`);
  } else {
    for (let i = 0; i < expectedOrder.length; i += 1) {
      if (sectionOrder[i] !== expectedOrder[i]) {
        failures.push(
          `index.prod.xml: gg-mixed-config order mismatch at index ${i + 1} (expected ${expectedOrder[i]}, found ${sectionOrder[i] || "-"})`
        );
      }
    }
  }

  required.forEach((section) => {
    const cfg = sectionsById.get(section.id);
    if (!cfg) {
      failures.push(`index.prod.xml: gg-mixed-config missing section ${section.id}`);
      return;
    }
    if (parseInt(cfg.max, 10) !== section.max) {
      failures.push(
        `index.prod.xml: gg-mixed-config ${section.id} max must be ${section.max} (found ${cfg.max})`
      );
    }
    if (section.type && String(cfg.type || "").toLowerCase() !== String(section.type).toLowerCase()) {
      failures.push(
        `index.prod.xml: gg-mixed-config ${section.id} type must be ${section.type} (found ${cfg.type})`
      );
    }
    if (section.defer) {
      const defer = cfg.defer === true || String(cfg.defer || "") === "1";
      if (!defer) {
        failures.push(`index.prod.xml: gg-mixed-config ${section.id} must set defer=1`);
      }
    }
  });
}

function isSidebarRootSelector(selector) {
  const normalized = String(selector || "").trim();
  if (!normalized) return false;
  return /(?:^|[\s>+~])\.gg-blog-sidebar(?:--left|--right)?(?:[:\[].*)?$/i.test(
    normalized
  );
}

function verifySidebarWidthTokens(css, label) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selectors = String(m[1] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!selectors.some((s) => isSidebarRootSelector(s))) continue;

    const body = String(m[2] || "");
    const declRe = /(^|[;\s])width\s*:\s*([^;{}]+)/gim;
    let d;
    while ((d = declRe.exec(body))) {
      const value = String(d[2] || "").trim().toLowerCase();
      const tokenized = value.includes("var(");
      const keyword =
        value === "auto" ||
        value === "unset" ||
        value === "initial" ||
        value === "inherit";
      if (tokenized || keyword) continue;
      const line = lineForIndex(css, m.index + d.index);
      failures.push(
        `${label}:${line} width for sidebar root selector must be tokenized (found: ${value})`
      );
    }
  }
}

function verifyRuntimeContracts(coreJsRel, mixedJsRel, label) {
  const coreJs = readFile(coreJsRel);
  const mixedJs = readFile(mixedJsRel);
  if (!coreJs || !mixedJs) return;

  if (
    !/top:\s*\[\s*['"]gg-mixed-featuredstrip['"]\s*,\s*['"]gg-mixed-newsish-1['"]\s*,\s*['"]gg-mixed-bookish['"]\s*\]/.test(
      coreJs
    )
  ) {
    failures.push(`${label}: listing top order contract missing in ui.bucket.core.js`);
  }
  if (
    !/deferred:\s*\[\s*['"]gg-mixed-youtubeish['"]\s*,\s*['"]gg-mixed-shortish['"]\s*,\s*['"]gg-mixed-newsish-2['"]\s*,\s*['"]gg-mixed-podcastish['"]\s*\]/.test(
      coreJs
    )
  ) {
    failures.push(`${label}: listing deferred order contract missing in ui.bucket.core.js`);
  }
  if (!/data-gg-listing-flow['"],\s*'reading-first'/.test(coreJs)) {
    failures.push(`${label}: listing flow marker reading-first missing in ui.bucket.core.js`);
  }

  if (!/rootMargin:\s*['"]900px 0px['"]/.test(mixedJs)) {
    failures.push(`${label}: mixed defer observer rootMargin must be 900px 0px`);
  }
  if (!/data-gg-defer/.test(mixedJs)) {
    failures.push(`${label}: mixed module must read data-gg-defer contract`);
  }
  if (!/data-gg-disabled/.test(mixedJs)) {
    failures.push(`${label}: mixed module must skip data-gg-disabled sections`);
  }
}

function verifyLabelChannelContracts(listingJsRel, channelJsRel, label) {
  const listingJs = readFile(listingJsRel);
  const channelJs = readFile(channelJsRel);
  if (!listingJs || !channelJs) return;

  if (!/ui\.bucket\.channel\.js/.test(listingJs)) {
    failures.push(`${label}: listing module must lazy-load ui.bucket.channel.js`);
  }
  if (!/\/search\/label\/\[\^\/\?\#\]\+/.test(listingJs) && !/\/search\/label\//.test(listingJs)) {
    failures.push(`${label}: listing module must detect /search/label/* pages`);
  }

  if (!/CHANNEL_MODE_MAP/.test(channelJs)) {
    failures.push(`${label}: channel module missing editable CHANNEL_MODE_MAP`);
  }
  if (!/podcast['"]?\s*:\s*['"]podcast['"]/.test(channelJs)) {
    failures.push(`${label}: channel module missing podcast mode map`);
  }
  if (!/videos['"]?\s*:\s*['"]videos['"]/.test(channelJs)) {
    failures.push(`${label}: channel module missing videos mode map`);
  }
  if (!/photography['"]?\s*:\s*['"]photography['"]/.test(channelJs)) {
    failures.push(`${label}: channel module missing photography mode map`);
  }
  if (!/CHANNEL_COUNTS\s*=\s*\{\s*podcast:\s*6,\s*youtube:\s*3,\s*shorts:\s*5,\s*photography:\s*12\s*\}/.test(channelJs)) {
    failures.push(`${label}: channel module counts must be podcast=6 youtube=3 shorts=5 photography=12`);
  }
  if (!/renderSkeleton/.test(channelJs)) {
    failures.push(`${label}: channel module must render skeletons before fetch`);
  }
  if (!/gg-label-channel/.test(channelJs)) {
    failures.push(`${label}: channel module must render gg-label-channel container`);
  }
}

function verifyCssFile(relPath, label) {
  const css = readFile(relPath);
  if (!css) return;
  if (!/--gg-col-left:\s*240px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-left: 240px`);
  }
  if (!/--gg-col-main:\s*1440px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-main: 1440px`);
  }
  if (!/--gg-col-right:\s*240px/.test(css)) {
    failures.push(`${label}: missing layout token --gg-col-right: 240px`);
  }
  if (!/--gg-drawer-max-vw-compact:\s*[^;]+/.test(css)) {
    failures.push(`${label}: missing layout token --gg-drawer-max-vw-compact`);
  }
  if (!/--gg-drawer-max-vw-mobile:\s*[^;]+/.test(css)) {
    failures.push(`${label}: missing layout token --gg-drawer-max-vw-mobile`);
  }
  if (
    !/\.gg-blog-layout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*var\(--gg-col-left\)\)\s+minmax\(0,\s*var\(--gg-col-main\)\)\s+minmax\(0,\s*var\(--gg-col-right\)\)/.test(
      css
    )
  ) {
    failures.push(`${label}: .gg-blog-layout must use 3-column token contract`);
  }
  verifyDockSurfaceOverrides(css, label);
  verifyPostcardsSkeletonCss(css, label);
  verifySidebarWidthTokens(css, label);
  verifyMixedRatioContract(css, label);
  verifyListingFlowContract(css, label);
  verifyClampBoundsPx(css, label);
  verifyRailLayoutContract(css, label);
}

const indexXml = readFile("index.prod.xml");
const rel = extractReleaseId(indexXml);
if (!rel) {
  failures.push("unable to extract release id from index.prod.xml");
}
if (indexXml) {
  verifyIndexContracts(indexXml);
  verifyMixedContracts(indexXml);
}

verifyCssFile("public/assets/latest/main.css", "latest main.css");
verifyRuntimeContracts(
  "public/assets/latest/modules/ui.bucket.core.js",
  "public/assets/latest/modules/ui.bucket.mixed.js",
  "latest runtime"
);
verifyLabelChannelContracts(
  "public/assets/latest/modules/ui.bucket.listing.js",
  "public/assets/latest/modules/ui.bucket.channel.js",
  "latest label runtime"
);
if (rel) {
  verifyCssFile(`public/assets/v/${rel}/main.css`, `pinned main.css (v/${rel})`);
  verifyRuntimeContracts(
    `public/assets/v/${rel}/modules/ui.bucket.core.js`,
    `public/assets/v/${rel}/modules/ui.bucket.mixed.js`,
    `pinned runtime (v/${rel})`
  );
  verifyLabelChannelContracts(
    `public/assets/v/${rel}/modules/ui.bucket.listing.js`,
    `public/assets/v/${rel}/modules/ui.bucket.channel.js`,
    `pinned label runtime (v/${rel})`
  );
}

if (failures.length) {
  console.error("VERIFY_UI_GUARDRAILS: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_UI_GUARDRAILS: PASS");
