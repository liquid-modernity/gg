# TASK 001 — Material Symbols subset registry

## Context

Material Symbols are allowed and intentionally retained. The problem is not Material Symbols themselves. The problem is unbounded/full font loading, especially route surfaces that only need a few icons.

## Goal

Create one route-aware Material Symbols registry and generate efficient Google Fonts URLs with `icon_names` for each surface.

```text
Allowed: Material Symbols
Forbidden: full Material Symbols font load without icon_names
Forbidden: one giant icon list for every route if route-specific subset is possible
```

## Files to inspect

```text
store.html
landing.html
template/index.xml
template/partials/*.xml
templates/*.tpl
scripts/build*.js
scripts/build*.mjs
tools/template-pack.mjs
src/**/*
```

Adjust paths to actual repo layout.

## Required changes

### 1. Add icon config

Create:

```text
config/icons.config.json
schema/icons.schema.json
```

Example `config/icons.config.json`:

```json
{
  "family": "Material Symbols Outlined",
  "display": "block",
  "strategy": "route-subset",
  "surfaces": {
    "blog": [
      "article",
      "calendar_add_on",
      "chevron_right",
      "comment",
      "explore",
      "home",
      "home_app_logo",
      "keyboard_arrow_down",
      "keyboard_arrow_up",
      "menu",
      "newsmode",
      "search"
    ],
    "landing": [
      "article",
      "home",
      "home_app_logo",
      "storefront"
    ],
    "store": [
      "article",
      "bookmark",
      "bookmark_add",
      "bookmark_remove",
      "chat",
      "chevron_right",
      "content_copy",
      "home",
      "home_app_logo",
      "menu",
      "search",
      "shoppingmode",
      "storefront"
    ],
    "dashboard": [
      "cloud_upload",
      "code",
      "deployed_code",
      "edit",
      "history",
      "publish",
      "sync",
      "terminal"
    ]
  }
}
```

Schema requirements:

```text
- family: string
- display: enum ["block", "swap", "optional"]
- strategy: enum ["route-subset"]
- surfaces: object of arrays
- icon names: lowercase Material Symbols ligature names
- no duplicate icon names after normalization
```

### 2. Generate URL from config

Add helper in build scripts:

```js
function buildMaterialSymbolsUrl(iconNames, { xmlSafe = false } = {}) {
  const names = [...new Set(iconNames)]
    .filter(Boolean)
    .map(String)
    .sort()
    .join(",");

  const url = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=${encodeURIComponent(names)}&display=block`;
  return xmlSafe ? url.replace(/&/g, "&amp;") : url;
}
```

Rules:

```text
- Sort icon_names alphabetically.
- Deduplicate icon_names.
- Use XML-safe URL in Blogger XML.
- Use normal URL in HTML assets.
- Do not include variable axis ranges unless a future task proves a need.
```

### 3. Replace hardcoded Material Symbols URLs

Remove or replace URLs like:

```html
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block
```

Use generated subset URLs instead.

### 4. Landing-specific rule

The user wants Material Symbols retained.

Therefore:

```text
/landing may use Material Symbols only as subset.
/landing must never load full unbounded Material Symbols.
If possible, load landing Material Symbols in a non-critical way.
If loaded in head, it must still include route-specific icon_names.
```

Do not replace Material Symbols with SVG in this task.

### 5. QA guard

Add script/check, for example:

```bash
if grep -R "Material+Symbols+Outlined" . \
  | grep -v "icon_names" \
  | grep -v "node_modules"; then
  echo "FAIL: Material Symbols URL without icon_names"
  exit 1
fi
```

Better: implement as Node script to avoid false positives in documentation.

Also check generated HTML/XML:

```text
- dist/index.xml
- dist/landing.html
- dist/store.html
- .cloudflare-build/public/**
```

## Non-goals

- Do not change icon visual design.
- Do not remove Material Symbols.
- Do not split CSS/JS in this task.
- Do not touch Blogger comments.
- Do not change cache/robots policy.

## Acceptance criteria

```text
- No production/generated public file has Material Symbols URL without icon_names.
- icon_names are sorted and deduplicated.
- Blogger XML uses &amp; for URL parameters.
- Landing, Store, Blog, and Dashboard can each have different icon subsets.
- Existing icon rendering still works.
- No accessibility regression.
```

## Suggested commit

```text
feat(perf): add route-aware Material Symbols subset registry
```
