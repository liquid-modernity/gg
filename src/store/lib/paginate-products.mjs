import { STORE_CATEGORY_PAGE_SIZE, STORE_ORIGIN } from "../store.config.mjs";
import { productsForCategory, storeCategoryRoute, storeCategoryRoutes } from "./store-routes.mjs";

function normalizedPageSize(value) {
  const next = Number.parseInt(String(value || STORE_CATEGORY_PAGE_SIZE), 10);
  return Number.isFinite(next) && next > 0 ? next : STORE_CATEGORY_PAGE_SIZE;
}

function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil(Number(total || 0) / pageSize));
}

function pagePath(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.path : `${baseRoute.path}/page/${pageNumber}`;
}

function pageNestedOutputPath(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.nestedOutputPath : `store/${baseRoute.key}/page/${pageNumber}/index.html`;
}

function pageFlatOutputPath(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.flatOutputPath : `store-${baseRoute.key}-page-${pageNumber}.html`;
}

function pageTitle(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.title : `${baseRoute.h1} · Page ${pageNumber} · Yellow Cart`;
}

function pageDescription(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.description : `${baseRoute.description} Page ${pageNumber}.`;
}

function pageIntro(baseRoute, pageNumber) {
  return pageNumber === 1 ? baseRoute.intro : `${baseRoute.intro} Halaman ${pageNumber}.`;
}

function prevPath(baseRoute, pageNumber) {
  if (pageNumber <= 1) return "";
  return pageNumber === 2 ? baseRoute.path : pagePath(baseRoute, pageNumber - 1);
}

function nextPath(baseRoute, pageNumber, totalPages) {
  return pageNumber < totalPages ? pagePath(baseRoute, pageNumber + 1) : "";
}

export function paginateProducts(products, pageSize = STORE_CATEGORY_PAGE_SIZE) {
  const items = Array.isArray(products) ? products : [];
  const size = normalizedPageSize(pageSize);
  const totalPages = pageCount(items.length, size);
  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const start = index * size;
    return {
      page: pageNumber,
      pageNumber,
      pageSize: size,
      totalProducts: items.length,
      totalPages,
      positionOffset: start,
      products: items.slice(start, start + size),
    };
  });
}

export function paginateCategoryProducts(products, key, pageSize = STORE_CATEGORY_PAGE_SIZE) {
  const baseRoute = storeCategoryRoute(key);
  const categoryProducts = productsForCategory(products, baseRoute.key);
  const size = normalizedPageSize(pageSize);
  const totalPages = pageCount(categoryProducts.length, size);
  const pages = paginateProducts(categoryProducts, size).map((page) => {
    const path = pagePath(baseRoute, page.pageNumber);
    return {
      ...baseRoute,
      page: page.pageNumber,
      pageNumber: page.pageNumber,
      pageSize: size,
      totalPages,
      totalProducts: categoryProducts.length,
      positionOffset: page.positionOffset,
      products: page.products,
      visibleProducts: page.products.length,
      path,
      canonicalUrl: `${STORE_ORIGIN}${path}`,
      nestedOutputPath: pageNestedOutputPath(baseRoute, page.pageNumber),
      flatOutputPath: pageFlatOutputPath(baseRoute, page.pageNumber),
      title: pageTitle(baseRoute, page.pageNumber),
      description: pageDescription(baseRoute, page.pageNumber),
      intro: pageIntro(baseRoute, page.pageNumber),
      prevPath: prevPath(baseRoute, page.pageNumber),
      nextPath: nextPath(baseRoute, page.pageNumber, totalPages),
    };
  });

  return {
    key: baseRoute.key,
    label: baseRoute.label,
    route: baseRoute,
    pageSize: size,
    total: categoryProducts.length,
    totalProducts: categoryProducts.length,
    totalPages,
    pages,
    paths: pages.map((page) => page.path),
  };
}

export function paginateStoreCategories(products, pageSize = STORE_CATEGORY_PAGE_SIZE) {
  return storeCategoryRoutes().map((route) => paginateCategoryProducts(products, route.key, pageSize));
}
