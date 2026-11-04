# The Offer

A self-contained browser pod game for MGT 340: Introduction to Sport Management, Week 10 (youth and high school sport). A fictional nonprofit Philadelphia youth soccer club receives an offer from a fictional platform backed by a private-equity fund. Pods negotiate the terms, live through a Year 3 shock, and defend the tradeoff in a four-sentence board statement. It applies the week's current-issues material: pay-to-play, private capital in youth sport, and the question of who governs a youth sport market that sits outside school-sport structures.

- Student URL: https://jflevine.github.io/SportManagementSim/mgt340/the-offer/
- Instructor view: https://jflevine.github.io/SportManagementSim/mgt340/the-offer/?guide=1
- Target: 12 minutes, pods of 4–6, one device per pod
- Ungraded, no accounts, no student names, no backend or automatic submission
- Fictional scenario. Simplified model, not a forecast. Riverwards United SC and Keystone Play Holdings are invented.

## Classroom route

1. **0–2 minutes:** brief and roles. Riverwards United SC has 900 players ages 6–14, a $310 average fee, 22% of players on waivers, an all-volunteer board, two worn unlit city fields, and a 140-kid waitlist. Assign the Board chair (runs the device), Treasurer (capital), Family advocate (access), and Skeptic ("Who holds the owner accountable?").
2. **2–7:** decide. Choose a structure (full sale, facility partnership, or decline) and three terms (fees and access, video and data, governance) while a live meter shows the capital on the table and whether it clears the facility line.
3. **7–9:** Year 3 shock, then the Year 5 dashboard. For a sale or partnership, the fund sells its portfolio and the new owner raises prices 25%. For a decline, a city budget delay closes the fields for half the spring.
4. **9–12:** write the board statement ("We chose ___ because ___. The cost of our choice is ___. The owner is held accountable by ___."). Two pods report out for 30 seconds each; project one pod's **Compare all three structures** table.

The guide (`?guide=1`) carries the route, debrief questions, misconceptions to correct, and the full model. Students never need it. No real-time countdown is used.

## Model

All figures are classroom assumptions, chosen to make the tradeoffs visible. They do not describe any real club, company, fund, or deal.

**Capital** = opening number × T1 multiplier + T2 adjustment + T3 adjustment. Declining ignores the terms (shown disabled with a one-line explanation).

| Choice | Capital effect | Facility |
|---|---|---|
| S1 Full sale | $6.0M opening | Full dome at ≥ $4.5M, otherwise seasonal air-bubble |
| S2 Facility partnership (10-year lease) | $4.0M opening | Full prime-time hours at ≥ $3.0M, otherwise reduced hours |
| S3 Decline (city grant + local sponsor) | $0.8M; terms do not apply | Lit, refurbished city fields |
| T1 fees: (a) market · (b) 3% cap for 5 years · (c) cap + 20% scholarships | ×1.00 · ×0.85 · ×0.70 | |
| T2 data: (a) Keystone exclusive, no family full-game posting · (b) Keystone streams, families record · (c) club controls | +$0.5M · $0 · −$0.3M | |
| T3 governance: (a) none · (b) advisory council, non-binding · (c) binding seat + buy-back if the fee cap is broken | $0 · $0 · −$0.5M | |

Capital ranges from $3.4M to $6.5M for a sale and $2.0M to $4.5M for a partnership, so heavy protection can drop a pod below the facility line.

**Year 5 results** (after the Year 3 shock):

| Indicator | S1 Full sale | S2 Partnership | S3 Decline |
|---|---|---|---|
| Fee, market pricing | $640 planned; $800 after resale | $430 planned; $538 after resale | $340 |
| Fee, T1b or T1c | $359 (310 × 1.03⁵); cap holds through Year 5, then expires | same | — |
| Players | 1,400 (bubble: 1,200) | 1,250 (reduced: 1,100) | 950 (880 in the Year 3 spring) |
| Low-income share | 9%; 5% after resale without a cap; T1b 15%; T1c 22% | 15%; 11% after resale without a cap; T1b 21%; T1c 22% | 21% |
| Video and data | From T2 (T2a: illustrative "$14.99 per game to watch; no full-game posting") | From T2 | Club controls |
| Accountability | Low; T3b Low–Medium; T3c Medium | Medium; T3c High | High |

- Without a fee cap, the resale raises the fee a further 25% and drops the low-income share 4 points. With a cap, the cap holds, and a warning says it expires after Year 5.
- With a cap and T3c, the new owner's price plan breaks the cap and the board chooses whether to trigger its buy-back right. The note on cost says the volunteer board must raise or borrow the purchase price. The choice is recorded in the results and statement; it does not change the six indicators.
- With T3c but market pricing, there is no cap to break, so the buy-back never fires. The shock card and the results say so. This is a deliberate debrief point: protections work together.
- The dashboard shows each indicator with today's value, a word label (not color alone), and a note. A capital strip shows what the pod's terms cost against Keystone's opening number, or what declining gave up.

## Why no score?

More protection means less capital, and less capital means a smaller facility. A full sale with market pricing serves the most players and the smallest share of low-income families; declining keeps control and depends on a city budget. Pods must name the cost of their choice rather than optimize a number.

## Access, privacy, and fallback

- Native radio buttons in labeled fieldsets; keyboard and touch operation; visible focus and selected states; live region for the capital total; focus moves to each screen's heading.
- Times New Roman throughout; navy, cream, and gold palette; large type for projector distance; responsive down to phone width with a fixed capital bar while deciding. Reduced-motion preference disables the meter and shock-card animation.
- No external libraries, fonts, images, APIs, tracking, cookies, or browser storage. Choices and the statement live only in tab memory; refreshing starts over. Start over asks before clearing.
- The statement can be copied, downloaded as plain text (with the term sheet and Year 5 results), or printed. Nothing is submitted.
- Paper fallback: read the brief, project the guide's model table, and have pods write the statement on paper.

## Local use and tests

Open `index.html` directly or serve this directory with `python3 -m http.server 8000`. No build or package installation is needed.

Run `node tests.mjs` (Node 18 or newer, no packages). The suite extracts the embedded model from `index.html` and checks all 81 structure/term combinations (162 with the buy-back choice): capital math and ranges, facility thresholds, fees, players, and low-income shares within the stated values, the $359 cap, the resale effects, S3 ignoring every term, accountability levels, buy-back availability, the comparison table, rejection of incomplete sheets, frozen and deterministic outputs, and the absence of NaN. It also parses both scripts, asserts no network calls, remote assets, or storage, and checks that the fictional-scenario notice and required controls are present.

Browser smoke tests (Playwright, Chromium at 1366×768 and 390×844) covered a full sale run with the buy-back, a declined run by keyboard, a partnership run with an unusable buy-back, compare toggles, copy, download, restart, and the guide, with no console errors, no network requests, and no horizontal page overflow.
