# Classroom release verification — 28 September 2026

## Model and logic

12 tests pass, including all 45 available classroom strategies and the earlier model regression suite (288 simulated cycles across markets and game lengths).

Checked:
- One offered decision per cycle; only eligible cash/50% funding; rationale validation; affordability.
- Revenue, operating result, after-interest profit, cash and debt reconcile with full-precision calculations.
- Forecast capital ROI is invariant to financing, with correct year-one loan payments and continued debt.
- Crowd mood follows saved fan confidence; its disclosed causes reconcile to that change.
- The league comparison and reaction replay do not mutate or reroll outcomes.
- Board Report includes participant names, all original explanations, financial results, reflection and future commitments.

## Browser verification

Published GitHub Pages version checked in desktop Chromium. Completed all three cycles with two named partners: fan service, 50% debt-funded premium club, and star signing. Verified:
- Solo and pair setup; partner name requirement.
- Three options per cycle; rationale preserved when funding changes.
- Correct capital ROI calculation and loan payment explanation.
- Recorded cheering, as well as booing on a separate solo hold-cash run.
- Final income/cash results, continuing obligations, both partner names and all three original explanations.
- Final reflection validation; complete report visible in the report panel.
- 20% league comparison: $78M less shared revenue lowers both profit and cash by $78M without changing the recorded result.
- Completed run and final reflection persist after a real page reload.
- Restart cancellation preserves the run; confirmed restart returns to setup.
- Desktop screenshot inspected; no page-script error was encountered during the walkthrough.

The remote browser did not expose a completed download event for the text file. Download initiation and copy confirmation were observed, but file transfer / clipboard contents were not independently verified. The complete selectable report view was verified as a fallback. Do not describe download receipt as tested successfully.

Responsive styling and reduced-motion CSS are implemented; no mobile viewport, physical device or OS reduced-motion walkthrough was performed. Local browser installation/preview was unavailable, so testing used the published URL.

## Limits

No student timing study, classroom projector test, physical-device test or learning-effectiveness study is claimed. The cash/operating model is explicitly simplified. No server-side submissions or formal accounting statements.
