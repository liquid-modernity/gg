export function getTemplateElement(id, options = {}) {
  var root = options.root || document;
  if (!id || !root || typeof root.getElementById !== 'function') return null;

  var template = root.getElementById(id);
  if (!template || !template.content) return null;

  return template;
}

export function cloneTemplateElement(id, options = {}) {
  var template = getTemplateElement(id, options);
  if (!template) return null;

  var node = template.content.cloneNode(true).firstElementChild;
  return node || null;
}

(function attachTemplateHydration(global) {
  if (!global) return;

  var GG = global.GG = global.GG || {};
  GG.templateHydration = GG.templateHydration || {};
  GG.templateHydration.getTemplateElement = getTemplateElement;
  GG.templateHydration.cloneTemplateElement = cloneTemplateElement;
})(typeof window !== 'undefined' ? window : globalThis);
