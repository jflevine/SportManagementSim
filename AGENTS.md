# AGENTS.md — start here

You are a coding session working in Jeffrey Levine's teaching repository. He directs Sport
Management at La Salle University and teaches MGT 340 (Introduction to Sport Management),
SPM 343 (Esports & Digital Gaming Management) and SPM 370 (Esports, Video Games, and the
Law). He is not a software developer. He gives you a teaching idea in his own words; you
turn it into an activity his students can use in class and he can run and debrief.

## Two kinds of work live here

1. **Existing course activities** in `mgt340/`, `spm343/`, `spm370/`. Each is self-contained
   with its own backend. Many are live and hold student records. **Do not change them, their
   Supabase tables or their Edge Functions unless Jeff asks for that activity by name.**
2. **simkit** in `simkit/`: a small shared engine for *lifelike* simulations, plus one
   reference simulation, `spm370/the-report/`. New experiential activities are built this way.

## Read these, in this order, before writing code

1. `simkit/AUTHORING_GUIDE.md` — the method: from a rough idea to a working activity. It
   contains the design questions, the choice of interaction format, what is safe to reuse,
   what you must decide afresh, and the definition of done.
2. `spm370/the-report/README.md` — why the reference simulation has the form it has.
3. `spm370/the-report/casefile.mjs` — the reference casefile. Read it top to bottom once.
   Then skim `mgt340/the-shortfall/` (a budget board) to see how different a second
   simulation on the same engine should look.
4. `simkit/kernel.mjs` — 250 lines; the vocabulary of events and effects.
5. `simkit/AUDIT.md` — what limited the earlier activities, with the before/after test.

## How to work

- **Design before code.** Reply to Jeff's idea with the one-page design note described in
  the guide (section 1) and wait for his answer on anything only he can know: what happened
  in the room, what students struggled with, the course vocabulary. Then build.
- **Choose the form from the professional task, not from the reference.** The Report is an
  operations desk because that job is an inbox. A budget decision, a contract mark-up or an
  event schedule should not look like it. Reuse the engine, not the interface.
- **Work on a branch.** Never commit to `main`. Use fictional participants and `mode: 'test'`.
- **Run the checks** before you say anything works: `node --test simkit/checks/*.test.mjs`
  (Node 20+; no install step, no network). Add checks for your simulation's own paths.
- **Preview locally:** `node simkit/dev-server.mjs`, then open
  `http://localhost:8787/<course>/<your-sim>/?dev` (set `PORT=8799` if 8787 is busy). Any page also runs fully offline with
  `?local=1` (prepared voices, browser storage only).
- **Report honestly.** Say what you ran and what you did not. A classroom trial is the only
  test of whether students find a voice credible; do not claim it.

## Hard rules

- No API keys, service keys or instructor keys in the repository or in any browser code.
- Student-facing pages may only talk to the `simkit` Edge Function (or run offline).
- Everything consequential a student does is an appended event. Never edit or delete events.
- All characters are fictional adults. Keep sensitive subject matter non-graphic.
- Do not invent real cases, statutes, citations or statistics. If the activity needs law,
  put it in a document *inside the fiction* (a handbook, a contract, a league rule) and have
  students work from that. Tell Jeff anything he should verify.

## Where things are

| Path | What it is |
|---|---|
| `simkit/kernel.mjs` | Pure engine: ledger → state, rules, timers, who-knows-what, causal chains |
| `simkit/handler.mjs` | The one server entry point: start, join, view, act, instructor.runs |
| `simkit/voice.mjs` | Authored voices and the OpenAI voice (extract speech acts; render a line) |
| `simkit/stores.mjs`, `simkit/supabase/store.mjs` | Memory store; Supabase store |
| `simkit/client.mjs` | What a page imports: `connect`, `send` (retry-safe), offline driver |
| `simkit/describe.mjs` | Plain-language descriptions of events for case files and timelines |
| `simkit/cases.mjs` | Registry: one line per simulation |
| `simkit/checks/` | Runnable checks (`*.test.mjs`) and an optional browser check |
| `simkit/supabase/` | Migration, Edge Function entry, deployment notes |
| `spm370/the-report/` | Reference simulation: casefile, student desk, instructor room |
| `mgt340/the-shortfall/` | Second example (budget board), built by an independent session as a transfer test |
