# PRO SPORT TYCOON — MGT 340 Week 4 (VNext)

A browser-based sport finance / sport management simulation aligned to Chapter 4, *Financial and Economic Principles Applied to Sport Management*.

## Design north star

**You cannot maximize everything at once.**

Students serve as the franchise President / Managing Partner. They receive a board mandate, review competing player / capital / commercial proposals, inspect decision-support documents, hear conflicting advice from executives, commit scarce resources, record their rationale **before** uncertainty resolves, and then compare forecast vs. actual results.

Core loop:

**Read → Compare → Choose → Fund → Explain → Reveal**

## What changed from the prior version

- Replaced broad roster / marketing / fan-experience sliders with specific investment proposals.
- Added player contracts as persistent human-capital investments.
- Added persistent capital assets with recurring revenue / cost effects.
- Added persistent debt tranches and annual principal / interest consequences.
- Added board mandates so the same strategy is not optimal in every run.
- Added a front-office Decision Center with:
  - CFO Workbook
  - Executive Team advice
  - Scenario Model
  - proposal description
- Added forecast ranges (downside / base / upside) and confidence levels.
- Added portfolio selection: students can fund one or two proposals per cycle and choose cash vs. debt for eligible capital projects.
- Added mandatory Board Rationale before the result is known.
- Added actual-vs-forecast review so decision quality can be separated from outcome quality.
- Added Class Mode (3 cycles, ~20–25 minutes) and Full Mode (5 cycles).

## Primary learning goals

Students should be able to:

1. follow major revenue and expense flows;
2. distinguish operating profit from cash;
3. allocate scarce resources;
4. evaluate capital assets and player contracts;
5. compare debt vs. cash/equity financing;
6. interpret ROI as a forecast built on assumptions;
7. understand persistent contractual obligations;
8. see how competitive performance, fan demand, revenue, and financial flexibility interact;
9. explain why a defensible decision can still produce a poor outcome under uncertainty.

## Classroom use

For pod comparisons, use the same seed across the room. The opportunity pipeline and uncertainty will be comparable while strategies may differ.

Recommended debrief:

- Which proposal looked strongest before the outcome?
- Which expert did your pod trust most? Why?
- When did operating profit and cash tell different stories?
- What decision from an earlier cycle constrained a later choice?
- Did your worst outcome come from a bad decision or bad luck?

## Technical notes

Static HTML / CSS / JavaScript modules; no build step or backend required.

The economics are fictional and intentionally simplified for instruction. They are not a forecast, CBA model, accounting system, or representation of a specific professional league or club.
## Classroom refinement — September 23, 2026

Use Class Mode, Growth-Market Challenger and seed `MGT340` for the first run. Assign The Turnaround or The Contender to each pod. Compare numerical scores only within the same market and mandate. Allow 2 minutes setup, 7 minutes Cycle 1, 6 each for Cycles 2 and 3, and 4 minutes Board Review. Debrief afterward.

- Choose zero, one or two investments. Holding cash requires a rationale too.
- Cash uses existing club funds; the model does not issue equity or dilute shares.
- Debt pays equal principal each year plus interest on the remaining balance. Project forecasts and cash close use the same schedule. The debt can outlast an investment's modeled operating term.
- Operating profit excludes interest. Ending cash subtracts interest, upfront cash used and principal payments. Taxes, depreciation and working-capital timing are omitted.
- Base annual net is direct project cash contribution after recurring costs and first-year debt service, excluding wider effects on wins, fans and the club's revenue. The forecast/actual table is this project measure; the external event also affects the club as a whole.
- ROI is before financing. Capital projects use upfront cost as denominator; commercial/player commitments use upfront plus first-year recurring cost. It is a simple teaching comparison, not a full investment valuation.
- The Executive Team shows CFO, one relevant specialist and Board Strategy. All advice uses the selected funding option.
- Same seed produces the same external events and proposal-specific draws, independent of click order. Investments still change outcomes and later opportunity availability.
- Board score describes outcomes; it does not grade rationales. Competitive progress measures improvement from the starting roster, and asset growth includes facility improvement. The Contender puts 50% weight on competitive progress.
- Keep the tab open. There is no save/resume backend; refreshing starts over. Copy Board Report at completion to retain decisions, risks and results.

### Verification

```sh
node --check app.js
node --check model.js
node --test tests/model.test.mjs
# For DOM interaction tests: install jsdom in a disposable directory, then:
JSDOM_PATH=/absolute/path/to/node_modules/jsdom node --test tests/interface.test.mjs
```

No build step is required. Serve this folder using any static HTTP server. DOM tests exercise real handlers and markup but do not verify browser layout. Read `CLASSROOM_REVIEW.md` for results and limitations.
