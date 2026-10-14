# SPM 370 — Review the Counteroffer

A 12-minute individual Decision Lab: read the client brief and six-clause offer, recommend a course of action, and clarify one priority clause. Students write two short answers; 120–180 words total is guidance rather than a minimum. The 10-point rubric is visible on the activity page. This lab runs without generative AI.

## Classroom use

Student page: https://jflevine.github.io/SportManagementSim/spm370/review-counteroffer/

Instructor page: https://jflevine.github.io/SportManagementSim/spm370/review-counteroffer/instructor.html

Allow 2 minutes to read, 7 to write and submit, and 3 for instructor-led discussion. Provide the class code through the course LMS. Students use their names and La Salle email addresses; these are self-reported, not verified school sign-on. A confirmed submission is final. The page saves a local draft and offers a text download, but only a server receipt confirms submission. A pending submission retries the same saved answers and identifier.

The instructor key opens saved responses, manual 4/2/4 scoring, feedback, and CSV export. It also controls whether new submissions are open. Existing records remain accessible after closing. Never share the instructor key with students. Keep access credentials and teaching answers out of this public repository.

This is a separate weekly Decision Lab. It does not modify or activate the Northline/Avery negotiation project.

## Implementation

Static HTML/CSS/JavaScript hosted on GitHub Pages, with an isolated saved-submission service. See [backend/API.md](backend/API.md) for API behavior and deployment notes. No browser-side service-role key or AI key is used. `core.mjs` contains the public service URL and case version. Preserve the case version and existing records after students begin; do not change assessment facts mid-session.

For a local preview, serve this directory on port 8765. The API permits that local origin and the published GitHub Pages origin. Run focused unit tests with `node --test tests/backend.test.mjs`. The live test is opt-in, uses private access credentials, and requires owner cleanup of its recorded synthetic IDs; do not run it against a class in progress.

Instructor grades are stored in this service and exported as CSV; there is no automatic Canvas grade synchronization. Use the existing course process to return feedback and record grades.
