// Path checks for MGT 340 "The Shortfall" (mgt340/the-shortfall). Generic checks for every
// casefile live in every-case.test.mjs; these cover this simulation's own consequences.
// Run from the repository root:  node --test simkit/checks/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import cf from '../../mgt340/the-shortfall/casefile.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';
import { reduce, briefFor, causalChain, knowledgeAt } from '../kernel.mjs';

const setup = () => { const store = createMemoryStore(); return { store, handle: createHandler({ store, cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true }) }; };
const rid = () => crypto.randomUUID();
async function play(handle, steps, team = 'T', classCode = 'TEST') {
  const run = await handle('start', { caseId: cf.id, team, classCode });
  let res = run;
  for (const action of steps) res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action });
  return { run, res };
}
const sample = name => cf.samples.find(s => s.team.includes(name));
const headline = (o, who) => o.people.find(p => p.who === who).headline;

test('every sample budget is balanced at exactly $400,000 after cleaning', () => {
  for (const s of cf.samples) for (const st of s.steps) if (st.act === 'save_draft') {
    const p = cf.acts.save_draft.clean(st.params);
    assert.equal(Object.values(p).reduce((a, b) => a + b, 0), 400000, s.team);
  }
});

test('a line cannot be raised above its provisional amount or below zero', () => {
  const p = cf.acts.save_draft.clean({ tutoring: 999999, counselor: -5, fueling: 'abc', reserve: 51234 });
  assert.equal(p.tutoring, 110000); assert.equal(p.counselor, 0); assert.equal(p.fueling, 90000); assert.equal(p.reserve, 50000);
});

test('two plausible paths end in different places for Maya, SAAC and the plans', async () => {
  const { handle } = setup();
  const alder = (await play(handle, sample('Alder').steps)).res.view.debrief;
  const birch = (await play(handle, sample('Birch').steps)).res.view.debrief;
  assert.equal(headline(alder, 'Maya'), 'Reassured');
  assert.equal(headline(alder, 'Academic progress plans'), 'Plans unfunded');
  assert.equal(headline(birch, 'Maya'), 'Briefed before Finance');
  assert.equal(headline(birch, 'SAAC'), 'No post; invited the AD');
  assert.equal(headline(birch, 'Academic progress plans'), 'Covered');
  assert.equal(alder.promises[0].status, 'kept');
  assert.equal(birch.promises[0].status, 'kept');
  assert.equal(headline(alder, 'Finance'), 'Accepted');
  assert.equal(headline(birch, 'Finance'), 'Accepted');
});

test('a reassurance is recorded in the AD’s exact words and quoted back publicly when the budget breaks it', async () => {
  const { handle, store } = setup();
  const { run, res } = await play(handle, sample('Cedar').steps);
  const events = await store.events(run.runId);
  const c = events.find(e => e.type === 'commitment.made');
  assert.equal(c.quote, sample('Cedar').steps[0].text);
  assert.equal(events.find(e => e.type === 'commitment.resolved').status, 'broken');
  const post = events.find(e => e.type === 'note' && /SAAC posts on Instagram/.test(e.text));
  assert.ok(post.text.includes(c.quote));
  assert.equal(headline(res.view.debrief, 'Maya'), 'Her name is on a broken promise');
  // Hindsight: the post traces back through practice (where she repeated it) to the student's message.
  const practice = events.find(e => e.type === 'note' && /^3:30 PM/.test(e.text));
  assert.ok(causalChain(events, practice.seq).some(e => e.type === 'timer.due' && e.id === 'practice'));
});

test('the same promise, taken back to Maya before submitting, is revised rather than broken', async () => {
  const { handle } = setup();
  const steps = [sample('Cedar').steps[0], sample('Cedar').steps[2], { type: 'act', act: 'brief', params: { who: 'maya' } }, { type: 'wait' }, { type: 'wait' }, { type: 'wait' }, sample('Cedar').steps.at(-1)];
  const o = (await play(handle, steps)).res.view.debrief;
  assert.equal(o.promises[0].status, 'revised');
  assert.notEqual(headline(o, 'SAAC'), 'Posted the AD’s words');
});

