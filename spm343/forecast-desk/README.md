# Forecast Desk 2026 — SPM 343

Review draft. An isolated, anonymous, ungraded scenario companion to Knowledge Check 6. Canvas handles graded answers. This directory contains no assessment answer key, student identity field, backend or network calls. Nothing in this PR changes existing activities.

## Run
Open `index.html` directly, or serve the repository with `python3 -m http.server 8000` and open `/spm343/forecast-desk/`. No build or dependencies. GitHub source/PR URLs are not playable student URLs. No public release is authorized by this draft PR.

## Student flow
Read STUDENT.md. Three fictional rounds: technology, audience and safeguards. Choose an initial path, write a reason, reveal a development, then revise or defend the plan. Draft a final trend/segment/need/pilot recommendation and download a readable text memo. There is no best-path score, timer, lives or leaderboard. This is planning for the same final Canvas response, not an extra essay. No login or identifying details.

## Instructor setup and review
Read INSTRUCTOR.md. The chapter's 2020 forecasts are ideas to test, not verified current facts. All operational scenario details are fictional. Do not infer that game completion demonstrates knowledge or earns credit. The Canvas quiz and its key remain private and separate. Points, attempts, deadline and Canvas destination must be confirmed before assigning. No QR or student URL is promised until an authorized merge/deployment is verified.

## Data
Only localStorage key `spm343-forecast-desk-v1`. Browser reload restores a valid draft, invalid shapes are sanitized, blocked storage permits in-memory work and text download. No cloud synchronization or instructor retrieval. Clear this browser's draft requires confirmation and only removes this activity's key. On shared devices download first, then clear. Downloads are ordinary UTF-8 text, not submission receipts. No names/emails/IDs should be typed.

## Editing and tests
Scenario text is the `rounds` constant in `index.html`; the final prompt is in the memo-render branch. No build step. Keep all content and notes export text escaped; retain the local-only warnings and storage namespace.

Run `node --test spm343/forecast-desk/tests/model.test.cjs` from repository root. See VERIFICATION.md for actual test coverage and limitations. No repository-wide aggregate runner or AGENTS.md was present in the inspected default-branch tree. Existing course activity conventions are static isolated directories with READMEs and scoped tests.
