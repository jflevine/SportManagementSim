# OFF SCRIPT — Nova’s Next Deal (2.0.1)

SPM 370 Legal Decision Lab 2 · Jeffrey Levine · La Salle University.

The current activity is `index.html`. Students represent Nova, an adult independent gaming creator, in one sponsor negotiation. There is no CROSSPLAY event, ensemble cast, financial ledger, or alternate-timeline requirement.

## Routes

- Student: https://jflevine.github.io/SportManagementSim/spm370/off-script/
- Demo, separate save and no submission: `?demo=1`
- Instructor guide and source alignment: `?guide=1`
- Protected current gradebook: `?instructor=1` (`instructor/` redirects here)
- Previous activity: `legacy.html`
- Previous gradebook: `instructor/legacy.html`

## Three case steps

1. Read four short contract clauses; distinguish the recording from identity permission.
2. Propose a limited AI agreement, a new actual recording, or no expansion.
3. Respond to one sponsor counteroffer and explain the recommendation, controlling clause, precise term, and tradeoff.

The task, client instruction, and relevant contract remain visible. On small screens, the contract/client column is placed before the answer area. There is no actual timer. Dollar amounts and the sponsor’s responses are supplied fictional facts, not predictions. Prior copyright permissions are explicitly stipulated so the case stays focused on Nova’s identity grant.

## Source boundaries

Adapted from the uploaded `Chapter_5_NIL_Branding_Lecture_Ready_Notes(1).pptx`, including lecture notes. Selected concepts: separate copyright/identity interests (slide 4); defined grants, approval, new uses and termination (slides 15–16 and full reference clause); endorsement disclosure versus consent (18); control, compensation and bargaining (21); specific AI uses and model/output end terms (25). These are adaptations of course concepts, not a new current-law survey. No statewide statutory rule, pending legislation, union/NCAA coverage, or liability finding is supplied as a universal answer.

## Assessment

Five objective checks × two points = 10 automatic concept points. This replaces the older completion-points formula. Feedback and retries are allowed. First checked answers are retained as diagnostic information, not the recorded score. Strategic choices do not generate hidden grade penalties. Two responses of 2–3 sentences are required; the 30-character minimum is only a completeness check. Written reasoning is reviewed by the instructor, who may override the score. The automatic score remains preserved.

## Storage and privacy

New browser save: `spm370.offscript.nova.v2` (demo adds `.demo`). Legacy storage and all legacy assets/backend/records remain unchanged. New backend: `spm370-offscript-nova`; isolated table: `spm370_offscript_nova_submissions`. RLS enabled, no PUBLIC/anon/authenticated table privileges. Public submissions have bounded validation, server-computed scores, hashed rate limits, request fingerprints, UUID idempotency, duplicate-email protection, and server-confirmed receipts. Identities remain self-reported: this is a low-stakes lab, not an authenticated exam.

Instructor access reuses the existing protected `spm370-offscript/instructor` verifier server-to-server. The instructor key stays only in page memory. No instructor keys, verification digests, production service keys, student submissions, or source slides are committed here. CSV exports neutralize spreadsheet formula prefixes. Nothing syncs to Canvas automatically.

## Verification

Local synthetic browser walkthroughs passed at 390, 820, and 1440 pixels: incorrect-answer feedback, retry, preserved first score, all-step navigation, recommendation changes, writing, mocked private submission, receipt reload, and no horizontal overflow or page errors. The local browser test used inline HTML and synthetic storage/network fixtures because browser navigation is restricted in the build environment; it is not a real-device or first-time-student usability study. Nine local backend/security tests passed. A separate GitHub Actions smoke test exercises the deployed endpoint with clearly synthetic data; remove its test row after verification. The test workflow runs only on the temporary implementation branch, not on ordinary student use.

Planning target: 15–20 minutes plus debrief, to be calibrated in the first class run. The old six-decision launch-slide wording and old 6+4 grading description no longer apply to this edition.

## Final classroom-readiness sweep

Build 2.0.1 preserves the v2 browser save, the 2.0.0 submission format, existing records, and the five-check scoring scheme. It clarifies that students treat the supplied contract as valid and answer the final AI question regardless of their chosen deal. It adds a separate demo restart, safe correction after definite validation failures, browser-compatible request timeouts, a new-tab instructor guide, emergency backup when browser storage is blocked, and protection against discarding unsaved instructor feedback. The QA workflow runs synthetic regression tests before committing these source changes on its isolated branch. Its live test uses one clearly marked example.invalid record that must be removed after verification.
