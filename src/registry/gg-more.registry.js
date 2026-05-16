export const GG_MORE_SHEET = Object.freeze({
  sections: Object.freeze([
    Object.freeze({
      id: "navigation",
      titleKey: "more.section.navigation",
      layout: "grid",
      items: Object.freeze(["home", "blog", "store", "contact"])
    }),
    Object.freeze({
      id: "discover",
      titleKey: "more.section.discover",
      layout: "list",
      items: Object.freeze(["search", "sitemap", "rss"])
    }),
    Object.freeze({
      id: "info",
      titleKey: "more.section.info",
      layout: "list",
      items: Object.freeze(["about", "privacy", "terms", "disclaimer"])
    }),
    Object.freeze({
      id: "language",
      titleKey: "more.section.language",
      layout: "segmented",
      items: Object.freeze(["english", "indonesia"])
    }),
    Object.freeze({
      id: "appearance",
      titleKey: "more.section.appearance",
      layout: "segmented",
      items: Object.freeze(["system", "light", "dark"])
    })
  ]),
  share: Object.freeze({
    labelKey: "more.shareSite"
  }),
  copyright: Object.freeze({
    key: "footer.copyright"
  }),
  routeNotes: Object.freeze({
    store: Object.freeze({
      key: "more.commerceNote",
      placement: "beforeCopyright"
    })
  })
});
