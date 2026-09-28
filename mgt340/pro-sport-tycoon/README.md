# Pro Sport Tycoon — classroom edition, 28 September 2026

Canonical student URL: https://jflevine.github.io/SportManagementSim/mgt340/pro-sport-tycoon/

## Classroom flow

- Individual or pair, one device. Both partners are named on the report.
- One shared starting situation: Growth-Market Challenger; seed MGT340; three annual cycles.
- Cycle 1: non-game events, fan service, or preserve cash.
- Cycle 2: premium club, video boards, or preserve cash. Venue funding is club cash or 50% borrowing.
- Cycle 3: star player, veteran depth, or preserve cash.
- One choice and one sentence explaining benefit/risk per cycle. Optional ROI explanation on venue proposals.
- Read recorded results: cash, win rate, fan confidence; causal story; simplified income and cash reconciliation.
- Write a final reflection and download/copy the Board Report. There is no automatic submission, student backend, or numeric winning score.
- Target 15–20 minutes plus demonstration and debrief. This is a facilitation target, not a measured student completion time.

## Teaching connections

Revenue is distinct from profit; profit is distinct from cash. Borrowing changes liquidity and obligations, not operating project ROI. Commitments persist. Forecasts are uncertain. Fan approval and financial health may diverge. The final optional Day 2 comparison reduces shared league revenue by 20%, holding all else fixed; it never changes the saved game.

Financial summaries are instructional, not GAAP statements. No taxes, depreciation, working-capital timing, or terminal values are modeled. Upfront program costs are treated as investment cash outflows. The financial-position summary is deliberately not labeled a balance sheet. Annual capital-project ROI is incremental operating net divided by upfront investment, before financing. Player proposals show direct net, not a misleading comparison with capital ROI.

## Graphics and access

Original SVG stadium and CSS crowd animations; supporter reaction derives from the saved change in fan confidence, with the underlying causes explained. Replaying a reaction never reruns the financial model. Animation lasts a few seconds and never blocks navigation. Reduced-motion preferences disable animation. No paid service, account, tracking or external application is needed. Web fonts have system fallbacks.

Progress and drafts save locally in the same browser if storage is available. Students sharing a device should download their report before Start over. Names and reports are not sent to a server. The game warns if browser storage is unavailable.

## Implementation

`index.html` loads `classroom.js`, `classroom-model.js`, `classroom-visuals.js`, and `classroom.css`; the tested financial engine is `model.js`. Earlier `app.js`, replay and styling sources are retained for historical reference but are not loaded by the student page. PRs #12 and #14 are superseded by this consolidated classroom experience; do not merge the old interfaces over it.

Run `node --test mgt340/pro-sport-tycoon/tests/*.test.mjs` from the repository root. No build step. Only this activity's files are modified.
