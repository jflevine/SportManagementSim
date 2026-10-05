import test from 'node:test';
import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createSubmissionHandler, MAX_BODY_BYTES, parseRubric, PRODUCTION_ORIGIN, resolveRuntimeConfig } from '../backend/handler.mjs';
import { createSupabaseStore } from '../backend/supabase-store.mjs';
import { deploymentConfig } from '../backend/deployment-config.mjs';

// Ephemeral, randomly generated test-only grading data. It is independent of
// the real assessment and is neither loaded from nor written to a rubric file.
function makeRubric() {
  return { assessmentVersion: 'synthetic-test-v1', rubricVersion: 'synthetic-test-r1', items: Array.from({ length: 10 }, (_, index) => ({ questionId: `synthetic-${index}`, category: index < 5 ? 'finance' : 'legal', correctIndex: randomInt(3), explanation: 'Synthetic test feedback; no course content.' })) };
}
function memoryStore() {
  const rows = new Map();
  const emailVersions = new Set();
  const calls = { insert: 0, lookup: [] };
  return {
    rows, calls,
    async insert(row) {
      calls.insert += 1;
      const unique = `${row.email}/${row.assessment_version}`;
      if (rows.has(row.attempt_id) || emailVersions.has(unique)) return 'conflict';
      rows.set(row.attempt_id, structuredClone(row));
      emailVersions.add(unique);
      return 'inserted';
    },
    async findAttempt(id) { calls.lookup.push(id); return structuredClone(rows.get(id) || null); },
  };
}
function setup(options = {}) {
  const rubric = makeRubric();
  const store = memoryStore();
  const handler = createSubmissionHandler({ enabled: true, rubric, store, now: () => new Date('2026-10-05T18:00:00.000Z'), ...options });
  const payload = { attemptId: randomUUID(), assessmentVersion: rubric.assessmentVersion, firstName: 'Synthetic', lastName: 'Student', email: 'synthetic-kc2-test@lasalle.edu', answers: rubric.items.map((item) => item.correctIndex), clientStartedAt: '2026-10-05T17:50:00.000Z' };
  return { rubric, store, handler, payload };
}
function request(payload, { method = 'POST', headers = {}, raw } = {}) {
  return new Request('https://example.invalid/functions/v1/submit-mgt340-kc2', { method, headers: { Origin: PRODUCTION_ORIGIN, 'Content-Type': 'application/json', ...headers }, ...(!['GET', 'HEAD', 'OPTIONS'].includes(method) ? { body: raw ?? JSON.stringify(payload) } : {}) });
}
async function submit(env, payload = env.payload, options) {
  const response = await env.handler(request(payload, options));
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}
function assertNoResult(body) {
  assert.equal(body.ok, false);
  assert.equal(body.receipt, undefined);
  assert.equal(body.feedback, undefined);
  assert.equal(JSON.stringify(body).includes('correctIndex'), false);
}

