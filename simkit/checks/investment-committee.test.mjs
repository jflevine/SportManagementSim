// Path checks for MGT 340 "The Investment Committee" (mgt340/investment-committee).
// Run from the repository root:  node --test simkit/checks/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import cf, { SECTORS } from '../../mgt340/investment-committee/casefile.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';

const setup = () => createHandler({ store: createMemoryStore(), cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true });
const rid = () => crypto.randomUUID();
async function play(handle, steps, team = 'T') {
  const run = await handle('start', { caseId: cf.id, team, classCode: 'TEST' });
  let res = run;
  for (const action of steps) res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action });
  return { run, res };
}
const sample = name => cf.samples.find(s => s.team.includes(name));
const memo = (call, consent, extra = {}) => ({ type: 'submit', memo: { call, consent, authorize: 'x', condition: 'y', evidence: 'Charter 4.3', unknown: '', ...extra } });

test('Round 1 is asked before any file exists, and cannot be answered twice', async () => {
  const handle = setup();
  const { run, res } = await play(handle, []);
  assert.deepEqual(res.view.documents, [], 'no documents before Round 1');
  assert.deepEqual(res.view.acts.map(a => a.id), ['round1']);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: memo('walk', 'none') }), /Round 1/);
  const after = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'act', act: 'round1', params: { sector: 'media', reason: 'Highlights travel.' } } });
  assert.ok(!after.view.acts.some(a => a.id === 'round1'));
  assert.deepEqual(after.view.documents.map(d => d.id).sort(), ['charter', 'memo_media']);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'act', act: 'round1', params: { sector: 'fan', reason: 'Changed our minds.' } } }), /not available/);
});

test('the Round 1 recommendation survives into Round 2: through later actions, a reload, a second device, and the debrief', async () => {
  const handle = setup();
  const reason = 'Every club sells tickets, so one platform could serve all 32.';
  const { run, res } = await play(handle, [{ type: 'act', act: 'round1', params: { sector: 'fan', reason } }, { type: 'open', doc: 'charter' }, { type: 'act', act: 'ask', params: { whom: 'counsel' } }]);
  const r1 = v => v.events.find(e => e.type === 'student.act' && e.act === 'round1').params;
  assert.deepEqual(r1(res.view), { sector: 'fan', reason });
  assert.equal(res.view.events.find(e => e.type === 'commitment.made').quote, reason);
  const reload = await handle('view', { runId: run.runId, token: run.token });
  assert.deepEqual(r1(reload.view), { sector: 'fan', reason });
  const second = await handle('join', { joinCode: run.joinCode });
  assert.deepEqual(r1(second.view), { sector: 'fan', reason });
  const done = await handle('act', { runId: run.runId, token: second.token, requestId: rid(), action: memo('condition', 'clubs') });
  assert.deepEqual(done.view.debrief.round1, { sector: 'Fan engagement', why: reason });
  assert.equal(done.view.debrief.final.call, cf.calls.condition);
});

test('same sector, different conditions: Pods A and B end in different places', async () => {
  const a = (await play(setup(), sample('Pod A').steps)).res.view.debrief;
  const b = (await play(setup(), sample('Pod B').steps)).res.view.debrief;
  assert.equal(a.round1.sector, b.round1.sector);
  assert.notEqual(a.chair, b.chair); assert.notEqual(a.later[0], b.later[0]);
  assert.match(a.chair, /4\.4/); assert.match(a.later[0], /did not move/);
  assert.match(b.later[0], /taken its other offer/);
});

test('approving without the right-holder is allowed, and the chair says what was missing', async () => {
  const c = (await play(setup(), sample('Pod C').steps)).res.view.debrief;
  assert.match(c.chair, /4\.3/); assert.match(c.chair, /nobody opened the charter/);
  assert.equal(c.named, 'none'); assert.match(c.later[0], /could not sell/);
});

test('a condition tied to the wrong party gives no protection', async () => {
  const steps = [{ type: 'act', act: 'round1', params: { sector: 'perf', reason: 'Data.' } }, { type: 'open', doc: 'charter' }, memo('condition', 'clubs')];
  const d = (await play(setup(), steps)).res.view.debrief;
  assert.equal(d.named, 'other'); assert.match(d.chair, /does not control/); assert.match(d.later[0], /gave no protection/);
});

test('each call returns a partial answer; calling twice adds nothing; every sector has all five aftermaths', async () => {
  for (const [k, c] of Object.entries(SECTORS)) {
    for (const call of Object.keys(cf.calls)) assert.ok(c.later[call], `${k}.${call}`);
    const { res } = await play(setup(), [{ type: 'act', act: 'round1', params: { sector: k, reason: 'r' } }, { type: 'act', act: 'ask', params: { whom: 'counsel' } }, { type: 'act', act: 'ask', params: { whom: 'counsel' } }]);
    const said = res.view.events.filter(e => e.type === 'actor.message' && e.from === 'raman').map(e => e.text);
    assert.equal(said[0], c.asks.counsel[1]); assert.match(said[0], /have not (read|seen)|cannot tell you/); assert.match(said[1], /do not have more/);
  }
});

test('at 4:00 the file closes to reading and calls, and the pod can still send its recommendation', async () => {
  const handle = setup();
  const { run, res } = await play(handle, [{ type: 'act', act: 'round1', params: { sector: 'hosp', reason: 'r' } }, { type: 'wait' }]);
  assert.ok(res.view.ended);
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: { type: 'act', act: 'ask', params: { whom: 'holder' } } }), /Time has run out/);
  const done = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: memo('walk', 'stadium') });
  assert.ok(done.view.submitted);
});
