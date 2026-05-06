export const STORE_ORIGIN = "https://www.pakrpp.com";
export const STORE_PATHNAME = "/store";
export const STORE_ROUTE_URL = `${STORE_ORIGIN}${STORE_PATHNAME}`;
export const STORE_FEED_URL = "https://www.pakrpp.com/feeds/posts/default/-/Store?alt=json&max-results=50";
export const STORE_FEED_PATH = "/feeds/posts/default/-/Store?alt=json&max-results=50";
export const STORE_LEGACY_FEED_PATH = "/feeds/posts/default/-/yellowcard?alt=json&max-results=50";
export const STORE_WEBSITE_ID = `${STORE_ORIGIN}/#website`;
export const STORE_ORGANIZATION_ID = `${STORE_ORIGIN}/#organization`;
export const STORE_COLLECTION_ID = `${STORE_ROUTE_URL}#collection`;
export const STORE_ITEMLIST_ID = `${STORE_ROUTE_URL}#itemlist`;
export const STORE_SCHEMA_DESCRIPTION = "Yellow Cart is PakRPP's affiliate product curation and discovery page for editorially selected fashion, skincare, workspace, tech, and everyday picks.";
export const STORE_CATEGORY_PAGE_SIZE = 48;
export const STORE_ASSET_CSS_HREF = "/assets/store/store.css";
export const STORE_ASSET_JS_HREF = "/assets/store/store.js";
export const STORE_ARTIFACT_CONTRACT_VERSION = "store-artifact-contract-v1";
export const STORE_REQUIRE_FLAT_TRANSITIONAL = isStoreFlatTransitionalRequired();
export const CRITICAL_CSS_BUDGET_BYTES = 15 * 1024;
export const STORE_PRODUCTION_BUDGETS = Object.freeze({
  storeHtmlBytes: 250 * 1024,
  categoryHtmlBytes: 350 * 1024,
  criticalCssBytes: CRITICAL_CSS_BUDGET_BYTES,
  storeCssGzipWarnBytes: 70 * 1024,
  storeCssGzipFailBytes: 120 * 1024,
  storeJsGzipWarnBytes: 90 * 1024,
  storeJsGzipFailBytes: 150 * 1024,
  manifestGzipWarnBytes: 250 * 1024,
  manifestGzipFailBytes: 500 * 1024,
  storeVisibleProducts: 50,
  categoryVisibleProducts: 60,
});
export const SYSTEM_LABELS = ["store", "yellowcard", "yellowcart"];
export const MARKET_KEYS = ["shopee", "tokopedia", "tiktok", "lazada", "website", "official"];

export function isStoreFlatTransitionalRequired(value = globalThis.process?.env?.GG_STORE_REQUIRE_FLAT_TRANSITIONAL ?? "1") {
  return !["0", "false", "no", "off"].includes(String(value).trim().toLowerCase());
}

export function storeAbsoluteUrl(slug) {
  return `${STORE_ROUTE_URL}?item=${encodeURIComponent(slug)}`;
}
