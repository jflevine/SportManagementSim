# Signal Leak — SPM370

Isolated release: existing simulations and shared simkit function unchanged. Fictional adult-only collegiate esports safeguarding scenario. The paper-specific governance debrief is not included pending Jeff’s approval.

## Access and collection
Student page: `https://jflevine.github.io/SportManagementSim/spm370/signal-leak/`
Local-only practice: append `?practice=1`. Synthetic shared-backend QA: append `?qa=1`.
Instructor: `instructor.html`, using the existing private simkit instructor key. Never put that key in a URL or student materials. Course aliases are self-reported, not verified identities. Jeff must tell students an alias convention he can match; do not enter real residence information or sensitive details.

Server saves decisions and final handoff in the existing protected simkit tables through the separate `signal-leak` Edge Function. Prepared responses only, no AI API calls. Final submit produces a run-ID receipt. Download is a backup, not submission. No auto-grade, LMS sync, invented deadline or points. Instructor review filters SPM370-THURSDAY; QA filters SIGNAL-QA. The existing instructor key has not been changed.

## Classroom plan
30-minute live orientation then roughly 20–25 minutes individual response; estimates, not student timing. Remote students have the same complete orientation. Read the records, distinguish questions from actions, review both later updates, and write one 200–300-word three-part handoff. Check uncertainty, proportionate protection, authority, selective disclosure and follow-up. Provide equivalent alternative if technical or accessibility barriers arise.

## Verification limits
93 source snapshot tests passed before release adaptation. Live endpoint verification is recorded separately. Real browser/mobile/keyboard verification remains blocked by execution environment socket restrictions. Actual instructor login remains unverified because its existing key is not available to this task. Do not describe this as fully classroom-tested.

## Maintenance
All activity files are isolated under this path. `engine/` is a preserved copy of the authored simkit runtime, not a change to other applications. `backend/index.ts` and its imports are deployed as a bundled Edge Function using existing tables and unchanged row-level security. No browser database grants or secret keys are exposed.
