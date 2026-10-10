# Arena Turnaround

A self-contained, browser-only facility management game for MGT 340 at La Salle University. Self-selected pods of 3–4 use one device to convert a fictional arena from a concert to basketball before a protected tenant handover.

- Student game: https://jflevine.github.io/SportManagementSim/mgt340/arena-turnaround/
- Public instructor guide: https://jflevine.github.io/SportManagementSim/mgt340/arena-turnaround/?guide=1
- Goal: understand how linked conversion tasks and verified handover consume calendar capacity.

## Fifteen-minute class route

| Minutes | Activity |
|---|---|
| 0–2 | Read instructions and assign operator, scheduler, challenger, and optional cost recorder |
| 2–7 | Play the standard rehearsal and inspect its causal feedback |
| 7–11 | Rotate the operator and replay the same workload to improve the schedule |
| 11–15 | Compare like scenarios, explain the bottleneck, and report readiness time and contribution |

The optional stretch challenge adds two floor-conversion crew-hours. It is clearly labeled as a different scenario and is for early finishers or later practice. The primary replay uses the same workload.

## Simulation rules

All values are invented classroom assumptions, not a real venue staffing plan, safety specification, or cost forecast.

- Work starts Saturday at **00:00**. The tenant needs the venue at **07:00**.
- Three trained crews are available each hour. A crew completes one crew-hour of work per hour.
- A task can use no more than two crews at once. Crews can be idle. Completed work and dependencies become available at the next hour boundary.
- Load-out requires **4 crew-hours**.
- Floor conversion requires **6 crew-hours** in standard rehearsal, **8** in stretch. It starts only after load-out finishes.
- Guest-area reset requires **4 crew-hours** and can run alongside other work.
- An authorized venue lead then completes **one full additional hour of required inspection and sign-off**, after every task finishes. The game has no early-opening or inspection-bypass option.
- The base **$5,000 event contribution** already subtracts scheduled staffing, conversion, staffed inspection, and required services through 07:00. Finishing earlier does not refund contracted costs.
- Each hour past 07:00 adds **$600 incremental overtime**, deducted once: `contribution = 5000 − max(0, current_hour − 7) × 600`.
- Contribution is not annual profit. Annual fixed costs and wider tenant-delay impacts are outside the model.
- If inspection has not completed by noon, the run stops **unready**. Any displayed money is a contribution estimate at the stop, not a successful handover.

There is no arbitrary composite score: readiness comes first, then contribution, then readiness buffer. Identical choices produce identical outcomes.

### Useful reference outcomes

| Schedule | Ready | Contribution | Meaning |
|---|---:|---:|---|
| Efficient standard | 06:00 | $5,000 | One-hour readiness buffer |
| Standard with one extra idle hour | 07:00 | $5,000 | On time, no buffer |
| Standard with two extra idle hours | 08:00 | $4,400 | One hour late |
| Efficient stretch | 07:00 | $5,000 | On time, different workload |

The efficient standard uses load-out 2 / reset 1 for two hours, then floor 2 / reset 1 for two hours, floor 2 for one hour, and the required inspection hour. A spare crew in the last conversion hour cannot break the two-crew task limit.

## Accessibility and data

- Keyboard and touch buttons; no drag-and-drop, real-time countdown, or account required.
- Responsive layout, visible focus states, labeled controls, progress indicators, live announcements, and reduced-motion support.
- Optional made-up pod alias. No personal information is required.
- No external assets, libraries, analytics, API calls, or network requests.
- Guarded local storage uses the namespace `jflevine_mgt340_arena_turnaround_v1`.
- Saved state is replay-validated before resumption. A fresh pod can reset with confirmation; a current run can restart without deleting completed history.
- The last 12 completed runs and the current reflection stay in the current browser. They do not form a shared class leaderboard.
- Downloaded text results include the run assignments, readiness, overtime, contribution, and latest optional reflection. **Nothing is centrally submitted; instructors cannot pull student scores from this game.**

## Run locally

Open `index.html` directly in a browser, or serve this directory with a standard static server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. The public facilitation guide is at `?guide=1`. No build or package installation is required.

## Tests

With Node.js available, run:

```sh
node tests.mjs
```

The dependency-free test suite extracts the actual embedded model and checks the required inspection, sequencing, crew and work limits, deadline boundaries, late costs, noon stop, stretch rules, state replay validation, and immutability. An exhaustive reachable-state search independently verifies the 06:00 and 07:00 lower-bound optima. A packaging check verifies self-contained HTML and script parsing.

The browser UI is separate from the pure model, exposed as `window.ArenaTurnaroundEngine` for inspection and testing. No testing backdoor bypasses the student controls or affects scoring.
