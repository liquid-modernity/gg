export const GG_DISCOVERY = Object.freeze({
  global: Object.freeze({
    id: "global",
    surfaces: Object.freeze(["landing", "blog", "detail", "page"]),
    titleKey: "discovery.title",
    placeholderKey: "discovery.global.placeholder",
    feedMax: 80,
    filters: Object.freeze(["all", "articles", "topics", "saved"]),
    routeIds: Object.freeze(["home", "blog", "store", "contact"]),
    sectionIds: Object.freeze(["hero", "rubrics", "faq", "contact"]),
    actionIds: Object.freeze(["contactPakrpp", "openMore", "openStore", "openBlog"]),
    itemTypes: Object.freeze(["article", "topic", "route", "section", "action"]),
    sources: Object.freeze(["articles", "topics", "routes", "landingSections", "actions"]),
    commandPlacement: "bottom",
    indexId: "global-discovery-v1"
  }),
  store: Object.freeze({
    id: "store",
    surfaces: Object.freeze(["store"]),
    titleKey: "discovery.store.title",
    placeholderKey: "discovery.store.placeholder",
    filters: Object.freeze(["all", "products", "categories", "saved"]),
    itemTypes: Object.freeze(["product", "category", "route", "action"]),
    sources: Object.freeze(["products", "categories", "storeRoutes"]),
    commandPlacement: "bottom",
    indexId: "store-discovery-v1"
  })
});
