# Signal Leak — playable local-only preview

The activity is implemented and browser QA is being run. It is NOT yet an assigned course submission route. The default page is local-only, with a downloadable handoff/decision log. Professor Levine must confirm where students upload it and the due date before assigning it. No grade or identity is verified by this page. Use a fictional alias, not personal data.

The private `signal-leak` backend was tested with ONE clearly marked synthetic run, then closed to new runs, joining and actions. Existing synthetic work remains private and readable. Other functions and records were unchanged. Do not enable collection until instructor access, student identification, abuse controls and the actual submission route are settled.

The isolated case preserves PR50/51 and other applications. Paper-specific debrief remains unapproved and excluded. See `browser-qa.cjs` and the GitHub Actions workflow for browser coverage. 93 source snapshot tests passed; live synthetic backend token/retry/persistence tests passed. Actual instructor key login is unverified. No new database permissions, tables, credentials or AI charges were introduced.

## Teaching
30-minute live orientation followed by 20–25 minutes individual work (estimates). Remote students have the same complete on-page orientation. One 200–300-word three-paragraph handoff plus decision log. Assess uncertainty, authority, proportionate protection, selective disclosure and follow-up, not a hidden score. No esports expertise needed. Provide an equivalent alternative if the topic or technology creates a barrier.

## Preview locally
Serve the repository with a static HTTP server and open `/spm370/signal-leak/`. Browser storage may be cleared, so keep the export. Instructor review here shows only this browser’s practice records, not class submissions. Do not treat it as a gradebook.
