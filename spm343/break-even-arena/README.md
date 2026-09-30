# Esports Industry Tycoon: Break-Even Arena

SPM 343 · La Salle University · Jeffrey Levine, J.D., Ph.D.

A self-contained, local-first tournament-finance activity. This folder does not alter or depend on the other course games.

## Entry points

- Student activity: `./`
- Instructor demo: `?demo=1` (separate browser-save slot; starts as Instructor preview)
- Instructor guide: `?guide=1` (timing, read-aloud introduction, model matrix, teaching notes, and collection instructions)

Host this folder as static files. No build step, backend, external font, image service, analytics, account, room code, or opening/unlocking process is required. For local development: `python3 -m http.server 8000` from this folder, then open the served index.

## Learning loop

1. Choose an event package and entry fee.
2. Enter a whole-player break-even estimate and a short justification.
3. Run a brief animated event; compare budget with actual results.
4. Change exactly one decision: package OR fee. Compare under the same conditions.
5. Write two short explanations and copy, save, or print the Canvas summary.

Suggested facilitated timing: 3 minutes introduction, 8 planning, 4 event/review, 6 revision, 9 explanations/debrief. There are no artificial countdown locks. Individual exploratory play can be much shorter.

## Source and model boundaries

Campus Classic reproduces the chapter's cost baseline: Gil Fried, "Esports Finance and Economics," Chapter 11 of Esports Business Management, Tables 11.2–11.3, printed pp. 197–198. Fixed costs are $4,000. Variable costs are $10 per paying entrant ($5 licensing and $5 food). At a $50 entry fee, contribution margin is $40 and break-even is 100 entrants.

Community Cup and Spotlight Showcase costs, every attendance forecast, the 240-entrant maximum, and the common turnout shortfall are invented teaching assumptions. They are identified as such in the activity. Actual turnout is two-thirds of each forecast, with no randomized financial outcomes. The revision uses the same observed condition; it is a counterfactual, not a second season or a horizontal comparison across periods.

The simplified event operating result excludes spectator revenue, sponsorship income, refunds, tax, depreciation, financing, and persistent debt. It is not a complete corporate income statement. The mismatched EA/Activision numerical examples and speaker notes in the uploaded lecture deck are not used.

## Work and privacy

Names, choices, and written work stay in this browser's localStorage. The app sends no student data or scores to a server and has no central instructor dashboard. Students must submit the exported text through Canvas. The local run reference is not a verified identity, secure receipt, or academic score. This is an applied learning activity, not a tamper-proof examination.

Refreshing restores work when browser storage is available. A blocked-storage session remains usable but must stay open until the summary is exported. New run confirms before replacing this activity's current save slot. Instructor demo uses a separate save slot. Reduced-motion and skip-animation options are included.

## Validation of v1.0.0

- All nine starting combinations independently checked for fixed-cost totals, contribution margin, rounded-up break-even, revenue/expense reconciliation, and variance identities.
- 36 complete Chromium browser playthroughs: each of nine starting plans with all four permitted one-decision revisions. Includes improvement, deterioration, losses, exact break-even, and profits.
- Four additional complete responsive runs at 390, 768, 1366, and 1920 CSS pixels with no page-level horizontal overflow.
- Tested input validation and escaping, keyboard radio controls, standard/reduced animation, interrupted-run restoration, corrupted save recovery, demo isolation, blocked native storage, full text export, clipboard success/fallback branches, and print rendering.
- No JavaScript page errors or app-originated network requests during the suite.

Testing limitation: Chromium network navigation was restricted in the authoring environment. The exact HTML/CSS/JavaScript build was loaded into a browser test document. Save/restore success used an explicit in-memory Storage test double; native storage failure was tested separately. Query-route tests changed only the URLSearchParams input. These tests do not claim an interactive live-site browser run or a physical-device/Safari test. The three uploaded runtime files were verified byte-for-byte against the tested build using Git blob hashes. Public deployment is checked separately after merge.
