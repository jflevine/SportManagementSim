# TAP Decision Lab 2 independent browser QA

`browser_pilot.py` runs end-to-end checks with synthetic data in isolated browser contexts. It intercepts all pilot endpoint calls, so default success validates the browser contract, not production database persistence or production authorization.

## Run

```
python -m pip install playwright==1.57.0
python -m playwright install --with-deps chromium firefox webkit
TAP_BROWSERS=chromium,firefox,webkit python spm343/tap-decision-lab/tests/browser_pilot.py
```

The script starts a local HTTP server rooted at the repository. `TAP_BASE_URL` can supply an existing base such as `http://127.0.0.1:8766/spm343/tap-decision-lab/`. `TAP_BROWSER_EXECUTABLE` optionally selects an installed browser executable. Browser engines default to Chromium; `TAP_BROWSERS` accepts a comma-separated list.

Results, fixture-only downloads, and screenshots go to `TAP_QA_OUTPUT` (default `/tmp/tap-qa`). A failed or blocked check exits nonzero. Results include source hashes and clearly distinguish PASS, FAIL, and BLOCKED.

Live API denial and persistence checks belong in the separate `live-api.mjs` suite. The browser suite does not call the production API: its CORS policy intentionally excludes localhost. Successful private authentication, database persistence, and backend idempotency require separate authorized verification.

## Coverage

- Student field IDs, labels and keyboard focus; default guest opt-out
- Complete draft → locked initial snapshot → reflection → stable local receipt
- Reload at every stage; navigation back/forward; repeated completion attempt
- Positive whole minutes totaling 90; edge allocations and invalid values
- Blocked storage, local download, save retry, and restored draft
- Multi-tab overwrite guard and preservation of the frozen tab's draft
- Student network payload whitelist, no typed text or identity in pilot progress
- Guest text rendering, ignored private properties, stale-view message, recovery
- Instructor bounded integer scores and screening confirmation before release
- Instructor key absent from Web Storage; cleared password field and pagehide/logout lock
- Unauthorized instructor refresh clears private records
- Failed instructor mutation retry retains the exact same request ID and payload
- 390px mobile and 1440px desktop: landing, draft, finished, guest, instructor overflow

## Current local environment limitation

On 2026-10-07 the cloud shell's Chromium launch was blocked by an OS socket restriction (`Operation not permitted`). No local browser pass was claimed. Run in the hosted CI runner to obtain execution results. The script itself passes Python syntax compilation.
