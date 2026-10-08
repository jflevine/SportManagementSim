# TAP Decision Lab 2: October 8 clarity revision

This revision supplies explicit event plans, a 220–320-word individual brief, and secure access to each student's own instructor-reviewed score. It preserves the existing live/test data separation and submission protocol.

## Verification

- 19 source checks: response fields, native labels, character limits, stage order, course independence, individual timing, supplied timetable, and the hands-on requirement
- 14 backend tests: immutable initial plans, version conflicts, durable retries, budget constraints, separate test identities, authenticated access to one's own grade, zero versus pending, grade corrections, and private-note exclusion
- Three browser engines (Chromium, Firefox, WebKit): complete student submission, interrupted/offline saving, resuming, receipt download, own-grade refresh, instructor scoring/CSV, anonymous guest view, keyboard completion, and 390/1440-pixel layouts
- Deployed API smoke uses only retained synthetic attempts in the separate test table; classroom records and guest totals are excluded
- A separate deployed owner-grade check submitted a synthetic attempt, added an 8/10 review fixture through a narrowly scoped test-table update, and verified the owning token returned the rubric points, preserved the receipt, excluded private notes, and rejected a different token. This tests actual grade retrieval; it does not claim a real instructor-key login
- All supplied format/adjustment schedules total 90 minutes and provide at least 15 minutes of hands-on play per visitor. A third host is affordable only with Play & Connect

The release workflow and exact-commit evidence are linked from [PR 32](https://github.com/jflevine/SportManagementSim/pull/32). The first run passed 60 of 63 browser scenarios; the remaining three used a stale expected label, `spare of 12`, after the display correctly changed to `not reserved of 12`. The corrected test retains the numeric budget and submission assertions. The final release requires the corrected hosted workflow to pass before merging.

## Deliberate boundaries

- Instructor grading is manual using the 2/3/3/2 rubric. Completion checks never award points
- Students see only their own reviewed points, using their private attempt session. Instructor notes stay private; Canvas is the official course record
- The existing instructor verification digest is preserved. A real instructor key was not retrieved or used in QA
- Student names and La Salle emails are self-reported, not verified through university SSO
- Browser testing is automated; no actual first-time student, physical-device, screen-reader, or campus-network trial is claimed
- 25–30 minutes is the designed scope, not a measured class result
- The existing guest-day lecture and guest fill 75 minutes. Use the seven-minute practice slot for launch and allow independent completion by the announced Canvas deadline
- The instructor guide, replacement launch slide, and complete fallback response document accompany the release
