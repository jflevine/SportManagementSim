# MGT 340 — Earn the Next Step

A text-based sport sales rehearsal set in a fictional 2–7 Eagles season. Students
offer a fictional eight-game package for **next season**, not eight remaining
games in the current season.
This standalone activity does not import or modify the Avery negotiation app.

## Classroom use

Share this directory's GitHub Pages URL and the separate class code. Students
choose an assigned buyer and work alone or in pods of up to three. Pods choose
a salesperson, coach and observer, then change the salesperson for round two.
Suggested timing: 3 minutes planning, 6 first round, 3 feedback, 7 retry, 3 account
note. Timers are advisory for accessibility and instructor pacing. Each round
allows up to 20 student turns. The final account note is 100–150 words; each
participant adds a name and three-sentence reflection in the shared reflection
field: a concept used, a moment that changed the approach, and what to try next.

A collapsed sales reference remains available with the authorized offer. It
defines customer-focused selling, the Five-Step PRO Method and the four purchase
factors. It contains no private buyer facts or worked-case answers.

During preparation, students may enter up to three discovery questions (400
characters each). After feedback, they may identify an exact buyer statement or
missed clue and a PRO step to improve in an optional retry plan (800 characters).
These fit within the existing preparation and feedback periods; neither is a new
required assignment. Drafts are stored in the existing browser key and scoped to
the active session ID. Beginning round one sends `preparation.questions` with the
existing `begin` action; beginning round two sends `retryPlan`. The server saves
these with the session for instructor review, but does not send them to the AI
buyer. Older clients and records without these optional fields remain valid.

After each conversation, choose **End round & get feedback**. After the second
round, draft the account note using a buyer statement, the recommendation and
outcome, a PRO step, and the concrete next action. Add each participant's reflection,
then choose **Save final record** and optionally **Download full record**.

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
browser. Planning drafts are session-specific and become instructor-visible only
when the corresponding round begins successfully. Transcript downloads and CSV
exports use only server-returned planning fields, never unsaved browser drafts.
Downloads contain the visible record, not resume credentials. A shared
computer should use **Leave this device** after downloading a completed record.
Saved records remain available to the instructor. This is not a Canvas submission.

## Validation

Backend transition tests cover input validation, two-round isolation, failures,
turn limits, submission bounds, and private buyer constraints. Live tests cover
all four buyers, class and instructor authentication failures, session isolation,
reload, concurrent requests, and idempotent retry. Private backend source and QA
materials are maintained outside this public repository.
