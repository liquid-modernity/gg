#!/usr/bin/env node
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  const hit = args.find((a) => a.startsWith(name + "="));
  if (hit) return hit.split("=").slice(1).join("=");
  return "";
}

const base = getArg("--base") || "https://www.pakrpp.com";
const listingUrl = new URL("/blog", base).href;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error(`fetch failed ${url} (${res.status})`);
  return await res.text();
}

function pickFirstMatch(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

function findPostUrl(html, baseUrl) {
  const candidates = [
    /class=['"]gg-post-card__thumb['"][^>]*href=['"]([^'"]+)['"]/i,
    /class=['"]gg-post-card__title['"][^>]*href=['"]([^'"]+)['"]/i,
    /data-url=['"]([^'"]+)['"]/i,
    /href=['"]([^'"]+\/20\d{2}\/[^'"]+)['"]/i,
  ];
  for (const re of candidates) {
    const raw = pickFirstMatch(html, re);
    if (!raw) continue;
    if (/\/search|\/p\/|\/blog/.test(raw)) continue;
    try {
      return new URL(raw, baseUrl).href;
    } catch (_) {}
  }
  return "";
}

function extractAside(html, className) {
  const idx = html.indexOf(className);
  if (idx === -1) return "";
  const start = html.lastIndexOf("<aside", idx);
  if (start === -1) return "";
  const end = html.indexOf("</aside>", idx);
  if (end === -1) return "";
  return html.slice(start, end + 8);
}

async function main() {
  const listingHtml = await fetchHtml(`${listingUrl}?x=${Date.now()}`);
  const postUrl = findPostUrl(listingHtml, base);
  if (!postUrl) throw new Error("unable to find post URL from /blog");
  const postHtml = await fetchHtml(`${postUrl}${postUrl.includes("?") ? "&" : "?"}x=${Date.now()}`);

  const listAside = extractAside(listingHtml, "gg-blog-sidebar--left");
  const postAside = extractAside(postHtml, "gg-blog-sidebar--left");
  if (!listAside) throw new Error("listing missing left sidebar");
  if (!postAside) throw new Error("post missing left sidebar");

  const listHas = /gg-left-sidebar-list/.test(listAside);
  const postHas = /gg-left-sidebar-post|gg-postinfo/.test(postAside);
  if (!listHas) throw new Error("listing sidebar missing gg-left-sidebar-list");
  if (!postHas) throw new Error("post sidebar missing gg-left-sidebar-post/gg-postinfo");
  if (listAside === postAside) throw new Error("left sidebar blocks identical");

  console.log(`PASS: multizone markers differ (listing vs post)`);
  console.log(`INFO: listing=${listingUrl}`);
  console.log(`INFO: post=${postUrl}`);
}

main().catch((err) => {
  console.error(`FAIL: multizone check failed: ${err.message || err}`);
  process.exit(1);
});
