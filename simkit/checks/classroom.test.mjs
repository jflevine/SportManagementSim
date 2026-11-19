// Runnable checks: `node --test simkit/checks/` from the repository root.
// They exercise the reference simulation through the same handler the classroom uses,
// against an in-memory store with authored voices (no network, no AI, no student data).
import test from 'node:test';
import assert from 'node:assert/strict';
import cf from '../../spm370/the-report/casefile.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';
import { reduce, briefFor, causalChain, knowledgeAt } from '../kernel.mjs';

const setup = () => { const store = createMemoryStore(); return { store, handle: createHandler({ store, cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true }) }; };
const rid = () => crypto.randomUUID();
async function play(handle, sample, classCode = 'TEST') {
  const run = await handle('start', { caseId: cf.id, team: sample.team, members: sample.members, classCode });
  let res = run;
  for (const action of sample.steps) res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action });
  return { run, res };
}
const sample = name => cf.samples.find(s => s.team.includes(name));

test('the authored patterns recognise every speech act the sample teams rely on', () => {
  for (const s of cf.samples) for (const st of s.steps) if (st.type === 'message')
    assert.deepEqual([...cf.detect(st.to, st.text)].sort(), [...st.acts].sort(), st.text);
});

test('two plausible paths end in meaningfully different places', async () => {
  const { handle } = setup();
  const kestrel = (await play(handle, sample('Kestrel'))).res.view.debrief;
  const osprey = (await play(handle, sample('Osprey'))).res.view.debrief;
  assert.equal(kestrel.people[0].headline, 'Told you, and nothing changed');
  assert.equal(osprey.people[0].headline, 'Taking part in the review');
  assert.equal(kestrel.people[2].headline, 'League inquiry opened Monday');
  assert.equal(osprey.people[2].headline, 'League notified before check-in');
  assert.equal(kestrel.promise.status, 'open');
  assert.equal(osprey.promise, null);
});

test('BEFORE/AFTER: a promise is recorded in the student\'s words and later held against them', async () => {
  const { handle, store } = setup();
  const { run, res } = await play(handle, sample('Heron'));
  const events = await store.events(run.runId);
  const promise = events.find(e => e.type === 'commitment.made');
  assert.equal(promise.quote, 'Yes, this stays between us.');            // the student's exact words
  const broken = events.find(e => e.type === 'commitment.resolved');
  assert.equal(broken.status, 'broken');
  const rinLine = events.find(e => e.type === 'actor.message' && e.from === 'rin' && /you said this would stay between us/.test(e.text));
  assert.ok(rinLine, 'Rin holds the student to the promise');
  // Hindsight: her reaction traces back through Dana's email to the referral the student filed.
  const chain = causalChain(events, rinLine.seq).map(e => e.type + (e.act ? ':' + e.act : '') + (e.id ? ':' + e.id : ''));
  assert.ok(chain.includes('student.act:refer') && chain.includes('timer.due:dana_contacts_rin'), chain.join(' > '));
  assert.equal(res.view.debrief.promise.status, 'broken');
  // Same promise, but the student goes back to her first: she stays in.
  const { handle: h2 } = setup();
  const kept = { team: 'Variant', steps: [sample('Heron').steps[0], sample('Heron').steps[2],
    { type: 'message', to: 'rin', text: 'I have to tell you before anyone else does. I can’t keep this between us after all; I’ve referred it to Dana and she will email you.' }, { type: 'wait' }, { type: 'wait' }, sample('Heron').steps[6]] };
  const v = (await play(h2, kept)).res.view.debrief;
  assert.equal(v.promise.status, 'revised');
  assert.equal(v.people[0].headline, 'Taking part in the review');
});

test('each character is briefed only on what that person knows at that moment', async () => {
  const { handle, store } = setup();
  const { run } = await play(handle, sample('Merlin'));
  const events = await store.events(run.runId);
  const start = reduce(cf, events, 4);
  const ids = who => briefFor(cf, start, who).knows.map(f => f.id);
  assert.ok(!ids('marcus').includes('F_dms') && !ids('marcus').includes('F_report'));
  assert.ok(!ids('rin').includes('F_prior') && !ids('rin').includes('F_policy'));
  assert.ok(!ids('dana').includes('F_report'));
  const told = events.find(e => e.type === 'fact.learned' && e.who === 'marcus' && e.fact === 'F_report');
  assert.ok(!knowledgeAt(cf, events, told.seq - 1).marcus.includes('F_report'));
  assert.ok(knowledgeAt(cf, events, told.seq).marcus.includes('F_report'));
  assert.equal(told.via, 'you');
});

