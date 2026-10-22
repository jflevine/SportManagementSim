# SPM 370 Northline negotiation midterm

The main page is the student midterm. Avery Chen is an AI counterparty representing Jordan Reyes. The instructor assesses student work; Avery does not grade, coach strategy, or draft submissions.

## October 22, 2026 arrangements

- Opens at 3:30 p.m. Eastern. Negotiation, transcript, and separate term sheet are due in Canvas by 11:59 p.m. Eastern.
- Remote participation is permitted. Follow the instructor's current announcement where older packet timing differs.
- Allow 35 minutes for negotiation, five minutes for confirmation, and 15 minutes for the separate term sheet. Start by 11 p.m. to allow an upload buffer.
- New session clocks are capped at the common deadline. Starting late reduces available conversation time and can leave no confirmation time. Instructor accommodations can extend an individual session.
- One graded attempt per normalized email and case version. Names and emails are self-reported, not school single sign-on.
- Complete the separate Word term sheet (file 03). Upload it and the downloaded full transcript to Canvas. Saving the app record does not submit to Canvas.
- The Contract Recommendation Memo remains a separate assignment under the Student Guide.

## Instructor test and records

- [Student midterm](https://jflevine.github.io/SportManagementSim/spm370/contract-negotiation/)
- [Instructor test](https://jflevine.github.io/SportManagementSim/spm370/contract-negotiation/?pilot=1): use a unique `@example.invalid` identity and the private instructor access credential. The student class code cannot start tests.
- [Instructor records](https://jflevine.github.io/SportManagementSim/spm370/contract-negotiation/?instructor=1): use the separate instructor access credential.

The instructor test and graded case use identical role instructions, rules, and opening economics. Their records and attempt limits are separate. The voice is confident and personable, with respectful pushback and occasional restrained wit; tone does not change substantive acceptance standards. Neither an OpenAI API key nor a Supabase service key belongs in a browser form.

## Server and release

GitHub Pages serves the interface; the existing `spm370-contract-negotiation` Supabase Edge Function handles custom authentication, the OpenAI Responses API, private case policies, and append-only records. The configured model remains `gpt-4.1-mini-2025-04-14`; a session freezes its model on creation. Provider credentials remain server-side.

Graded release requires the active private graded policy's `assessed_release` field to be exactly `true`. Missing policy/configuration fails closed. The handler and database enforce its opening window. The earlier environment release switch is superseded by this explicit private case release field. Do not publish case policies, thresholds, credentials, or student records in this repository.

The public health route reports configuration booleans. Configuration alone does not prove live model quality. October 22 verification includes real AI replies, rejection of an impermissible opening, a supported 25% advance exchange, relevant scheduling facts, refusal to draft coursework, exact request retries, confirmation, saved receipts, and matching participant/instructor records.

## Recovery

The browser saves a private resume credential. Students should save the private resume file for device recovery and keep it confidential. Email alone does not recover a session. Existing pilot and midterm records remain separate.

Instructor controls can pause/resume, extend time, recover a stalled turn, or reset a private resume credential after identity verification. Provider failure preserves the student message and pauses the session. Students should contact Professor Levine promptly rather than start another attempt. Saved records remain readable/downloadable after the deadline. A receipt records the actual finish timestamp; Canvas controls submission timeliness.

## Scoped maintenance

Run `npm test` from this folder. Deploy only the six files in `backend/` needed by `index.ts` to the existing function with JWT verification disabled, because custom credentials are checked by the handler. Preserve all namespaced RLS restrictions and unrelated activities.

`backend/schema.sql` and `002_record_only.sql` describe already-applied setup; do not rerun them. `004_midterm_deadline.sql` updates only the existing session transaction function to cap initial clocks while preserving instructor extensions and all records. Private policies are versioned; do not rewrite the role used by existing attempts.
