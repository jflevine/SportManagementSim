# The Report — SPM 370, Week 12 (Safeguarding Issues in Esports and Gaming)

The reference simulation for `simkit`. Read `simkit/AUTHORING_GUIDE.md` for the method.

## The task

The student is the **Team Operations Manager** at Harbor City Esports, a fictional
organisation. It is Thursday, 1:10 PM; the qualifier is Saturday. An academy player, Rin,
messages: *"can i talk to you about something? … and can it stay between us"*. The student
has about a day of simulated time to decide what to promise, whom to tell, what to verify
and what to do before Saturday, then writes a three-paragraph memo to the general manager.

It serves the chapter outcome *"Compare two responses to a safeguarding risk and explain the
legal considerations, practical tradeoffs, and remaining risk"*, and uses duty of care,
notice and the Identify → Assess → Mitigate model without asking students to practise law.
The "law" is the organisation's handbook, the league rulebook and the coach's agreement:
documents inside the fiction. All characters are adults; conduct is described without
graphic detail.

## Why it has this form

- **A desk, because the job is a desk.** Messages arrive on different channels, records sit
  in a drawer, and formal steps leave a dated trail. Each person arrives the way they would
  (Discord DM, text, email) so voices differ before anyone reads a word.
- **Conversation only where it is the skill.** What you say to a person raising a concern is
  the professional act, so that is free text and it is recorded. Referring, recommending an
  interim measure and notifying the league are forms, because in life they are forms.
- **Time moves when you act.** Reading costs five minutes, a message ten. Other people act on
  their own clock with what they know. Doing nothing is a decision with a consequence.
- **No score.** After the memo the student sees what happened to Rin, to Cole and to Harbor
  City, each with a chain of "why this happened".

## Who knows what at the start

| | Knows | Does not know |
|---|---|---|
| Rin | The DMs, the scrim cut, that she has screenshots | The handbook, March |
| Marcus (head coach) | That Cole cut her blocks for "attitude" | The DMs, that she has said anything |
| Priya (GM) | March; the sponsor meeting; Cole's agreement | That anything is happening now |
| Dana (Safeguarding Lead) | The handbook, the league rule | Anything about this, until referred |
| Cole | Everything he did; March | That Rin has spoken |
| The student | Saturday's logistics | Everything else |

## Paths to try (also the scripted sample teams)

| Team | What they do | Where it ends |
|---|---|---|
| Kestrel | Promise secrecy and keep it | Rin is dropped from the travel roster; a league inquiry opens Monday |
| Osprey | Explain limits, refer, tell Rin first, act before Saturday | Rin takes part; credential held; league notified |
| Heron | Promise secrecy, then refer without telling her | Rin hears from the Lead, quotes the promise back, withdraws |
| Merlin | Ask the head coach for his read, then go to Cole | Cole messages Rin within the hour |

## Debrief

In the instructor room tick two teams and press **Compare**. The projector view shows each
team's first words to Rin, the decision points where they differ, where each person ended
up, and a question for the room. Questions are in `casefile.mjs` under `lenses`.

## Run it

- Student: `index.html` · Instructor: `instructor.html` (instructor key required; not in this repo)
- Offline preview of either page: add `?local=1`
- Local development: `node simkit/dev-server.mjs`, then add `?dev` (instructor key `dev`)
- Checks: `node --test simkit/checks/*.test.mjs`; browser check: `simkit/checks/browser_check.py`

## What was tested, and what was not

Tested: 19 automated checks (two paths differ; promise recorded and held; knowledge scoping;
off-path action; refresh; retry; simultaneous teammates; submission; instructor retrieval;
view leakage). A real-browser run through the dev server. A live run against the deployed
Edge Function with AI voices, including a paraphrased promise with no keyword match.

Not tested: a classroom. Whether students find Rin credible, whether 25–30 minutes is
enough, and whether pods on several devices stay in step are questions for a trial run.
