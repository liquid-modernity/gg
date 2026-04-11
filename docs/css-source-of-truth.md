# CSS Source Of Truth

Status: temporary operational bridge, not constitutional law.

CSS_SOT_MODE: temporary-runtime-bridge
CSS_PIPELINE_CLASSIFICATION: absent
CSS_AUTHORING_TRUTH: public/assets/v/<active-release>/main.css
CSS_RUNTIME_MIRROR: public/assets/latest/main.css
CSS_GENERATION_PIPELINE: none

## Current Reality

The repo does not currently contain a real source CSS tree or a CSS build pipeline that feeds `public/assets/.../main.css`.

Until that pipeline exists, manual CSS authoring truth is the active versioned CSS file resolved from `index.prod.xml`, currently `public/assets/v/ac33998/main.css`.

`public/assets/latest/main.css` is not an authoring file. It is a runtime mirror of the active versioned CSS file and must stay byte-identical to it.

## Temporary Debt

This bridge exists because `docs/gg_rules_of_css.md` correctly defines `public/assets/.../main.css` as generated-artifact territory, but the repository has not yet implemented the source tree/build step that would make that true in practice.

Do not claim a CSS split or source pipeline exists until there is a real source tree, a real build command, and verification that generated output matches runtime assets.

## Operator Rule

For CSS work before the source pipeline exists:

1. Treat `public/assets/v/<active-release>/main.css` as the temporary manual authoring truth.
2. Keep `public/assets/latest/main.css` as an exact mirror only.
3. Run `npm run gaga:verify-css-sot` before any CSS split/refactor task.
4. Do not edit `public/assets/latest/main.css` as the source file.
