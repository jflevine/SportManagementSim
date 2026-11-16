# Authoring guide: from a rough idea to a lifelike simulation

Written for a coding session that has never seen the conversation in which this was built.
Jeff's standard for "lifelike": **people have distinct incentives, partial information,
credible voices, and reasons to act on their own; students make defensible choices under
uncertainty and meet consequences that make sense in hindsight.**

## The design lesson this kit exists to carry

Before simkit, most activities in this repository shared one spine: a role brief, a complete
fact pack, a choice among prepared options, a scripted shock that hit every team the same
way, and a text box for justification. In the athletic-director budget exercise a student
could tell the athlete representative "I promise support funding won't be cut" and nothing
recorded it, no one else heard it, the shortfall arrived regardless, and the instructor saw
none of it. The characters all read from the same fact sheet, so the athlete sounded like
the business officer.

In the reference simulation a student tells a player "this stays between us." The words are
recorded as a commitment. When the student later refers the matter without going back to
her, she hears it from someone else, quotes the promise back, and withdraws. The instructor
sees the promise, the referral and her reaction, and can project that team beside one that
explained the limits of confidentiality first.

Three things make that possible. Keep all three in every simulation you build:

1. **An event ledger, not a state blob.** Everything a student does, and everything anyone
   does in response, is an appended event with a time and a cause.
2. **Facts that people know or do not know.** Information is a set of facts; each person
   holds some of them, and learns others only when an event teaches them.
3. **Rules decide what happens; voices decide how it is said.** AI never changes a fact,
   makes a decision or grants a request. It speaks for one person, briefed only on what
   that person knows.

---

## 1. Start from the work (answer these before any code)

Write a one-page **design note** for Jeff answering:

1. **The professional and the moment.** Who is the student (job title, not "student")? What
   has just arrived on their desk, and when is the next thing they cannot move?
2. **The skill.** What must they notice, decide, communicate or produce? State it as a verb
   phrase a practitioner would recognise ("decide what to promise a complainant", "allocate
   a cut across programs with unequal claims", "find the clause that moves the risk").
3. **Who holds what.** List 3–5 people. For each: what they want, what they fear, what they
   know that others do not, what they have only heard, and what is on their mind *today*.
4. **What can be verified, and where.** Which documents or records exist? What does each
   prove, and what does it not prove?
5. **What a reasonable person might get wrong.** Name two or three defensible moves that
   lead somewhere uncomfortable. These become your contrasting paths.
6. **Who relies on the decision.** What does each person *do* because of it, and when does
   the student find out?
7. **The debrief.** Which two teams would you want side by side, and what question would
   you ask the room? If you cannot write that question, the design is not ready.

Ask Jeff only what he alone knows: what happened when he taught this, the chapter's terms
and learning outcomes (they are in his Drive course folders), how long he has in class, and
whether students work alone or in pods.

## 2. Choose the form from the skill

Ask: *what are the student's hands doing when a professional does this well?* Build that.

| If the skill is… | The student should mostly be… | Not… |
|---|---|---|
| Listening, persuading, handling an objection, deciding what to promise | In a conversation whose words are recorded and have consequences | Choosing from reply options |
| Allocating scarce resources among claimants | Moving amounts on a board, with claimants reacting to what *they* can see | Chatting with stakeholders about a preset plan |
| Finding and weighing risk in a document | Reading, marking and comparing clauses; questioning a source; sending advice a client then acts on | Answering questions about the document |
| Triage under time pressure | Working an inbox with a clock, where ignoring something is also a decision | Reading a case and writing a reflection |
| Advising a decision-maker | Producing the memo, call or recommendation, and watching the client act on it, including on its omissions | Being told whether the advice was "correct" |
| Coordinating with other humans | Negotiating with classmates who hold private briefs; the software keeps the record | Talking to an AI playing a classmate's role |

A conversation earns its place only when listening or persuasion *is* the skill. A familiar
format is fine when it fits: the Eagles sales lab and the Northline negotiation are
conversations because handling an objection is the job.

**Do not copy The Report's interface.** Its three-column desk, channel-styled threads and
case file exist because that job is an inbox. Write the page your task needs. Reuse
`simkit/client.mjs` and the kernel; write new HTML, CSS and page logic.

## 3. Decide what the simulation must remember

Only these become state. Everything else is prose.

- **Facts** — atoms of information someone can know or not know. One sentence each.
- **Commitments** — things the student said or did that someone will hold them to. Store the
  student's exact words (`quote`). A commitment is `open`, then `kept`, `revised` or `broken`.
- **Flags** — things that are now true of the world (`referred`, `nocontact`).
- **Trust** — a small number per person, changed only by rules, with a reason.
- **Timers** — things other people will do on their own clock unless something changes.

Test: *if this were forgotten, would a later consequence be impossible or unexplainable?*
If not, do not store it.

## 4. Model what each person can know

In the casefile every fact lists who knows it at the start (`initial`). Nobody else knows it
until a `learn` effect teaches them, and the event records from whom (`via`).

- Give each person at least one fact nobody else has at the start.
- Give at least one person something they have only *heard* (a rumour, a note in a log).
- Let information travel on its own: a timer by which someone tells someone else, unless the
  student has done something that stops it (`cancel`) or makes it harmless.
- Mark facts a person would hold back with `guarded: (state, who) => boolean`. A guarded fact
  is in their head but they will not volunteer it unless a rule tells them to.
- Write each person's `concern` as a function of state: what is on their mind *right now*.

`kernel.briefFor(casefile, state, actorId)` returns exactly what a voice is given. If two
people's briefs read alike, they will sound alike. Fix the briefs, not the prompt.

## 5. Voices

A voice does two jobs: **extract** the speech acts in a student's message, and **render** a
person's line. `simkit/voice.mjs` has an authored voice (deterministic; used offline, in
tests and during outages) and an OpenAI voice.

