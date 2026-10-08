# SPM 343 Decision Lab 2 — Which esports event should TAP host?

Individual decision brief · 25–30 minutes · about 220–320 words · 10 points assigned by the instructor.

## Student and review access

- Class: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/
- Ungraded local preview: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/?mode=pilot
- Guest: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/guest/
- Guest preview: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/guest/?mode=pilot
- Private instructor review: https://jflevine.github.io/SportManagementSim/spm343/tap-decision-lab/instructor/

The October 8 clarity revision adds explicit case parameters, complete operating schedules, a substantial individual brief, and authenticated access to each student’s own reviewed grade. Verification is recorded in QA.md. The prior pilot endpoint remains unchanged.

## What students do

1. Read a fictional venue brief: 24 visitors, 12 PC stations, two included hosts, a 90-minute slot, and a $300 incremental budget. The total occupancy limit is 27 people, including up to three staff; the off-station area has 16 visitor places. All figures are classroom inputs, never claims about TAP’s real capacity or rates
2. Compare Rivalry Mini-Cup ($280, 12 stations), Play & Connect ($180, 10), and Campus Showcase ($240, 8). Save an initial choice and a short position before seeing the registration update
3. Read the new information: 16 visitors are new to gaming PCs and 8 are experienced. The organizer requires at least 15 minutes of supported hands-on play for each visitor, while the club still wants a competitive finish
4. Keep or change the proposal, select one adjustment and stakeholder priority, explain adaptation and a risk/response, then explain why the runner-up loses despite its benefit
5. Submit and keep the server-confirmed receipt. The grade remains pending until the instructor evaluates the reasoning

There are three written responses, not a full event plan. A 10-minute orientation replaces main-program time; an extra host costs $75; coaching uses the first 5 minutes of each group’s playing turn and reduces independent playing time. The app checks the supplied budget, but does not invent outcome scores. Every proposal can earn full credit with defensible reasoning. Keeping the initial proposal can earn full credit too.

All case information is provided by the activity. Andrew’s interview is optional enrichment and has no scoring dependency. Allow 25–30 minutes of active work. The guest-day deck already fills 75 minutes: replace its seven-minute ungraded practice with the lab launch, then have students finish independently after class by the announced Canvas deadline.

## Rubric: 10 points

- Initial position (2): reasonable choice; relevant venue/audience fact used to justify it
- Event/venue fit (3): feasible final plan; purposeful adjustment; explains how resources support it
- Tradeoff/risk (3): fair runner-up comparison; stakeholder tradeoff; concrete risk with practical response
- Adaptation (2): uses the new information; explains changed/retained decision and consequence

These are manually assigned reasoning points. Validation and completion are not grades. Blank/ungraded is distinct from an instructor-entered 0/10.

## Private instructor workflow

Open the instructor page with the existing OFF SCRIPT / Legal Literacy Check 2 instructor key. The key stays only in tab memory. Class records are the default; isolated synthetic tests require an explicit record-set selection.

Review the initial and final writing, enter four bounded rubric scores and optional private feedback, then choose Save score. The server calculates the total. A student can resume their own attempt and choose Check my grade to see their own total and rubric points after review. Private grading notes remain instructor-only. Canvas remains the official course record. CSV exports contain private identity/work and neutralize spreadsheet formula prefixes; keep the downloaded file secure.

Names and La Salle emails are self-reported rather than institutional SSO-verified. Duplicate email attempts are flagged for roster review. No one is emailed. Losing browser data loses self-service resume access; the student should contact the instructor rather than create repeated attempts. No student-record deletion endpoint is provided.

## Guest privacy

The guest view refreshes every 10 seconds while visible. It reads only aggregate stages and structured choices. An individual proposal requires the student’s optional opt-in plus the instructor’s explicit release. Its summary is built solely from selected options. Names, emails, session tokens, grades, comments, and raw written answers are excluded from the guest API. No freeform publication field exists.

The guest URL is a public presentation view, not a confidentiality control. Only the whitelisted anonymous structure is available there. Isolated test records never affect guest counts.

## Saving, recovery, and testing

Live and test attempts have separate storage and scoped random resume sessions. The browser persists the token and exact pending request before transmission. Operations are serialized, version-checked, and idempotent; the initial position and final receipt become immutable. After a conflict, the student can download local writing and explicitly load the current server version. Shared-device cleanup removes only the browser copy, never the server record.

`?mode=pilot` is local practice only. `?mode=test` uses a fixed Synthetic Fixture identity at example.invalid in a separate table; it is for end-to-end checks, not course credit. No real classroom rows are created by tests. Test fixtures are retained without deletion.

Source: `backend-v2/`, `tests-v2/`; the earlier pilot implementation remains in `backend/`. See QA.md for actual test scope and remaining limits.

## Supplied schedules and case boundaries

Arrival takes 10 minutes, the program takes 70, and closing takes 10. All costs and staffing are fictional teaching assumptions. Base prices include the room, equipment, two hosts, and planned materials/prizes. No added revenue forecast or purchases are required.

- Mini-Cup: two groups of 12 each get 20 minutes of play plus 5 minutes for reset/changeover; then an eight-player final lasts 20 minutes.
- Play & Connect: three groups of eight each get 15 minutes of play plus 5 minutes for reset/changeover; then 10 minutes of social time. Ten PCs are reserved: eight active and two backups; the other two venue PCs are outside the package.
- Showcase: 20-minute demonstration, three 15-minute playing turns for groups of eight, and 5 minutes total between-group changes.

Orientation uses 10 minutes of feature time (Mini-Cup final20→10; Open social10→0; Showcase demonstration20→10). All guaranteed playing turns remain intact. Coaching uses the first five minutes of each group’s turn, not extra time. A third host fits only Play & Connect ($255). In full-group briefings/social time, at least eight visitors remain in PC-area seats so the16-place off-station area is not exceeded.

The new `plan-preview.js` renders the selected timetable; it neither assigns points nor saves records. `clarity.css` contains readable-layout additions. The backend remains compatible with the existing record schema.
