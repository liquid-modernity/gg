import { STORE_CATEGORY_PAGE_SIZE } from "../store.config.mjs";
import { paginateCategoryProducts } from "./paginate-products.mjs";
import { productCategoryKey, productsForCategory } from "./store-routes.mjs";
import {
  applyPageMetadata,
  buildCategoryRail,
  buildGridBlock,
  buildItemListJsonLdBlock,
  buildPreloadBlock,
  buildSemanticProductsBlock,
  buildStoreReportBlock,
  buildStaticProductsJsonBlock,
  escapeHtmlAttr,
  escapeHtmlText,
  replaceMarkedRegion,
} from "./render-store-page.mjs";

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`missing category page fragment: ${label}`);
  return source.replace(pattern, replacement);
}

function categoryPageJsonLdOptions(route) {
  return {
    routeUrl: route.canonicalUrl,
    collectionId: `${route.canonicalUrl}#collection`,
    itemListId: `${route.canonicalUrl}#itemlist`,
    collectionName: route.title,
    itemListName: `${route.h1} product picks`,
    description: route.description,
    positionOffset: route.positionOffset || 0,
  };
}

function categoryPageReport(baseReport, route, allCategoryProducts, visibleProducts) {
  return {
    ...baseReport,
    pageType: "category",
    categoryKey: route.key,
    categoryLabel: route.label,
    categoryPath: route.path,
    categoryCanonicalUrl: route.canonicalUrl,
    categoryPageNumber: route.pageNumber || 1,
    productCount: visibleProducts.length,
    validProducts: visibleProducts.length,
    visibleProducts: visibleProducts.length,
    totalCategoryProducts: allCategoryProducts.length,
    categoryPageSize: route.pageSize || STORE_CATEGORY_PAGE_SIZE,
    categoryTotalPages: route.totalPages || 1,
    categoryPositionOffset: route.positionOffset || 0,
    categoryPrevPath: route.prevPath || "",
    categoryNextPath: route.nextPath || "",
    needsPagination: allCategoryProducts.length > (route.pageSize || STORE_CATEGORY_PAGE_SIZE),
  };
}

function buildCategoryPaginationNav(route) {
  if (!route.prevPath && !route.nextPath) return "";

  const links = [
    route.prevPath ? `        <a class="store-chip" rel="prev" href="${escapeHtmlAttr(route.prevPath)}">Previous</a>` : "",
    route.nextPath ? `        <a class="store-chip" rel="next" href="${escapeHtmlAttr(route.nextPath)}">Next</a>` : "",
  ].filter(Boolean).join("\n");

  return [
    '      <nav class="store-chip-row store-category-pagination" aria-label="Store pagination">',
    links,
    "      </nav>",
  ].join("\n");
}

export function renderCategoryPage({ template, products, categoryKey, report, page = 1, paginationPage = null, inlineBuildReport = false }) {
  const requestedPage = Math.max(1, Number.parseInt(String(page || paginationPage?.pageNumber || 1), 10) || 1);
  const categoryPagination = paginationPage ? null : paginateCategoryProducts(products, categoryKey, STORE_CATEGORY_PAGE_SIZE);
  const route = paginationPage || categoryPagination?.pages.find((entry) => entry.pageNumber === requestedPage);
  if (!route) throw new Error(`category ${categoryKey} page ${requestedPage} is out of range`);
  const categoryProducts = productsForCategory(products, route.key);
  const start = route.positionOffset || 0;
  const visibleProducts = Array.isArray(route.products) ? route.products : categoryProducts.slice(start, start + (route.pageSize || STORE_CATEGORY_PAGE_SIZE));
  const firstProduct = visibleProducts[0] || products[0];
  let source = template;

  if (!firstProduct) throw new Error(`category ${route.key} has no product to seed preload`);

  source = applyPageMetadata(source, route);
  source = replaceMarkedRegion(source, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->", buildPreloadBlock(firstProduct));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->", buildGridBlock(visibleProducts));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->", buildStaticProductsJsonBlock(visibleProducts));
  source = replaceMarkedRegion(source, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->", buildItemListJsonLdBlock(visibleProducts, categoryPageJsonLdOptions(route)));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->", buildSemanticProductsBlock(visibleProducts));
  source = replaceMarkedRegion(
    source,
    "<!-- STORE_BUILD_REPORT_START -->",
    "<!-- STORE_BUILD_REPORT_END -->",
    buildStoreReportBlock(categoryPageReport(report, route, categoryProducts, visibleProducts), { inline: inlineBuildReport })
  );

  source = replaceRequired(
    source,
    /(<main\b[^>]*\bid=["']store-app["'][^>]*)(>)/i,
    `$1\n    data-store-category-key="${escapeHtmlAttr(route.key)}"\n    data-store-category-page="true"\n    data-store-category-page-number="${escapeHtmlAttr(route.pageNumber || 1)}"$2`,
    "store app category attributes"
  );
  source = replaceRequired(
    source,
    /<h1\b([^>]*)\bid=["']store-title["']([^>]*)>[\s\S]*?<\/h1>/i,
    `<h1 class="store-title" id="store-title" aria-label="${escapeHtmlAttr(route.intro)}">${escapeHtmlText(route.h1)}</h1>`,
    "category h1"
  );
  source = replaceRequired(
    source,
    /<h2\s+id=["']store-category-title["'][^>]*>[\s\S]*?<\/h2>/i,
    `<h2 id="store-category-title">${escapeHtmlText(route.h1)}</h2>`,
    "category title"
  );
  source = replaceRequired(
    source,
    /<p\s+id=["']store-category-description["'][^>]*>[\s\S]*?<\/p>/i,
    `<p id="store-category-description">${escapeHtmlText(route.intro)}</p>`,
    "category intro"
  );

  const categoryPaginationNav = buildCategoryPaginationNav(route);
  source = replaceRequired(
    source,
    /(<\/section>\n\n\s*<section\b[^>]*id=["']store-grid-skeleton["'])/i,
    `${buildCategoryRail(route.key)}${categoryPaginationNav ? `\n${categoryPaginationNav}` : ""}\n\n$1`,
    "category rail insertion"
  );

  if (visibleProducts.some((product) => productCategoryKey(product) !== route.key)) {
    throw new Error(`category ${route.key} render received products outside category`);
  }

  return {
    route,
    html: source,
    visibleProducts,
    totalProducts: categoryProducts.length,
    totalPages: route.totalPages || 1,
    pageNumber: route.pageNumber || 1,
    needsPagination: categoryProducts.length > (route.pageSize || STORE_CATEGORY_PAGE_SIZE),
  };
}
