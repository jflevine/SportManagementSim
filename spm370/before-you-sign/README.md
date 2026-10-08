# Before You Sign + Legal Literacy Check 3

SPM 370 individual asynchronous class for October 8, 2026. The five-file lesson takes approximately 45 minutes. The separate 20-point Legal Literacy Check 3 takes approximately 15 minutes.

Students enter their own full name and La Salle email, complete the activity, select Submit activity, and receive a server-confirmed receipt. They then take and submit the check on this same GitHub Pages site. No GitHub account or LMS upload is needed.

## Private persistence

The existing course Supabase project serves the `spm370-before-you-sign` function. Isolated `spm370_bys_*` tables have RLS enabled, no browser-role grants, and no public policies. A private 192-bit resume code scopes access to one attempt; only its SHA-256 digest is stored. Email is unique per assignment. Identity is self-reported, not email-verified. Losing browser access is recoverable with a saved code or an instructor-issued replacement.

Activity and quiz have separate immutable submission timestamps and receipts. Identical retries return the existing submission; resubmission never silently overwrites it. Draft quiz saves use optimistic concurrency. The server validates completion and computes the 12 multiple-choice points. Activity writing and two 4-point short responses require instructor review. Student responses omit official keys, models, and scores.

`instructor/` uses the existing SPM 370 instructor access key, checked on the server before records are read. It lists identified progress, reviews answers, saves activity/essay grades, exports a CSV, opens/closes submissions, and generates private recovery codes. Instructor credentials are held in memory only. The table can be viewed only through authenticated instructor routes or authorized project administration.

Private grading keys and model responses are in the restricted settings table, not this public repository. The deployed entrypoint reuses existing private instructor verification and server credentials. `backend/index.example.ts` is documentation only; never commit production keys or verification digests. Test fixtures contain synthetic question keys, not the official graded assessment.

## Files and verification

- `index.html`: lesson and activity submission
- `check/`: Legal Literacy Check 3
- `instructor/`: private instructor dashboard
- `connection.js`: attempt access and retry handling
- `backend/`: validation, authorization, database adapter, schema, synthetic tests
- `qa/`: complete browser flow using an isolated synthetic API

Run `node --test spm370/before-you-sign/backend/server.test.mjs` and `python spm370/before-you-sign/qa/browser_test.py` from the repository root. Browser QA covers activity and quiz submission, lost acknowledgements, draft recovery, instructor access and grading, downloads, and mobile/enlarged layout in Chromium, Firefox, and WebKit. Live database verification uses synthetic records, then removes only those test records.

## Teaching sources

Jeffrey Levine's supplied Contracts in Esports chapter, 39-slide Contracts deck, Chapter 5 NIL deck, and SPM 370 Fall 2026 syllabus. Characters and clauses are fictional. File 5 explicitly changes the facts for a guaranteed-pay damages exercise; the original unsigned draft governs the final recommendation. This covers core concepts; named cases and specialist dispute forums remain supporting slide material.