test('silence is a decision: with no reply before 3:30 the rumour is posted, and travel below the charter is returned', async () => {
  const { handle } = setup();
  const o = (await play(handle, sample('Dogwood').steps)).res.view.debrief;
  assert.equal(headline(o, 'SAAC'), 'Posted the rumour');
  assert.equal(headline(o, 'Finance'), 'Returned');
  assert.match(o.people.find(p => p.who === 'Finance').detail, /signed charter/);
});

test('a promise to show Maya the numbers is broken if she only saw an earlier draft', async () => {
  const { handle } = setup();
  const b = sample('Birch').steps;
  const later = { type: 'act', act: 'save_draft', params: { ...b[5].params, fueling: 50000, lights: 85000 } };
  const steps = [b[0], b[1], b[5], b[6], later, { type: 'wait' }, { type: 'wait' }, { type: 'wait' }, b.at(-1)];
  const o = (await play(handle, steps)).res.view.debrief;
  assert.equal(o.promises.find(p => /hear the decision/.test(p.label)).status, 'broken');
  assert.equal(o.mayaSaw, 1); assert.equal(o.drafts, 2);
});

test('the tutoring floor is only known by asking Renee (or showing her a draft); no document states it', async () => {
  const { handle, store } = setup();
  const { run } = await play(handle, [{ type: 'open', doc: 'worksheet' }, { type: 'open', doc: 'policy' }, { type: 'open', doc: 'usage' }]);
  let s = reduce(cf, await store.events(run.runId));
  assert.ok(!s.knows.you.F_app, 'documents alone do not reveal the $66,000 floor');
  await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'message', to: 'renee', text: 'What is the minimum we need for tutoring?' } });
  s = reduce(cf, await store.events(run.runId));
  assert.equal(s.knows.you.F_app.via, 'renee');
});

test('each character is briefed only on what that person knows', async () => {
  const { handle, store } = setup();
  const { run } = await play(handle, sample('Cedar').steps.slice(0, 2));
  const events = await store.events(run.runId);
  const s0 = reduce(cf, events, 7);
  const ids = who => briefFor(cf, s0, who).knows.map(f => f.id);
  assert.ok(ids('maya').includes('F_rumor') && !ids('maya').includes('F_shortfall') && !ids('maya').includes('F_app'));
  assert.ok(!ids('ellen').includes('F_breakfast') && !ids('ellen').includes('F_app'));
  assert.ok(ids('ruiz').includes('F_rumor_source') && briefFor(cf, s0, 'ruiz').knows.find(f => f.id === 'F_rumor_source').guarded);
  assert.notEqual(briefFor(cf, s0, 'maya').voice, briefFor(cf, s0, 'renee').voice);
  const told = events.find(e => e.type === 'fact.learned' && e.who === 'you' && e.fact === 'F_rumor_source');
  assert.ok(!knowledgeAt(cf, events, told.seq - 1).you.includes('F_rumor_source'));
  assert.equal(told.via, 'ruiz');
});

test('a message no rule anticipates gets an in-character reply and changes nothing', async () => {
  const { handle, store } = setup();
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'message', to: 'ruiz', text: 'How did the scrimmage go on Saturday?' } });
  const s = reduce(cf, await store.events(run.runId));
  assert.equal(s.threads.ruiz.at(-1).from, 'ruiz');
  assert.ok(!s.flags.ruiz_admitted && !s.knows.you.F_rumor_source);
});

test('before submission the student view does not reveal the tutoring floor or the coach as the source', async () => {
  const { handle } = setup();
  const { res } = await play(handle, sample('Dogwood').steps.slice(0, -1));
  const text = JSON.stringify(res.view);
  assert.ok(!text.includes('66,000') && !text.includes('gut the fueling'));
  assert.ok(!/rule\.fired|timer\.set|"must"|"because"/.test(text));
});
