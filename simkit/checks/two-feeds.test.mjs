// Two Feeds: checks for this simulation's own paths. The generic checks in
// every-case.test.mjs already cover refresh, retry, leakage and instructor retrieval.
import test from 'node:test';
import assert from 'node:assert/strict';
import cf from '../../spm370/two-feeds/casefile.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';
import { reduce, causalChain, briefFor } from '../kernel.mjs';

const rid = () => crypto.randomUUID();
async function play(steps) {
  const store = createMemoryStore(); const handle = createHandler({ store, cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true });
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'CHECK' }); let res = run;
  for (const action of steps) res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action });
  return { res, events: await store.events(run.runId), handle, run };
}
const sample = n => cf.samples.find(s => s.team.includes(n)).steps;
const advise = (rec, conds = {}, why = 'reason') => ({ type: 'submit', memo: { rec, conds, why } });
const ask = { type: 'message', to: 'mateo', text: 'What exactly are you planning to stream, and in what language?' };

test('the same two agreements support opposite advice with different costs', async () => {
  const a = (await play(sample('Anchor'))).res.view.debrief, b = (await play(sample('Beacon'))).res.view.debrief;
  assert.equal(a.people[2].headline, 'Down $30,000'); assert.equal(b.people[2].headline, 'Kept both partners and both payments');
  assert.equal(a.found.spanish, false); assert.equal(b.found.spanish, true);
});

test('the fact that changes the advice is in no document; only asking reveals it', async () => {
  const all = Object.keys(cf.documents).map(doc => ({ type: 'open', doc }));
  const { res, events } = await play(all.slice(0, 5));
  const s = reduce(cf, events);
  assert.ok(!s.knows.you.F_spanish && !s.knows.you.F_preshow, 'reading everything does not reveal the language');
  assert.ok(!JSON.stringify(res.view).includes('español'));
  const asked = await play([ask]);
  assert.ok(reduce(cf, asked.events).knows.you.F_spanish);
});

test('the CEO acts on what the advice leaves out: no language condition, an English pre-show airs', async () => {
  const { res, events } = await play([{ type: 'open', doc: 'lumen' }, advise('coexist', { notice: true })]);
  assert.equal(res.view.debrief.people[0].headline, 'Cut its fee by $48,000');
  const cut = events.find(e => e.type === 'flag.set' && e.key === 'makegood');
  assert.ok(causalChain(events, cut.seq).some(e => e.type === 'run.submitted'), 'traceable to the advice');
  assert.ok(events.some(e => e.type === 'note' && /English-language pre-show/.test(e.text)));
});

test('notice advised after 6:00 PM is late, and the student who read 2.3 is told when the window closes', async () => {
  const slow = [...Object.keys(cf.documents).map(doc => ({ type: 'open', doc })), ask, { type: 'message', to: 'grace', text: 'What matters most to Lumen?' }, { type: 'message', to: 'devon', text: 'Who approved this?' }, { type: 'message', to: 'imani', text: 'Nearly there.' }, { type: 'message', to: 'imani', text: 'One more minute.' }, { type: 'message', to: 'devon', text: 'Anything else I should know?' }];
  const { res, events } = await play([...slow, advise('coexist', { spanish: true, notice: true })]);
  assert.ok(reduce(cf, events).flags.window_closed);
  assert.ok(events.some(e => e.type === 'note' && /Any notice under Lumen 2.3 sent from now on is late/.test(e.text)));
  assert.equal(res.view.debrief.people[0].headline, 'Cut its fee by $48,000');
});

test('a reassurance given before advising is recorded and quoted back if the advice contradicts it', async () => {
  const { res, events } = await play([{ type: 'message', to: 'mateo', text: "You're fine to stream Saturday." }, advise('enforce')]);
  assert.equal(res.view.debrief.promises[0].status, 'broken');
  assert.ok(events.some(e => e.type === 'actor.message' && e.from === 'mateo' && e.text.includes("You're fine to stream Saturday.")));
});

test('a hedged reply is not treated as a promise; a question is not treated as an answer', () => {
  assert.deepEqual(cf.detect('mateo', "I can't confirm you're fine to stream until I've read both agreements."), []);
  assert.deepEqual(cf.detect('grace', 'I cannot promise that no one else will broadcast yet.'), []);
  assert.deepEqual(cf.detect('mateo', 'Which language is your commentary in?'), ['ask_plan']);
});

test('advice with no recommendation or no reason is refused and nothing is submitted', async () => {
  const { handle, run } = await play([]);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: advise('', {}, 'x') }), /Choose what you are advising/);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: advise('both', {}, '  ') }), /reason/);
  assert.equal((await handle('view', { runId: run.runId, token: run.token })).view.submitted, null);
});

test('the four people are briefed differently, and held-back facts stay guarded', () => {
  const s = reduce(cf, []);
  const ids = w => briefFor(cf, s, w).knows.filter(f => !f.guarded).map(f => f.id);
  assert.ok(!ids('grace').includes('F_spanish') && !ids('mateo').includes('F_carveout') && !ids('imani').includes('F_spanish'));
  assert.ok(briefFor(cf, s, 'mateo').knows.find(f => f.id === 'F_preshow').guarded);
  assert.equal(new Set(['imani', 'grace', 'mateo', 'devon'].map(w => briefFor(cf, s, w).concern)).size, 4);
});
