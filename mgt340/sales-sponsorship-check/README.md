# The Philly Sports Desk

MGT 340 Sales + Sponsorship Knowledge Check. A fictional Philadelphia sports-agency desk connects a ticket recommendation and a coffee-sponsorship recommendation.

- Individual; suggested 15 minutes; no countdown, speed bonus, or branching penalty.
- Eight multiple-choice items plus two brief responses with two parts each.
- 12 points total: Sales 6 + Sponsorship 6.
- The original assessed stems and answer options are preserved. Narrative labels add context, not extra graded tasks.

## Student and preview modes

Use the activity directory for the student version. Add `?pilot=1` for a clearly labeled instructor preview that collects no identity, sends no responses, and issues no grade.

The official version asks for first/last name and a La Salle email. These are self-reported, not authenticated university identity. It stores drafts in this browser tab's session storage, not long-lived local storage. Students can navigate back and review all answers before final submission.

Submission freezes the attempt ID, identity and responses. A matching server-confirmed receipt is required for success. If a save fails or its acknowledgment is uncertain, retry the same frozen attempt. Do not start a new attempt or alter the pending payload. Response downloads without a confirmed receipt are backups, not official submissions. Clearing the browser copy never deletes an instructor record.

## Grading and privacy

Eight multiple-choice points are scored in a private server function. The receipt shows only the MC subtotal out of 8, with 4 brief-response points pending instructor review. This is not a final grade out of 12. There is no AI writing grade or Canvas sync.

The private instructor key, grading explanations, server credentials and student records are not included in these public files. The public API key grants no table access. There is no public student lookup or gradebook. An isolated Supabase endpoint and private table are used; prior activities remain separate.

## Local checks

Static files require no build step or third-party frontend dependencies. Serve this directory with a static HTTP server. The real endpoint only accepts the authorized production origin; use a local mocked endpoint for development, not live student records.

On shared devices, download the receipt before clearing the tab's copy or closing the tab.
