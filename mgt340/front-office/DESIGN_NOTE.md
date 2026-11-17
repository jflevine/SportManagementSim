# Design note: The Front Office — Game-Day Decisions

## Professional task
A three-person front-office team (ticketing, game operations and basketball operations)
must recommend one family offer before it opens at noon. Saturday's basketball game has
300 unsold seats; the owner wants first-time families to return. Class time: approximately
15 minutes plus debrief. The brief and three choices are Jeff's revised paper case.

## Skill and interface
Make an executable offer: separate proposing, approving and delivering; cite policy;
revise a promise when evidence changes; define a fallback and a repeat-attendance measure.
An **offer builder**, not a chatbot, fits the work. The initial letter, assumption and
approver are locked into an append-only record. Students then open a separate policy
update on the instructor's cue, save a draft, obtain another pod's parent-perspective
challenge, and submit their revised wording. No AI, points, guessing demand or fabricated
consent. Precise source language remains fixed.

## Who holds what
- Ticket director: authority over rates/blocks; two adjacent sections are on hold and youth
  coaches conditionally want 180 seats. A hold is not confirmation of contiguous seats.
- League and broadcast partner: schedule authority, neither can confirm by noon.
- Player representative: secures each player's agreement; neither player has agreed.
  Basketball operations can staff one line, at most 60 photos with two players.
These are document sources, not conversational characters. Their policies become visible
only after the initial decision and reveal action. No invented rumor or stakeholder
conversation is added merely to satisfy a generic simulation pattern.

## Deliberate uncertainty, not confusing instructions
The policies do not establish approval, a sale, consent or a sellout. Students must name
what to verify, not infer that the app has authorized it. A reasonable person may mistake
a hold for a booking, assume schedule control, or offer every purchaser a player photo.
Do not resolve those missing facts with invented outcomes. Compare evidence and promises.

## Consequential record and debrief
The initial vote survives the update, draft revision, reload and final submission. The
instructor compares two pods' exact initial assumptions, final offer, required approvals,
delivery checks and fallback. The system records a changed letter as a revised commitment;
a retained letter does not imply an unchanged offer. The debrief explicitly asks about this.
Put a pod that changes B to conditional A beside one that retains a carefully bounded C:
**Which promise could a parent rely on, who must agree, and what do you do at noon if they
have not?** The third sample postpones A rather than claiming a completed sale.

## Claude method: adopted and bounded
Read `simkit/AUTHORING_GUIDE.md`, `AUDIT.md`, reference and Shortfall examples, and PR #48's
Investment Committee. Reuse the engine/handler/client and its ledger, scoped information,
retry safety and instructor comparison. Do not copy its investment content or its interface.
Unlike a full lifelike conversation, this is a focused guided case: the shared update is
intentional and preserves the approved worksheet. It is not an independent blind transfer
test, because the builder inspected the previous examples.

## Assumptions for Jeff's review
- One device per pod, no student names, no automated grading.
- Instructor gives the reveal cue verbally. The reveal button is not centrally locked.
- Peer review is in person; app records the challenge, not an inter-pod message exchange.
- Local preview has no shared collection. Shared operation currently requires local dev
  mode; deploying the pages and registering this case in the existing Edge Function needs
  separate authorization and verification. No production change is included.
