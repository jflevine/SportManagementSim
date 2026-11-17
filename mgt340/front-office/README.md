# The Front Office: Game-Day Decisions

**Prototype, not deployed or classroom-signed-off.** Existing activities remain untouched.
Three students act as a professional basketball club's ticketing, game operations and
basketball operations team. Sources are Jeff's revised November 17 arena materials:
- [Student worksheet](https://drive.google.com/file/d/1hGl6BAcmn5xcoWjycIwFBcv_pJ8aVRq4/view)
- [Withheld staff update](https://drive.google.com/file/d/1KRQLnXQNVBEV7DJAK-vavROH8DeK3sxc/view)
- [Instructor guide](https://drive.google.com/file/d/1eA6NKk0gH0tXMNdCvT9dZNL_4M034wL6/view)
- [Final Tuesday deck, slides 30–34](https://docs.google.com/presentation/d/1RkNLngmiv3CLkZ24AY2WeRcQJW704TvZO0Rjme8WWrI/edit)

The clearer worksheet wording takes priority over slide 32's ambiguous “volunteers”: two
players could participate, neither has agreed; operations staff are separate.

## Run locally (Node 20+; no dependencies or API keys)
From repository root:
```
PORT=8797 node simkit/dev-server.mjs
```
Do not set `OPENAI_API_KEY` for this activity; it does not need AI. Open:
- `http://localhost:8797/mgt340/front-office/?dev`
- `http://localhost:8797/mgt340/front-office/instructor.html?dev` (key: `dev`)

Use fictional pod labels and a shared test class code. The local development server stores
records in memory, so **restarting it clears them**. This is not a production server.

Without `?dev`, both pages run in browser-local preview mode. Decisions persist on reload,
but **only in that browser**. There is no automatic cross-device collection. The instructor
can create clearly labeled fictional sample pods. Separate tabs may need a manual refresh.
A student can download a token-free JSON decision record. This is an export, not submission
to Canvas or to the instructor. Do not collect student names in test mode.

## Facilitation
1. Assign three perspectives. Initial choice + assumption + expected approver (3 min).
2. Tally first votes. Tell everyone to click the reveal button, then read policies (2 min).
3. Draft offer, evidence, approval, delivery checks, fallback and retention measure (4 min).
4. Show neighboring pod the screen. Record the parent-perspective challenge, revise (4 min).
5. Submit and prepare 20-second pitch (2 min). Debrief separately. Exit slip stays on paper.

Initial records are immutable within the normal run, not tamper-proof assessments. This
preview ships case source to the browser; a determined student can inspect future content
or reset browser storage. The instructor cue is an honor-system stage control, not a global
release lock. These are explicit prototype limits, not security guarantees.

## What is tested
- All `node --test simkit/checks/*.test.mjs`: **83 passed, 0 failed** on Node 24.22.1.
- Includes 8 generic arena checks and 5 arena-specific checks: initial gate/immutability,
  separate reveal, form validation, conditional/postponed recommendation, retry/refresh,
  different sample paths, and instructor retrieval of the same outcome.
- Source module syntax checks passed.
- Browser test script provided in `simkit/checks/front-office-browser.py`, **not completed**:
  Chromium cannot create its local socket in this execution environment, including the
  approved escalation attempt. The separate cloud browser could not reach the local server.
  Therefore no claim of visual, keyboard, phone layout or browser end-to-end validation.

## Before classroom deployment
Complete the browser script and a manual keyboard/phone review. Confirm student submission
appears in the instructor view from a separate device and that refresh/retry works. Decide
whether a centrally controlled reveal is needed. Register the case in a separately approved
Edge Function deployment, configure its endpoint and publish a separately approved preview
or GitHub Pages change. Verify the deployed commit and the full production path. Do not
merge simply to preview: Pages follows main. Retain the revised paper activity as fallback.

## Files
- `casefile.mjs`: exact fictional policies, state transitions, lenses, scripted sample pods
- `app.mjs` / `index.html`: student offer builder, local unsent-text recovery, record export
- `instructor.mjs` / `instructor.html`: class-filtered board and two-pod comparison
- `config.mjs`: intentionally no production endpoint
- `styles.css`: responsive layout, large controls, focus indicators
- `DESIGN_NOTE.md`: conceptualization and explicit differences from a lifelike AI conversation