- **Speech acts** are the short, closed list of consequential things a student can say
  (`promise_confidentiality`, `disclose_concern`). Each must be something a rule reacts to.
  Give each a one-line `describe`. Write `detect(to, text)` patterns as the fallback, and
  list the expected acts on every sample message so a check keeps the patterns honest.
- **Every scripted line has an authored `text` and a `must`.** The authored text is what
  students see offline. `must` is what the line has to convey; an AI voice says that, in
  character, and adds nothing.
- **Use `voice: false` where precision is the point**: decisions, procedure, policy, anything
  with a legal or numerical edge. In the first live test an AI-voiced Safeguarding Lead
  turned "I'd advise no contact" into "the GM has directed no contact." A voice had changed
  a fact. Her procedural line and the GM's decisions are now fixed text.
- **Leave the voice on where manner is the point**: the nineteen-year-old who types in
  lowercase, the coach who texts in clichés.
- A message no rule anticipated gets a free in-character reply from the brief. It cannot
  change state. If students keep asking something that *should* matter, add a speech act and
  a rule.

## 6. Produce evidence the instructor can use

Every casefile must export:

- `signals(state)` — short chips for the live board ("Promised secrecy", "Coach knows").
- `lenses` — the decision points worth comparing. Each has `value(state)` and a `question`
  for the room, written for the case where two teams differ on it.
- `outcome(state, events)` — what happened to each person, with the `seq` of the event that
  explains it. Evidence, not a score. Do not add points or a grade.
- `samples` — at least two scripted fictional teams that end in different places, plus one
  that does something reasonable off the expected path. They drive the checks and populate
  the instructor preview.
- A `why` on every rule and a `timerWhy` line per timer: one sentence an instructor could
  read aloud. These are the links in "why this happened".

## 7. Build it

1. Create `<course>/<sim-name>/casefile.mjs`. **No imports.** Copy the *shape* of
   `spm370/the-report/casefile.mjs`, not its content.
2. Add one line to `simkit/cases.mjs`.
3. Write the page(s): import `connect` from `simkit/client.mjs`; call `sim.start`, `sim.send`,
   `sim.resume`; render from `sim.view`. Write an instructor page from `sim.instructor()`,
   `reduce`, `causalChain` and `briefFor`. Copy `config.mjs` from the reference.
4. Add `<sim>.test.mjs` under `simkit/checks/` for your own paths (the generic checks in
   `every-case.test.mjs` already cover refresh, retry, leakage and instructor retrieval).
5. `node --test simkit/checks/*.test.mjs`, then `node simkit/dev-server.mjs` and play it.
6. Deployment is two small steps, described in `simkit/supabase/README.md`. No new tables.

### Casefile reference

