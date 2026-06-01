import { storeSource, stripTrailingSlash } from "../registry/gg-source-boundary.registry.js";

export const STORE_ORIGIN = new URL(storeSource.publicCanonicalBase).origin;
export const STORE_PATHNAME = new URL(storeSource.publicCanonicalBase).pathname.replace(/\/$/u, "") || "/store";
export const STORE_ROUTE_URL = stripTrailingSlash(storeSource.publicCanonicalBase);
export const STORE_SOURCE_HOST = storeSource.sourceHost;
export const STORE_SOURCE_CUSTOM_HOST = storeSource.sourceCustomHost;
export const STORE_FEED_URL = storeSource.feed.url;
export const STORE_FEED_PATH = storeSource.feed.url;
export const STORE_LEGACY_FEED_PATH = storeSource.feed.legacyUrl;
export const STORE_WEBSITE_ID = `${STORE_ORIGIN}/#website`;
export const STORE_ORGANIZATION_ID = `${STORE_ORIGIN}/#organization`;
export const STORE_COLLECTION_ID = `${STORE_ROUTE_URL}#collection`;
export const STORE_ITEMLIST_ID = `${STORE_ROUTE_URL}#itemlist`;
export const STORE_SCHEMA_DESCRIPTION = "Yellow Cart is PakRPP's affiliate product curation and discovery page for editorially selected fashion, skincare, workspace, tech, and everyday picks.";
export const STORE_CATEGORY_PAGE_SIZE = 48;
export const STORE_ASSET_CSS_HREF = "/assets/store/store.css";
export const STORE_ASSET_JS_HREF = "/assets/store/store-core.js";
export const STORE_DISCOVERY_ASSET_JS_HREF = "/assets/store/store-discovery.js";
export const STORE_LEGACY_ASSET_JS_HREF = "/assets/store/store.js";
export const STORE_BUILD_REPORT_ARTIFACT_PATH = "store/data/build-report.json";
export const STORE_BUILD_REPORT_HREF = `/${STORE_BUILD_REPORT_ARTIFACT_PATH}`;
export const STORE_ARTIFACT_CONTRACT_VERSION = "store-artifact-contract-v1";
export const STORE_REQUIRE_FLAT_TRANSITIONAL = isStoreFlatTransitionalRequired();
export const STORE_INLINE_BUILD_REPORT = isStoreInlineBuildReportEnabled();
export const CRITICAL_CSS_BUDGET_BYTES = 14 * 1024;
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

export function isStoreInlineBuildReportEnabled(value = globalThis.process?.env?.GG_STORE_INLINE_BUILD_REPORT ?? "0") {
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function storeAbsoluteUrl(slug) {
  return `${STORE_ROUTE_URL}?item=${encodeURIComponent(slug)}`;
}
