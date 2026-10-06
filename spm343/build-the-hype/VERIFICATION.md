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

Completed on 2026-10-06 in the cloud Chromium browser.

- Public route: https://jflevine.github.io/SportManagementSim/spm343/build-the-hype/
- PR #27 was reviewed as a draft, readied, and merged with explicit publication approval. Initial deployed commit: `10eadb53b7e630164502c7d96dade9c299e4a852`.
- Poster aspect scaling and responsive grid containment were refined in `017fb0411cb7a70085fb916c8249bdda167766fc`. Versioned asset URLs were added in `b43dca1ddaffad1c1f2820b79610311aabb69c8a` so existing classroom clients receive the update. Pages deployment for that build succeeded (Actions run `37399382888`).
- Played a paired spectator/knockout event with creator, stream, and predictions; a solo community/rotation event with free-play and coaching; and a phone-width competition/group-play event with coaching and spotlight. Together these exercised all three missions, formats, and contingency responses.
- Verified the ten-credit guard and third-feature limit, keyboard Enter activation, native refresh restoration, browser Back/Forward, reset confirmation/cancel, and remix retaining the plan while clearing the response.
- Verified the real browser download of the HTML recap. The downloaded file rendered as exactly one US-letter page using its print stylesheet. Browser-native PDF save and physical printer output were not exercised.
- Checked phone (390px frame), tablet (768px frame), and desktop layouts in Chromium. Body scroll width equaled client width at phone and tablet sizes; the desktop page had no horizontal overflow. These are responsive browser-layout tests, not physical-device, Safari, or screen-reader certification.
- Confirmed final versioned poster artwork loaded and preserved its aspect ratio. Captured the complete live feature-selection page.
- No application-origin console errors were observed. The browser environment emitted unrelated extension-metadata errors, which were excluded from the application result.

The development-only `tests/responsive.html` route offers fixed-width frames for repeatable responsive inspection. It loads the actual activity and shares its local save; it is not an instructor dashboard or a student-data collection page.
