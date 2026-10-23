# MGT 340 — Earn the Next Step

A text-based sport sales rehearsal for a fictional disappointing Eagles season.
This standalone activity does not import or modify the Avery negotiation app.

## Classroom use

Share this directory's GitHub Pages URL and the separate class code. Students
choose an assigned buyer, work alone or in pods of up to three, and rotate roles.
Suggested timing: 3 minutes planning, 6 first round, 3 feedback, 7 retry, 3 account
note. Timers are advisory for accessibility and instructor pacing. Each round
allows up to 20 student turns. The final account note is 100–150 words; each
participant adds a three-sentence reflection.

The Instructor button uses the existing Avery instructor key. The instructor can
review and download saved conversations, export student records, run marked
tests, and close admission to new sessions. Closing admission does not interrupt
existing sessions. AI feedback is advisory and ungraded.

## Separation and data

The endpoint is `mgt340-eagles-sales`. Its database objects have the
`mgt340_sales_` prefix. The existing server-side OpenAI connection is reused;
there is no provider key in this source. Buyer instructions remain server-side.
The frontend has no dependencies on `spm370/contract-negotiation`.

Student resume access is stored only under `mgt340.eagles.sales.v1` in this
browser. Downloads contain the visible record, not resume credentials. A shared
computer should use **Leave this device** after downloading a completed record.
Saved records remain available to the instructor. This is not a Canvas submission.

## Validation

Backend transition tests cover input validation, two-round isolation, failures,
turn limits, submission bounds, and private buyer constraints. Live tests cover
all four buyers, class and instructor authentication failures, session isolation,
reload, concurrent requests, and idempotent retry. Private backend source and QA
materials are maintained outside this public repository.
