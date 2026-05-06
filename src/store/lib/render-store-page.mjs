import { buildStoreJsonLd } from "./build-store-jsonld.mjs";
import { clean } from "./normalize-store-product.mjs";
import { storeCategoryRoutes } from "./store-routes.mjs";
import {
  STORE_BUILD_REPORT_HREF,
  STORE_INLINE_BUILD_REPORT,
} from "../store.config.mjs";

export function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeHtmlAttr(value) {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeJsonForScript(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, "<\\/script");
}

export function replaceMarkedRegion(source, startMarker, endMarker, nextContent) {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);
  const startLineStart = source.lastIndexOf("\n", startIndex);
  const markerIndent = startLineStart === -1 ? "" : source.slice(startLineStart + 1, startIndex);

  if (startIndex === -1) throw new Error(`missing marker: ${startMarker}`);
  if (endIndex === -1) throw new Error(`missing marker: ${endMarker}`);
  if (source.indexOf(startMarker, startIndex + startMarker.length) !== -1) throw new Error(`duplicate marker: ${startMarker}`);
  if (source.indexOf(endMarker, endIndex + endMarker.length) !== -1) throw new Error(`duplicate marker: ${endMarker}`);
  if (endIndex <= startIndex) throw new Error(`marker order is invalid: ${startMarker} -> ${endMarker}`);

  return `${source.slice(0, startIndex + startMarker.length)}\n${nextContent}\n${markerIndent}${source.slice(endIndex)}`;
}

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`missing page fragment: ${label}`);
  return source.replace(pattern, replacement);
}

export function buildCriticalCssBlock(cssSource) {
  return `  <style>\n${String(cssSource).trimEnd()}\n  </style>`;
}

export function buildAssetCssLink(href) {
  return `  <link rel="stylesheet" href="${escapeHtmlAttr(href)}" />`;
}

export function buildRuntimeScriptTag(src) {
  return `  <script src="${escapeHtmlAttr(src)}" defer></script>`;
}

export function buildPreloadBlock(product) {
  return `  <link rel="preload" as="image" href="${escapeHtmlAttr(product.images[0])}" fetchpriority="high" />`;
}

function buildCardDots(product) {
  if (!product.images || product.images.length < 2) {
    return '            <span class="store-card__dots" aria-hidden="true" hidden></span>';
  }

  const dots = product.images.map((_, index) => `              <span class="store-card__dot${index === 0 ? " is-active" : ""}"></span>`).join("\n");
  return `            <span class="store-card__dots" aria-hidden="true">\n${dots}\n            </span>`;
}

export function buildGridBlock(products) {
  return products.map((product, index) => {
    const href = escapeHtmlAttr(product.canonicalUrl);
    const name = escapeHtmlText(product.name);
    const image = escapeHtmlAttr(product.images[0]);
    const category = escapeHtmlText(product.category);
    const priceText = escapeHtmlText(product.priceText);
    const slug = escapeHtmlAttr(product.slug);
    const cardId = escapeHtmlAttr(product.id || product.slug);
    const loading = index === 0 ? "eager" : "lazy";
    const fetchPriority = index === 0 ? "high" : "auto";

    return [
      `        <article class="store-card" data-store-product-id="${cardId}">`,
      `          <a class="store-card__button" href="${href}" aria-label="${escapeHtmlAttr(`Buka ${product.name}`)}" data-store-open-preview="${index}" data-store-product-slug="${slug}">`,
      "            <div class=\"store-card__media\">",
      `              <img src="${image}" width="900" height="1125" alt="${escapeHtmlAttr(product.name)}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}" draggable="false" />`,
      "              <span class=\"store-card__shade\" aria-hidden=\"true\"></span>",
      "              <div class=\"store-card__content\">",
      `                <span class="store-card__badge">${category}</span>`,
      `                <span class="store-card__price">${priceText}</span>`,
      `                <h2 class="store-card__title">${name}</h2>`,
      buildCardDots(product),
      "              </div>",
      "            </div>",
      "          </a>",
      "        </article>",
    ].join("\n");
  }).join("\n");
}

export function buildStaticProductsJsonBlock(products) {
  return `  <script type="application/json" id="store-static-products">\n${escapeJsonForScript(products)}\n  </script>`;
}

