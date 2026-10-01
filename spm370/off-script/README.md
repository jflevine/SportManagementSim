# OFF SCRIPT — Esports NIL Adventure (v1.1.0)

SPM 370 · La Salle University · Jeffrey Levine, J.D., Ph.D.

A fictional six-decision campaign with choices that change later facts and options.

## Play

- Student activity: `./`
- Instructor demo: `?demo=1` (separate save; includes the full introduction)
- Instructor guide: `?guide=1`

The introduction now comes before the first decision in both modes. It explains Signal House, CROSSPLAY, the student's role, Blaze, Nova, Seatline, and the first task. Every scene shows its essential facts and a specific decision question. “Story & people” remains available for names and terms. Character roles are visible on mobile.

The original v1.0 financial/permissions engine remains in `model.js`. `experience.js` supplies the explanatory narrative and adapted records without changing financial or permission outcomes. `app.js` handles the interface and saves; `styles.css` and `runway.css` supply the layout. Keep these files together with `index.html`. No build service, account, room opening, external font, analytics, or database is required.

## Save compatibility and student work

Version 1.0 saves are migrated by reconstructing the recorded decisions. Names, committed choices, alternate timelines, explanations, and results are preserved when local browser storage is available. Returning users see the new introduction once, then resume their saved place. “Story & people” is a nondestructive reference, not a reset.

Names and work stay in the browser. Students must submit the copied, downloaded, or printed summary through Canvas. There is no central grade dashboard or automatic submission. Production funding is not profit, legal damages, or an academic score. Export before sharing a device, clearing storage, or starting a new story.

## Teaching scope

Suggested facilitated block: 3 minutes setup, 16 minutes story, 4 minutes optional short alternate, and 7 minutes explanations/debrief. This is not a measured student completion time.

The conceptual basis is the instructor's September 28, 2026 Chapter 5, Player Image Rights and Branding, and classroom deck. Story details, offers, payments, deadlines, and reactions are fictional adaptations. The supplied agreements govern the game's options; they are not one nationwide NIL rule. The game does not adjudicate liability or assume school, NCAA, minor, or union coverage. All talent are adults.

## Quality review

See `CLARITY_QA.md` for the specific v1.0 comprehension problems and the v1.1 changes. Model comparison covers all 729 completed decision sequences. Current browser checks cover all 14 scene variants through 24 complete runs across 390, 768, and 1440 CSS-pixel widths, plus save migration, help dialogs, a rewind, and export checks.

The review combines source/code inspection, edited scene-by-scene explanations, screenshots, and controlled Chromium tests. It is not testing with actual first-time students. Browser network navigation is blocked in the authoring environment; the exact files are injected into an offline browser test document. Successful storage uses an explicit test double; denied native storage is separately tested. No interactive live-site or physical-device test is claimed. Deployment is verified separately through GitHub.
