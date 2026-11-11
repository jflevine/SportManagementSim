# MGT 340 — You're the Athletic Director

A 30 minute fictional collegiate athletics exercise adapted from Chapter 8's Marcela Chavez case. Students serve as incoming AD, consult three simulated colleagues, choose one of three annual allocation plans, respond to a funding reduction, and explain their final recommendation.

## Run and test
Serve this folder over HTTP. Live conversations use the isolated `ad-decision-chat` endpoint documented in `backend/README.md`. No API key is shipped to the browser. If chat fails, the UI labels prepared responses as Guided mode and keeps the activity usable.

Run `node --test logic.test.mjs backend/core.test.mjs`.

## Teaching and records
The `?guide` page contains pacing and debrief guidance. No sign-in, names, or email addresses are required. Conversations and final responses can be downloaded as text; printing offers a PDF route. There is no automatic Canvas submission or grading. Student questions sent to live chat are processed by the backend and model service; do not enter personal or confidential data. Local progress remains on the device until the student starts over or clears browser storage.

The prior worksheet is preserved at `../chavez-decision-classic/`. The redesigned page uses a separate browser storage key.

## 2026-11-11 redesign
- Three conversational perspectives with fixed case evidence
- Three prepared $600,000 plans and three $400,000 revisions
- One optional $25,000 transfer after the funding update
- Four short final responses with an exportable conversation record
- Guided fallback, saved progress, keyboard focus, and accessible form labels
- No invented retention guarantees, new money, or automatic eligibility conclusions
