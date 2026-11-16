// Checks that EVERY registered casefile must pass. A new simulation gets these for free by
// being listed in simkit/cases.mjs and providing `samples`, `lenses` and `outcome`.
// Run all checks from the repository root:  node --test simkit/checks/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { cases } from '../cases.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';
import { reduce } from '../kernel.mjs';

const rid = () => crypto.randomUUID();
for (const cf of Object.values(cases)) {
  const setup = () => { const store = createMemoryStore(); return { store, handle: createHandler({ store, cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true }) }; };
  const play = async (handle, sample, upTo = Infinity) => {
    const run = await handle('start', { caseId: cf.id, team: sample.team, classCode: 'CHECK' });
    let res = run; let i = 0;
    for (const action of sample.steps) { if (i++ >= upTo) break; res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action }); }
    return { run, res };
  };

  test(`${cf.id}: has the parts an instructor needs`, () => {
    assert.ok(cf.samples?.length >= 2, 'at least two scripted sample teams');
    assert.ok(cf.lenses?.length >= 2 && cf.lenses.every(l => l.question && l.value), 'lenses, each with a debrief question');
    assert.equal(typeof cf.outcome, 'function'); assert.equal(typeof cf.signals, 'function');
    for (const r of cf.rules) assert.ok(r.id && r.why && r.when && r.then, `rule ${r.id} needs id, why, when, then`);
  });

  test(`${cf.id}: every sample team plays to a submitted file without error`, async () => {
    for (const s of cf.samples) { const { handle } = setup(); const { res } = await play(handle, s); assert.ok(res.view.submitted, s.team); assert.ok(res.view.debrief, s.team); }
  });

  test(`${cf.id}: sample teams differ on at least two lenses (there is something to debrief)`, async () => {
    const states = [];
    for (const s of cf.samples) { const { handle, store } = setup(); const { run } = await play(handle, s); states.push(reduce(cf, await store.events(run.runId))); }
    const differing = cf.lenses.filter(l => new Set(states.map(st => l.value(st))).size > 1);
    assert.ok(differing.length >= 2, `only ${differing.length} lens(es) separate the sample teams`);
  });

  test(`${cf.id}: authored patterns find the speech acts the samples rely on`, () => {
    for (const s of cf.samples) for (const st of s.steps) if (st.type === 'message' && st.acts)
      assert.deepEqual([...cf.detect(st.to, st.text)].sort(), [...st.acts].sort(), st.text);
  });

  test(`${cf.id}: what a sample team enters in a form is what gets recorded (nothing silently clamped)`, () => {
    for (const s of cf.samples) for (const st of s.steps) if (st.type === 'act' && cf.acts[st.act]?.clean) {
      const cleaned = cf.acts[st.act].clean(st.params || {}, reduce(cf, []));
      for (const [k, v] of Object.entries(st.params || {})) assert.deepEqual(cleaned[k], v, `${s.team}: ${st.act}.${k}`);
    }
  });

  test(`${cf.id}: refresh returns the same view; a retried request applies once`, async () => {
    const { handle, store } = setup(); const s = cf.samples[0];
    const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'CHECK' });
    const body = { runId: run.runId, token: run.token, requestId: rid(), action: s.steps[0] };
    const first = await handle('act', body); const count = (await store.events(run.runId)).length;
    const again = await handle('act', body);
    assert.equal(again.replay, true); assert.equal((await store.events(run.runId)).length, count);
    assert.deepEqual((await handle('view', { runId: run.runId, token: run.token })).view, first.view);
  });

  test(`${cf.id}: before submission the student view exposes no hidden events`, async () => {
    for (const s of cf.samples) {
      const { handle } = setup(); const { res } = await play(handle, s, s.steps.length - 1);
      if (res.view.submitted) continue;
      assert.ok(!/"rule\.fired"|"timer\.set"|"why":|"must":|"because":/.test(JSON.stringify(res.view)), s.team);
      assert.ok(!res.view.events.some(e => e.type === 'fact.learned' && e.who !== 'you'), s.team);
    }
  });

  test(`${cf.id}: the instructor retrieves exactly the outcome the student saw`, async () => {
    const { handle } = setup(); const { res } = await play(handle, cf.samples[0]);
    const board = await handle('instructor.runs', { caseId: cf.id, classCode: 'CHECK' });
    const ev = board.runs[0].events;
    assert.deepEqual(cf.outcome(reduce(cf, ev), ev), res.view.debrief);
  });
}
