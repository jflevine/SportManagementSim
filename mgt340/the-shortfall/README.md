> **Provenance.** Built on November 15, 2026 by an independent coding session given only this repository and a one-sentence assignment, as a test of whether the method transfers. Jeff has not reviewed it. The assumptions in `DESIGN_NOTE.md` need his answers before class use.

# The Shortfall — MGT 340, college athletics week

A simkit simulation. Method: `simkit/AUTHORING_GUIDE.md`. Design and the assumptions that still
need Jeff's answer: `DESIGN_NOTE.md`.

## The task
The student is the **Director of Athletics** at Wissahickon University (fictional). Tuesday,
1:30 PM. A $200,000 sponsorship has fallen through; Finance needs the $600,000 provisional
athlete-experience budget resubmitted at exactly $400,000 by 5:00 PM. Maya, the women's soccer
captain, texts: she heard the fueling station is being cut entirely, practice is at 3:30 and SAAC
meets at 8:00. Everything is fictional; all characters are adults; the only "rules" are a
fictional department policy and a budget worksheet.

## Why it has this form
- **A budget board, because the job is allocation.** Students move amounts, watch the total
  against $400,000, save dated drafts, and choose whom to show a draft to. People react only to
  what they have been shown.
- **Messages beside the board, because the captain's text is the interruption.** What the AD
  tells Maya is recorded word for word when it is a commitment, and she repeats it at practice.
- **Precision lines are fixed text.** Ellen's and Renee's numbers (the charter terms, the
  $66,000 tutoring floor) are `voice: false`. Maya and Coach Ruiz are voiced, because their
  manner is the point.
- **No score.** After submission: what happened to Maya, SAAC, Finance and the academic progress
  plans, each with "why this happened", plus what the student found out and missed.

## Hidden information (who knows what at the start)
| | Knows | Does not know |
|---|---|---|
| Maya | The rumour; that the fueling station is breakfast for early-lift teams; who she heard it from | The shortfall, any constraint |
| Ellen (Finance) | The shortfall; the signed $40,000 charter and that cancelling forfeits it | What athletes use |
| Renee (Student-Athlete Services) | 38 athletes on plans need ≥ $66,000 of tutoring; psychologist can drop to $35,000 | Anything about the rumour |
| Coach Ruiz | He started the rumour; he pitched the charter to recruits (both guarded) | Constraints |
| The student | The shortfall; the rumour | Everything else |

## Sample paths (scripted fictional teams; they drive the checks and the instructor preview)
| Team | What they do | Where it ends |
|---|---|---|
| Alder | Promise the fueling station is safe; keep it by cutting tutoring to $60k without asking | Promise kept, SAAC quiet; **38 academic progress plans unfunded** |
| Birch | Explain a cut is coming, ask what matters, ask Renee and Ellen what can't move, show Maya the final draft | Maya briefed before Finance; SAAC invites the AD; plans covered |
| Cedar (off-path) | Tell Maya "nobody is cutting anything, it is just a rumor"; trace the rumour to Ruiz; cut fueling to $40k | **SAAC posts the AD's exact words** beside the $200,000 cut; shakes-only breakfast |
| Dogwood | Never answer Maya; cut travel to $30k | Rumour posted by SAAC; **Finance returns the budget** (below the signed charter) |

## Debrief
Instructor room → tick two teams → **Compare**. The projector shows each team's first words to
Maya, the lenses where they differ, the two budgets line by line, and a question for the room.
Questions are under `lenses` in `casefile.mjs`. Suggested pair: Alder and Birch.

## Run it
- Student `index.html`, instructor `instructor.html`.
- Local: `node simkit/dev-server.mjs` (or `PORT=8799 …`), then
  `http://localhost:8787/mgt340/the-shortfall/?dev` and `…/instructor.html?dev` (key `dev`).
- Offline: add `?local=1` to either page (prepared voices; the instructor preview seeds the four samples).
- **Without `?dev` or `?local=1` the pages call the deployed `simkit` function**, which does not
  know this simulation until `simkit/supabase/index.ts` is re-pinned to a commit that contains it
  and redeployed (`simkit/supabase/README.md`). Until then students would see "Unknown simulation."
- Checks: `node --test simkit/checks/*.test.mjs`. Browser check (needs Python Playwright + Chrome,
  dev server running): `python3 simkit/checks/shortfall_browser_check.py http://localhost:8787 [shots_dir]`.

## What was tested, and what was not
Tested: the generic checks every casefile gets, plus 11 path checks in
`simkit/checks/shortfall.test.mjs` (balanced samples; line clamping; Alder vs Birch end
differently; a reassurance is recorded verbatim and quoted back publicly; the same reassurance
taken back before submitting is "revised" not broken; silence leads to the rumour being posted;
a heads-up promise is broken if Maya only saw an earlier draft; the tutoring floor is in no
document; per-character knowledge; free-text reply changes nothing; no leakage before
submission). A real-browser run through the dev server (Chrome via Playwright): play, refresh
mid-way, retry the same request, show a draft, pass practice, submit, debrief, instructor room,
offline student page, offline instructor preview and projector.

Not tested: AI voices (no OpenAI key was used; all lines were authored), the deployed Edge
Function, phones/narrow screens beyond the CSS breakpoint, several devices in one pod, and any
classroom. Whether Maya reads as a credible 21-year-old captain, whether 25–35 minutes is
enough, and whether students find the hidden constraints too hidden are questions for a trial.
The keyword fallback that recognises promises and reassurances is blunter than the AI extractor;
students who phrase things unusually will be read less accurately offline.
