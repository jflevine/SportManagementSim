# The Investment Committee (MGT 340 · professional sport · Tuesday)

A two-round pod activity. Round 1: "Which industry or business opportunity should the Fund
pursue, and why?" The answer is saved and stays on the page. Round 2: the staff memo for a
company in that sector, the Committee's charter, up to three calls, and a recommendation:
what the Committee can authorize today, what it should put in writing, whose agreement it
needs, and what evidence says so.

Everything inside the exercise is invented for class (the League Growth Fund, its charter,
four companies, all people and numbers). It is modelled on the kind of vehicle the NFL's
clubs approved in October 2026 and does not describe that vehicle's actual rules.

## Run it

| | Address |
|---|---|
| Offline preview, no server | `mgt340/investment-committee/?local=1` (student), `instructor.html?local=1` (room, with four sample pods) |
| Local test | `node simkit/dev-server.mjs`, then `http://localhost:8787/mgt340/investment-committee/?dev`; room at `instructor.html?dev`, key `dev` |
| Class use | The plain address, once this branch is merged and the `simkit` Edge Function is redeployed with the updated `simkit/cases.mjs` (see `simkit/supabase/`) |

Pods: one device per pod is enough. A second device joins with the six-character pod code
shown in the green bar. Use one class code per section (for example `MGT340-TUE`).

## What the instructor sees

Each pod's Round 1 sector, what it read, whom it called, its call, and whether it named the
party that controls the right. Tick two pods and press Compare for a side-by-side with a
question for the room. Sample pods A and B (fan engagement, different conditions) and C and D
(performance tech, opposite calls) are the prepared debrief pairs.

## Checks

`node --test simkit/checks/*.test.mjs` (includes `investment-committee.test.mjs`).
Optional browser check on a phone-sized screen: `simkit/checks/investment_committee_browser_check.py`.

## Not yet done

No classroom trial. Voices are fixed text on purpose (the content is procedural), so the AI
voice is not used. Not deployed: the live Edge Function does not know this simulation until
it is redeployed.
