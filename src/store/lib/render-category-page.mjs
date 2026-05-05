import { CATEGORY_PAGE_SIZE, productCategoryKey, productsForCategory, storeCategoryRoute } from "./store-routes.mjs";
import {
  applyPageMetadata,
  buildCategoryRail,
  buildGridBlock,
  buildItemListJsonLdBlock,
  buildPreloadBlock,
  buildSemanticProductsBlock,
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
    productCount: visibleProducts.length,
    validProducts: visibleProducts.length,
    visibleProducts: visibleProducts.length,
    totalCategoryProducts: allCategoryProducts.length,
    categoryPageSize: CATEGORY_PAGE_SIZE,
    needsPagination: allCategoryProducts.length > CATEGORY_PAGE_SIZE,
  };
}

export function renderCategoryPage({ template, products, categoryKey, report }) {
  const route = storeCategoryRoute(categoryKey);
  const categoryProducts = productsForCategory(products, route.key);
  const visibleProducts = categoryProducts.slice(0, CATEGORY_PAGE_SIZE);
  const firstProduct = visibleProducts[0] || products[0];
  let source = template;

  if (!firstProduct) throw new Error(`category ${route.key} has no product to seed preload`);

  source = applyPageMetadata(source, route);
  source = replaceMarkedRegion(source, "<!-- STORE_LCP_PRELOAD_START -->", "<!-- STORE_LCP_PRELOAD_END -->", buildPreloadBlock(firstProduct));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_GRID_START -->", "<!-- STORE_STATIC_GRID_END -->", buildGridBlock(visibleProducts));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_PRODUCTS_JSON_START -->", "<!-- STORE_STATIC_PRODUCTS_JSON_END -->", buildStaticProductsJsonBlock(visibleProducts));
  source = replaceMarkedRegion(source, "<!-- STORE_ITEMLIST_JSONLD_START -->", "<!-- STORE_ITEMLIST_JSONLD_END -->", buildItemListJsonLdBlock(visibleProducts, categoryPageJsonLdOptions(route)));
  source = replaceMarkedRegion(source, "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_START -->", "<!-- STORE_STATIC_SEMANTIC_PRODUCTS_END -->", buildSemanticProductsBlock(visibleProducts));
  source = replaceMarkedRegion(source, "<!-- STORE_BUILD_REPORT_START -->", "<!-- STORE_BUILD_REPORT_END -->", `  <script type="application/json" id="store-build-report">\n${JSON.stringify(categoryPageReport(report, route, categoryProducts, visibleProducts), null, 2).replace(/<\/script/gi, "<\\/script")}\n  </script>`);

  source = replaceRequired(
    source,
    /(<main\b[^>]*\bid=["']store-app["'][^>]*)(>)/i,
    `$1\n    data-store-category-key="${escapeHtmlAttr(route.key)}"\n    data-store-category-page="true"$2`,
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
  source = replaceRequired(
    source,
    /(<\/section>\n\n\s*<section\b[^>]*id=["']store-grid-skeleton["'])/i,
    `${buildCategoryRail(route.key)}\n\n$1`,
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
    needsPagination: categoryProducts.length > CATEGORY_PAGE_SIZE,
  };
}
