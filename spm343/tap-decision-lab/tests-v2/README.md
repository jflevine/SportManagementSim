# TAP Lab 2 live release: independent verification

These suites use the fixed invented Synthetic Fixture / `tap-v2@example.invalid` identity and fake instructor keys only. They do not need or print a real instructor key. Browser requests to the production API are intercepted by deterministic fixtures. The separate live API smoke is opt-in and creates **mode=test** attempts only; those records stay segregated and are not deleted.

## Independent backend/source checks

```sh
node --test spm343/tap-decision-lab/tests-v2/backend-independent.test.mjs
python spm343/tap-decision-lab/tests-v2/static-review.py
```

The Node suite uses the real v2 handler with an independent in-memory store. It proves request/state-machine behavior, not PostgreSQL atomicity. `TAP_BACKEND_DIR` can point to a staging source directory; the default is `backend-v2/`. Source-only checks never stand in for browser interaction or layout checks.

## Portable browser suite

```sh
python -m pip install playwright==1.57.0
python -m playwright install --with-deps chromium firefox webkit
TAP_BROWSERS=chromium,firefox,webkit TAP_QA_OUTPUT=tap-v2-qa-results \
  python spm343/tap-decision-lab/tests-v2/browser_live.py
```

The suite starts a local HTTP server rooted at the checkout. `TAP_BASE_URL` can supply an already running local server. `TAP_BROWSER_EXECUTABLE` is optional and is intended for a single selected engine. Output includes source hashes, every assertion result, failure traces and mobile/desktop screenshots. A failed or blocked check exits nonzero. Runtime checks that cannot execute are **BLOCKED**, never passed by source inspection.

## Deployed test-mode API smoke

```sh
TAP_LIVE_API_TEST=1 TAP_QA_OUTPUT=tap-v2-qa-results \
  node spm343/tap-decision-lab/tests-v2/live-api.mjs
```

The default URL is the v2 function; `TAP_API_ENDPOINT` can override it. Opt-in is mandatory because this persists synthetic test attempts. Every student write includes `mode: "test"`; synthetic rows are retained and identified in the JSON report. Tokens are not emitted. This verifies real durable test-mode behavior and public privacy, not successful instructor authentication.

## Release coverage

- A 10–15 minute individual task with exactly three short-response textareas, first/last name and university email in live mode
- Initial position and rationale locked before the visitor update appears, then immutable on reload and browser navigation
- A final choice/adjustment, stakeholder risk and runner-up tradeoff with manual grading out of 10
- All three proposals can be defended within $300 with valid adjustments; Cup plus host ($355) and Showcase plus host ($315) are rejected; Open plus host ($255) is accepted
- Unknown-outcome start retry, autosave queue edits, lost acknowledgements, offline recovery, storage failure and pending-state reload
- Exact request-ID and payload replay, version conflicts, duplicate final submission and durable receipt resume
- Pending grade is distinct from an actual 0/10; bounded integer instructor criteria are 2/3/3/2
- Default opt-out, private identity/answers/grades, safe-template release, guest markup rendered as text
- Pilot remains browser-local; mobile 390px and desktop 1440px, keyboard entry, accessible labels and no horizontal overflow

## Explicit limits

A mocked instructor success path does not prove the real instructor's key works. No real student records, physical devices, campus network, assistive-technology user testing, or timed first-time-student trial are included. An empty or successful test output does not substitute for running the suites against the exact release commit.
