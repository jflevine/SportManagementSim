# Front Office: Triple Threat

A screen-based MGT 340 Week 3 management simulation built around three fictional Forge Sports Group teams.

## Learning design

- **Soccer / Planning:** allocate 10 scarce resource tokens across first team, academy, analytics, facilities, marketing, and scouting.
- **Hockey / Organizing:** define decision authority in a player-availability conflict and choose an operating structure.
- **Basketball / Leading:** respond to a visible coach-star leadership conflict under time pressure.
- **All three sports / Evaluating:** interpret conflicting dashboards, select a corrective-action priority, and choose board-level KPIs.
- **Owner's Challenge:** spend a $15M modernization budget and up to six executive actions, then simulate a season.
- **Reflection:** receive a management profile and identify which decision the student would change with better information.

## Design principles

The simulation is intentionally screen-based rather than an RPG. Every stage asks the student to allocate, decide, prioritize, interpret, or react. Soccer, hockey, and basketball function as distinct management mechanics rather than decorative skins.

The app uses plain HTML/CSS/JavaScript with no external dependencies, no backend, and no student PII requirement. A nickname is sufficient. Current progress is saved locally in the browser so a refresh can recover a run.

## Manual smoke test

1. Enter a name and start.
2. Soccer: allocate exactly 10 tokens and commit.
3. Hockey: select one authority rule and one structure; commit.
4. Basketball: select and lock a leadership response.
5. Evaluation: select one team and exactly three KPIs; submit.
6. Owner challenge: select at least three investments without exceeding $15M; simulate.
7. Confirm the season events render and the final management profile appears.
8. Test Restart and refresh/resume behavior.
9. Check a narrow mobile viewport for reflow.
