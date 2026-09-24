# PRO SPORT TYCOON — MGT 340 Week 4 (VNext)

A browser-based sport finance / sport management simulation aligned to Chapter 4, *Financial and Economic Principles Applied to Sport Management*.

## Design north star

**You cannot maximize everything at once.**

Students serve as the franchise President / Managing Partner. They receive a board mandate, review competing player / capital / commercial proposals, inspect decision-support documents, hear conflicting advice from executives, commit scarce resources, record their rationale **before** uncertainty resolves, and then compare forecast vs. actual results.

Core loop:

**Proposal → Evidence → Advice → Decision → Uncertainty → Results → Review**

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
  - Department File
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
## September 2026 decision replay and Day 2 extension

Results now include a short animated replay built entirely from the recorded cycle:
club cash and borrowing, each funded proposal, the club's season, shared league
revenue, and the profit-to-cash reconciliation. The venue highlights selected and
continuing investments; occupied seats reflect recorded attendance. The replay
runs for 12–18 seconds and supports pause, previous/next, skip, replay and a full
text recap. Reduced-motion preferences disable autoplay and motion. Replay does
not rerun chance, change outcomes, or delay access to the results and next cycle.

The optional **Day 2 lens** shows shared revenue as a proportion of club revenue
and lets students inspect a 20% reduction in that cycle's league distribution.
It is a one-cycle sensitivity with all other inputs held fixed, not a forecast of
owner behavior or a new scored game mode. This supports Day 2 slides 2, 7, 9,
12, 14 and 22: joint production, growth costs, resource distribution and the
limits of sharing. There is no added league-policy selection, draft, cap, tax,
NIL system or rival league. Existing three/five-cycle modes remain intact.

Finance reconciliation for the replay:
- Operating profit excludes interest; cash then subtracts interest, cash invested
  and principal repaid. Financing is not revenue.
- Debt forecasts use the same equal-principal schedule as actual debt payments.
- Direct ROI is before financing; direct cash contribution includes first-year
  debt service. Interest falls as the outstanding balance declines.
- Proposal-specific uncertainty is stable across selection order for the same seed.
- The existing board financial/value calculations retain their after-interest
  basis; the optional league comparison never alters the score.
- Holding cash is available, requires a rationale, and retains existing obligations.

Run the model tests with Node 22 or newer:
`node --test mgt340/pro-sport-tycoon/tests/model.test.mjs`

The game runs in the current browser tab. It has no student login, server-side
grade capture or save/resume. Copy Board Report now includes each cycle's
original rationale, accepted risk and financial result.