test('all correct: server awards ten points, five per category, after insert', async () => {
  const env = setup();
  const { response, body } = await submit(env);
  assert.equal(response.status, 200);
  assert.equal(body.receipt.score, 10);
  assert.equal(body.receipt.financeScore, 5);
  assert.equal(body.receipt.legalScore, 5);
  assert.equal(body.receipt.maxScore, 10);
  assert.equal(body.receipt.submittedAt, '2026-10-05T18:00:00.000Z');
  assert.equal(body.feedback.length, 10);
  assert.ok(body.feedback.every((item) => item.correct));
  assert.deepEqual(env.store.rows.get(env.payload.attemptId).receipt, body);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('all wrong: client scores are ignored', async () => {
  const env = setup();
  env.payload.answers = env.rubric.items.map((item) => (item.correctIndex + 1) % 3);
  const { body } = await submit(env, { ...env.payload, score: 10, financeScore: 5, legalScore: 5 });
  assert.equal(body.receipt.score, 0);
  assert.equal(body.receipt.financeScore, 0);
  assert.equal(body.receipt.legalScore, 0);
  assert.ok(body.feedback.every((item) => !item.correct));
});

test('mixed answers: exactly one point each, correct category totals', async () => {
  const env = setup();
  env.payload.answers = env.rubric.items.map((item, index) => [0, 2, 4, 6].includes(index) ? item.correctIndex : (item.correctIndex + 1) % 3);
  const { body } = await submit(env);
  assert.equal(body.receipt.score, 4);
  assert.equal(body.receipt.financeScore, 3);
  assert.equal(body.receipt.legalScore, 1);
});

test('canonical identity and minimum exact stored fields; no request telemetry', async () => {
  const env = setup();
  const { body } = await submit(env, { ...env.payload, firstName: '  Synthetic  ', lastName: 'Test  Student', email: ' SYNTHETIC-KC2-TEST@LASALLE.EDU ' }, { headers: { 'User-Agent': 'not-stored', 'X-Forwarded-For': '192.0.2.1' } });
  const row = env.store.rows.get(body.receipt.attemptId);
  assert.equal(row.email, env.payload.email);
  assert.equal(row.first_name, 'Synthetic');
  assert.equal(row.last_name, 'Test Student');
  assert.deepEqual(Object.keys(row).sort(), ['attempt_id', 'assessment_version', 'rubric_version', 'first_name', 'last_name', 'email', 'answers', 'score', 'finance_score', 'legal_score', 'client_started_at', 'submitted_at', 'receipt'].sort());
});

test('identical retry returns original receipt, not a newly graded receipt', async () => {
  const env = setup();
  const original = await submit(env);
  const retry = await submit(env, { ...env.payload, score: 1000 });
  assert.equal(retry.response.status, 200);
  assert.deepEqual(retry.body, original.body);
  assert.equal(env.store.rows.size, 1);
  assert.deepEqual(env.store.calls.lookup, [env.payload.attemptId]);
});

test('retry is stable even if configured rubric later changes', async () => {
  const env = setup();
  const first = await submit(env);
  const differentRubric = structuredClone(env.rubric);
  differentRubric.rubricVersion = 'synthetic-test-r2';
  differentRubric.items.forEach((item) => { item.correctIndex = (item.correctIndex + 1) % 3; item.explanation = 'Different synthetic explanation.'; });
  env.handler = createSubmissionHandler({ enabled: true, rubric: differentRubric, store: env.store });
  const next = await submit(env);
  assert.deepEqual(next.body, first.body);
});

test('same UUID with changed answers, identity, or start time is rejected without feedback', async () => {
  const env = setup();
  await submit(env);
  const changedAnswers = [...env.payload.answers];
  changedAnswers[0] = (changedAnswers[0] + 1) % 3;
  for (const patch of [{ answers: changedAnswers }, { firstName: 'Different' }, { lastName: 'Different' }, { email: 'other-synthetic-test@lasalle.edu' }, { clientStartedAt: '2026-10-05T17:49:00.000Z' }]) {
    const result = await submit(env, { ...env.payload, ...patch });
    assert.equal(result.response.status, 409);
    assertNoResult(result.body);
  }
  assert.equal(env.store.rows.size, 1);
});

test('same normalized email and version with new UUID gets generic duplicate only', async () => {
  const env = setup();
  const first = await submit(env);
  const nextId = randomUUID();
  const duplicate = await submit(env, { ...env.payload, attemptId: nextId, email: ` ${env.payload.email.toUpperCase()} ` });
  assert.equal(duplicate.response.status, 409);
  assertNoResult(duplicate.body);
  assert.equal(JSON.stringify(duplicate.body).includes(first.body.receipt.receiptId), false);
  assert.deepEqual(env.store.calls.lookup, [nextId]);
  assert.equal(env.store.rows.size, 1);
});

test('concurrent identical retries persist exactly once with one original receipt', async () => {
  const env = setup();
  const responses = await Promise.all(Array.from({ length: 20 }, () => submit(env)));
  assert.ok(responses.every((result) => result.response.status === 200));
  assert.ok(responses.every((result) => JSON.stringify(result.body) === JSON.stringify(responses[0].body)));
  assert.equal(env.store.rows.size, 1);
});

test('concurrent email collision has one winner and no prior-result leak', async () => {
  const env = setup();
  const responses = await Promise.all(Array.from({ length: 20 }, () => submit(env, { ...env.payload, attemptId: randomUUID() })));
  assert.equal(responses.filter((result) => result.response.status === 200).length, 1);
  assert.equal(responses.filter((result) => result.response.status === 409).length, 19);
  responses.filter((result) => result.response.status === 409).forEach(({ body }) => assertNoResult(body));
  assert.equal(env.store.rows.size, 1);
});

test('concurrent changed-payload UUID collision has one winner', async () => {
  const env = setup();
  const changed = { ...env.payload, answers: env.payload.answers.map((value) => (value + 1) % 3) };
  const responses = await Promise.all([submit(env), submit(env, changed)]);
  assert.deepEqual(responses.map((result) => result.response.status).sort(), [200, 409]);
  assert.equal(env.store.rows.size, 1);
});

test('a new assessment version is independently allowed by the DB uniqueness contract', async () => {
  const env = setup();
  await submit(env);
  const rubric = { ...env.rubric, assessmentVersion: 'synthetic-test-v2' };
  env.handler = createSubmissionHandler({ enabled: true, rubric, store: env.store });
  const next = await submit(env, { ...env.payload, assessmentVersion: rubric.assessmentVersion, attemptId: randomUUID() });
  assert.equal(next.response.status, 200);
  assert.equal(env.store.rows.size, 2);
});

test('validation rejects incomplete/out-of-range/typed answers and malformed identity', async (t) => {
  const patches = [
    { answers: [] }, { answers: Array(9).fill(0) }, { answers: Array(11).fill(0) }, { answers: Array(10).fill(3) }, { answers: Array(10).fill(-1) }, { answers: Array(10).fill(1.5) }, { answers: Array(10).fill('1') }, { answers: Array(10).fill(null) }, { answers: {} },
    { attemptId: 'guessable' }, { attemptId: '00000000-0000-0000-0000-000000000000' }, { firstName: '' }, { firstName: 'X'.repeat(81) }, { firstName: 'bad\nname' }, { lastName: null }, { email: 'synthetic@example.com' }, { email: 'a@lasalle.edu.evil.example' }, { email: 'a@students.lasalle.edu' }, { email: '.a@lasalle.edu' }, { email: 'a..b@lasalle.edu' }, { email: 'a@@lasalle.edu' },
    { clientStartedAt: 'not-a-date' }, { clientStartedAt: '2026-02-30T17:00:00.000Z' }, { clientStartedAt: '2026-10-05T18:06:00.000Z' }, { clientStartedAt: '1999-01-01T00:00:00.000Z' }, { extra: 'unapproved field' },
  ];
  for (let index = 0; index < patches.length; index += 1) await t.test(`invalid payload ${index + 1}`, async () => {
    const env = setup();
    const { response, body } = await submit(env, { ...env.payload, ...patches[index] });
    assert.equal(response.status, 400);
    assertNoResult(body);
    assert.equal(env.store.calls.insert, 0);
  });
});

test('version mismatch is rejected before save', async () => {
  const env = setup();
  const result = await submit(env, { ...env.payload, assessmentVersion: 'wrong-version' });
  assert.equal(result.response.status, 400);
  assert.equal(result.body.error.code, 'VERSION_MISMATCH');
  assert.equal(env.store.calls.insert, 0);
});

test('missing/malformed rubric and disabled or missing storage fail closed', async () => {
  for (const options of [{ enabled: false }, { enabled: 'true' }, { rubric: null }, { rubric: '{}' }, { rubric: '{bad' }, { store: null }]) {
    const env = setup(options);
    const result = await submit(env);
    assert.equal(result.response.status, 503);
    assert.equal(result.body.error.code, 'SUBMISSIONS_UNAVAILABLE');
    assertNoResult(result.body);
    assert.equal(env.store.calls.insert, 0);
  }
});

test('private config validates ten unique items, versions, categories, bounds and explanations', () => {
  const valid = makeRubric();
  assert.ok(parseRubric(JSON.stringify(valid)));
  const mutations = [
    (r) => delete r.assessmentVersion, (r) => delete r.rubricVersion, (r) => r.items.pop(), (r) => { r.items[1].questionId = r.items[0].questionId; }, (r) => { r.items[0].category = 'legal'; }, (r) => { r.items[0].correctIndex = 3; }, (r) => { r.items[0].correctIndex = '1'; }, (r) => { r.items[0].explanation = ' '; }, (r) => { r.items[0].explanation = 'x'.repeat(2401); },
  ];
  for (const mutate of mutations) { const candidate = structuredClone(valid); mutate(candidate); assert.equal(parseRubric(candidate), null); }
});

test('JSON, media type, body caps, method, and compressed payload safeguards', async () => {
  const env = setup();
  for (const [options, status] of [
    [{ raw: '{' }, 400], [{ raw: 'null' }, 400], [{ raw: '[]' }, 400], [{ headers: { 'Content-Type': 'text/plain' } }, 415], [{ headers: { 'Content-Encoding': 'gzip' } }, 415], [{ raw: 'x'.repeat(MAX_BODY_BYTES + 1) }, 413], [{ headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } }, 413], [{ method: 'GET' }, 405], [{ method: 'PUT' }, 405],
  ]) {
    const result = await submit(env, env.payload, options);
    assert.equal(result.response.status, status);
    assertNoResult(result.body);
  }
  assert.equal(env.store.calls.insert, 0);
});

test('CORS exact production origin only; CORS does not authenticate identity', async () => {
  const env = setup();
  const preflight = await submit(env, env.payload, { method: 'OPTIONS' });
  assert.equal(preflight.response.status, 204);
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Origin'), PRODUCTION_ORIGIN);
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Headers'), 'content-type');
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Credentials'), null);
  for (const origin of ['https://evil.example', 'https://jflevine.github.io.evil.example', 'http://localhost:3000', 'null', '']) {
    const result = await submit(env, env.payload, { headers: { Origin: origin } });
    assert.equal(result.response.status, 403);
    assert.equal(result.response.headers.get('Access-Control-Allow-Origin'), null);
    assertNoResult(result.body);
  }
  assert.equal(env.store.calls.insert, 0);
});

test('test harness may explicitly add exact loopback origin', async () => {
  const env = setup({ allowedOrigins: ['http://127.0.0.1:4319'] });
  assert.equal((await submit(env, env.payload, { headers: { Origin: 'http://127.0.0.1:4319' } })).response.status, 200);
});

test('no feedback before durable insert resolves', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const saved = memoryStore();
  const env = setup({ store: { ...saved, async insert(row, options) { await gate; return saved.insert(row, options); } } });
  let settled = false;
  const pending = submit(env).then((value) => { settled = true; return value; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled, false);
  assert.equal(saved.rows.size, 0);
  release();
  assert.equal((await pending).response.status, 200);
  assert.equal(saved.rows.size, 1);
});

test('failed save returns no grade or database error details', async () => {
  const env = setup({ store: { insert: async () => { throw new Error('secret backend detail'); }, findAttempt: async () => null } });
  const result = await submit(env);
  assert.equal(result.response.status, 503);
  assertNoResult(result.body);
  assert.equal(JSON.stringify(result.body).includes('secret backend detail'), false);
});

test('timeout aborts storage and does not disclose grading', async () => {
  let aborted = false;
  const env = setup({ timeoutMs: 15, store: { insert: async (_row, { signal }) => new Promise((_, reject) => { signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); }); }), findAttempt: async () => null } });
  const result = await submit(env);
  assert.equal(result.response.status, 503);
  assert.equal(aborted, true);
  assertNoResult(result.body);
});

