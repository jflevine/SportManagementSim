# Launch Day — SPM 343 Knowledge Check 2

Individual, in-class assessment: 12 multiple-choice questions in three rounds, 12 points total. Suggested completion time is 12 minutes; allow about 15 minutes with directions and debrief. The clock is advisory and never auto-submits.

## Student and instructor routes

- Student: https://jflevine.github.io/SportManagementSim/spm343/launch-day/
- Instructor: https://jflevine.github.io/SportManagementSim/spm343/launch-day/?view=instructor
- Add `?room=SESSIONCODE` to prefill a student's session code.

Use the existing private Marketing Arena instructor key. No key is included in this repository. Session labels, access codes, student data, and scores are managed by the private backend.

## Running class

1. Sign into the instructor dashboard and select or create a session. New sessions start closed, with student scores hidden.
2. Copy the student link. Click **Open for students** when class begins.
3. Students enter their full name and La Salle email, confirm independent work, and answer the questions. They can move between rounds and review before final submission.
4. Monitor joined students, saved progress, and confirmed submissions. The dashboard refreshes every 15 seconds.
5. Allow approved accommodations. Close the session after students finish. Closing prevents joins, saves, and submissions, but retains existing drafts. Reopen if a student needs additional time.
6. Use **Release student scores** when ready. Each student can then see only their own total and round scores. Correct answers are not returned to students.
7. Export CSV for name, email, status, total, percentage, round scores, answers, timestamps, and receipt. Post official grades in Canvas using your normal workflow.

## Content

- Questions 1–3: stakeholder roles, publisher control, dependencies.
- Questions 4–5: segmentation by motivations and matching an offer to a segment.
- Questions 6–8: all five course Ps: product, price, place, promotion, public relations.
- Questions 9–12: endemic sponsors, rights versus activation, activation fit, objective-aligned measurement.

Question wording matches the approved Launch Day Word assessment. The private question bank and answer key are seeded in `spm343_kc2_assessments`, not shipped in client files or this public repository. Change the private bank only between sessions; an active assessment should not be edited.

## Persistence and privacy

The static GitHub Pages client calls the `spm343-launch-day` Supabase Edge Function. The existing project is reused with isolated KC2 tables. RLS is enabled, and anonymous and authenticated Data API roles have no access to these tables. The function uses server credentials, which never reach the client. Instructor requests are checked against the existing Marketing Arena SHA-256 key record. Student requests use a random 256-bit per-attempt token; only its hash is stored server-side. Joining requires an open session code. Names and emails are self-entered and should be checked against the roster; this is not an institution-verified login.

Scoring is server-side. Client-supplied scores are ignored. One attempt per email per session is enforced by the database. Final submission is immutable and idempotent: retrying returns the same receipt, without changing the score. Version checks prevent stale writes from silently replacing newer work. Student responses never include the answer key or classmates' records.

Answers save to the device immediately and to the server after a short debounce. Refresh restores the attempt; unsent changes are retained when they do not conflict with newer server data. On a connection error, keep the original browser open and retry. A confirmed receipt is required for a completed submission. If access is lost, verify the student's identity, then generate a **Recovery link** in the dashboard and give it privately to that student. This invalidates their previous token.

The timer is not an exam lockdown mechanism. There is no speed scoring, public grade leaderboard, automatic grade posting, or background proctoring.

## Development and verification

Plain HTML, CSS, and JavaScript; no build step. Serve this repository with a local HTTP server. `backend/schema.sql` records the additive schema; `backend/index.ts` is the deployed function source. Do not place answer keys, instructor keys, student exports, or private question-bank files in the repository.

`tests/api.mjs` uses an existing disposable `TESTKC22` session and external `LAUNCH_KEY_FILE` and `LAUNCH_BANK_FILE` paths. It verifies authentication, validation, duplicate prevention, version conflicts, session closure, immutable scoring, score release, and access recovery. Test data must stay separate from classroom records.
