# Esports Power Play — Who Controls the Ecosystem?

SPM 343 Week 3 gamified stakeholder simulation based on the lecture deck on esports stakeholders, stakeholder salience, publisher gatekeeping, player welfare, team sustainability, sponsors, investors, broadcasters, governments, fans, and ecosystem fragmentation.

## Learning architecture

1. **Soccer — Build the Passing Network**: students connect stakeholder dependencies and experience publisher gatekeeping.
2. **Hockey — Stakeholder Power Play**: students rate stakeholder claims using power, legitimacy, and urgency, then choose only three response priorities.
3. **Basketball — Atlas Esports Survival Clock**: students select only two strategic moves under a shot clock and see how every revenue choice creates new dependencies.
4. **Evaluation Lab**: students interpret conflicting performance indicators and define what organizational success should mean.
5. **Worlds Crisis Command**: students resolve four simultaneous stakeholder shocks plus two discretionary actions.
6. **Postgame Power Map**: the game visualizes which stakeholders became more powerful because of the student's decisions.

## Design goals

- Decision or consequence every 30–90 seconds.
- Sports metaphors are gameplay mechanics, not merely decorative themes.
- No walking/navigation filler.
- No single universal “correct” management profile at the end.
- Preserve the lecture's core concepts: interdependence, power, legitimacy, urgency, publisher control, revenue dependence, player welfare, stakeholder conflict, and fragmentation.
- No student name/email required. Optional callsign is stored only in browser localStorage.
- No external libraries, remote APIs, database, or authentication.

## Manual smoke test

1. Load the page and start a new run.
2. Soccer: intentionally make one incorrect pass, then complete all six correct passes and the publisher shock.
3. Hockey: rate all five claims, verify only three response-line boxes can be selected, then lock the line.
4. Basketball: choose exactly two plays and submit before the shot clock expires. Repeat once and allow the clock to expire to verify fallback behavior.
5. Evaluation: verify exactly one team and exactly three metrics are required.
6. Finale: verify one answer per crisis and exactly two discretionary moves are required.
7. Run the Worlds simulation and confirm five headlines appear before the Boardroom button.
8. Verify the final stakeholder power map and profile render.
9. Refresh mid-run and confirm browser-local progress resumes at the current stage.
10. Test at narrow mobile width and with sound toggled off.

## Production path

`/spm343/esports-power-play/`
