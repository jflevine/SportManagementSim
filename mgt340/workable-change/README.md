# Negotiate a Workable Change (MGT 340 · professional sport · Thursday)

Pods are assigned management or player representatives. They read a summary of the wearables
section of the agreement in force and the league's three proposed terms, put up to three
proposals across the table (accept, revise, reject or defer one term, in their own words),
and report to their own side: the term as they would now write it, whose agreement is needed
and why, and the provision or fact that supports them.

The other side's answer depends on the term and the move. A pod's own principal can reject
what its negotiator agreed to.

## Run it

| | Address |
|---|---|
| Offline preview, no server | `mgt340/workable-change/?local=1` (student), `instructor.html?local=1` (room, with four sample pods) |
| Local test | `node simkit/dev-server.mjs`, then `http://localhost:8787/mgt340/workable-change/?dev`; room at `instructor.html?dev`, key `dev` |
| Class use | The plain address, once this branch is merged and the `simkit` Edge Function is redeployed with the updated `simkit/cases.mjs` |

Sample pods M1 (management: refused, came back with a trial) and P1 (players: agreed at the
table, overruled by its board) are the two prepared outcomes for the debrief.

## Checks

`node --test simkit/checks/*.test.mjs` (includes `workable-change.test.mjs`).
Optional browser check: `simkit/checks/workable_change_browser_check.py`.

## For Jeff to verify

`CURRENT` in `casefile.mjs` summarises the 2023 NBA–NBPA agreement, Article XXII, Section 13.
It was checked against public reproductions and secondary sources, not the signed PDF.

## Not yet done

No classroom trial. Not deployed.
