# OFF SCRIPT — An esports NIL adventure

SPM 370 · La Salle University · Jeffrey Levine, J.D., Ph.D.

A six-decision, choose-your-own-adventure application of Chapter 5: Player Image Rights and Branding. Manage brand partnerships at fictional Signal House. Build the CROSSPLAY creator weekend with Blaze, Nova, a sponsor, a fan artist, and a voice vendor. The promises you make change the situations and available choices later.

## Open the activity

- Student game: `./`
- Instructor demo: `?demo=1` (separate local save)
- Instructor guide: `?guide=1` (read-aloud introduction, timing, source mapping, routes, debrief, and submission guidance)

Four static runtime files: index.html, styles.css, model.js, and app.js. No build, account, room code, unlock, analytics, external font, AI service, or backend. For development, serve this directory with `python3 -m http.server 8000` and open the served index. No secrets or privileged instructor functionality are embedded.

## Classroom use

Suggested 30-minute facilitated block: 3 minutes setup; 16 minutes reading/discussing six decisions; 4 minutes optional replay; 7 minutes explanation/debrief. This is a planning estimate, not a timed lock or measured completion guarantee. Use alone or with one partner. Do not add the entire activity on top of the deck's already full 75-minute teaching route. Consolidate the existing applications or place the game in a separate application block.

Students receive three actions per scene. The interface separates selection from commitment, displays consequences, and preserves a decision trail. At the end, students write two short explanations and copy/download/print a summary for Canvas. Their financial ending is not an academic grade; there is no hidden point score or automatic writing assessment.

## Real branching, manageable scope

The pure model contains 14 conditional scene variants across six story beats, 729 complete choice sequences, and six ending families. It does not claim 729 separately authored novels. Initial sponsorship scope changes the second dilemma. Earlier footage clearance or an artist collaboration changes the non-AI fallback. A voice preview without consent causes Nova to refuse a new license at the final deadline; the extension option is replaced by postponement. Earlier unresolved clearances change repair work and costs.

All reactions, offers, cash flows, and deadlines are invented teaching assumptions. They are deterministic, not probabilities of legal liability. Trust labels describe fictional relationships; they never substitute for consent. The production ledger is partial campaign funding/spending, not net profit or damages. A repair does not erase prior publications, sunk costs, lost trust, or possible third-party copies.

The optional rewind preserves the first ending and written brief. Students choose an earlier decision (default: decision five for a short replay) and play forward on a separate timeline. Later choices may also change. The comparison is not advertised as isolating one variable experimentally.

## Source fidelity

Based on Jeffrey Levine's September 28, 2026 Chapter 5 manuscript and classroom slides, particularly the sample NIL clause; Blaze's sponsor conflict; Nova's identifiable persona and synthetic voice; the fan-art problem; separate identity/copyright permissions; disclosure; and the limits of consent over time. Moth and the linking commercial narrative are new adaptations. No full manuscript is republished.

The game distinguishes identity rights, copyright, contract scope, disclosure, and expression. It does not impose one nationwide publicity test, assume every sold parody is unlawful, infer permission from an AI label, presume union/NCAA coverage, or invent court judgments. Separate AI consent is an express term of the fictional contracts, not a claimed universal rule. Talent are adults. Historical cases, state-by-state elements, postmortem rights, collegiate governance, and current federal legislative status are not directly tested.

The built-in guide links the FTC's Disclosures 101 for Social Media Influencers as primary-source corroboration of the chapter's disclosure guidance. It does not replace the course materials with outside doctrine.

## Privacy and collection

Names, decisions, and explanations stay in this browser's localStorage when available. No work is automatically sent to the instructor or Canvas. Students must submit the exported summary in the assignment. The local run reference is not a verified identity or tamper-proof receipt. The demo and student saves are separate. Shared-device users should export and then start a new story. Blocked-storage users can play but must keep the tab open and export before leaving.

## Validation of v1.0.0

- Exhaustively evaluated all 729 complete model sequences (1,093 nodes), all 14 conditional scene variants, and all six ending families.
- Checked ledger reconciliation, immutable prior states, valid scene transitions, prefix reconstruction, and the unavailability of the refused voice/expansion license.
- Fourteen complete Chromium UI runs in the main route/feature suites, plus a completed alternate timeline; twelve routes distributed across 390, 768, 1366, and 1440 CSS-pixel widths without page-level horizontal overflow.
- Tested radio-keyboard operation, separate commit, dialog/Escape, input trimming/escaping, restore after a committed consequence, preserved first ending during replay, complete report restoration, corrupt saves, demo isolation, native blocked Storage, text export, clipboard branches, and print layout. No JavaScript page errors in these suites.
- Visually reviewed desktop and phone-width captures. No physical-device or Safari claim.

Testing environment limitation: Chromium network navigation is blocked by the authoring environment. UI tests injected the exact HTML/CSS/scripts into an isolated browser document. Successful persistence used an explicitly declared in-memory Storage test double; native blocked Storage was tested separately through a complete run. Demo/guide route tests substituted only the query-string input. Clipboard permissions were represented by explicit success/failure doubles; actual text download was tested. This is not an interactive public-site browser test. GitHub deployment status and public file retrieval are checked separately.

The downloadable source archive includes model/browser test scripts and recorded test results. Run `node qa/model-test.cjs` for model validation. Browser tests require Python Playwright and Chromium; they deliberately use the documented isolated-document harness in this environment.
