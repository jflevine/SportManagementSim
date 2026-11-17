# Signal Leak — Thursday SPM 370 review draft

NOT deployed, NOT class-ready signoff. Preserves PR50 and its original risk bridge. All people, locations, the game and institutional policies are fictional. No student data or real account identifiers belong here.

## Teaching plan
30-minute live launch: (0–5) explain safeguarding as reducing foreseeable exposure while facts remain uncertain; (5–10) map director/producer/player/campus-safety/platform authority; (10–15) model a private fact question versus a formal action; (15–20) demonstrate one decision without prescribing a best route; (20–25) distinguish a verified exposed location from an unverified visitor connection; (25–30) show the single handoff, technical fallback and submission route. Students then complete a 20–25-minute individual case in class or remotely. These are planning estimates, not timed student-tested results.

The case unfolds through a Twitch overlay leak, reposted clips on X/TikTok, then a residence-desk report of a visitor asking for a gamer tag. The visitor was not admitted; motive and connection are unknown. Fans are not collectively characterized as hostile. Protective action does not require declaring guilt.

## One assessable artifact
Three paragraphs, approximately 200–300 words total, plus the attached decision log:
1. Verified facts and unknowns.
2. Actions, sequence, owners, necessary disclosures and reasons.
3. Review time, remaining exposure, one team risk and one organizer risk.

Suggested formative assessment (not an automatic grade): facts/uncertainty 0–2; proportionate protection 0–2; authority/coordination 0–2; selective disclosure/evidence 0–2; follow-up and connected risks 0–2. Judge the explanation and record, not whether all action buttons were clicked. Do not replace an existing graded legal-literacy check until Jeff confirms equivalency, deadline and LMS submission route.

## Local preview and test
From repository root, with Node installed:
`env -u OPENAI_API_KEY PORT=8799 node simkit/dev-server.mjs`
Open `http://localhost:8799/spm370/signal-leak/` for browser-local practice. This does not submit to an instructor on another device. The JSON download is an export, NOT a submission. Use only a fictional alias.

For shared in-memory local testing open `http://localhost:8799/spm370/signal-leak/?dev` and `instructor.html?dev` (key `dev`). Server restart deletes these test records. Neither mode is a production backend. Do not host the whole repository or test server for students. Deployment, persistence, access controls and actual instructor retrieval require separate approval and end-to-end testing.

Editing: story/actors/actions/outcomes in casefile.mjs; student page index.html/app.mjs/style.css; review page instructor.html. Registry is simkit/cases.mjs. Run `node --test simkit/checks/*.test.mjs`.

## Scope and limits
Paper-specific governance debrief remains pending Jeff’s review and is not incorporated in the activity. Fictional role authority remains part of the core approved case.

Prepared responses, not live AI. Questions use limited authored patterns; formal choices drive effects. Free-text reasons and disclosures need instructor review; the engine does not evaluate their truth, adequacy or legality. The explicit location-disclosure selector drives that consequence, not semantic analysis of the written update. No actual messages, takedowns or safety responses occur.

## Verification on Nov 17, 2026
All 91 repository Node checks passed before added case-specific checks. Syntax checked. Browser launch attempted with Playwright/system Chromium but environment denied socket creation; no successful visual, keyboard or browser submission verification is claimed. Instructor retrieval is covered at handler level, not live hosting. Do not give classroom-ready signoff yet.

Before use: complete browser student→refresh→handoff→export→instructor retrieval test, mobile/desktop and keyboard checks; confirm deadline/submission route and accessibility alternative. Ask Jeff to approve story and assessment, then test delivery from a separate device. Never use live student names for testing.
