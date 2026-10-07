# TAP Decision Lab 2 pilot verification

Date: October 7, 2026. Scope: instructor-review pilot only.

## Backend checks completed

- 24 automated unit/security tests passed
- 20 deployed HTTP smoke checks passed against `spm343-tap-lab2`
- Real-student start/resume/save/lock/submit routes each reject with `LIVE_DISABLED`
- Missing/wrong instructor keys cannot list, grade, release, or create private fixture records
- Public demonstration accepts only two format values and three stage values; extra identity, text, or identifier fields are rejected
- Public save → guest read matched draft, plan-locked, and completed states across independent requests
- Identical enum retries preserved the same server timestamp
- Guest payload whitelist contained no names, emails, IDs, grades, receipts, comments, or raw answers
- PostgreSQL transaction test verified atomic start/save/lock/revision/submit, unchanged initial snapshot, immutable final receipt, exact retry, manual grade, and separate publication; fixture transaction rolled back
- All four new tables have ENABLE and FORCE RLS; browser roles have no table privileges; all three new RPCs are service-role-only, security-invoker, and use an empty search path
- Security advisor findings for these resources are informational no-policy notices, intentional for tables with no browser-role privileges
- No existing course records were read, altered, or removed; no credentials created or changed

## Browser checks

The local sandbox could not launch a browser because socket creation was unavailable. No local browser pass is claimed. The portable deterministic suite runs on a GitHub-hosted runner with pinned Playwright 1.57.0 and Chromium, Firefox, and WebKit. It covers desktop/mobile layout, labels, complete student flow, reload and history, original-plan retention, repeated completion, blocked storage/download/retry, multi-tab conflicts, enum-only guest updates, guest XSS/privacy/stale recovery, and private instructor scoring/release controls.

The instructor success-path browser tests use synthetic fixtures and a mock key. Real deployed access-denial and database operations are verified separately. No actual valid instructor key was accessed; the instructor must confirm successful login with the existing OFF SCRIPT / Legal Literacy Check 2 key.

Hosted verification passed: [TAP pilot QA run 37629471680](https://github.com/jflevine/SportManagementSim/actions/runs/37629471680), tested commit `b97a5e842d983fd5adf9f4be70357760ae0655af`. All 30 browser cases passed (10 cases in each engine), including 390px and 1440px layouts, with zero failed or blocked cases. The same run passed all 24 backend tests and the live synthetic API loop. Screenshot artifacts are attached to that run. An earlier run identified long-text overflow in the mobile private view; wrapping was corrected and verified in all three engines.

The deployment targets are listed in README.md. GitHub Pages publication is a separate build from this QA run.

## Remaining limits

- This is not a live classroom collection system. Student answers stay on-device and real submission routes are disabled
- The shared public demo is one synthetic record; other testers can overwrite it. It does not represent actual enrollment or attendance
- Guest free-text example content is fixed synthetic copy, not student typing
- Physical phone/tablet, assistive-technology screen reader, campus Wi-Fi, and first-time student trial remain unverified
- Course launch requires a reviewed real-student identity/submission implementation and a practical screened/opt-in guest text workflow
