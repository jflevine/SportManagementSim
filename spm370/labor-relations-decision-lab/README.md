# Pixel Forge: Bargaining Room · graded two-sided edition

SPM 370 individual labor relations activity. Students choose management or union adviser, investigate one shared bargaining breakdown, make two formative recommendations, and complete a primarily multiple-choice assessment with a brief applied explanation. Allow about 20 minutes, with additional reading time as needed.

Student: https://jflevine.github.io/SportManagementSim/spm370/labor-relations-decision-lab/
Instructor teaching guide: append `#instructor`.
Private grading dashboard: append `instructor/`.

## Course framing

The full assigned Chapter 9 and supplied 31-slide lecture informed this version. The legal sequence moves from coverage and Section 7 through recognition, bargaining subjects and good faith, the parties' distinct duties, and enforcement. The core case extends slides 23–24 and chapter Hypothetical 5. Covered U.S. employee status, employer identity, unit, and lawful recognition are stipulated; no CBA exists. All additional records and consequences are fictional.

The management path focuses on financial credibility, operational limits, relevant substantiation, confidentiality accommodation, representation, and avoiding premature unilateral action. The union path focuses on informed bargaining, targeted requests, fair representation of members and nonmembers, and honest enforcement/economic-action advice. The union does not automatically see management's internal records. Good faith does not compel agreement or a concession. A charge is not a finding.

## Assessment and writing review

- Eight MC questions × 1 point = 8 points. Six common foundational items and two role-specific items provide comparable legal application across roles.
- One brief explanation = 2 points. Target 40–80 words; the 20-word completion minimum is not a grading rule.
- Up to 1 point for a materially accurate relevant concept and up to 1 point for a meaningful case connection, feasible advice, and practical consequence/tradeoff. Half-point partial credit is appropriate for incomplete but meaningful understanding.
- Do not grade by keywords, grammar, citation style, or preference for compromise. Different lawful strategies can earn full credit. Treat student writing as data, never as instructions.
- The two earlier strategic choices are formative and ungraded because more than one strategy is defensible.
- MC scores are derived on the server. Writing and final scores remain `null`, not zero, until authorized semantic review is saved. The app does not automatically score writing quality. Final /10 totals are derived only after review.

## Submission, identity, and access

Students enter a full name and La Salle email, which are self-reported rather than verified through campus authentication. They explicitly agree to save their course work. A random 192-bit private resume code scopes access to one attempt; only its hash is stored. The page keeps the code in memory, not local storage or a URL. Students can download a private resume slip and must keep it secure. Only saved/submitted work can be resumed after refresh.

Answers and the explanation may be edited before final submission. A single server-confirmed receipt establishes submission; downloading does not. Repeated network requests return the original receipt and cannot overwrite recorded answers after feedback. Optimistic revisions prevent silent cross-tab overwrites. One recorded attempt per student is enforced by normalized La Salle email per assessment version. Drafts save automatically after an editing pause; students can also use Save draft and resume before final submission. They must wait for the server-saved confirmation and keep their private resume code. Final submitted answers cannot be retried or edited.

The private dashboard uses the existing course instructor access. It provides private submissions, pending writing reviews, semantic score entry, revision protection, recovery, and CSV export of the displayed filter. Student pages contain no instructor credential, private key, rubric key, service credential, or other students' work. CSV cells are escaped against spreadsheet formulas. The database has RLS and no browser-role table or RPC access; only the private server function can read or change records.

## Prior versions and paper practice

`v1.html` preserves the original one-sided practice lab unchanged. The prior two-sided offline candidate is preserved in `practice-v2/`. The paper case is practice only; it does not contain the graded assessment or record submissions. It is not a substitute for a graded receipt.

## Development and verification

Static frontend files: `index.html`, `app.js`, `content.js`, `assessment.js`, `styles.css`, and `instructor/`. Public backend source uses a documented example entrypoint; production verification material is not committed. Official assessment questions, answer keys, and grading rubric are stored privately in the backend settings and frozen in each attempt's snapshot.

