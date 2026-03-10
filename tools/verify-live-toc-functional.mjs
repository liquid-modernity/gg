const args = process.argv.slice(2);

const getArg = (name) => {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === name) return args[i + 1] || "";
    if (a.startsWith(`${name}=`)) return a.slice(name.length + 1);
  }
  return "";
};

const parsePositiveInt = (name, fallback) => {
  const raw = parseInt(getArg(name), 10);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const DEFAULT_BASE = "https://www.pakrpp.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_MAX = 4;
const DEFAULT_RETRY_BASE_MS = 800;
const DEFAULT_RETRY_CAP_MS = 10000;
const DEFAULT_INTER_REQUEST_DELAY_MS = 250;
const DEFAULT_USER_AGENT = "gg-live-gate/1.0 (+https://www.pakrpp.com)";

const stripTrailingSlash = (s) => String(s || "").replace(/\/+$/, "");
const baseRaw = (getArg("--base") || DEFAULT_BASE).trim();
const postRaw = (getArg("--post") || "").trim();
const pageRaw = (getArg("--page") || "").trim();
const timeoutMs = parsePositiveInt("--timeout-ms", DEFAULT_TIMEOUT_MS);
const retryMax = parsePositiveInt("--retry-max", DEFAULT_RETRY_MAX);
const retryBaseMs = parsePositiveInt("--retry-base-ms", DEFAULT_RETRY_BASE_MS);
const retryCapMs = parsePositiveInt("--retry-cap-ms", DEFAULT_RETRY_CAP_MS);
const interRequestDelayMs = parsePositiveInt(
  "--inter-request-delay-ms",
  DEFAULT_INTER_REQUEST_DELAY_MS
);
const userAgent = (getArg("--user-agent") || DEFAULT_USER_AGENT).trim() || DEFAULT_USER_AGENT;

if (!baseRaw) {
  console.error("VERIFY_LIVE_TOC_FUNCTIONAL: FAIL");
  console.error("- FUNCTIONAL FAIL: missing --base");
  process.exit(1);
}

const base = stripTrailingSlash(baseRaw);
const blogUrl = `${base}/blog`;

const report = {
  transient: [],
  unavailable: [],
  functional: [],
  evidence: [],
};

const addTransient = (message) => {
  report.transient.push(message);
};

const addUnavailable = (message) => {
  report.unavailable.push(`LIVE UNAVAILABLE AFTER RETRIES: ${message}`);
};

const addFunctional = (message) => {
  report.functional.push(`FUNCTIONAL FAIL: ${message}`);
};

const addEvidence = (message) => {
  report.evidence.push(`EVIDENCE: ${message}`);
};

const sleep = (ms) => {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
  if (safe <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, safe));
};

const parseRetryAfterMs = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return 0;

  if (/^\d+$/.test(value)) {
    const seconds = parseInt(value, 10);
    if (!Number.isFinite(seconds) || seconds < 0) return 0;
    return seconds * 1000;
  }

  const when = Date.parse(value);
  if (!Number.isFinite(when)) return 0;
  const delta = when - Date.now();
  return delta > 0 ? delta : 0;
};

const nextWaitMs = (attempt, retryAfterMs) => {
  const exp = Math.min(retryCapMs, retryBaseMs * 2 ** Math.max(0, attempt - 1));
  const jitterBound = Math.max(120, Math.floor(exp * 0.25));
  const jitter = Math.floor(Math.random() * jitterBound);
  if (retryAfterMs > 0) return retryAfterMs + jitter;
  return exp + jitter;
};

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

