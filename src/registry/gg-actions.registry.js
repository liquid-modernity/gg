export const GG_ACTIONS = Object.freeze({
  scrollTop: Object.freeze({ id: "scrollTop", kind: "scroll" }),
  scrollToContact: Object.freeze({ id: "scrollToContact", kind: "scroll" }),
  navigateHome: Object.freeze({ id: "navigateHome", kind: "navigate", route: "home" }),
  navigateBlog: Object.freeze({ id: "navigateBlog", kind: "navigate", route: "blog" }),
  navigateStore: Object.freeze({ id: "navigateStore", kind: "navigate", route: "store" }),
  navigateContact: Object.freeze({ id: "navigateContact", kind: "navigate", route: "contact" }),
  openContact: Object.freeze({ id: "openContact", kind: "panel", panel: "contact" }),
  openMore: Object.freeze({ id: "openMore", kind: "panel", panel: "more" }),
  openGlobalDiscovery: Object.freeze({ id: "openGlobalDiscovery", kind: "panel", panel: "globalDiscovery" }),
  openStoreDiscovery: Object.freeze({ id: "openStoreDiscovery", kind: "panel", panel: "storeDiscovery" }),
  openSitemap: Object.freeze({ id: "openSitemap", kind: "navigate", route: "sitemap" }),
  openRss: Object.freeze({ id: "openRss", kind: "navigate", route: "rss" })
});

export const GG_ACTION_IDS = Object.freeze(Object.keys(GG_ACTIONS));

export function resolveActionId(actionId) {
  if (!Object.prototype.hasOwnProperty.call(GG_ACTIONS, actionId)) {
    throw new Error(`Unknown GG action: ${actionId}`);
  }
  return GG_ACTIONS[actionId];
}
