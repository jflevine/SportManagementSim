# Draft verification — October 5, 2026

## Passed

- All available MGT 340 Node regression tests, including the new client/content and server suites
- Ten questions, three options each, five finance/five legal, one point each, stable q1–q10 ordering
- Public prompt source contains no answer key, correct-option metadata, or post-grade explanations
- Server unit tests: correct/wrong/mixed scoring; client-score tampering; validation; private disabled configuration; body/media limits; atomic uniqueness/races; original-receipt retry; saved-but-lost acknowledgment; private adapter calls; no-grade-before-save
- Eleven additional DOM scenarios with JSDOM 26.1.0, the real public prompts, the separately held private rubric, a memory-only store, and synthetic identities:
  - Preview completes without identity, POST, or grade
  - Correct/wrong/mixed submissions yield 10/10, 0/10, and 5/10 after the memory server saves
  - Selected answers survive reconstructed refresh and browser-history events
  - Lost acknowledgment, locked answers, reconstructed refresh, same-payload retry, one saved receipt
  - Repeated submit clicks issue one request
  - A different attempt with the same email returns a generic conflict, with no grade disclosure
  - Blocked recovery storage sends zero POSTs and focuses the error
  - Pre-submit identity editing preserves answers
  - Download failure offers text; failed local removal does not claim success
- JavaScript syntax and whitespace checks

The DOM harness is held outside the public repository because its grading fixture uses the private rubric. It did not perform network or database writes. All records existed only in memory and disappeared when the test process ended.

## Not yet verified

- Actual Chromium layout, mobile rendering, keyboard navigation, or real-browser history/refresh
- A deployed PostgreSQL schema/RLS policy, hosted Edge Function, production receipt, or real instructor export

The installed cloud Chromium process was blocked by its required Unix socket permissions, including the approved escalated launch. The managed cloud browser rejected the localhost preview and supports only HTTP(S), so a self-contained data-URL preview was also unavailable. No browser result is claimed from those failed attempts.

## Before opening to students

After separate deployment approval, verify the hosted page at desktop and 390px/320px widths, keyboard-only navigation, mobile overflow, each question/review/result screen, refresh/back/repeated-submit behavior, failed network/retry, copy/download fallbacks, and official feedback. Run controlled synthetic end-to-end 10/10, 0/10, and mixed attempts through the approved backend, verify private storage/role denials, and clean those exact synthetic records without touching student records. Do not call the graded check ready until this succeeds.
