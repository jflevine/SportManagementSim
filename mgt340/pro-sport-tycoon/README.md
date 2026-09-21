# Pro Sport Tycoon — Front Office, Open Books

MGT 340 Week 4: **How Does the Money Work?** A fictional sport-finance simulation for undergraduate pods of 4–6. Revised September 2026 in the existing static application, not a separate prototype.

## Classroom launch

Use **Class mode: 3 seasons** for the lecture's 25-minute activity. Full mode has 5 seasons for a longer session or follow-up. These are design targets, not student-pilot timing results.

1. Assign CFO, competitive strategy, commercial, fan/brand, facilities and chair roles. With four people, combine CFO + facilities and commercial + fan.
2. For comparable pods, use common seed `MGT340`, the same market, mandate and policy. The default is Growth-Market Challenger / Growth Story / National sharing only.
3. Respond to a board dilemma and choose ticket yield. Compare up to two new proposals, or deliberately hold.
4. Inspect the CFO workbook, downside/base/upside forecast and conflicting executive advice. Capital proposals can combine internal cash, debt, new outside equity and public participation.
5. Record the decision, rejected alternative and knowingly accepted risk **before** the season is revealed.
6. Read the financial close. Reconcile operating result, simplified net income, cash, debt and next-season constraints.
7. After the final season, download the Board Report. Judge the decision using what was known beforehand, not only the outcome.

Suggested 25-minute use: 3 minutes to organize and inspect; about 6 minutes per season; final 4 minutes to open the report and prepare the debrief. Keep the separate lecture debrief. If a pod is behind, have it deliberately hold new proposals rather than skip financial explanation.

All game state is held in the current browser tab. Refreshing or closing the page discards it. There is no account, server storage, analytics or multiplayer synchronization. Each pod uses one device.

## What changed

- Shared editorial visual system with the Week 4 deck: warm paper, condensed typography, ticket/board-paper motifs and consistent money colors.
- Four multidimensional board dilemmas, ticket pricing, fourteen proposals and persistent contracts, assets and debt.
- Explicit debt / equity / public / internal-cash capital stack. Public conditions limit ticket yield; equity dilutes original ownership; debt creates scheduled principal and interest.
- P&L, cash bridge and simplified balance sheet, followed by five causal explanations and a forecast-versus-realized proposal ledger.
- Visible next-season debt register and a league ledger exposing benchmark opponents' resources, payroll, taxes, cash and performance.
- Distinct policies: sharing changes resources, a cap restricts commitments, a floor imposes minimum cost, a tax raises marginal payroll cost, and a draft changes talent access. Commissioner’s Room supplies the broader discussion, including scheduling.
- Rival financial resilience and competitive dispersion affect next-season shared media value, not a fixed “fairness bonus.”
- Emergency liquidity, unpaid obligations and restricted capital spending preserve a recovery path without erasing losses.
- A multi-dimensional Board Report replaces one overall score. Rationale survives decision revision; new-game confirmation protects an unfinished run.

## Model boundaries

All amounts are **fictional $ millions**, unless stated otherwise. This is not a real-club forecast, valuation service, CBA or complete accounting system.

- Operating result = revenue − operating expenses, including simplified depreciation. Simplified net income = operating result − interest. No income taxes or working-capital accruals; league payroll tax applies when selected.
- Ending cash = beginning cash + net income + depreciation − capex + new debt + new equity + public capital − principal + emergency debt + newly unpaid obligations − prior arrears paid.
- Cash + capital assets = debt + unpaid obligations + book equity. Illustrative franchise valuation is separate, never substituted for book assets.
- Capital spending includes cash-funded overruns and is depreciated over simplified useful lives. Delayed openings postpone operating benefits and depreciation, not debt service. Player signing/program launch costs are expensed.
- New capital-project loans amortize over 10 years at 5.8%, rising by 2 percentage points in distress. Existing loans keep their terms. Emergency liquidity costs 9.5% over three years, beginning repayment the following season.
- Capital sources sum to 100%. Per-project limits: 70% debt, 50% outside equity, 20% public; internal cash supplies the rest. Cumulative new equity is limited to $65M. Public support reduces project revenue by 8% and imposes a 105% ticket-yield ceiling while the asset remains active.
- Ownership dilution uses simplified book equity, not negotiated market value. Public support is a capital contribution, not automatically ownership. Real grant accounting varies.
- Direct ROI is annual gross benefit less recurring cost divided by capex, or first-year upfront plus recurring commitment for non-capital proposals. It excludes indirect wins/brand effects and is not a lifetime return.
- Project cash yield uses internal cash **plus outside equity** in the denominator. It is not the original owner's personal return or a promised distribution.
- **DSCR is an applied extension**, not required Chapter 4 vocabulary. It compares project annual operating cash contribution with scheduled project debt service, not club-wide debt service.
- Three benchmark rivals make league feedback visible. Health combines cash resilience (55%) and competitive dispersion (45%), smoothed halfway from the preceding season. This is an instructional assumption, not an empirical estimate.
- Default uses generic unpaid obligations rather than creditor-specific ledgers, legal proceedings or full bankruptcy accounting. It is not debt forgiveness.

Common seeds stabilize season events and proposal-specific draws independently of selection order. Different choices create different exposure and can change later eligible opportunities. Forecast ranges are scenarios, not guaranteed bounds.

## Files and local use

`index.html`, `styles.css`, `app.js`, and `model.js` are the application. No build step. Serve over HTTP; browser ES modules do not reliably run from a double-clicked `file://` page.

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/mgt340/pro-sport-tycoon/`.

Run deterministic regression and strategy tests:

```sh
node mgt340/pro-sport-tycoon/model.test.mjs
```

`TESTING.md` records verification and limits. `DESIGN_CONSTITUTION.md` and `MULTI_AGENT_ORCHESTRATION.md` remain preserved development history; the current Week 4 master prompt and implementation govern where older directions conflict.

## Publishing

Review the scoped pull request before merging. The public classroom URL does **not** use revised branch code until the site's configured deployment publishes it. After deployment, verify the title **Front Office, Open Books**, complete one Class-mode run, download its report, and check the classroom device/projector. Retain the prior commit for a normal revert if a regression appears.

## Debrief

Which stream carried the club? What spending created value? When did profit and cash diverge? What did debt enable and later restrict? Which forecast missed most? How did policy and rival health alter future options? Compare mandates and tradeoffs, not one winner.
