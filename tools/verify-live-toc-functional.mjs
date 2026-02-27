const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || "").trim();
const timeoutRaw = parseInt(getArg("--timeout-ms"), 10);
const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

if (!baseRaw) {
  console.error("VERIFY_LIVE_TOC_FUNCTIONAL: FAIL");
  console.error("- missing --base");
  process.exit(1);
}

const base = stripTrailingSlash(baseRaw);
const blogUrl = `${base}/blog`;

const decodeEntities = (input) =>
  String(input || "").replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (m, code) => {
    const token = String(code || "").toLowerCase();
    if (token === "amp") return "&";
    if (token === "lt") return "<";
    if (token === "gt") return ">";
    if (token === "quot") return '"';
    if (token === "apos") return "'";
    if (token === "nbsp") return " ";
    if (token.startsWith("#x")) {
      const cp = Number.parseInt(token.slice(2), 16);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    if (token.startsWith("#")) {
      const cp = Number.parseInt(token.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    return m;
  });

const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, " ");
const cleanText = (value) => decodeEntities(stripTags(value)).replace(/\s+/g, " ").trim();

const fetchText = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      text: await res.text(),
    };
  } finally {
    clearTimeout(timer);
  }
};

const findPostUrl = (html, baseUrl) => {
  const hrefRe = /href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  for (const m of html.matchAll(hrefRe)) {
    const raw = String(m[1] || m[2] || m[3] || "").trim();
    if (!raw) continue;
    if (/^mailto:|^tel:|^javascript:/i.test(raw)) continue;
    let candidate;
    try {
      candidate = new URL(raw, baseUrl);
    } catch (_) {
      continue;
    }
    if (!/^https?:$/i.test(candidate.protocol)) continue;
    if (candidate.hostname !== new URL(baseUrl).hostname) continue;
    if (!/\/20\d{2}\/\d{2}\/[^/?#]+\.html$/i.test(candidate.pathname)) continue;
    return candidate.toString();
  }
  return "";
};

const normalizeUrl = (raw) => {
  try {
    return new URL(raw).toString();
  } catch (_) {
    const path = String(raw || "").trim();
    if (!path) return "";
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  }
};

const findElementRangeFromOpen = (source, openStart, openTag, tagName) => {
  const html = String(source || "");
  const open = String(openTag || "");
  const name = String(tagName || "").trim().toLowerCase();
  if (!html || !open || !name) return null;
  const openEnd = openStart + open.length;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<\\/?${escaped}\\b[^>]*>`, "gi");
  re.lastIndex = openEnd;
  let depth = 1;
  let closeStart = -1;
  let closeEnd = -1;
  let token;
  while ((token = re.exec(html))) {
    const tag = token[0];
    const isClose = /^<\//.test(tag);
    const selfClose = /\/>\s*$/.test(tag);
    if (isClose) depth -= 1;
    else if (!selfClose) depth += 1;
    if (depth === 0) {
      closeStart = token.index;
      closeEnd = re.lastIndex;
      break;
    }
  }
  if (closeStart < 0 || closeEnd < 0) return null;
  return {
    openStart,
    openEnd,
    closeStart,
    closeEnd,
    innerStart: openEnd,
    innerEnd: closeStart,
    innerHtml: html.slice(openEnd, closeStart),
  };
};

const findPostBodyHtml = (html) => {
  const source = String(html || "");
  const openRe =
    /<([a-z0-9:-]+)\b[^>]*\bclass\s*=\s*(?:(['"])([^'"]*)\2|([^\s"'=<>`]+))[^>]*>/gi;
  let match;
  while ((match = openRe.exec(source))) {
    const tagName = String(match[1] || "").toLowerCase();
    const className = String(match[3] || match[4] || "");
    const tokens = className.split(/\s+/).map((x) => x.trim()).filter(Boolean);
    if (!tokens.includes("post-body")) continue;
    if (!tokens.includes("entry-content") && !tokens.includes("gg-post__content")) continue;
    const range = findElementRangeFromOpen(source, match.index, match[0], tagName);
    if (!range) continue;
    return range.innerHtml;
  }
  return "";
};