test('a reasonable action off the expected path has a consequence that makes sense', async () => {
  const { handle, store } = setup();
  const { run, res } = await play(handle, sample('Merlin'));
  const events = await store.events(run.runId);
  const dm = events.find(e => e.type === 'actor.message' && e.from === 'rin' && /how does he know/.test(e.text));
  assert.ok(dm);
  assert.ok(causalChain(events, dm.seq).some(e => e.type === 'student.message' && e.to === 'cole'));
  assert.equal(res.view.debrief.people[0].headline, 'Contacted by Cole');
});

test('a free-text message no rule anticipates still gets an in-character reply and changes nothing', async () => {
  const { handle, store } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  const res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'message', to: 'marcus', text: 'How is draft prep going for Saturday?' } });
  const last = res.view.events.filter(e => e.type === 'actor.message').pop();
  assert.equal(last.from, 'marcus');
  const s = reduce(cf, await store.events(run.runId));
  assert.ok(!s.knows.marcus.F_report);
});

test('refresh mid-activity: a new page load recovers the same state from the server', async () => {
  const { handle } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  const a = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: sample('Kestrel').steps[0] });
  const reloaded = await handle('view', { runId: run.runId, token: run.token });
  assert.deepEqual(reloaded.view, a.view);
  assert.ok(reloaded.view.events.some(e => e.type === 'commitment.made'));
});

test('retry: the same request sent twice is applied once', async () => {
  const { handle, store } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  const requestId = rid(); const body = { runId: run.runId, token: run.token, requestId, action: sample('Kestrel').steps[0] };
  const first = await handle('act', body); const second = await handle('act', body);
  assert.equal(second.replay, true);
  assert.deepEqual(second.view, first.view);
  const events = await store.events(run.runId);
  assert.equal(events.filter(e => e.type === 'student.message').length, 1);
  assert.equal(events.filter(e => e.type === 'commitment.made').length, 1);
});

test('two pod members acting at once cannot corrupt the ledger', async () => {
  const { handle, store } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  const mate = await handle('join', { joinCode: run.joinCode });
  await Promise.all([
    handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'open', doc: 'handbook' } }),
    handle('act', { runId: mate.runId, token: mate.token, requestId: rid(), action: { type: 'open', doc: 'rulebook' } }),
  ]);
  const seqs = (await store.events(run.runId)).map(e => e.seq);
  assert.deepEqual(seqs, seqs.map((_, i) => i + 1));
});

test('submit: the student can tell it succeeded, cannot submit twice, and the instructor retrieves the same outcome', async () => {
  const { handle } = setup();
  const { run, res } = await play(handle, sample('Osprey'), 'SEC-A');
  assert.ok(res.view.submitted && res.view.debrief);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'submit', memo: {} } }), /already been submitted/);
  const board = await handle('instructor.runs', { caseId: cf.id, classCode: 'SEC-A' });
  assert.equal(board.runs.length, 1);
  const s = reduce(cf, board.runs[0].events);
  assert.deepEqual(cf.outcome(s, board.runs[0].events), res.view.debrief);
  assert.equal(s.submitted.memo.did, sample('Osprey').steps.at(-1).memo.did);
});

test('before submitting, the student view holds nothing the student has not been shown', async () => {
  const { handle } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  const res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: sample('Merlin').steps[1] });
  const text = JSON.stringify(res.view);
  assert.ok(!/rule\.fired|timer\.set|"why"|"must"|"because"/.test(text));
  assert.ok(!res.view.events.some(e => e.type === 'fact.learned' && e.who !== 'you'));
  assert.ok(!text.includes('March'));
  assert.equal(res.view.documents.find(d => d.id === 'incidentlog'), undefined);
});

test('the instructor key is required when the board is not open', async () => {
  const store = createMemoryStore();
  const { sha256 } = await import('../handler.mjs');
  const handle = createHandler({ store, cases: { [cf.id]: cf }, voice: authoredVoice(), instructorKeyHash: await sha256('right') });
  await assert.rejects(handle('instructor.runs', { caseId: cf.id, key: 'wrong' }), /not accepted/);
  assert.deepEqual((await handle('instructor.runs', { caseId: cf.id, key: 'right' })).runs, []);
});

test('a guarded fact never reaches a voice in a free reply', async () => {
  const { characterPrompt } = await import('../voice.mjs');
  const s = reduce(cf, []);
  const brief = briefFor(cf, s, 'priya');
  assert.ok(!characterPrompt({ cf, brief, must: null, free: true }).includes('March'));
  assert.ok(characterPrompt({ cf, brief, must: 'Admits March.', free: false }).includes('March'));
});
