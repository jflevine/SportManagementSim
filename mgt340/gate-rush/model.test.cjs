'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert.equal(scripts.length, 2, 'Expected the model and interface scripts');
scripts.forEach((script, i) => new vm.Script(script, { filename: `embedded-script-${i}.js` }));
const sandbox = {};
vm.runInNewContext(scripts[0], sandbox);
const M = sandbox.GateRushModel;
const plain = value => JSON.parse(JSON.stringify(value));
const metrics = plan => plain(M.metrics(M.simulate(plan)));

assert.equal(M.WAVES.length, 6);
assert.equal(M.WAVES.reduce((sum, w) => sum + w.routine, 0), 18);
assert.equal(M.WAVES.reduce((sum, w) => sum + w.help, 0), 6);
assert.equal(M.TOTAL, 24);
assert.deepEqual(plain(M.WAVES.map(w => [w.routine, w.help])), [[4, 0], [0, 3], [6, 0], [2, 3], [6, 0], [0, 0]]);

const known = [
  {plan: [2, 2, 2, 2, 2, 2], served: 23, pending: 1, wait: 65, routine: 20, help: 45},
  {plan: [1, 1, 1, 1, 1, 1], served: 18, pending: 6, wait: 130, routine: 120, help: 10},
  {plan: [2, 1, 2, 2, 2, 1], served: 24, pending: 0, wait: 40, routine: 20, help: 20},
  {plan: [2, 1, 2, 1, 2, 2], served: 24, pending: 0, wait: 50, routine: 40, help: 10}
];
for (const expected of known) {
  const actual = metrics(expected.plan);
  assert.equal(actual.served, expected.served);
  assert.equal(actual.pending, expected.pending);
  assert.equal(actual.waitingMinutes, expected.wait);
  assert.equal(actual.routes.routine.finishedWait + actual.routes.routine.pendingWait, expected.routine);
  assert.equal(actual.routes.help.finishedWait + actual.routes.help.pendingWait, expected.help);
}

let fullCompletion = 0;
const completedWaits = [];
for (let mask = 0; mask < 64; mask++) {
  const plan = Array.from({ length: 6 }, (_, i) => ((mask >> i) & 1) + 1);
  let model = M.initial();
  for (let step = 0; step < 6; step++) {
    const before = JSON.stringify(model);
    const next = M.advance(model, plan[step]);
    assert.equal(JSON.stringify(model), before, 'advance must not mutate prior model');
    const h = next.history[step], wave = M.WAVES[step], x = M.metrics(next);
    const sr = h.served.filter(t => t.route === 'routine').length;
    const sh = h.served.length - sr;
    assert.equal(h.routineStaff + h.helpStaff, 3, 'No volunteer double-counting');
    assert.ok(h.routineStaff >= 1 && h.helpStaff >= 1, 'Both service routes protected');
    assert.ok(sr <= h.routineStaff * 2 && sh <= h.helpStaff, 'Respect rate capacities');
    assert.equal(next.queues.routine.length, model.queues.routine.length + wave.routine - sr);
    assert.equal(next.queues.help.length, model.queues.help.length + wave.help - sh);
    assert.equal(h.addedWait, (next.queues.routine.length + next.queues.help.length) * 5);
    assert.equal(next.waitingMinutes, model.waitingMinutes + h.addedWait);
    assert.equal(x.served + x.pending + x.notArrived, 24, 'Team conservation');
    assert.equal(next.arrived, next.completed.length + next.queues.routine.length + next.queues.help.length);
    const teams = [...next.completed, ...next.queues.routine, ...next.queues.help];
    assert.equal(new Set(teams.map(t => t.id)).size, teams.length, 'No duplicate or lost team');
    for (const route of ['routine', 'help']) {
      const completed = next.completed.filter(t => t.route === route);
      const ids = completed.map(t => t.id);
      assert.deepEqual(plain(ids), plain([...ids].sort((a, b) => a - b)), 'FIFO order');
      if (completed.length && next.queues[route].length) {
        assert.ok(completed.at(-1).id < next.queues[route][0].id, 'No newer team overtakes waiting team');
      }
      for (const team of completed) assert.equal(team.wait, (team.servedStep - team.arrivalStep) * 5);
    }
    const teamWait = next.completed.reduce((sum, t) => sum + t.wait, 0) +
      [...next.queues.routine, ...next.queues.help].reduce((sum, t) => sum + (next.step - t.arrivalStep) * 5, 0);
    assert.equal(teamWait, next.waitingMinutes, 'Individual and queue-area delay accounting agree');
    model = next;
  }
  assert.deepEqual(plain(model), plain(M.simulate(plan)), 'Identical replay is deterministic');
  assert.throws(() => M.advance(model, 2), /complete/);
  if (model.completed.length === 24) { fullCompletion++; completedWaits.push(model.waitingMinutes); }
}
assert.equal(fullCompletion, 18, '18 of 64 permitted plans complete all teams');
assert.equal(Math.min(...completedWaits), 40);
assert.equal(completedWaits.filter(w => w === 40).length, 2);
for (const invalid of [-1, 0, 3, 4, 1.5, '2', null, undefined]) assert.throws(() => M.advance(M.initial(), invalid), /route/);
const first = M.advance(M.initial(), 2);
assert.equal(first.completed.length, 4);
assert.ok(first.completed.every(t => t.wait === 0), 'Same-window service excludes service time');
const staticModel = M.simulate([2, 2, 2, 2, 2, 2]);
assert.equal(staticModel.queues.help.length, 1);
assert.equal((staticModel.step - staticModel.queues.help[0].arrivalStep) * 5, 15, 'Pending final team retains accrued delay');

assert.ok(!/<(?:script|link|img|iframe|audio|video)[^>]+(?:src|href)\s*=\s*["']https?:/i.test(html), 'No remote assets');
assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(scripts.join('\n')), 'No network calls');
assert.ok(html.includes('mgt340.gate-rush.v1'), 'Namespaced browser save');
assert.ok(html.includes('prefers-reduced-motion'), 'Reduced-motion support');
assert.ok(html.includes('aria-live="polite"'), 'Results announcements');
assert.ok(html.includes('type=\'text/plain;charset=utf-8\'') || html.includes("type:'text/plain;charset=utf-8'"), 'Plain-text result export');

console.log('Gate Rush: syntax, known outcomes, all 64 plans, 384 window states, conservation, capacities, FIFO, delay accounting, deterministic replay, and offline checks passed.');
