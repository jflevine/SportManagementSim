# The Saturday Decision Desk

MGT 340 youth-sport manager lab. Ten minutes: 1 brief, 6 decisions, 1 board handoff, 2 debrief. Pods of 3–4 share one device. The fictional league has a $12,000 improvement budget and three choices: access, development, and sideline prevention. Safety procedures are mandatory baseline, not a purchasable option.

## Files and use

- `index.html`: self-contained app; opens directly from disk for an offline copy.
- `facilitator-guide.html`: printable scenario, full choice set, handoff fields, and facilitation notes. Requires no JavaScript.
- Public route: `/SportManagementSim/mgt340/youth-sport-manager/`.

No build, fonts, frontend dependencies, analytics, login, grading, external API, or backend. Text and choices are stored only in this tab's sessionStorage. Storage failure is handled; the page remains usable until closed. Downloaded handoffs are local copies, not instructor submissions. No real identities, financial or traumatic experiences are requested. The separate Youth Sport Desk knowledge check is unchanged.

The activity's amounts, people and situations are invented teaching assumptions. Consequences are discussion prompts, not numeric predicted effects. Project Play's 11% figure is parent belief, not an athlete's odds.

## Checks

Run `node --test tests/model.test.cjs` from the activity directory in the repo. Tests cover all 27 combinations, exact sums and budget edits, malformed state/storage failure, escaping and exports, no network transport, and mandatory safety content.

Manual checks: missing decision; safety unchecked; $14,000 over-budget bundle; revise to $12,000; missing reflection; completed handoff; refresh recovery; print/download; restart cancel/accept; narrow layout and keyboard access. Controls use native radio/checkbox/text fields, visible focus, live validation and focus-managed stage changes.