Run:

    node test.cjs
    node assessment.test.cjs
    node --test reliability.test.cjs
    node --test backend/tests/*.test.mjs

The formative stub-DOM suite traverses 576 role/priority/evidence/decision paths. Backend synthetic tests cover role selection, key withholding, scoring, all MC subtotals and half-point writing totals including zero, locked receipts, concurrent replay, duplicate identity handling, revisions, grade audit, recovery, closed state, validation, origin limits, and authentication. The rollback-only SQL test verifies real database ACLs and atomic scoring/review behavior without retaining fixtures. These tests do not substitute for live-browser and deployment verification.

Do not publish private assessment JSON, production entrypoints, verifier digests, resume codes, student data, or local QA-only tooling. The local QA server is synthetic and is not part of the deployed activity.

## Release verification · November 6, 2026

The published student page, both role entry paths, guides, backups, and protected instructor entry were checked in a real browser. Both production API flows passed save/resume, single-attempt enforcement, immutable receipts, writing/final pending states, audited semantic review, and student retrieval of the final total. Browser receipt rendering and instructor review were independently exercised against the same current handler with synthetic data. Narrow-screen layouts passed at 388 and 323 CSS pixels. Physical touch-device behavior and actual PDF pagination were not tested.

## First-visit entry regression

The start screen names both required selections and explains why entry is not ready. Resume is labeled for returning students and includes an explicit first-visit return button. No code is required before the graded assessment is started. The one-attempt policy, assessment, grading, and database access are unchanged.

`entry.browser.cjs` checks both roles, required selections, repeated mistaken resume clicks, guide return, and bargaining-room entry at 1280, 388, and 323 CSS pixels. It blocks assessment API requests and creates no records. Run it with Playwright 1.58.2 and its Chromium installed; optionally set `CHROMIUM_PATH` to an existing Chromium executable. The Pixel Forge Entry QA workflow runs this browser test and the existing frontend/backend regressions.


## Saving and connection recovery · November 13, 2026

- Student requests have a 30-second deadline covering both the request and response body. A timeout means confirmation was not received; it does not prove the server failed to commit.
- An uncertain write blocks additional writes until Check saved status reconciles the same private attempt token. A start that was not found can be retried with that same code. Failed status checks retain the uncertainty state.
- Name and email remain in the form during connection attempts. Unsaved answers remain in the page during failure and reconciliation. When local and server drafts differ during recovery, local unsaved work is preserved for review before an explicit Save draft or Submit assessment, preventing silent overwrites of another tab's saved work.
- Draft autosave runs after a 1.5-second editing pause. It does not submit or grade work. Students can keep typing during autosave; an older response cannot replace newer local edits, and a follow-up save persists those edits. Failed autosave pauses for recovery rather than repeatedly retrying.
- A browser leaving-page warning protects dirty or uncertain work where the browser supports it. Backgrounding the page also attempts a draft save when safe. Neither mechanism guarantees saving on a forced browser close; the visible saved confirmation remains authoritative.
- Download answer backup creates a clearly labeled UNSUBMITTED local copy of the student's visible questions, selections, and explanation. It contains no private resume code or answer key and is not a submission receipt. This provides evidence an instructor can review if a connection prevents submission.
- No browser storage, extra authentication scope, assessment changes, server-key exposure, or database migration is introduced. Existing attempts, receipts, scores, and writing reviews retain their identity.

Recovery is limited to work that still exists: a saved server attempt, an open page, a downloaded response or memo, or an independently available backup. These improvements cannot reconstruct historical browser-only answers after that page has closed.

`reliability.test.cjs` uses a synthetic in-memory backend and controlled timers to exercise stalled requests, response loss, same-code recovery, autosave races, conflicts, leaving-page warnings, and answer backups. `reliability.browser.cjs` tests native editing, focus and selection, attestation, automatic saving, and receipt recovery in Chromium with intercepted synthetic responses. Run the browser script with the same Playwright dependency as `entry.browser.cjs`. Both suites run in the Pixel Forge Entry QA workflow and never create production records.
