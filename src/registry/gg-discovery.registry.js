export const GG_DISCOVERY = Object.freeze({
  global: Object.freeze({
    id: "global",
    surfaces: Object.freeze(["landing", "blog", "detail", "page"]),
    titleKey: "discovery.title",
    placeholderKey: "discovery.global.placeholder",
    filters: Object.freeze(["all", "articles", "topics", "routes", "sections", "actions"]),
    sources: Object.freeze(["articles", "topics", "routes", "landingSections", "actions"]),
    commandPlacement: "bottom"
  }),
  store: Object.freeze({
    id: "store",
    surfaces: Object.freeze(["store"]),
    titleKey: "discovery.store.title",
    placeholderKey: "discovery.store.placeholder",
    filters: Object.freeze(["all", "products", "categories", "routes"]),
    sources: Object.freeze(["products", "categories", "storeRoutes"]),
    commandPlacement: "bottom"
  })
});
