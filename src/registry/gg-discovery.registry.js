export const GG_DISCOVERY = Object.freeze({
  global: Object.freeze({
    id: "global",
    surfaces: Object.freeze(["landing", "blog", "detail", "page"]),
    titleKey: "discovery.title",
    placeholderKey: "discovery.global.placeholder",
    filters: Object.freeze(["all", "articles", "topics", "routes", "sections", "actions"]),
    itemTypes: Object.freeze(["article", "topic", "route", "section", "action"]),
    sources: Object.freeze(["articles", "topics", "routes", "landingSections", "actions"]),
    feed: Object.freeze({
      endpointPath: "/feeds/posts/default?alt=json",
      maxResults: 80
    }),
    staticBaseItemIds: Object.freeze([
      "route:home",
      "route:blog",
      "route:store",
      "route:contact",
      "section:hero",
      "section:structure",
      "section:routes",
      "section:interaction",
      "section:discoverability",
      "section:contact",
      "action:contact",
      "action:more",
      "action:store",
      "action:blog"
    ]),
    commandPlacement: "bottom",
    indexId: "global-discovery-v1"
  }),
  store: Object.freeze({
    id: "store",
    surfaces: Object.freeze(["store"]),
    titleKey: "discovery.store.title",
    placeholderKey: "discovery.store.placeholder",
    filters: Object.freeze(["all", "products", "categories", "routes"]),
    itemTypes: Object.freeze(["product", "category", "route", "action"]),
    sources: Object.freeze(["products", "categories", "storeRoutes"]),
    commandPlacement: "bottom",
    indexId: "store-discovery-v1"
  })
});
