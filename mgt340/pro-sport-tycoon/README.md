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