const stripBlockedBlocks = (html) => {
  let out = String(html || "");
  const patterns = [
    /<pre\b[\s\S]*?<\/pre>/gi,
    /<code\b[\s\S]*?<\/code>/gi,
    /<script\b[\s\S]*?<\/script>/gi,
    /<style\b[\s\S]*?<\/style>/gi,
    /<template\b[\s\S]*?<\/template>/gi,
    /<([a-z0-9:-]+)\b[^>]*\bhidden\b[^>]*>[\s\S]*?<\/\1>/gi,
    /<([a-z0-9:-]+)\b[^>]*\baria-hidden\s*=\s*(['"])true\2[^>]*>[\s\S]*?<\/\1>/gi,
  ];
  for (const re of patterns) {
    out = out.replace(re, " ");
  }
  return out;
};

const countEligibleHeadings = (postBodyHtml) => {
  const source = stripBlockedBlocks(postBodyHtml);
  const re = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let count = 0;
  let match;
  while ((match = re.exec(source))) {
    const text = cleanText(match[2] || "");
    if (!text) continue;
    count += 1;
  }
  return count;
};

const extractTocContainerHtml = (html) => {
  const source = String(html || "");
  const m = source.match(/<nav\b[^>]*\bid\s*=\s*(["'])gg-toc\1[^>]*>[\s\S]*?<\/nav>/i);
  return m ? String(m[0] || "") : "";
};

const countTocLinks = (tocHtml) => {
  const source = String(tocHtml || "");
  if (!source) return 0;
  const strict = source.match(
    /<a\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-toc__link\b[^"']*\1[^>]*\bhref\s*=\s*(["'])#[^"']+\2[^>]*>/gi
  );
  if (strict && strict.length) return strict.length;
  const fallback = source.match(/<a\b[^>]*\bhref\s*=\s*(["'])#[^"']+\1[^>]*>/gi);
  return fallback ? fallback.length : 0;
};

const failures = [];

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) failures.push(`post: invalid --post target (${postRaw})`);
}

if (!postUrl) {
  let listing;
  try {
    listing = await fetchText(`${blogUrl}?x=${Date.now()}`);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    failures.push(`blog: fetch failed (${msg}) ${blogUrl}`);
  }
  if (listing) {
    if (!listing.ok) {
      failures.push(`blog: status ${listing.status} ${blogUrl}`);
    } else {
      postUrl = findPostUrl(listing.text, base);
      if (!postUrl) {
        failures.push("post: unable to resolve post URL from /blog (set --post explicitly)");
      }
    }
  }
}

if (postUrl) {
  let post;
  try {
    const sep = postUrl.includes("?") ? "&" : "?";
    post = await fetchText(`${postUrl}${sep}x=${Date.now()}`);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "timeout" : (e && e.message ? e.message : "fetch-failed");
    failures.push(`post: fetch failed (${msg}) ${postUrl}`);
  }

  if (post) {
    if (!post.ok) {
      failures.push(`post: status ${post.status} ${postUrl}`);
    } else if (!/\btext\/html\b/i.test(post.contentType)) {
      failures.push(`post: non-html content-type "${post.contentType}" ${postUrl}`);
    } else {
      const html = String(post.text || "");
      if (/No content found/i.test(html)) {
        failures.push(`post: forbidden text "No content found" present @ ${postUrl}`);
      }
      const postBodyHtml = findPostBodyHtml(html);
      if (!postBodyHtml) {
        failures.push(`post: unable to locate .post-body/.entry-content container @ ${postUrl}`);
      } else {
        const headingCount = countEligibleHeadings(postBodyHtml);
        const tocHtml = extractTocContainerHtml(html);
        const tocLinkCount = countTocLinks(tocHtml);
        if (headingCount > 0 && tocLinkCount < 1) {
          failures.push(
            `post: headings=${headingCount} but TOC links=${tocLinkCount} in #gg-toc @ ${postUrl}`
          );
        }
        if (headingCount === 0 && tocLinkCount > 0) {
          failures.push(
            `post: headings=${headingCount} but TOC links=${tocLinkCount} (expected hidden/empty TOC) @ ${postUrl}`
          );
        }
      }
    }
  }
}

if (failures.length) {
  console.error("VERIFY_LIVE_TOC_FUNCTIONAL: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VERIFY_LIVE_TOC_FUNCTIONAL: PASS post=${postUrl || "(auto)"}`);
