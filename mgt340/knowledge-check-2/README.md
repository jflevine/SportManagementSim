# Rivalry Night: Ready to Open

MGT 340 Knowledge Check 2: a simple, individual, ten-minute finance/legal check in one fictional basketball-event story. Ten three-choice questions, one point each, with five finance and five legal points. There is no countdown, economy, leaderboard, branching penalty, or bonus score.

## Student and pilot versions

The student page uses the approved private KC2 submission endpoint in `config.js`. First/last name and La Salle email are collected only for an official attempt. A matching server receipt confirms a saved grade.

Open the same URL with `?pilot=1` to try all ten story decisions without collecting identity, sending responses, or creating a student record. Pilot mode is clearly labeled, uses separate browser-tab recovery, and issues no grade. It includes a link back to the student version.

The backend source under `backend/` retains disabled public defaults. The approved deployment receives the real rubric privately; no answer key is present in this repository. See `VERIFICATION.md` for checks and any remaining release verification.

## Student experience

- A short role/story briefing and a restrained event scene
- A chronological story: Monday budget briefing, midweek funding/equipment, Friday team coordination, Saturday walkthrough/early entry, sponsorship check-in, and a late participation dispute before tipoff
- Brief stage labels and connective sentences link each item; Q2 plans a future postgame report without moving the story past the game
- One question at a time, with native keyboard-accessible radio controls
- Back and review controls allow revisions until final submission
- A final review shows every selected answer before submission
- Live mode collects first/last name and La Salle email, as KC1 did; identity is explicitly self-reported, not authenticated
- Once submission begins, the answers and random attempt ID are frozen
- A server-confirmed receipt shows total /10 and finance/legal /5, followed by explanations
- Failed or uncertain saves retain the original attempt for retry; no success is claimed without a matching server receipt
- Downloadable and copyable response backups clearly distinguish unconfirmed work from an official receipt
- Refresh/back recovery uses this tab's session storage; no long-lived local-storage record is created
- If a locked retry snapshot cannot be persisted, the app sends no new submission request and offers a backup instead

Close the tab or clear the browser copy on a shared device. Clearing the browser copy never deletes an instructor record. The instructor's private server record is authoritative, not a downloaded or copied receipt alone.

## Course alignment

Questions are based on the actual course finance and legal lecture decks and the provided Introduction to Sport Management chapter readings. Finance covers profit, financial statements, loan financing, simple expected annual ROI, and opponents' joint production of sport. Legal covers D.I.M., negligence issue recognition, agency, consideration, and injunctive relief. A separate private instructor key records the exact chapter/PPT source mapping and wording caveats; it must not be committed here.

The finance reading and lecture were both checked. The latest accessible legal lecture was the September 26 deck; the located September 28 revision could not be read. The supplied legal chapter scan omits printed pages 89–90, so the negligence item is limited to issue recognition supported by the accessible material. It does not ask students to recite unseen elements or decide liability.

## Run and test

No frontend dependencies or build step are required. Serve the repository with a static HTTP server and open `/mgt340/knowledge-check-2/`.

```sh
python -m http.server 8000
node --test mgt340/knowledge-check-2/tests/*.mjs
```

Full available MGT 340 model regression checks:

```sh
node --test mgt340/*/tests/*.mjs mgt340/*/tests/*.cjs
```

Backend unit tests use memory stores and mocked requests only. They are not proof of deployed PostgreSQL permissions, production availability, or live browser submission. No student records are read by this test suite.

## Story continuity refinement

The same Forge Arena/River City/Northside event now builds visibly toward tipoff. Jordan connects the agency and sponsorship-exchange items, and the final participation dispute threatens the matchup introduced at the start. Narrative transitions add about 124 words. Assessed stems, options, IDs, points, and the private rubric are unchanged; no new calculation, branching outcome, or dependent scoring was added. The funding and equipment proposals are not asserted to be the same transaction; the injury report does not establish liability or claim that an earlier answer caused it; the court request has no promised outcome.
