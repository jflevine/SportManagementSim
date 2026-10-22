import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createHandler, digest} from '../backend/handler.mjs';

const OPEN = Date.parse('2026-10-22T19:30:00Z');
const CLOSE = Date.parse('2026-10-23T03:59:00Z');
const CLASS_CODE = 'SYNTHETIC_CLASS_CODE_FOR_TESTS';
const INSTRUCTOR_KEY = 'SYNTHETIC_INSTRUCTOR_KEY_FOR_TESTS';
const ID = '10000000-0000-4000-8000-000000000001';
const TOKEN = '20000000-0000-4000-8000-00000000000130000000-0000-4000-8000-000000000001';

async function fixture({at = OPEN, mode = 'graded', released = true} = {}) {
  const policy = {
    id: 'synthetic-release-test', mode, assessed_release: true,
    release_at: new Date(OPEN).toISOString(), close_at: new Date(CLOSE).toISOString(),
    public_case: 'Synthetic public case', student_brief: 'Synthetic student brief',
    opening: 'Synthetic opening', model_name: 'synthetic-model',
  };
  const sessions = new Map(), events = new Map(), commands = [];
  const store = {
    policy: async () => policy,
    policyById: async () => policy,
    session: async id => sessions.get(id) || null,
    events: async id => events.get(id) || [],
    command: async (action, args) => {
      commands.push({action, args});
      assert.equal(action, 'create');
      if ([...sessions.values()].some(s => s.case_id === args.case_id && s.email === args.email)) {
        throw Error('duplicate key value violates unique constraint');
      }
      // SQL deadline arithmetic is covered by the separate rollback-only test.
      sessions.set(args.id, {
        ...args, mode, bargain_until: new Date(at + 35 * 60000).toISOString(),
        confirm_until: new Date(at + 40 * 60000).toISOString(),
      });
      events.set(args.id, [{seq: 1, actor: 'counterpart', text: 'Synthetic opening', payload: {}}]);
      return {id: args.id};
    },
  };
  const handler = createHandler({
    store, provider: {configured: true, model: 'synthetic-model'},
    classHash: await digest(CLASS_CODE), instructorHash: await digest(INSTRUCTOR_KEY),
    allowedOrigins: ['https://class.example'], released, now: () => at,
  });
  const body = {
    mode, name: 'Synthetic Test Student', email: 'synthetic@example.invalid',
    classCode: mode === 'pilot' ? INSTRUCTOR_KEY : CLASS_CODE,
    consent: true, attempt_id: ID, attempt_token: TOKEN,
  };
  const start = overrides => handler(new Request('https://api.example/spm370-contract-negotiation/start', {
    method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://class.example'},
    body: JSON.stringify({...body, ...overrides}),
  }));
  return {handler, start, sessions, events, commands, policy};
}

test('graded start stays closed without an explicit assessed release', async () => {
  const f = await fixture({released: false});
  const r = await f.start();
  assert.equal(r.status, 403);
  assert.match((await r.json()).error, /not been released/i);
  assert.equal(f.commands.length, 0);
});

test('before the opening, start returns a useful message and creates no attempt', async () => {
  const f = await fixture({at: OPEN - 1});
  const r = await f.start();
  assert.equal(r.status, 403);
  assert.match((await r.json()).error, /opens.*3:30.*Eastern/i);
  assert.equal(f.commands.length, 0);
});

test('opening instant and the final millisecond before closing permit new starts', async () => {
  for (const at of [OPEN, CLOSE - 1]) {
    const f = await fixture({at});
    const r = await f.start({email: 'Synthetic@EXAMPLE.INVALID'});
    assert.equal(r.status, 200);
    assert.equal((await r.json()).session.mode, 'graded');
    assert.equal(f.commands.length, 1);
    assert.equal(f.commands[0].args.email, 'synthetic@example.invalid');
  }
});

test('exact closing instant and later reject new starts without consuming an attempt', async () => {
  for (const at of [CLOSE, CLOSE + 1]) {
    const f = await fixture({at});
    const r = await f.start();
    assert.equal(r.status, 403);
    assert.match((await r.json()).error, /deadline.*passed.*resume/i);
    assert.equal(f.commands.length, 0);
  }
});

test('a lost start response can recover the same private attempt after the deadline', async () => {
  const f = await fixture({at: CLOSE + 1000});
  f.sessions.set(ID, {
    id: ID, case_id: f.policy.id, mode: 'graded', name: 'Synthetic Test Student',
    email: 'synthetic@example.invalid', token_hash: await digest(TOKEN),
    bargain_until: new Date(CLOSE).toISOString(), confirm_until: new Date(CLOSE).toISOString(),
  });
  const recovered = await f.start();
  assert.equal(recovered.status, 200);
  assert.equal((await recovered.json()).session.id, ID);
  assert.equal(f.commands.length, 0);
  const rejected = await f.start({attempt_token: TOKEN.replace(/^2/, '4')});
  assert.equal(rejected.status, 401);
  assert.equal(f.commands.length, 0);
});

test('duplicate normalized email gives recovery guidance without replacing the original', async () => {
  const f = await fixture();
  assert.equal((await f.start()).status, 200);
  const original = f.sessions.get(ID);
  const r = await f.start({attempt_id: '10000000-0000-4000-8000-000000000002', email: 'SYNTHETIC@example.invalid'});
  assert.equal(r.status, 409);
  assert.match((await r.json()).error, /attempt already exists.*resume/i);
  assert.equal(f.sessions.size, 1);
  assert.equal(f.sessions.get(ID), original);
});

test('new pilot attempts require the instructor credential, not the shared class code', async () => {
  const f = await fixture({mode: 'pilot'});
  assert.equal((await f.start({classCode: CLASS_CODE})).status, 403);
  assert.equal(f.commands.length, 0);
  assert.equal((await f.start()).status, 200);
  assert.equal(f.commands.length, 1);
});

test('existing pilot resume uses its private token without needing either admission credential', async () => {
  const f = await fixture({mode: 'pilot'});
  assert.equal((await f.start()).status, 200);
  const r = await f.handler(new Request('https://api.example/spm370-contract-negotiation/session/' + ID, {
    headers: {'X-Session-Token': TOKEN, Origin: 'https://class.example'},
  }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).session.mode, 'pilot');
});

test('entrypoint uses only an explicit private-policy release and fails closed on lookup errors', async () => {
  const source = (await readFile(new URL('../backend/index.ts', import.meta.url), 'utf8')).replace(/^import .*;\s*$/gm, '');
  for (const scenario of [undefined, false, 'true', true, 'lookup-error']) {
    let serve, captured;
    const store = {policy: async mode => {
      assert.equal(mode, 'graded');
      if (scenario === 'lookup-error') throw Error('Synthetic database outage');
      return scenario === undefined ? null : {assessed_release: scenario};
    }};
    vm.runInNewContext(source, {
      Deno: {env: {get: name => name === 'SPM370_CONTRACT_RELEASED' ? 'true' : ''}, serve: callback => {serve = callback;}},
      createStore: () => store, createProvider: () => ({configured: true}),
      loadAccess: async () => ({}),
      createHandler: options => {captured = options; return async () => new Response('{}');},
      Response,
    });
    await serve(new Request('https://api.example/spm370-contract-negotiation/health'));
    assert.equal(captured.released, scenario === true);
  }
});
