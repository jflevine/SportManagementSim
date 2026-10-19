# SPM 370 — Review the Counteroffer

A 12-minute individual Decision Lab: read the client brief and six-clause offer, recommend a course of action, and write a short reply proposing one specific change and asking one useful question about a priority issue. Students write two short answers; 120–180 words total is guidance rather than a minimum. The 10-point rubric is visible on the activity page. This lab runs without generative AI.

## Classroom use

Student page: https://jflevine.github.io/SportManagementSim/spm370/review-counteroffer/

Instructor page: https://jflevine.github.io/SportManagementSim/spm370/review-counteroffer/instructor.html

Allow 3 minutes to read, 6 to write and submit, and 3 for instructor-led discussion. Compare how a specific proposal and an information-seeking question help students prepare to negotiate with Avery. Provide the class code through the course LMS. Students use their names and La Salle email addresses; these are self-reported, not verified school sign-on. A confirmed submission is final. The page saves a local draft and offers a text download, but only a server receipt confirms submission. A pending submission retries the same saved answers and identifier.

The instructor key opens saved responses, manual 4/2/4 scoring, feedback, and CSV export. It also controls whether new submissions are open. Existing records remain accessible after closing. Never share the instructor key with students. Keep access credentials and teaching answers out of this public repository.

This is a separate weekly Decision Lab. It does not modify or activate the Northline/Avery negotiation project.

## Prompt update and original-version fairness

The October 17 prompt update asks “What would you say next?” rather than requiring a replacement clause. The 10 points remain recommendation/reasoning 4, applied concept 2, and reply 4 (specific within-authority proposal 2; useful question 2). Students who began the original version may submit their clause revision for the same final 4 points, assessed for specificity, workability, and resolution of the chosen uncertainty. Do not require a question or message format from them. Submission time cannot establish when an unsubmitted browser draft began.

The stored `clarification` field and grade key deliberately remain unchanged and can contain either response format. Instructor and export labels describe both; they do not classify old responses as new-format replies. Case version, storage key, input names, decision values, and API shape are unchanged. Do not clear saved drafts, alter pending submissions, or regrade existing records automatically.

## Implementation

Static HTML/CSS/JavaScript hosted on GitHub Pages, with an isolated saved-submission service. See [backend/API.md](backend/API.md) for API behavior and deployment notes. No browser-side service-role key or AI key is used. `core.mjs` contains the public service URL and case version. Preserve the case version and existing records after students begin; do not change assessment facts mid-session.

For a local preview, serve this directory on port 8765. The API permits that local origin and the published GitHub Pages origin. Run focused unit tests with `node --test tests/backend.test.mjs`. The live test is opt-in, uses private access credentials, and requires owner cleanup of its recorded synthetic IDs; do not run it against a class in progress.

Instructor grades are stored in this service and exported as CSV; there is no automatic Canvas grade synchronization. Use the existing course process to return feedback and record grades.

## Individually authorized additional attempt

The `?attempt=2` URL selects a separate local draft/receipt slot and sends an explicit retry marker. It does not grant permission. The server accepts at most one additional attempt only for an original submission privately authorized by the owner. It links the new immutable record to the original; neither original work nor grades are replaced. Instructor review and CSV show the attempt number and original ID. The full 10-point rubric applies; grades remain manual.

Apply `backend/retry-migration.sql` once after the existing installation. Never rerun the fresh-install schema. Authorization records are private database-owner actions with no public management endpoint. Never put student identities or authorization data into this repository. Existing school-email/class-code authentication remains self-reported identity, not individual sign-on. The settings-row transaction lock and unique linked-retry index enforce one use; exact saved request retries preserve their receipt even after closing.

Run `node --test tests/*.test.mjs`. `tests/retry-database.sql` verifies synthetic runtime cases inside a rolled-back transaction; it does not consume a real student authorization. Do not run persistent synthetic live submissions against a class in progress.

