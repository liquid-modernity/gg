# Local Workflow (release-safe)

One-time setup:
- `npm run install:hooks`

Every change:
1. `npm run prep:release`
2. Commit generated artifacts
3. Push

Notes:
- `prep:release` requires a clean tree.
- The pre-push hook runs `npm run verify:release` and will block misaligned releases.