const fetchTextWithRetry = async (url, label) => {
  for (let attempt = 1; attempt <= retryMax; attempt += 1) {
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
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": userAgent,
        },
        signal: controller.signal,
      });

      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          contentType: res.headers.get("content-type") || "",
          text: await res.text(),
        };
      }

      const isRateLimit = res.status === 429;
      const isUpstreamTransient = res.status >= 500;
      if (!isRateLimit && !isUpstreamTransient) {
        return {
          ok: false,
          fatal: true,
          status: res.status,
        };
      }

      if (attempt >= retryMax) {
        addUnavailable(`${label} status=${res.status} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const retryAfterMs = parseRetryAfterMs(res.headers.get("retry-after"));
      const waitMs = nextWaitMs(attempt, retryAfterMs);
      if (isRateLimit) {
        addTransient(
          `TRANSIENT RATE LIMIT: ${label} attempt ${attempt}/${retryMax} status=429 wait=${waitMs}ms${
            retryAfterMs > 0 ? ` retry-after=${retryAfterMs}ms` : ""
          } url=${url}`
        );
      } else {
        addTransient(
          `TRANSIENT UPSTREAM: ${label} attempt ${attempt}/${retryMax} status=${res.status} wait=${waitMs}ms url=${url}`
        );
      }
      await sleep(waitMs);
    } catch (error) {
      const reason =
        error && error.name === "AbortError"
          ? "timeout"
          : error && error.message
            ? error.message
            : "fetch-failed";

      if (attempt >= retryMax) {
        addUnavailable(`${label} network-error=${reason} attempts=${retryMax} url=${url}`);
        return { ok: false };
      }

      const waitMs = nextWaitMs(attempt, 0);
      addTransient(
        `TRANSIENT NETWORK: ${label} attempt ${attempt}/${retryMax} error=${reason} wait=${waitMs}ms url=${url}`
      );
      await sleep(waitMs);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false };
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
  const re = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const levels = { h1: 0, h2: 0, h3: 0, h4: 0, total: 0 };
  let match;
  while ((match = re.exec(source))) {
    const level = String(match[1] || "");
    const text = cleanText(match[2] || "");
    const key = `h${level}`;
    if (!text) continue;
    if (!Object.prototype.hasOwnProperty.call(levels, key)) continue;
    levels[key] += 1;
    levels.total += 1;
  }
  return levels;
};

const extractLeftTocContainerHtml = (html) => {
  const source = String(html || "");
  const m = source.match(/<nav\b[^>]*\bid\s*=\s*(["'])gg-toc\1[^>]*>[\s\S]*?<\/nav>/i);
  return m ? String(m[0] || "") : "";
};

const extractRightTocContainerHtml = (html) => {
  const source = String(html || "");
  const m = source.match(
    /<ol\b[^>]*\bclass\s*=\s*(["'])[^"']*\bgg-info-panel__toclist\b[^"']*\1[^>]*>[\s\S]*?<\/ol>/i
  );
  return m ? String(m[0] || "") : "";
};

const hasListingTocMarker = (html) =>
  /\bdata-gg-marker\s*=\s*(["'])panel-listing-toc\1/i.test(String(html || ""));

const countTocLinks = (tocHtml, classToken) => {
  const source = String(tocHtml || "");
  if (!source) return 0;
  const cls = String(classToken || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const strictRe = cls
    ? new RegExp(
        `<a\\b[^>]*\\bclass\\s*=\\s*([\"'])[^\"']*\\b${cls}\\b[^\"']*\\1[^>]*\\bhref\\s*=\\s*([\"'])#[^\"']+\\2[^>]*>`,
        "gi"
      )
    : /<a\b[^>]*\bhref\s*=\s*(["'])#[^"']+\1[^>]*>/gi;
  const strict = source.match(strictRe);
  if (strict && strict.length) return strict.length;
  const fallback = source.match(/<a\b[^>]*\bhref\s*=\s*(["'])#[^"']+\1[^>]*>/gi);
  return fallback ? fallback.length : 0;
};

function verifyListingTocSurface(targetUrl, html) {
  const source = String(html || "");
  const rightTocHtml = extractRightTocContainerHtml(source);
  const rightTocLinks = countTocLinks(rightTocHtml, "gg-info-panel__toclink");
  const hasRightToc = !!rightTocHtml;
  const hasMarker = hasListingTocMarker(source);
  addEvidence(
    `listing: right_container=${hasRightToc ? 1 : 0} right_marker=${hasMarker ? 1 : 0} right_links=${rightTocLinks} scope=right-only @ ${targetUrl}`
  );
  if (!hasRightToc) {
    addFunctional(
      `listing: missing right TOC container .gg-info-panel__toclist (final contract: /blog right panel) @ ${targetUrl}`
    );
  }
  if (!hasMarker) {
    addFunctional(
      `listing: missing marker data-gg-marker=\"panel-listing-toc\" (final contract: /blog right panel) @ ${targetUrl}`
    );
  }
}

async function verifyTocTarget(kind, targetUrl) {
  if (!targetUrl) return;

  if (interRequestDelayMs > 0) {
    await sleep(interRequestDelayMs);
  }

  const sep = targetUrl.includes("?") ? "&" : "?";
  const result = await fetchTextWithRetry(`${targetUrl}${sep}x=${Date.now()}`, kind);
  if (!result.ok) {
    if (result.fatal) {
      addFunctional(`${kind}: status ${result.status} ${targetUrl}`);
    }
    return;
  }

  if (!/\btext\/html\b/i.test(result.contentType)) {
    addFunctional(`${kind}: non-html content-type "${result.contentType}" ${targetUrl}`);
    return;
  }

  const html = String(result.text || "");
  if (/No content found/i.test(html)) {
    addFunctional(`${kind}: forbidden text "No content found" present @ ${targetUrl}`);
  }

  const postBodyHtml = findPostBodyHtml(html);
  if (!postBodyHtml) {
    addFunctional(`${kind}: unable to locate .post-body/.entry-content container @ ${targetUrl}`);
    return;
  }

  const headingCount = countEligibleHeadings(postBodyHtml);
  const totalHeadings = headingCount.total;
  const expectedTocLinks = Math.min(totalHeadings, 12);
  const leftTocHtml = extractLeftTocContainerHtml(html);
  const rightTocHtml = extractRightTocContainerHtml(html);
  const leftTocLinks = countTocLinks(leftTocHtml, "gg-toc__link");
  const rightTocLinks = countTocLinks(rightTocHtml, "gg-info-panel__toclink");
  addEvidence(
    `${kind}: h1=${headingCount.h1} h2=${headingCount.h2} h3=${headingCount.h3} h4=${headingCount.h4} total=${totalHeadings} expected_links=${expectedTocLinks} left_links=${leftTocLinks} right_links=${rightTocLinks} scope=left-only @ ${targetUrl}`
  );
  if (!leftTocHtml) {
    addFunctional(`${kind}: missing left TOC container #gg-toc (final contract: post/page left panel) @ ${targetUrl}`);
  }
  if (totalHeadings > 0 && leftTocLinks < expectedTocLinks) {
    addFunctional(
      `${kind}: expected left TOC links >=${expectedTocLinks} from h1-h4, got ${leftTocLinks} @ ${targetUrl}`
    );
  }
  if (totalHeadings === 0 && leftTocLinks > 0) {
    addFunctional(`${kind}: h1-h4 total=0 but left TOC links=${leftTocLinks} @ ${targetUrl}`);
  }
  if (rightTocLinks > 0) {
    addFunctional(
      `${kind}: right TOC links should be inactive for post/page final scope, got ${rightTocLinks} @ ${targetUrl}`
    );
  }
}

let postUrl = "";
if (postRaw) {
  postUrl = normalizeUrl(postRaw);
  if (!postUrl) addFunctional(`post: invalid --post target (${postRaw})`);
}

let listingHtml = "";
const listing = await fetchTextWithRetry(`${blogUrl}?x=${Date.now()}`, "blog");
if (listing.ok) {
  listingHtml = String(listing.text || "");
  verifyListingTocSurface(blogUrl, listingHtml);
  if (!postUrl) {
    postUrl = findPostUrl(listingHtml, base);
    if (!postUrl) {
      addFunctional("post: unable to resolve post URL from /blog (set --post explicitly)");
    }
  }
} else if (listing.fatal) {
  addFunctional(`blog: status ${listing.status} ${blogUrl}`);
}

let pageUrl = "";
if (pageRaw) {
  pageUrl = normalizeUrl(pageRaw);
  if (!pageUrl) addFunctional(`page: invalid --page target (${pageRaw})`);
}

await verifyTocTarget("post", postUrl);
if (pageUrl) await verifyTocTarget("page", pageUrl);

const hasUnavailable = report.unavailable.length > 0;
const hasFunctional = report.functional.length > 0;

if (hasUnavailable || hasFunctional) {
  console.error("VERIFY_LIVE_TOC_FUNCTIONAL: FAIL");
  console.error(`- FAILURE_CLASS: ${hasFunctional ? "FUNCTIONAL_FAIL" : "LIVE_UNAVAILABLE"}`);
  for (const line of report.evidence) console.error(`- ${line}`);
  for (const line of report.transient) console.error(`- ${line}`);
  for (const line of report.unavailable) console.error(`- ${line}`);
  for (const line of report.functional) console.error(`- ${line}`);
  process.exit(1);
}

if (report.transient.length) {
  console.log("VERIFY_LIVE_TOC_FUNCTIONAL: TRANSIENT RECOVERY");
  for (const line of report.transient) console.log(`- ${line}`);
}
for (const line of report.evidence) console.log(`- ${line}`);
console.log(
  `VERIFY_LIVE_TOC_FUNCTIONAL: PASS listing=${blogUrl} post=${postUrl || "(auto)"} page=${pageUrl || "(skip)"}`
);
