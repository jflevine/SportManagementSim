# Gate Rush

A self-contained event-management game for MGT 340. Pods rehearse registration for the fictional North Philly 3×3 Community Cup, then replay the identical arrivals to test a staffing change. It applies registration, volunteer coordination, the run of show, and event evaluation.

## Classroom route

One shared device per pod of 3–4. Allow 15 minutes:

- 2 minutes: explain the two service routes and assign pod roles
- 5 minutes: first rehearsal, rotating the staffing decision
- 5 minutes: agree on a change and replay
- 3 minutes: compare results and prepare a 20-second operations handoff

Each click advances five simulated minutes. There is no real-time countdown and no speed bonus. Pause and reduced motion are available. A separate whole-class debrief can follow.

## Rules

There are 24 team-captain transactions, three trained volunteers, and six windows from 08:30 to 09:00. One volunteer stays on each independent service route. The player assigns the third before each window.

- Routine check-in: 2 teams per volunteer per window
- Assisted check-in: 1 team per volunteer per window
- Assistance means roster, payment, or non-digital questions; it is not a proxy for disability
- Required safety provision and basic accessibility remain protected
- New arrivals join before service, and each route serves first arrivals first
- A volunteer’s unused capacity does not transfer to the other route within a window
- The final queue remains unresolved at 09:00; nobody is discarded from the model

| Window | Routine arrivals | Assisted arrivals |
|---|---:|---:|
| 08:30–08:35 | 4 | 0 |
| 08:35–08:40 | 0 | 3 |
| 08:40–08:45 | 6 | 0 |
| 08:45–08:50 | 2 | 3 |
| 08:50–08:55 | 6 | 0 |
| 08:55–09:00 | 0 | 0 |

Compare actual teams checked in out of 24 first, then accumulated queue delay. Every team remaining after a window adds 5 **modeled waiting-team-minutes**. This discrete measure excludes service time and includes delay accrued by unfinished teams. Separate route totals make service tradeoffs visible. Rates and arrivals are fictional teaching assumptions, not staffing or safety standards.

## Guide, results, and storage

- Student game: `index.html`
- Public instructor guide: `index.html?guide=1` (or `?guide=1` on the published directory URL)
- No authentication, backend, analytics, external requests, or dependencies
- Optional pod alias, decisions, and notes save only in browser local storage under `mgt340.gate-rush.v1`
- The game continues if local storage is unavailable and explains the limitation
- A confirmed restart clears the current local rehearsal
- A plain-text result download includes both runs, the six decisions, route outcomes, and debrief notes
- Nothing is submitted automatically; an instructor must provide a separate collection channel if needed

## Run locally

Open `index.html` directly in a browser, or serve the directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` and `http://localhost:8000/?guide=1`.

## Tests

Node 18 or newer, no packages required:

```sh
node model.test.cjs
```

The tests load the exact embedded model from `index.html`, check known outcomes, enumerate all 64 permitted staffing sequences, and check conservation, capacities, FIFO behavior, queue-delay accounting, nonmutation, invalid moves, and deterministic replay at every window. They also syntax-check both embedded scripts and assert no remote assets or network API calls.

Useful checked outcomes, with each sequence stating the routine volunteer count in the six windows:

| Routine staffing sequence | Ready at 09:00 | Total queue delay | Routine delay | Assisted delay |
|---|---:|---:|---:|---:|
| 2, 2, 2, 2, 2, 2 | 23 | 65 | 20 | 45 |
| 2, 1, 2, 2, 2, 1 | 24 | 40 | 20 | 20 |
| 2, 1, 2, 1, 2, 2 | 24 | 50 | 40 | 10 |

All delays are modeled waiting-team-minutes. The third sequence shows why a smaller combined total does not fully describe each route’s experience.

Manual UI checks before release: keyboard and touch controls, first run and replay, guide, reload/resume, blocked/corrupt storage, pause/resume, download, restart cancellation/confirmation, and mobile horizontal overflow.

## Reading alignment

Michael Clemons and Ashley Dabb, supplied Chapter 14, *Event Management*: operations and event script (printed p. 310), registration (p. 311), volunteers (pp. 311–312), and planning/evaluation concepts. The simulation model is an instructor-created teaching extension.
