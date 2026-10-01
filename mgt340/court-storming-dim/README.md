# Manage the Final Buzzer — D.I.M.

A 15-minute individual or pair exercise applying Develop, Implement, and Manage to court-storming safety. Static HTML, CSS, and JavaScript; no package installation, build, backend, room code, login, or unlocking.

- Student URL: https://jflevine.github.io/SportManagementSim/mgt340/court-storming-dim/
- Instructor notes: append `?guide=1`, or use the header button.
- Suggested timing: 2 minutes case, 4 planning, 5 simulation, 4 reflection/export/debrief.

## Student flow

1. Read the Clark case and enter a name (or both partners' names).
2. **Develop:** select a priority group and two preventive measures; give one or two sentences of reasoning.
3. **Implement:** select each functional unit and click a post on the arena, or use the equivalent labeled dropdowns. Select an activation trigger and communication approach.
4. **Manage:** make one decision at each of three moments: 30 seconds, final buzzer, and departure. Read the consequences before advancing. Crowd/team markers move, staff posts change, and route/coverage/communication status updates.
5. **After-action:** review outcomes, decisions, and process evidence. Write a two- or three-sentence revision. Download TXT, copy for Canvas (manual-copy fallback), or print/save PDF.

## Teaching model

`model.js` contains deterministic, named consequences, not safety probabilities or automatic grading. The priority group frames the explanation and reflection; it does not excuse ignoring others or change a hidden score.

- Designating a lane helps staff establish an available main route.
- Rehearsal plus a named radio confirmation protocol establishes initial readiness.
- Spectator messaging moderates the illustrative approach but does not provide staff coverage.
- A verified backup unlocks a usable alternate corridor.
- Placement, activation, and live decisions change the operation. All three final-stage choices are available; an unverified alternate ends with a check still outstanding.
- Process warnings remain in the report after recovery. A team can complete departure while leaving a coverage gap.

The clock advances by clicking; there is no speed score. Animation respects reduced-motion preferences. The map is a schematic and units represent functions, not recommended real-world staff counts. The short game score is fictional.

## Case integrity

On January 21, 2024, Caitlin Clark collided with a spectator during Ohio State's court storming. AP reported that she was shaken up but not injured.

Source: https://apnews.com/article/caitlin-clark-fans-storming-court-7f226a252df600432734db409d3b5b3e

The next-game planning role, arena, staff reports, score, crowd behavior, and all outcomes are fictional teaching situations. This does not reconstruct Ohio State's staffing, predict actual crowd safety, or determine legal fault. The separate Sports Illustrated article about Clark's WNBA back issue is not evidence of injury from the collision.

## Persistence and collection

Names, setup, decisions, and reflection remain in local storage on the current device under `mgt340-court-storming-dim-v2`. Reload restores the same moment or consequence. Blocked storage does not prevent completion and displays a warning to export before closing.

The earlier `mgt340-court-storming-dim-v1` writing plan is not overwritten. If present, the case screen offers a download of it. It is not imported as an interactive run.

Setup becomes read-only after the simulation launches. Restart requires confirmation, retains names/setup, and clears decisions/reflection. A full reset separately confirms clearing the interactive run. Neither operation clears the earlier writing-version plan.

No data is transmitted, no instructor dashboard exists, and export is not submission. Students submit their exported report in Canvas. Export includes names, setup, reasoning, all three decisions, incoming reports, consequences, process evidence, and final revision.

## Verification

Run the deterministic model checks:

```sh
node --test mgt340/court-storming-dim/tests/model.test.cjs
```

The model checks cover all 27 decision paths plus coverage/recovery, readiness, backup verification, and early release. Chromium desktop pair and 390px mobile solo playthroughs verified placement, dropdown alternatives, validation, restored progress, escaped student names, distinct outcomes, TXT/clipboard export, print visibility, restart/reset, legacy-plan download, blocked storage, and instructor notes. No JavaScript errors or mobile horizontal overflow occurred.

## Classroom clarity update (October 1)

The opening briefing explicitly defines playing-space invasion, distinguishes prevention from response after entry, and introduces the host event-manager role and D.I.M. sequence. The instructor-selected video is linked directly, with three observation prompts: entry points, crossing paths, and preventive action before the buzzer. Its YouTube title/metadata were checked; the full footage was not independently reviewed. The written case remains sufficient if playback is unavailable. Allow approximately 15 minutes for the exercise after the video.

Typography now uses one consistent sans-serif family, larger body text and controls, more readable line spacing, and clearer group spacing. The staff-assignment screen defines each role before students place units. The playing-space status and after-action report record entry separately from team departure; that record persists after recovery. The model's sixth test checks this distinction. Previously saved runs remain usable and the original decisions/fields are retained.
