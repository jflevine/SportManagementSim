# The Youth Sport Desk

MGT 340 Week 10 Knowledge Check: Youth and High School Sport, revised edition `mgt340-youth-sport-v2`. A new hire at a fictional Delaware Valley youth sport alliance works through two files before a board meeting: **Foundations** (history, governance, and principles) and **Today's Field** (current issues). The assessed question stems, options and brief-response parts match the revised printable Week 10 check.

- Student page: https://jflevine.github.io/SportManagementSim/mgt340/youth-sport-check/
- Instructor preview: https://jflevine.github.io/SportManagementSim/mgt340/youth-sport-check/?pilot=1

- Individual and open notes; suggested 15 minutes (8 multiple choice, 6 brief responses, 1 review); no countdown, speed bonus, or branching penalty.
- Eight multiple-choice items plus two brief responses with two parts each.
- 12 points total: Foundations 6 + Today's Field 6.
- The assessed stems and answer options are fixed. Narrative labels add context, not extra graded tasks. The alliance, companies, and people are fictional; cited figures come from published reports.

## Student and preview modes

Use the activity directory for the student version. Add `?pilot=1` for a clearly labeled instructor preview that collects no identity, sends no responses, and issues no grade.

The official version asks for first/last name and a La Salle email. These are self-reported, not authenticated university identity. It stores drafts in this browser tab's session storage, not long-lived local storage. Students can navigate back and review all answers before final submission.

Submission freezes the attempt ID, identity and responses. A matching server-confirmed receipt is required for success. If a save fails or its acknowledgment is uncertain, retry the same frozen attempt. Do not start a new attempt or alter the pending payload. Response downloads without a confirmed receipt are backups, not official submissions. Clearing the browser copy never deletes an instructor record.

## Grading and privacy

Eight multiple-choice points are scored in a private server function. The receipt shows only the MC subtotal out of 8 (Foundations out of 4, Today's Field out of 4), with 4 brief-response points pending instructor review. This is not a final grade out of 12. There is no AI writing grade or Canvas sync.

The private instructor key, grading explanations, server credentials and student records are not included in these public files. The public API key grants no table access. There is no public student lookup or gradebook. An isolated Supabase endpoint (`submit-mgt340-youth-sport`) and private table are used; prior activities remain separate.

The private submission function was deployed and verified on November 4, 2026. A live synthetic submission returned a matching server receipt; an exact retry recovered the same receipt, changed submissions conflicted, and browser-role table reads/writes were denied. If a later save fails, students keep the same locked attempt, download a backup, and retry from the original tab.

## Server contract

The page POSTs `attemptId`, `assessmentVersion` (`mgt340-youth-sport-v2`), `firstName`, `lastName`, `email`, `answers` (eight option indexes 0–3 in the order q1, q2, q3, q4, q6, q7, q8, q9), `briefs` (`q5` and `q10`, each with parts `a` and `b`), and `clientStartedAt`. It accepts success only when `ok` is true and `receipt` echoes the same `attemptId` and `assessmentVersion` and contains a UUID `receiptId`, a valid `submittedAt`, `maxMcScore: 8`, `maxScore: 12`, `briefPointsPending: 4`, `reviewStatus: "pending_instructor_review"`, and integer `foundationsMcScore` and `issuesMcScore` (each 0–4) that sum to `mcScore`.

## Local checks

Static files require no build step or third-party frontend dependencies. Serve this directory with a static HTTP server. The real endpoint only accepts the authorized production origin; use a local mocked endpoint for development, not live student records.

```sh
node --test mgt340/youth-sport-check/tests/*.test.mjs
```

On shared devices, download the receipt before clearing the tab's copy or closing the tab.