export function buildItemListJsonLdBlock(products, options = {}) {
  return `  <script type="application/ld+json" id="store-itemlist-jsonld">\n${escapeJsonForScript(buildStoreJsonLd(products, options))}\n  </script>`;
}

export function buildStoreReportBlock(report, { inline = STORE_INLINE_BUILD_REPORT } = {}) {
  const metadata = `  <span hidden id="store-build-metadata" data-store-build-id="${escapeHtmlAttr(report?.buildId || "")}" data-store-build-report="${escapeHtmlAttr(STORE_BUILD_REPORT_HREF)}"></span>`;

  if (!inline) return metadata;

  return `${metadata}\n  <script type="application/json" id="store-build-report">\n${escapeJsonForScript(report)}\n  </script>`;
}

function buildSemanticFact(label, value) {
  if (!clean(value)) return "";
  return [
    "          <div class=\"store-semantic-product__fact\">",
    `            <dt class="store-semantic-product__label">${escapeHtmlText(label)}</dt>`,
    `            <dd class="store-semantic-product__value">${escapeHtmlText(value)}</dd>`,
    "          </div>",
  ].join("\n");
}

export function buildSemanticProductsBlock(products) {
  if (!products.length) {
    return '          <p class="store-semantic-product__empty" data-copy="semanticEmptyLabel">Product notes will appear here after the curation loads.</p>';
  }

  return products.map((product) => {
    const facts = [
      buildSemanticFact("Why picked", product.whyPicked),
      buildSemanticFact("Best for", product.bestFor.join(" · ") || product.useCase || product.geoContext),
      buildSemanticFact("Caveat", product.caveat),
    ].filter(Boolean);

    return [
      `          <article class="store-semantic-product" id="store-note-${escapeHtmlAttr(product.slug)}">`,
      "            <div class=\"store-semantic-product__head\">",
      `              <p class="store-semantic-product__category">${escapeHtmlText(product.category)}</p>`,
      `              <h3 class="store-semantic-product__title">${escapeHtmlText(product.name)}</h3>`,
      `              <p class="store-semantic-product__summary">${escapeHtmlText(product.summary)}</p>`,
      "            </div>",
      facts.length ? "            <dl class=\"store-semantic-product__facts\">" : "",
      facts.join("\n"),
      facts.length ? "            </dl>" : "",
      "            <div class=\"store-semantic-product__links\">",
      `              <a class="store-button store-button--subtle" href="${escapeHtmlAttr(product.canonicalUrl)}">Editorial detail</a>`,
      `              <a class="store-button" href="${escapeHtmlAttr(product.storeUrl)}" data-store-open-slug="${escapeHtmlAttr(product.slug)}">Open in Store</a>`,
      "            </div>",
      "          </article>",
    ].filter(Boolean).join("\n");
  }).join("\n");
}

export function buildCategoryRail(activeKey = "") {
  const links = [
    '          <a class="store-chip" href="/store">Semua</a>',
    ...storeCategoryRoutes().map((route) => {
      const current = route.key === activeKey ? ' aria-current="page"' : "";
      return `          <a class="store-chip" href="${escapeHtmlAttr(route.path)}"${current}>${escapeHtmlText(route.label)}</a>`;
    }),
  ].join("\n");

  return [
    '      <nav class="store-chip-row store-category-page-rail" aria-label="Kategori Store">',
    links,
    "      </nav>",
  ].join("\n");
}

export function applyPageMetadata(source, page) {
  const title = escapeHtmlText(page.title);
  const description = escapeHtmlAttr(page.description);
  const canonical = escapeHtmlAttr(page.canonicalUrl);

  let next = source;
  next = replaceRequired(next, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`, "title");
  next = replaceRequired(next, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}" />`, "description");
  next = replaceRequired(next, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`, "canonical");
  next = replaceRequired(next, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtmlAttr(page.title)}" />`, "og:title");
  next = replaceRequired(next, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`, "og:description");
  next = replaceRequired(next, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`, "og:url");
  next = replaceRequired(next, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtmlAttr(page.title)}" />`, "twitter:title");
  next = replaceRequired(next, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`, "twitter:description");
  return next;
}
