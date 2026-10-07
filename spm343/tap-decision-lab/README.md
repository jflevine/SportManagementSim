# SPM 343 Decision Lab 2 — Which esports event should TAP host?

Individual decision lab · 10–15 minutes · 10 points assigned by the instructor.

## Student and review access

- Class: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/
- Ungraded local preview: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/?mode=pilot
- Guest: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/guest/
- Guest preview: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/guest/?mode=pilot
- Private instructor review: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/instructor/

Publication of this revised interface is verified separately in QA.md. The previous synthetic pilot endpoint remains unchanged.

## What students do

1. Read a fictional venue brief: 24 visitors, 12 PC stations, two included hosts, a 90-minute slot, and a $300 incremental budget. All figures are classroom inputs, never claims about TAP’s real capacity or rates
2. Compare Rivalry Mini-Cup ($280, 12 stations), Play & Connect ($180, 10), and Campus Showcase ($240, 8). Save an initial choice and a short position before seeing the registration update
3. Read the new information: 16 visitors are new to gaming PCs and 8 are experienced. The organizer wants supported hands-on participation, while the club still wants a competitive finish
4. Keep or change the proposal, select one adjustment and stakeholder priority, explain adaptation and a risk/response, then explain why the runner-up loses despite its benefit
5. Submit and keep the server-confirmed receipt. The grade remains pending until the instructor evaluates the reasoning

There are three written responses, not a full event plan. A 10-minute orientation replaces main-program time; an extra host costs $75; more rotations reduce uninterrupted play/exhibition time. The app checks the supplied budget, but does not invent outcome scores. Every proposal can earn full credit with defensible reasoning. Keeping the initial proposal can earn full credit too.

All case information is provided by the activity. Andrew’s interview is optional enrichment and has no scoring dependency. The lab can run as one 10–15-minute block; the lecture launch uses a 12-minute block before the guest.

## Rubric: 10 points

- Initial position (2): reasonable choice; relevant venue/audience fact used to justify it
- Event/venue fit (3): feasible final plan; purposeful adjustment; explains how resources support it
- Tradeoff/risk (3): fair runner-up comparison; stakeholder tradeoff; concrete risk with practical response
- Adaptation (2): uses the new information; explains changed/retained decision and consequence

These are manually assigned reasoning points. Validation and completion are not grades. Blank/ungraded is distinct from an instructor-entered 0/10.

## Private instructor workflow

Open the instructor page with the existing OFF SCRIPT / Legal Literacy Check 2 instructor key. The key stays only in tab memory. Class records are the default; isolated synthetic tests require an explicit record-set selection.

Review the initial and final writing, enter four bounded rubric scores and optional private feedback, then choose Save score. The server calculates the total. A student can resume their own attempt to see its grade. CSV exports contain private identity/work and neutralize spreadsheet formula prefixes; keep the downloaded file secure.

Names and La Salle emails are self-reported rather than institutional SSO-verified. Duplicate email attempts are flagged for roster review. No one is emailed. Losing browser data loses self-service resume access; the student should contact the instructor rather than create repeated attempts. No student-record deletion endpoint is provided.

## Guest privacy

The guest view refreshes every 10 seconds while visible. It reads only aggregate stages and structured choices. An individual proposal requires the student’s optional opt-in plus the instructor’s explicit release. Its summary is built solely from selected options. Names, emails, session tokens, grades, comments, and raw written answers are excluded from the guest API. No freeform publication field exists.

The guest URL is a public presentation view, not a confidentiality control. Only the whitelisted anonymous structure is available there. Isolated test records never affect guest counts.

## Saving, recovery, and testing

Live and test attempts have separate storage and scoped random resume sessions. The browser persists the token and exact pending request before transmission. Operations are serialized, version-checked, and idempotent; the initial position and final receipt become immutable. After a conflict, the student can download local writing and explicitly load the current server version. Shared-device cleanup removes only the browser copy, never the server record.

`?mode=pilot` is local practice only. `?mode=test` uses a fixed Synthetic Fixture identity at example.invalid in a separate table; it is for end-to-end checks, not course credit. No real classroom rows are created by tests. Test fixtures are retained without deletion.

Source: `backend-v2/`, `tests-v2/`; the earlier pilot implementation remains in `backend/`. See QA.md for actual test scope and remaining limits.
