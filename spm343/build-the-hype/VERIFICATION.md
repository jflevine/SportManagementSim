# Verification — Build the Hype

## Automated checks

- `node --check model.js` and `node --check app.js`: passed.
- `NODE_PATH=/tmp/kc2-test-deps/node_modules node --test tests/*.test.cjs`: 16 tests passed.
- Exhaustive deterministic-model checks: all **1,080** feasible purpose × format × feature-set × response combinations, including zero features.
- Budget never negative; at most three features; invalid IDs, duplicates, over-budget selections, repeated toggles, and malformed saves handled.
- Core format mismatch remains visible and cannot be erased by buying extras.
- Same plan and response return the same recap; no randomness or timing-dependent outcomes.
- DOM tests cover solo/pair paths, all phases, back/forward, editing earlier choices, refresh restoration, replay, reset/cancel, corrupted or blocked storage, input escaping and lengths, download success/failure, print invocation, and report content.
- Native buttons/labels, focus restoration, pressed state, live announcement, skip link, reduced-motion CSS, mobile breakpoints, and print CSS are present.

## Boundaries

DOM tests use JSDOM, with explicit doubles for dialog, download, print and scrolling APIs. They are not a native-browser or physical-device test. A local Chromium launch was attempted but the authoring shell denied its required socket. The cloud browser disallows local/data URL previews. Browser verification therefore follows the authorized public deployment.

No production student data or account was used. This activity contains no identity, grade, backend, or app-originated network request. Source assets are local SVGs; development tools are not loaded by the student page.

## Live verification

Pending authorized GitHub Pages publication and browser checks. Do not treat this pre-publication entry as a live-site pass.
