# Decision Lab 2 live-release verification

October 7, 2026. Revised self-contained events-and-venues decision lab.

## Completed before browser CI

- 18 source/content checks passed: three responses, native labels, locked new-information stage, character caps, optional sharing, supplied resource tradeoffs, and no guest dependency
- 12 independent handler/protocol/security tests passed
- 9 deployed API groups passed using three retained, isolated synthetic attempts: Cup/orientation, Open/extra host, Showcase/rotations
- Real PostgreSQL rollback checks verified seven storage/review/publication transitions, immutable initial snapshot, stable receipt replay, grade null versus zero, and test exclusion
- New live/test/operations/guest-projection tables enforce RLS and FORCE RLS; browser roles have no direct privileges. RPCs are security invoker with empty search paths and no browser execution privilege
- The old synthetic pilot endpoint is unchanged
- Existing instructor verification was reused without retrieving a raw key or creating credentials

## Browser release gate

Local Chromium cannot create sockets in this execution environment. No local runtime/layout pass is claimed. The portable hosted suite runs against the exact release commit with Chromium, Firefox, and WebKit, using synthetic fixtures for student/instructor UI and a separate deployed test-mode API smoke check.

The suite exercises identity validation, unknown-success/retry, serialized saving, interrupted/offline edits, immutable initial position, budget constraints, repeated submit/receipt, explicit conflict reconciliation, grade zero versus pending, instructor score/release controls, CSV safety, guest privacy, keyboard labels, and mobile/desktop layouts. Full hosted run [37684074430](https://github.com/jflevine/SportManagementSim/actions/runs/37684074430) passed all 60 browser scenarios (20 per engine), 12 backend tests, 18 static checks, and deployed synthetic API checks on commit ccd1f0252a420447d87a671e60c6a16f0d1d17c6. Mobile/desktop screenshot pixels were inspected. Visual review then clarified that the fictional 27-person total occupancy includes 24 visitors and up to three staff, and simplified the program-time display to avoid double-counting arrival/closing. A final rerun verifies those small display changes before publication.

## Remaining limits

- Actual valid-key instructor browser login requires the instructor’s existing key; no real key was retrieved or used in QA
- Self-reported student identity is not institutional email verification
- No physical-device, screen-reader, campus-network, or first-time-student trial is claimed
- 10–15 minutes is a designed scope, not a measured classroom timing result
- Guest summaries are selected-option summaries, not students’ free-text explanations
