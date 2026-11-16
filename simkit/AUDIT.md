# Audit: what limited the earlier activities (November 15, 2026)

Scope: 40 coded activities in this repository (19 MGT 340, 9 SPM 343, 12 SPM 370) and the
Drive-only exercises located by title (SPM 343 paper player–team negotiation, Campus Clash,
MGT 340 "The Offer" and Collegiate Sport activity sheets, SPM 343 proposal and
audiences-and-funding worksheets, Sport Sales Live Reps Kit, Jawn Juice). Read closely: the
AD budget exercise, Eagles sales lab, Northline negotiation midterm, TAP Decision Lab 2,
Marketing Arena, and the paper negotiation instructor guide. Eight more were skimmed by
README. The rest were classified by automated signals, so counts are approximate.

Evidence labels: **[code]** verified in source; **[observed]** reported by Jeff from class;
**[trial]** a hypothesis that needs a student playtest.

## Recurring design choices, and the strongest exception to each

| Dimension | Usual choice | Strongest exception |
|---|---|---|
| What students see first | A role brief, then the complete fact pack | Paper negotiation: private role sheets; the other side's limits must be discovered |
| Who holds information | The author; every character speaks from one fixed case | Northline midterm: the counterparty's limits are server-side and must be probed |
| What students spend time doing | Choosing among prepared options, then justifying in a text box (rationale or reflection fields in 33 of 40) | Eagles sales and Northline: the talking is the work |
| Which choices carry consequences | A scripted shock that hits every team alike | Northline: acceptance must cite a specific earlier offer on the record |
| What reaches the instructor | Downloads, CSVs, gradebooks after the fact (30 of 40 offer a download) | TAP Lab 2: a live projection of class choices |

Where the familiar format fits: conversation suits Eagles and Northline because handling an
objection or holding a position is the skill. It fits poorly in the AD exercise, where the
skill is allocation under competing claims.

## The three constraints that matter most

**1. One spine, reused: brief → prepared options → common shock → written justification.**
Example: `mgt340/chavez-decision/logic.mjs` — `recordProvisional` reveals the same $200,000
shortfall whichever of three preset plans was chosen; four short responses follow.
Consequence: students practise defending a choice more than making one; teams differ by what
they wrote, not what they did. Source: design habit, reinforced by starting each build in a
fresh AI session. [code] the path; [trial] whether students experience the shock as arbitrary.

**2. Characters defined by prohibitions on a shared fact sheet.**
Example: `mgt340/chavez-decision/backend/core.mjs` — `PERSONAS.athlete` carries a dozen "do
not" instructions and the prompt appends the same `FIXED CASE`, `BUDGET AND CAP` and
`CATEGORIES` blocks for all three roles. The athlete has nothing only she knows, nothing she
has merely heard, and nothing she needs today. Consequence: accurate but interchangeable
voices. Source: interaction of a sound aim (no invented facts) with how language models
behave; limiting what a character may *say* is not limiting what it *knows*. [code] the
prompt; [observed] athletes "sounded too much like administrators"; [trial] whether
knowledge-limited characters read as more credible.

**3. Decisions live where the instructor cannot use them during class.**
Example: the AD exercise keeps plan choices in `localStorage`; the server holds anonymous
chat turns only. Across the repository each activity has its own tables, Edge Function and
after-the-fact instructor page (50+ tables, 29 functions). Consequence: facilitation by
walking the room; debrief by volunteers. Source: mostly technology, partly habit (records
designed for grading). [code] storage and instructor pages; [observed] Jeff had to check how
teams committed and what triggered the shortfall; [trial] whether a live board changes how
he runs the room.

## Worth preserving

`spm370/contract-negotiation/backend/`: an append-only numbered transcript, request IDs that
make a retry replay instead of double-apply, server-derived facts that ignore the browser's
claims, hashed credentials, and separate test records. simkit generalises this pattern.

## The before-and-after test (run in the pilot)

| | Before: AD budget exercise | After: The Report |
|---|---|---|
| What the student does | Tells the athlete representative "I promise support funding won't be cut" | Tells Rin "Yes, this stays between us" |
| What is remembered | Nothing; chat cannot create a commitment (`ACTION BOUNDARY`) | A `commitment.made` event holding the student's exact words |
| Who else learns | No one; threads are per stakeholder | Whoever an event teaches, with the route recorded (`via`) |
| What happens later | The same shortfall for every team | She hears of the referral from the Lead, quotes the promise, withdraws; or, if told first, stays |
| What the instructor sees | Nothing during class | "Promise broken · Referred · Rin withdrew" on the board; the chain of cause; a two-team comparison |

Result: passes as an automated check (`simkit/checks/classroom.test.mjs`, "BEFORE/AFTER"),
in a real browser through the dev server, and against the deployed function with AI voices,
where a paraphrased promise containing none of the fallback keywords ("nobody else has to
hear about this. You have my word.") was recognised and recorded.

One defect surfaced in that live run and is fixed: an AI-voiced Safeguarding Lead restated
advice as a decision. Procedural and decision lines are now fixed text (`voice: false`).

Still unverified: everything that depends on students. See the reference README.
