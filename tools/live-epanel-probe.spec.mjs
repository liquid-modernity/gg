import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

const TARGET_URL = String(process.env.GG_EPANEL_URL || "https://www.pakrpp.com/blog").trim();
const WAIT_MS = Number.parseInt(process.env.GG_EPANEL_WAIT_MS || "7000", 10) || 7000;
const OUT_JSON = String(process.env.GG_EPANEL_OUT || "test-results/live-blog-epanel-probe.json").trim();
const OUT_SCREENSHOT = String(
  process.env.GG_EPANEL_SCREENSHOT || "test-results/live-blog-epanel-before.png"
).trim();

test.setTimeout(120000);

function ensureParent(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

test("probe live /blog editorial preview", async ({ page }) => {
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(WAIT_MS);

  const probe = await page.evaluate(async () => {
    const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const panel = document.querySelector(".gg-info-panel .gg-editorial-preview");
    const pickRow = (name) => {
      const row = panel ? panel.querySelector(`[data-row="${name}"]`) : null;
      if (!row) return null;
      return { hidden: !!row.hidden, text: clean(row.textContent) };
    };
    const rows = {
      title: pickRow("title"),
      author: pickRow("author"),
      contributors: pickRow("contributors"),
      labels: pickRow("labels"),
      tags: pickRow("tags"),
      date: pickRow("date"),
      updated: pickRow("updated"),
      comments: pickRow("comments"),
      readtime: pickRow("readtime"),
      snippet: pickRow("snippet"),
      toc: pickRow("toc"),
    };

    const titleLink = panel ? panel.querySelector('[data-s="title"]') : null;
    const panelHref = titleLink ? clean(titleLink.getAttribute("href")) : "";
    const panelTitle = titleLink ? clean(titleLink.textContent) : "";
    const cards = Array.from(document.querySelectorAll(".gg-post-card"));
    const selectedCard = panelHref
      ? cards.find((card) => {
          const href = clean(card.querySelector(".gg-post-card__title-link")?.getAttribute("href") || "");
          return href === panelHref;
        })
      : null;

    const cardMeta = selectedCard
      ? {
          href: panelHref,
          title: clean(selectedCard.querySelector(".gg-post-card__title-link")?.textContent || ""),
          dataContributors:
            selectedCard.getAttribute("data-contributors") ||
            selectedCard.getAttribute("data-gg-contributors") ||
            "",
          dataTags: selectedCard.getAttribute("data-tags") || selectedCard.getAttribute("data-gg-tags") || "",
          dataSnippet:
            selectedCard.getAttribute("data-snippet") || selectedCard.getAttribute("data-gg-snippet") || "",
          dataTocJson: selectedCard.getAttribute("data-gg-toc-json") || "",
          labelChips: Array.from(
            selectedCard.querySelectorAll('.gg-post-card__label a[rel="tag"], .gg-post-card__labels a[rel="tag"]')
          ).map((node) => clean(node.textContent)),
        }
      : null;

    const contributorsChips = panel ? panel.querySelectorAll('[data-gg-slot="contributors"] .gg-chip').length : -1;
    const tagsChips = panel ? panel.querySelectorAll('[data-gg-slot="tags"] .gg-chip').length : -1;
    const labelsChips = panel ? panel.querySelectorAll('[data-gg-slot="labels"] .gg-chip').length : -1;
    const tocLinks = panel ? panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink').length : -1;
    const tocHint = panel ? clean(panel.querySelector('[data-gg-slot="toc-hint"]')?.textContent || "") : "";

    let postProbe = null;
    if (panelHref) {
      try {
        const abs = new URL(panelHref, location.href).toString();
        const mobileUrl = `${abs}${abs.includes("?") ? "&" : "?"}m=1`;
        const response = await fetch(mobileUrl, { cache: "no-store" });
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const root = doc.querySelector(
          ".post-body.entry-content, .post-body.post-body-container, .post-body, .entry-content, .post-outer .post-body, .gg-post__content.post-body.entry-content, .gg-post__content"
        );
        const headings = root
          ? Array.from(root.querySelectorAll("h1,h2,h3,h4"))
              .map((h) => ({ tag: h.tagName, id: h.id || "", text: clean(h.textContent) }))
              .filter((item) => item.text)
          : [];
        const postmeta = doc.querySelector(".gg-postmeta,[data-gg-postmeta]");
        postProbe = {
          abs,
          headingsCount: headings.length,
          headingsSample: headings.slice(0, 5),
          postmeta: postmeta
            ? {
                contributors:
                  postmeta.getAttribute("data-contributors") ||
                  postmeta.getAttribute("data-gg-contributors") ||
                  "",
                tags: postmeta.getAttribute("data-tags") || postmeta.getAttribute("data-gg-tags") || "",
                snippet: postmeta.getAttribute("data-snippet") || postmeta.getAttribute("data-gg-snippet") || "",
                updated: postmeta.getAttribute("data-updated") || postmeta.getAttribute("data-gg-updated") || "",
                read:
                  postmeta.getAttribute("data-read-min") ||
                  postmeta.getAttribute("data-readtime") ||
                  postmeta.getAttribute("data-gg-read-min") ||
                  postmeta.getAttribute("data-gg-readtime") ||
                  "",
              }
            : null,
        };
      } catch (error) {
        postProbe = { error: String(error) };
      }
    }

    return {
      pageUrl: location.href,
      panelExists: !!panel,
      panelTitle,
      panelHref,
      rows,
      contributorsChips,
      tagsChips,
      labelsChips,
      tocLinks,
      tocHint,
      cardMeta,
      postProbe,
    };
  });

  ensureParent(OUT_SCREENSHOT);
  await page.screenshot({ path: OUT_SCREENSHOT, fullPage: true });

  ensureParent(OUT_JSON);
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(probe, null, 2)}\n`, "utf8");
  // Keep one-line prefix so shell can grep quickly from test output.
  // eslint-disable-next-line no-console
  console.log(`EPANEL_PROBE_JSON ${JSON.stringify(probe)}`);
});
