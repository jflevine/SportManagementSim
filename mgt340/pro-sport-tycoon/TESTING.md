# Verification record — September 20, 2026

## Automated model tests

Run `node mgt340/pro-sport-tycoon/model.test.mjs` from the repository root.

Thirteen test groups pass, including **2,160 complete strategy games and 9,092 checked financial closes**. Each checked close reconciles revenue, operating expenses, operating result, net income, cash, debt rollforward, capital assets, book equity and the accounting equation.

Coverage includes all 3 markets, 6 league policies, both lengths, all 14 proposals, all 12 board responses, all 8 macro events, construction delay/overrun, injury, four capital funding mixes, public covenants, equity limits, malformed funding, duplicate/unavailable/tampered proposals, same-seed repeatability, selection-order invariance, default and recovery. With uncertainty disabled, forecast and realized engines agree through five seasons. Input state is not mutated.

The sweep combines 3 markets × 6 policies × 2 lengths × 10 seeds × 6 scripted strategies. This is finite coverage, **not every possible decision sequence**.

| Strategy | Mean ending cash ($M) | Mean cumulative net income ($M) | Mean win rate | Mean facility | Mean fan trust |
|---|---:|---:|---:|---:|---:|
| Hold | 382.84 | 245.68 | 49.0% | 49.37 | 56.06 |
| Commercial first | 372.57 | 313.03 | 49.9% | 71.77 | 68.49 |
| Roster first | 274.01 | 152.91 | 57.9% | 63.62 | 63.19 |
| Assets first | 350.04 | 335.22 | 50.7% | 80.57 | 77.36 |
| Debt-funded investment | 306.50 | 207.21 | 54.8% | 80.82 | 80.76 |
| One balanced proposal | 338.00 | 310.92 | 50.3% | 77.78 | 69.98 |

Means pool both lengths and all conditions. They are regression diagnostics, not forecasts or student rankings. No tested strategy led every mean outcome. This **does not prove** absence of exploits or dominant strategies beyond the sample.

## Browser verification

A complete three-season Growth-Market / Growth Story / MGT340 / National-sharing run reached the Board Report. It exercised a debt/equity/public-funded video-board project, a cash-funded sales proposal, a two-year roster commitment and a lasting facility repair. Observed events included a construction overrun, consumer slowdown, corporate expansion and operating-cost inflation.

Confirmed: funding totals reject more than 100%; public support enforces the ticket-price ceiling; rationale/risk are required; workbook/scenario/advice render; active commitments carry forward; debt and rival registers expand; closes and final totals appear; Field Guide opens/closes. The downloaded text report matched the final screen and included all three rationales. Desktop financial screens were visually reviewed.

Reset testing exposed a native browser-confirmation interruption. The application now uses an accessible in-page confirmation instead. Final regression/responsive findings are recorded in the delivery QA report; do not infer full browser coverage from model tests.

## Limits

- No real-league calibration, student usability pilot, accessibility certification or 25-minute classroom timing study.
- Local verification does not establish deployment to the public site; a post-deployment smoke test remains necessary.
- No backend or persistence exists. Refresh discards the run; download the completed report first.
- Actual accounting, CBAs, ownership valuation and legal default/bankruptcy are more complex than the disclosed classroom model.
