# OFF SCRIPT — Esports NIL Adventure (v1.2.0)

SPM 370 · La Salle University · Jeffrey Levine, J.D., Ph.D.

A fictional six-decision campaign with choices that change later facts and options.

## Play

- Student activity: `./`
- Instructor demo: `?demo=1` (separate save; includes the full introduction)
- Instructor guide: `?guide=1`

The introduction now comes before the first decision in both modes. It explains Signal House, CROSSPLAY, the student's role, Blaze, Nova, Seatline, and the first task. Every scene shows its essential facts and a specific decision question. “Story & people” remains available for names and terms. Character roles are visible on mobile.

The original v1.0 financial/permissions engine remains in `model.js`. `experience.js` supplies the explanatory narrative and adapted records without changing financial or permission outcomes. `app.js` handles the interface and saves; `styles.css` and `runway.css` supply the layout. Keep these files and the `assets/avatars/` folder, `lab.js` and `lab.css` together with `index.html`. The story needs no account, room opening, external font or analytics. Optional private lab submission uses the existing course Supabase backend; gameplay and the downloadable Canvas fallback work without it.

## Save compatibility and student work

Version 1.0, 1.1.0 and 1.1.1 saves are migrated by reconstructing the recorded decisions. Names, committed choices, alternate timelines, explanations, and results are preserved when local browser storage is available. Returning v1.0 users see the new introduction once, then resume their saved place. Players who already completed the v1.1 introduction resume directly. “Story & people” is a nondestructive reference, not a reset.

Work stays in the browser until the student explicitly submits. The final lab form collects an individual first name, last name and email, sends the six choices, two concept responses and reflections to the private course database, and confirms a receipt. The access-key-protected instructor gradebook is at `instructor/`. Nothing is sent to Canvas automatically; the copied, downloaded or printed summary is the fallback. Production funding is not profit, legal damages, or an academic score. Export before sharing a device, clearing storage, or starting a new story.

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


## Legal Decision Lab 2: light grading (v1.2.0)

The 10-point learning score awards 6 points for completing the six decisions and 2 points for each of two short concept checks. Students may read feedback and retry freely before submitting. Story choices, production funds, trust and ending do not affect points. The two short reflections remain for instructor review; text length is only a completeness check, not automated assessment of reasoning quality. Instructors may retain or adjust the recorded grade while the original automatic score remains on record.

Names and email are required only at submission. Partners can play together, then use “Another student on this device” to complete separate checks and reflections without replaying the shared story. Identities are self-reported, not authenticated. This is a low-stakes classroom lab, not a secure exam.

The client freezes the exact attempt payload before sending it. An uncertain response retains that same attempt for retry; server idempotency returns the same receipt. No receipt is displayed unless the server confirms it. Confirmed summaries use the submitted snapshot; later alternate exploration does not change the submitted work. Export a fallback before clearing storage or leaving a blocked connection.

The instructor key is entered on the private gradebook page and kept only in that tab’s memory. The page provides search, reflection review, a 0–10 grade override and CSV export. Student records and production credentials are not committed to this repository. See `backend/README.md` for the deployment/security boundary and tests.
