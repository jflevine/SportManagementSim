// Path checks for MGT 340 "Negotiate a Workable Change" (mgt340/workable-change).
// Run from the repository root:  node --test simkit/checks/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import cf, { RESPONSES, TERMS, LEVERS } from '../../mgt340/workable-change/casefile.mjs';
import { createHandler } from '../handler.mjs';
import { createMemoryStore } from '../stores.mjs';
import { authoredVoice } from '../voice.mjs';

const setup = () => createHandler({ store: createMemoryStore(), cases: { [cf.id]: cf }, voice: authoredVoice(), openInstructor: true });
const rid = () => crypto.randomUUID();
async function play(handle, steps) {
  const run = await handle('start', { caseId: cf.id, team: 'T', classCode: 'TEST' });
  let res = run;
  for (const action of steps) res = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action });
  return { run, res };
}
const side = role => ({ type: 'act', act: 'side', params: { role } });
const propose = (term, move, lever = '', wording = 'w') => ({ type: 'act', act: 'propose', params: { term, move, lever, wording } });
const report = (term, consent = 'union') => ({ type: 'submit', memo: { term, consent, wording: 'w', reason: 'r', evidence: 'Current agreement, point 2', changed: 'c' } });
const lastSaid = v => v.events.filter(e => e.type === 'actor.message').at(-1);
const sample = n => cf.samples.find(s => s.team.includes(n));

test('every term, move and revision has an authored answer on both sides', () => {
  for (const role of ['management', 'players']) for (const t of Object.keys(TERMS)) for (const k of ['accept', 'reject', 'defer', ...Object.keys(LEVERS)]) {
    const r = RESPONSES[role][t][k]; assert.ok(r && ['agree', 'counter', 'refuse'].includes(r[0]) && r[1].length > 20, `${role}.${t}.${k}`);
  }
});

test('the other side’s response changes when the term changes', async () => {
  const say = async (role, ...p) => lastSaid((await play(setup(), [side(role), propose(...p)])).res.view).text;
  const a = await say('management', 't1', 'revise', 'limit'), b = await say('management', 't3', 'revise', 'limit');
  assert.notEqual(a, b); assert.match(a, /mandatory/); assert.match(b, /current rule applied to games/);
});

test('the response changes when the move on the same term changes, and when the pod sits on the other side', async () => {
  const say = async (role, ...p) => lastSaid((await play(setup(), [side(role), propose(...p)])).res.view).text;
  const seen = new Set();
  for (const [move, lever] of [['accept', ''], ['reject', ''], ['defer', ''], ...Object.keys(LEVERS).map(l => ['revise', l])]) seen.add(await say('management', 't1', move, lever));
  assert.equal(seen.size, 8, 'eight different answers on Term 1');
  assert.notEqual(await say('management', 't1', 'accept'), await say('players', 't1', 'accept'));
});

test('a pod that is refused and comes back with a different proposal gets a different answer, and both stay on the record', async () => {
  const { res } = await play(setup(), sample('M1').steps);
  const d = res.view.debrief;
  assert.deepEqual(d.exchanges.map(x => x.stance), ['Refuses', 'Counters']);
  assert.match(d.exchanges[0].reply, /stop using a wearable at any time/);
  assert.equal(d.result, 'open'); assert.match(d.later[0], /no longer the one the league office first wrote/);
});

test('agreeing outside your instructions: the table says yes and your own side says no', async () => {
  const d = (await play(setup(), sample('P1').steps)).res.view.debrief;
  assert.equal(d.exchanges[0].stance, 'Agrees'); assert.equal(d.result, 'disowned');
  assert.match(d.principalSaid, /right to decline/); assert.match(d.principalSaid, /One correction/);
});

test('naming the commissioner or the owners as the only agreement needed draws a correction', async () => {
  for (const who of ['commissioner', 'owners']) {
    const d = (await play(setup(), [side('management'), propose('t2', 'revise', 'limit'), report('t2', who)])).res.view.debrief;
    assert.match(d.principalSaid, /the association has to agree/);
  }
  const ok = (await play(setup(), [side('management'), propose('t2', 'revise', 'limit'), report('t2', 'union')])).res.view.debrief;
  assert.doesNotMatch(ok.principalSaid, /One correction/); assert.equal(ok.result, 'tentative');
});

test('each side sees only its own instructions; three proposals is the limit; reporting without proposing is recorded as untested', async () => {
  const handle = setup();
  const { run, res } = await play(handle, [side('players')]);
  assert.deepEqual(res.view.documents.map(d => d.id).sort(), ['brief_players', 'current', 'proposal']);
  let v;
  for (let i = 0; i < 3; i++) v = await handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: propose('t3', 'revise', 'limit') });
  assert.ok(!v.view.acts.some(a => a.id === 'propose'));
  await assert.rejects(handle('act', { runId: run.runId, token: run.token, requestId: rid(), action: propose('t1', 'defer') }), /not available/);
  const d = (await play(setup(), [side('management'), report('t1')])).res.view.debrief;
  assert.equal(d.result, 'untested');
});
