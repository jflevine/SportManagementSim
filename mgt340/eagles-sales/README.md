# MGT 340 — Earn the Next Step

A text-based sport sales rehearsal set in a fictional 2–7 Eagles season. Students
offer a fictional eight-game package for **next season**, not eight remaining
games in the current season.
This standalone activity does not import or modify the Avery negotiation app.

## Classroom use

Share this directory's GitHub Pages URL and the separate class code. Students
choose an assigned first buyer and work alone or in pods of up to three. Pods
rotate salesperson, coach and observer after each round, giving each member a
salesperson turn when all three rounds are completed.

Suggested 22-minute block: 3 minutes planning, 4 conversation, 2 review/buyer
choice, 4 conversation, 2 review/buyer choice, 4 conversation, 3 account-note draft.
Timers are advisory; the instructor can end after one or two rounds if needed.
Each round allows up to 20 student turns. After feedback, students can retry the
same buyer or choose any of the other three. Each begins with fresh buyer context.

Use the Five-Step PRO Method throughout: qualify, explore the need, connect a
benefit, propose a fitting next step, and maintain the relationship. Quality,
quantity, time and cost guide discovery and fit. These are applied concepts,
not required words or a rigid script. Buyer approach labels are emphases and
students may use more than one technique. A fitting sale, agreed next step, or
respectful no can be successful.

Buyers have distinct Philly voices. They deliver sharper, behavior-focused
comebacks for clear trolling or repeated disregard of stated needs, then soften
when the student re-engages. Honest beginner mistakes, typos, short messages,
and harmless banter do not trigger that escalation. Purchase constraints remain
fixed even when rapport improves. AI behavior and feedback may vary.

The full sales reference stays available beside the authorized offer. It includes
no hidden buyer facts. Students may enter three discovery questions (400 characters
each). Between rounds they can save a plan (800 characters) naming a buyer clue,
PRO step or purchase factor. Drafts are scoped to the session and next round.
Only submitted planning is included in instructor records and downloads, never
in the buyer's model context.

When the buyer genuinely agrees to the appropriate outcome, the buyer briefly
confirms it, recaps the agreed terms or next step, requests the relevant written
follow-up in the simulation, and signs off in their own voice. The page displays
**Call complete** and stops additional messages. Choose **Get feedback & choose
next buyer** to review and continue. A purchase commitment is different from
permission to follow up, a plan-review meeting, or a service-review agreement;
these next steps do not claim a sale, renewal, email or future service occurred.
Interest alone does not end the round. If the conversation has not reached an
agreement, you can still choose **End round & get feedback**.

After each conversation, review feedback, check the advice
against the transcript, choose a buyer, rotate roles, and begin the next round.
At the end, select one conversation for a 100–150-word account note identifying
the buyer and round, an exact statement, recommendation, outcome and follow-up.
Each participant adds a name and three sentences applying a PRO step, explaining
a purchase factor, and identifying an improvement. Finish reflections and save
during the lesson's final three minutes. Choose **Save final record** and optionally
**Download full record**. This is formative, ungraded practice.

Every round stores its own buyer, approach, transcript, plan and feedback.
Downloads, CSV and instructor histories label each round correctly. Older
records without round-level buyer fields fall back to their original buyer.
Existing sessions and the browser's resume key remain compatible.

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

Backend transition tests cover input validation, three-round switching and isolation, failures,
turn limits, submission bounds, and private buyer constraints. DOM tests cover buyer selection, per-round drafts, historical labels, TXT/CSV
exports and final submission. Live checks exercise
buyer voice, recovery, buyer constraints and switching through the existing endpoint. Private backend source and QA
materials are maintained outside this public repository.


