# OFF SCRIPT — Esports NIL Adventure (v1.1.1)

SPM 370 · La Salle University · Jeffrey Levine, J.D., Ph.D.

A fictional six-decision campaign with choices that change later facts and options.

## Play

- Student activity: `./`
- Instructor demo: `?demo=1` (separate save; includes the full introduction)
- Instructor guide: `?guide=1`

The introduction now comes before the first decision in both modes. It explains Signal House, CROSSPLAY, the student's role, Blaze, Nova, Seatline, and the first task. Every scene shows its essential facts and a specific decision question. “Story & people” remains available for names and terms. Character roles are visible on mobile.

The original v1.0 financial/permissions engine remains in `model.js`. `experience.js` supplies the explanatory narrative and adapted records without changing financial or permission outcomes. `app.js` handles the interface and saves; `styles.css` and `runway.css` supply the layout. Keep these files and the `assets/avatars/` folder together with `index.html`. No build service, account, room opening, external font, analytics, or database is required.

## Save compatibility and student work

Version 1.0 and 1.1.0 saves are migrated by reconstructing the recorded decisions. Names, committed choices, alternate timelines, explanations, and results are preserved when local browser storage is available. Returning v1.0 users see the new introduction once, then resume their saved place. Players who already completed the v1.1 introduction resume directly. “Story & people” is a nondestructive reference, not a reset.

Names and work stay in the browser. Students must submit the copied, downloaded, or printed summary through Canvas. There is no central grade dashboard or automatic submission. Production funding is not profit, legal damages, or an academic score. Export before sharing a device, clearing storage, or starting a new story.

## Teaching scope

Suggested facilitated block: 3 minutes setup, 16 minutes story, 4 minutes optional short alternate, and 7 minutes explanations/debrief. This is not a measured student completion time.

The conceptual basis is the instructor's September 28, 2026 Chapter 5, Player Image Rights and Branding, and classroom deck. Story details, offers, payments, deadlines, and reactions are fictional adaptations. The supplied agreements govern the game's options; they are not one nationwide NIL rule. The game does not adjudicate liability or assume school, NCAA, minor, or union coverage. All talent are adults.

## Quality review

See `CLARITY_QA.md` for the original review and the October 1 first-time-player follow-up. The v1.1.1 patch makes the deal file and trailer wording branch-aware, discloses the extension’s event-wide delay before commitment, improves interrupted alternate saves, and permits a decision-six-only rewind. Shorter scene copy, concise next-scene hooks, illustrated character portraits, and scene-specific campaign-chat subjects preserve the existing six-decision structure. Names and roles remain visible; portraits are decorative.

Run the committed dependency-free regression suite from the repository root:

```sh
node --test spm370/off-script/tests/*.test.js
```

All 18 checks pass, including comparison of all 729 completed choice sequences and 1,093 history states with the original financial/permissions engine. Interface tests use an explicit DOM/storage test double; they do not establish browser layout or native-device behavior.

The previous 24-run, three-width browser suite applies to v1.1.0. An independent live walkthrough informed this patch, but revised-file browser rendering has not been rerun because the local Chromium process is socket-blocked. Verify the deployed v1.1.1 game after publication. No actual first-time-student usability study or physical-device test is claimed.
