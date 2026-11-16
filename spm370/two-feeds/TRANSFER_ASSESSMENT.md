# Did the method transfer? — Two Feeds

**Read this first.** This build was done by the same Claude session that wrote simkit and the
authoring guide. It is therefore **not** an independent test, and it cannot show that a fresh
ChatGPT session would succeed. What it can show is narrower: whether a third professional
task with a third interaction format fits the engine and the guide without changing either,
and where the guide was silent when I needed it. I worked from the repository and the prompt
only and did not open the course Drive folders.

## What I reused directly (no changes)
- `simkit/kernel.mjs`, `handler.mjs`, `client.mjs`, `stores.mjs`, `voice.mjs`, `describe.mjs`, the dev server.
- The generic checks in `every-case.test.mjs`: listing the casefile in `cases.mjs` produced eight checks at once.
- The `describeEvent` and `checkSubmit` hooks added after the previous transfer test. Both were needed here.
- The casefile shape: actors, facts with `initial` and `guarded`, rules with `why`, timers, samples, lenses.

**Shared code changed: one line** (the registry entry in `simkit/cases.mjs`).

## What I had to invent for this task (creative decisions left to me)
- The scenario, parties, clause wording and numbers.
- The reading-table interface: two slots, pinning, the advice form as the submission.
- Language as the fact that decides the conflict and sits in no document.
- A three-hour afternoon with a 48-hour notice window closing inside it.
- Treating the advice itself as the submission, with the CEO acting literally on it.

## Where the repository left me guessing (gaps in the guide)
1. **"Advice a client then acts on" has no worked mapping.** The guide's format table names it, but both examples end in a free-text memo. I had to work out that structured advice belongs in `submit`, shaped by `cleanMemo`, guarded by `checkSubmit`, with consequences in `afterSubmit`. *Workaround: none needed, but it took reading the kernel.*
2. **Nothing shows what people say after submission.** `afterSubmit` can make characters reply, but neither example's debrief displays those replies, and there is no shared debrief component. My first browser run failed on exactly this. *Workaround: wrote my own "replies" block.*
3. **Clause-level documents are undocumented.** The guide says `body: [paragraphs]`. I needed `{ id, text }` per clause to pin them. It works because the kernel passes `body` through untouched; I confirmed by reading the code.
4. **Zero-cost actions are undocumented.** Pinning is an `act` with `cost: 0` so a pod shares pins and the instructor sees them. I had to check that 0 is honoured.
5. **The instructor room is still copy-and-patch.** I copied 150 lines and a 60-line stylesheet, changed six strings and rewrote the projector block. This is the same cost the previous builder reported, and the largest one.
6. **`config.mjs` as copied would point a new activity at a live function that does not know it.** The guide now warns about this; I changed the default to offline and added `?live`. A new builder following "copy config.mjs" literally would still ship a page that fails by default.
7. **The dev server keeps earlier runs in memory,** so a rerun of a browser check sees duplicate team names. *Workaround: the check tolerates duplicates.*
8. **Course vocabulary.** With Drive out of bounds, I could not align clause language or terms with the contracts chapters. The guide's fallback (read the existing activity for that week) helped less here because the existing contract activities keep their case content server-side.

## What I could not test without touching production
AI voices and AI recognition of student messages for this casefile; the Supabase store; the
deployed function. All were verified for The Report in an earlier session, not for this one.

## Verdict
The engine held: a third format, no engine changes, eight generic checks for free, and the
core promise of the method (a recorded statement, a fact someone else holds, a consequence
traceable to both) took about 300 lines of casefile. The guide is good at the model and thin
on the interface side. As its author I filled those gaps from memory of the code; a fresh
builder would have to read `kernel.mjs` and an example page closely, as the previous
independent session did.

**The single change that would most help the next builder:** turn the instructor room and
the debrief into a shared module (`simkit/room.mjs`) driven entirely by the casefile
(`signals`, `lenses`, `outcome`, plus one small function for what to show on the projector),
with its own stylesheet. Every builder so far has rebuilt it by copying, and it is the part
Jeff relies on most in class.
