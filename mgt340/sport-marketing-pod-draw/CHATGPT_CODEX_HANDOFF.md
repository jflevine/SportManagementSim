# Handoff: MGT 340 Sport Marketing Pod Draw

Use this brief with ChatGPT or Codex when maintaining this activity.

## What this is

`index.html` is a finished, working, single-file static web app deployed with GitHub Pages. It needs no build step, framework, backend, database, or API keys.

## Constraints

- **Keep it one self-contained file.** Do not convert it to React, Next.js, or Vite, and do not add a backend unless the product requirements materially change.
- **Keep the draws deterministic.** `drawFor(code, idx)` must return the same draw for the same code and pod index. The projector and the students' phones depend on this.
- **Keep student data local.** Do not add analytics, tracking, or anything that sends student input off the device without an explicit product decision and privacy review.
- **Keep scenario content in the `EVENTS` array.** New events must use the same object shape. Only add facts that can be verified, and include source links.
- **Preserve accessibility and theming.** Keep visible focus states, `prefers-reduced-motion` handling, and the light/dark theme tokens.

## Architecture

- `EVENTS`, `MOTIVES`, `LOCKS`, `BUDGETS`, `TIMELINES`, and `GLOBAL_CURVES` hold the content pools.
- `hashStr` and `rng` form a seeded PRNG. The session code sets the event order and role offsets. The code plus the pod letter sets each pod's variables.
- There are three views:
  - `#roomView`: instructor/projector
  - `#podView`: a pod's brief and worksheet
  - `#joinView`: the student code entry screen
- URL hash parameters: `code`, `pods`, `pod`, `join`.
- The timer counts down from `Date.now()`.
- Answers are saved to localStorage under the key `mgt340-poddraw:<code>:<pod>`.

## Current deployment

- Instructor/projector: `https://jflevine.github.io/SportManagementSim/mgt340/sport-marketing-pod-draw/`
- Student join: `https://jflevine.github.io/SportManagementSim/mgt340/sport-marketing-pod-draw/#join=1`

## Possible next tasks (only if requested)

1. Add a way to load `EVENTS` from a separate `events.json`, so scenarios can be swapped without touching the code.
2. Add a printable one-page brief per pod.
3. Add an instructor-only "reveal all briefs" print view.
4. Add a reusable scenario schema only after multiple classroom apps demonstrate the same pattern.
