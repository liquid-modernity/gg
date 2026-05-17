export const GG_MORE_SHEET = Object.freeze({
  profile: Object.freeze({
    nameKey: "more.profile.name",
    metaKey: "more.profile.meta",
    href: "/p/about.html"
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "navigation",
      titleKey: "more.section.navigation",
      layout: "list",
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
      id: "preferences",
      titleKey: "more.section.preferences",
      layout: "rows",
      items: Object.freeze(["language", "appearance", "reading", "motion"])
    })
  ]),
  localSearch: Object.freeze({
    labelKey: "more.localSearch.label",
    placeholderKey: "more.localSearch.placeholder"
  }),
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
