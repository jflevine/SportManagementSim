# Pro Sport Tycoon — classroom review

Reviewed September 23, 2026 against the corrected `26-9-23-Day 1.pptx` and `26-9-23-Day 2.pptx`, starting at PR #14 head `4829e64`.

## Changes that matter

- **Fixed the launch blocker.** The original `$('.doc-tab').forEach` throws before the decision screen opens. Reproduced against the original HTML in JSDOM; corrected to select all tabs.
- **One consistent sequence:** Read → Compare → Choose → Fund → Explain → Reveal. The Day 2 simulation slides use the same wording. Three cycles and at most two investments remain.
- **Less reading:** Executive Team now shows CFO, one proposal-specific specialist, and Board Strategy. The separate evidence tabs remain CFO / Scenario / Executive Team. Removed the misleading break-even row rather than adding another financial calculation.
- **Recoverable choices:** Return from rationale to change investments. Zero investments is allowed, with a rationale and risk choice, so conserving cash is a legitimate strategy and a cash shortage does not strand a pod.
- **Clear financing:** Cash means club funds; no equity issuance is modeled. Funding buttons explicitly say that they add the proposal. Advisor calculations use the funding actually selected.
- **Consistent finance:** Forecast and actual debt use equal annual principal plus interest on the remaining balance. Operating profit excludes interest. The result provides the cash reconciliation. Direct ROI is calculated before financing; base annual net subtracts first-year debt payments.
- **Comparable uncertainty:** Proposal realization now uses seed + cycle + proposal ID; click order no longer changes its outcome.
- **More meaningful mandates:** Competitive progress measures improvement from the starting roster. The Contender puts 50% weight on it. Asset growth more visibly reflects facility improvement. Flexibility gives remaining debt more weight, reducing the tendency for the short horizon to make borrowing look free.
- **Honest Board Review:** Shows mandate weights and explains that it scores outcomes, not rationale quality. The copied report now includes each decision, explanation, risk and result.
- **Slides:** Revised Day 2 slides 18–22, retaining the supplied navy/cream/gold design and Times New Roman. Notes include setup, a 25-minute cadence, finance qualifications and debrief connections to both days. Day 1 requires no Tycoon edits.

## What stayed simple

No new tabs, dashboards, capital-stack exercise, operating sliders, accounting statements, grading engine, or extra required student inputs. Market and mandate choice, persistent assets/contracts/debt, pre-outcome reasoning, uncertainty and multidimensional review remain. No attempt to simulate every lecture concept: revenue sharing and market differences are in the model; caps, drafts, ownership dilution and rival leagues remain debrief material.

## Balance evidence

Screened 30 fixed seeds × 3 markets × 3 mandates × 3 single-category strategies × 3 financing choices: 2,430 complete Class Mode runs. These policies choose up to two available projects in a category, ordered by direct annual contribution, subject to cash affordability. This is a diagnostic, not exhaustive optimization or proof that every individual proposal is equally attractive.

Before adjustment, the cash-funded commercial policy beat the player policy under The Contender and narrowly beat capital under The Facility Crossroads. After adjustment, the average scores in the Growth market with cash funding were:

| Mandate | Commercial | Player | Capital |
| --- | ---: | ---: | ---: |
| Turnaround | 82.5 | 77.6 | 81.4 |
| Contender | 66.9 | 86.4 | 70.1 |
| Facility Crossroads | 74.3 | 73.0 | 84.2 |

Capital financing no longer improved every mandate's score in this comparison. For example, Contender averaged 70.1 with cash versus 69.9 with 70% debt; Turnaround averaged 81.4 versus 83.4. Debt still preserves current cash and leaves future obligations. These are fictional teaching outcomes, not investment advice or empirical estimates.

## Verification completed

- JavaScript syntax checks: pass.
- All existing offline repository tests: 5/5 pass (marketing-arena model suite). Its separate authenticated live-service rehearsal was not run; it creates unrelated student/test records and needs credentials.
- New Tycoon regression tests: 13/13 pass.
- Three complete DOM interaction runs, one for each funding level: cash, 50% debt, 70% debt. Verified all cycles, selection/removal, maximum two, all three evidence views, rationale rejection, back navigation, external events, forecast/actual rows, cash explanation, Board Review, copy report, reset/replay, and absence of runtime errors.
- Additional complete hold-cash run: pass.
- Model verifies principal/interest/cash reconciliation, persistence without input mutation, deterministic replay, order-independent proposal outcomes, scenario bounds, bounded scores, and all market/mandate combinations in Class and Full modes.
- All literal ID selectors resolve; no removed Department File UI references remain.
- Static app: no compilation/build step exists. Served locally for execution checks.

## Remaining limits before class

**A real browser playthrough and projector layout check remain incomplete.** The provided cloud browser refused local preview access and explicitly blocked file URLs. No workaround was used. JSDOM exercises markup and handlers; it cannot establish browser rendering, layout, scrolling, clipboard permissions or mobile behavior. CSS changes put the opportunity list before details on narrow screens, but that layout still needs an actual browser check.

**Timing is an instructional target.** No students were observed completing the game. Allow a short demonstration before the 25-minute timer.

**Markets are not equal difficulty levels.** Larger markets retain favorable initial cash and operating economics. Use Growth-Market Challenger for all pods in the first run. Compare scores only within the same market and mandate.

**The short horizon still favors liquidity and quick payoffs.** Capital debt may outlast project operating effects; later financing exposure appears in debt/flexibility but the game does not play out an entire asset life. Do not interpret the final score as a full discounted valuation.

**There is no save/resume backend.** Keep the tab open; refresh restarts. Copy Board Report at the end. Adding persistence would introduce scope beyond the requested refinement.

**The external event is a club-level shock.** The forecast/actual table measures direct project realization; it is not a complete attribution of every club revenue change. Wider wins, brand and event effects appear in the franchise totals.

## First-run facilitation

One device per pod. Class Mode, Growth-Market Challenger, seed MGT340. Assign half the pods Turnaround and half Contender. Set the question: “What should the next dollar do, given what our board wants?”

0–2 minutes setup; 2–9 Cycle 1; 9–15 Cycle 2; 15–21 Cycle 3; 21–25 Board Review and copy report. Debrief afterward using one decision and one result per pod. Good decisions can have bad outcomes; a favorable result is not proof of good judgment.