```js
export default {
  id, version, title, course, role,
  clock: { start, end, days },          // minutes; start/end are absolute minutes from day 0
  costs: { message, open, act },        // minutes each kind of action takes
  actors:   { id: { name, role, channel, voice, wants, fears, concern, trust, reachable } },
  facts:    { F_x: { text, initial: [who…], guarded?: (s, who) => bool } },
  documents:{ id: { title, kind, body: [paragraphs], reveals: [facts], available?: s => bool } },
  speechActs: { id: { to: [actors], describe } },
  detect(to, text) { return [actIds] },
  opening: s => effects,                // first messages and standing timers
  rules: [{ id, why, once?, when: (s, ev) => bool, then: (s, ev) => effects }],
  timers:  { id: s => effects },        // re-evaluated when due
  timerWhy:{ id: 'one sentence' },
  acts:    { id: { label, blurb, cost, fields, available?, clean, effect: (s, params) => effects } },
  fallbackReply(s, who, text) { return 'authored line' },
  cleanMemo, memoFields, afterSubmit: s => effects,
  outcome(s, events), signals(s), lenses, samples,
};
```

Effects (the only ways the world changes):

| Effect | Meaning |
|---|---|
| `{ say: { from, text, must, voice } }` | A person sends a message |
| `{ learn: { who, fact, via } }` | Someone comes to know a fact, from someone |
| `{ commit: { id, to, label, quote } }` / `{ resolve: { id, status } }` | Record / settle a commitment |
| `{ flag: { key, value } }` | Something is now true |
| `{ trust: { who, delta, why } }` | A relationship moves |
| `{ after: minutes, id }` / `{ at: minute, id }` / `{ cancel: id }` | Start / stop a timer |
| `{ note: text }` | Something the student is told happened |
| `{ end: reason }` | Time is up |

Student actions the kernel accepts: `open` (a document), `message` (free text to a person),
`act` (a formal step with a form), `wait` (advance to the next thing that happens), `submit`.
`act` is the general-purpose one: an allocation, a mark-up, a schedule, a filing are all
`act`s with their own `fields`, `clean` and `effect`.

### Safe to reuse as-is

`kernel.mjs`, `handler.mjs`, `stores.mjs`, `voice.mjs`, `client.mjs`, `describe.mjs`, the
Supabase tables and Edge Function, the dev server, `every-case.test.mjs`, and the patterns in
the reference instructor room (team board, timeline with "why", who-knew-what table,
briefing inspector, two-team projector).

### Decide afresh every time

The professional and the moment; the interaction format and the whole student interface; the
facts and who holds them; the speech acts or form fields; which lines are fixed and which are
voiced; the clock; the lenses and debrief questions; the names, organisations and documents.

### Known limits (say so if the idea needs them)

- One run is one team's world. Teams do not affect each other. A shared market or league
  would need a new store operation; discuss with Jeff before building it.
- Human-to-human role play inside one run is not modelled; pods share one seat.
- Identity is self-reported team names. There is no sign-in.
- Offline and outage mode uses authored lines and keyword patterns, which are blunter than
  the AI at recognising what a student meant.

## 8. Definition of done

- [ ] Design note agreed with Jeff, including the debrief question.
- [ ] Two sample teams end in different places on at least two lenses; one sample goes
      off the expected path and the result is explainable.
- [ ] `node --test simkit/checks/*.test.mjs` passes, including your own path checks.
- [ ] Played start to finish in a browser through the dev server; refreshed mid-way; the
      state survived. Say so only if you did it.
- [ ] Student can tell that submission succeeded. Instructor page shows the same outcome.
- [ ] Each rule has a `why`; each timer has a `timerWhy`.
- [ ] No two characters' briefs read alike. Precision lines are `voice: false`.
- [ ] A README in the simulation folder: the task, why this form, how to run, the two
      sample paths, the debrief questions, what was tested and what needs a classroom trial.
- [ ] Jeff told plainly what still needs a live or classroom test.

## 9. The prompt Jeff uses to start

```
Read AGENTS.md in https://github.com/jflevine/SportManagementSim (branch: simkit-reference)
and follow it. Build a new simkit simulation for this teaching idea:

[Course and week] —
[What a professional in this situation has to do] —
[What happened last time I taught it, or what I want students to struggle with] —
[Time available and whether students work alone or in pods] —

Before writing code, send me the one-page design note from section 1 of
simkit/AUTHORING_GUIDE.md, including the two teams you would put side by side and the
question you would ask the room. Choose the interaction format from the professional task;
do not reuse The Report's interface. Work on a new branch, use fictional participants, run
the checks, and tell me exactly what you tested and what still needs a classroom trial.
```
