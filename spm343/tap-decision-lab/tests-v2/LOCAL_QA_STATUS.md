# Independent release verification · October 7, 2026

## Executed

- **12/12 backend protocol/security tests passed**, using the real v2 handler and an independent in-memory store. Includes capability binding, exact replay, lost-ack start, state/CAS boundaries, budget limits, instructor-only manual zero with student resume/replay redaction, safe publication and test/live segregation
- **9/9 deployed API smoke checks passed**, using only the fixed Synthetic Fixture identity in mode=test. The latest v2.0.1 run retained three additional test attempts (six across both manual smoke runs); they completed all three defensible final formats. Live guest aggregates and released proposals were unchanged. See `local-evidence/live-api-results.json` for IDs and receipts
- **18/18 source checks passed**, including exactly three responses, matching backend caps, required labels and identifiers, default opt-out, hidden update stage and self-contained teaching structure
- Student, guest, instructor and live-smoke JavaScript passed syntax checks. Browser Python passed compilation. The independent browser fixture passed a direct synthetic lifecycle/replay self-check

## Browser execution is blocked locally

The portable suite contains **20 scenarios per engine**, supports Chromium/Firefox/WebKit, starts its own local server, writes JSON/screenshots and exits nonzero on failures or blockers. The local Chromium launch was attempted and exited with `socket() failed: Operation not permitted`. No browser-interaction, browser-layout or screenshot pass is claimed. The first hosted sweep passed 57/60 checks; three failures were the same overly narrow storage-status wording assertion. The UI title was clarified. The final privacy-narrowed source still requires its hosted rerun and pixel review against the exact release commit before treating that gate as passed.

## Findings resolved during source review

- Textarea caps were aligned to the backend's 1,800-character limit
- Structured-summary event names were aligned to the student cards
- Student responses, exact replays, receipts and exports now expose review status only; numeric grades/private feedback remain instructor-only
- Stale-version recovery gained an explicit confirmed “Load saved server version” action, preserving the local export before reconciliation

## Remaining limits

Successful authentication with the instructor's actual existing key is not verified by these tests. Browser instructor checks use a fake key and synthetic fixtures. PostgreSQL rollback/atomicity checks are owned by the backend implementation's separate SQL verification, not the in-memory suite. No real student identities or live-mode attempts were written by the deployed smoke; no records were deleted. A 10–15 minute duration is a design estimate until a first-time-student pilot.
