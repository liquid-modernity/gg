# Production Deploy Sequence Diagram

This PlantUML diagram models the production flow only:

1. GG Console configures profile and CMS sources.
2. Blogger API v3 is used to inspect/select root and store CMS sources.
3. Doctor/checks validate contracts.
4. Build creates artifacts from source.
5. Production optimizer minifies/compresses where safe and keeps source maps private by default.
6. Release packager creates the buyer/deploy artifact.
7. Cloudflare and Blogger serve the final production surfaces.

It intentionally does not describe the internal AI/dev workflow.