test('save committed but acknowledgment lost: original retry recovers exactly one record', async () => {
  const saved = memoryStore();
  let first = true;
  const env = setup({ store: { ...saved, async insert(row, options) { const result = await saved.insert(row, options); if (first) { first = false; throw new Error('acknowledgment lost'); } return result; } } });
  const uncertain = await submit(env);
  assert.equal(uncertain.response.status, 503);
  assertNoResult(uncertain.body);
  const retry = await submit(env);
  assert.equal(retry.response.status, 200);
  assert.deepEqual(retry.body, saved.rows.get(env.payload.attemptId).receipt);
  assert.equal(saved.rows.size, 1);
});

test('PostgREST adapter uses private headers, atomic insert, and attempt-only lookup', async () => {
  const calls = [];
  const synthetic = { attempt_id: randomUUID(), receipt: { ok: true } };
  const fakeKey = 'synthetic-test-placeholder-not-a-credential';
  const store = createSupabaseStore({ url: 'https://example.invalid', serviceRoleKey: fakeKey, fetchImpl: async (url, options) => {
    calls.push({ url: new URL(url), options });
    return options.method === 'POST' ? new Response(null, { status: 201 }) : Response.json([synthetic]);
  } });
  const signal = new AbortController().signal;
  assert.equal(await store.insert(synthetic, { signal }), 'inserted');
  assert.deepEqual(await store.findAttempt(synthetic.attempt_id, { signal }), synthetic);
  assert.equal(calls[0].options.headers.apikey, fakeKey);
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${fakeKey}`);
  assert.equal(calls[0].options.headers.Prefer, 'return=minimal');
  assert.equal(calls[0].options.signal, signal);
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(calls[1].url.searchParams.get('attempt_id'), `eq.${synthetic.attempt_id}`);
  assert.equal(calls[1].url.searchParams.has('email'), false);
});

test('PostgREST adapter only treats unique violations as conflicts and sanitizes errors', async () => {
  const signal = new AbortController().signal;
  const store = createSupabaseStore({ url: 'https://example.invalid', serviceRoleKey: 'synthetic-placeholder', fetchImpl: async () => Response.json({ code: '23505' }, { status: 409 }) });
  assert.equal(await store.insert({}, { signal }), 'conflict');
  const failure = createSupabaseStore({ url: 'https://example.invalid', serviceRoleKey: 'synthetic-placeholder', fetchImpl: async () => Response.json({ code: '23514', message: 'not for client' }, { status: 400 }) });
  await assert.rejects(() => failure.insert({}, { signal }), { message: 'Submission save failed' });
  await assert.rejects(() => failure.findAttempt(randomUUID(), { signal }), { message: 'Submission retry lookup failed' });
});

test('review-only SQL proposes private role access and atomic uniqueness', async () => {
  const sql = await readFile(new URL('../backend/schema.proposal.sql', import.meta.url), 'utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /force row level security/i);
  assert.match(sql, /revoke all on table public\.mgt340_kc2_submissions from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table public\.mgt340_kc2_submissions to service_role/i);
  assert.match(sql, /unique \(email, assessment_version\)/i);
  assert.match(sql, /attempt_id uuid primary key/i);
  assert.doesNotMatch(sql, /create (?:or replace )?(?:policy|view|function)/i);
});


test('public deployment config is disabled and contains no grading content', () => {
  assert.deepEqual(deploymentConfig, { enabled: false, rubric: null });
  assert.deepEqual(resolveRuntimeConfig({}, deploymentConfig), { enabled: false, rubric: null });
});

test('private deployment-only bundle is allowed; explicit env overrides cannot fail open', () => {
  const rubric = makeRubric();
  const bundle = { enabled: true, rubric };
  assert.deepEqual(resolveRuntimeConfig({}, bundle), bundle);
  for (const enabledValue of ['false', '', 'TRUE', 'typo', null, true]) {
    assert.equal(resolveRuntimeConfig({ enabledValue }, bundle).enabled, false);
  }
  assert.equal(resolveRuntimeConfig({ enabledValue: 'true' }, deploymentConfig).enabled, true);
  assert.equal(resolveRuntimeConfig({ rubricValue: '' }, bundle).rubric, '');
  assert.equal(resolveRuntimeConfig({ rubricValue: null }, bundle).rubric, null);
  const override = JSON.stringify(makeRubric());
  assert.equal(resolveRuntimeConfig({ rubricValue: override }, bundle).rubric, override);
});

test('stalled incoming body hits deadline and is canceled before any storage', async () => {
  let canceled = false;
  const env = setup({ timeoutMs: 15 });
  const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); }, cancel() { canceled = true; } });
  const incoming = new Request('https://example.invalid', { method: 'POST', headers: { Origin: PRODUCTION_ORIGIN, 'Content-Type': 'application/json' }, body, duplex: 'half' });
  const response = await env.handler(incoming);
  assert.equal(response.status, 503);
  assertNoResult(await response.json());
  assert.equal(canceled, true);
  assert.equal(env.store.calls.insert, 0);
});
