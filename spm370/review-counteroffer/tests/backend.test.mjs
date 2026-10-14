import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../backend/handler.mjs';
import {submission, grade, digest, CASE_VERSION, SCHEMA_VERSION} from '../backend/validation.mjs';
const classCode = 'SYNTHETIC_CLASS_CODE_1234567890';
const instructorKey = 'SYNTHETIC_INSTRUCTOR_CREDENTIAL_12345678901234567890';
const origin = 'https://jflevine.github.io';
const input = (overrides = {}) => ({submission_id: '10000000-0000-4000-8000-000000000001', submission_token: 'a'.repeat(72), case_version: CASE_VERSION, schema_version: SCHEMA_VERSION, name: 'Synthetic Student', email: 'codex-test@lasalle.edu', decision: 'counter', recommendation: 'I would counter because the payment timing changes the practical cost.', clause_number: 3, clarification: 'Does payment follow approval or publication?', ...overrides});
function request(path, {body, admin = false, code = classCode, method = body ? 'POST' : 'GET', requestOrigin = origin} = {}) {
  return new Request('https://example.invalid/functions/v1/spm370-counteroffer' + path, {method, headers: {'Content-Type': 'application/json', Origin: requestOrigin, ...(admin ? {'X-Instructor-Key': instructorKey} : {'X-Class-Code': code})}, body: body === undefined ? undefined : JSON.stringify(body)});
}
async function fixture() {
  const settings = {case_version: CASE_VERSION, schema_version: 1, class_code_hash: await digest(classCode), instructor_key_hash: await digest(instructorKey), accepts_submissions: true};
  const records = new Map(); let writes = 0;
  const store = {
    settings: async () => settings,
    submit: async args => {
      const existing = records.get(args.id);
      if (existing) { if (existing.token_hash !== args.token_hash || existing.payload_hash !== args.payload_hash) throw Error('RETRY_MISMATCH'); return {...existing.receipt, replayed: true}; }
      if (!settings.accepts_submissions) throw Error('ACTIVITY_CLOSED');
      if ([...records.values()].some(x => x.payload.email === args.payload.email)) throw Error('DUPLICATE_EMAIL');
      writes++; const receipt = {submission_id: args.id, receipt: '20000000-0000-4000-8000-000000000001', submitted_at: '2026-10-14T12:00:00Z', case_version: CASE_VERSION, replayed: false};
      records.set(args.id, {...args, receipt, grade: null}); return receipt;
    },
    list: async onlyId => [...records.entries()].filter(([id]) => !onlyId || onlyId === id).map(([id, r]) => ({...r.payload, submission_id: id, ...r.receipt, grade: r.grade})),
    setOpen: async open => {settings.accepts_submissions = open; return settings;},
    grade: async args => {
      const record = records.get(args.submission_id); if (!record) throw Error('NOT_FOUND');
      const current = record.grade, revision = current?.revision || 0;
      if (revision !== args.expected_grade_revision) {
        if (revision === args.expected_grade_revision + 1 && JSON.stringify(current.points) === JSON.stringify(args.points) && current.feedback === args.feedback) return {submission_id: args.submission_id, grade: current, replayed: true};
        throw Error('GRADE_CONFLICT');
      }
      record.grade = {revision: revision + 1, points: args.points, feedback: args.feedback, total: Object.values(args.points).reduce((a,b) => a+b,0), graded_at: '2026-10-14T12:01:00Z'};
      return {submission_id: args.submission_id, grade: record.grade, replayed: false};
    }
  };
  return {handler: createHandler({store}), settings, records, writes: () => writes};
}
test('submission normalizes school identity and preserves substantive answers', () => {
  const p = submission(input({name: '  Synthetic Student ', email: ' CODEX-TEST@LASALLE.EDU '}));
  assert.equal(p.name, 'Synthetic Student'); assert.equal(p.email, 'codex-test@lasalle.edu');
  assert.equal(p.recommendation, input().recommendation); assert(!Object.hasOwn(p, 'submission_token'));
  for (const bad of [{email: 'student@example.com'}, {email: 'student@lasalle.edu.evil.example'}, {clause_number: 7}, {clause_number: 1.5}, {recommendation: 'short'}, {clarification: 'tiny'}, {decision: 'accept'}, {schema_version: 2}, {case_version: 'old'}, {submission_token: 'short'}]) assert.throws(() => submission(input(bad)));
});
test('rubric bounds and half-point increments are enforced without scoring student content', () => {
  const g = {submission_id: input().submission_id, expected_grade_revision: 0, points: {recommendation: 3.5, concept: 2, clarification: 4}, feedback: ''}; assert.equal(grade(g).points.recommendation, 3.5);
  for (const bad of [{points: {...g.points, concept: 3}}, {points: {...g.points, recommendation: .25}}, {expected_grade_revision: -1}, {feedback: 'a'.repeat(5001)}]) assert.throws(() => grade({...g, ...bad}));
});
test('health and metadata return only public configuration', async () => {
  const f = await fixture(), h = await (await f.handler(request('/health'))).json(); assert(Object.values(h).every(x => typeof x === 'boolean'));
  const meta = await (await f.handler(request('/meta'))).json(); assert.equal(meta.case_version, CASE_VERSION); assert.equal(meta.limits.clause_max, 6); assert.doesNotMatch(JSON.stringify(meta), /hash|credential|token/);
});
test('unapproved origins, bad class credentials, and instructor access are denied', async () => {
  const f = await fixture(); assert.equal((await f.handler(request('/health', {requestOrigin: 'https://evil.example'}))).status, 403);
  assert.equal((await f.handler(request('/submit', {body: input(), code: 'wrong-code-long-enough'}))).status, 403);
  assert.equal((await f.handler(request('/instructor'))).status, 401); assert.equal(f.writes(), 0);
});
test('idempotent exact retry gives one durable receipt and cannot change the stored response', async () => {
  const f = await fixture(), a = await (await f.handler(request('/submit', {body: input()}))).json(), b = await (await f.handler(request('/submit', {body: input()}))).json();
  assert(a.ok); assert.equal(a.receipt, b.receipt); assert.equal(b.replayed, true); assert.equal(f.writes(), 1);
  for (const body of [input({recommendation: 'A different response cannot overwrite the saved submission.'}), input({submission_token: 'b'.repeat(72)})]) assert.equal((await f.handler(request('/submit', {body}))).status, 409);
  assert.equal(f.records.get(input().submission_id).payload.recommendation, input().recommendation);
});
test('knowing an email cannot take over or retrieve another response', async () => {
  const f = await fixture(); await f.handler(request('/submit', {body: input()}));
  const r = await f.handler(request('/submit', {body: input({submission_id: '10000000-0000-4000-8000-000000000002', submission_token: 'b'.repeat(72)})}));
  assert.equal(r.status, 409); const d = await r.json(); assert.equal(d.code, 'duplicate_email'); assert(!Object.hasOwn(d, 'receipt')); assert(!Object.hasOwn(d, 'recommendation'));
  assert.equal((await f.handler(request('/instructor?submission_id=' + input().submission_id))).status, 401);
});
test('closing blocks new work but permits exact receipt recovery and instructor retrieval', async () => {
  const f = await fixture(); await f.handler(request('/submit', {body: input()}));
  assert.equal((await f.handler(request('/settings', {admin: true, method: 'PUT', body: {accepts_submissions: false}}))).status, 200);
  assert.equal((await f.handler(request('/submit', {body: input()}))).status, 200);
  const r = await f.handler(request('/submit', {body: input({submission_id: '10000000-0000-4000-8000-000000000002', email: 'second@lasalle.edu'})})); assert.equal(r.status, 409);
  const list = await (await f.handler(request('/instructor', {admin: true}))).json(); assert.equal(list.submissions.length, 1); assert.doesNotMatch(JSON.stringify(list), /token_hash|payload_hash|class_code_hash|instructor_key_hash/);
});
test('grades append revisions, safely retry, and reject conflicting stale edits', async () => {
  const f = await fixture(); await f.handler(request('/submit', {body: input()}));
  const body = {submission_id: input().submission_id, expected_grade_revision: 0, points: {recommendation: 3, concept: 2, clarification: 4}, feedback: 'Evidence is clear.'};
  const first = await (await f.handler(request('/grade', {admin: true, body}))).json(); assert.equal(first.grade.total, 9); assert.equal(first.grade.revision, 1);
  const retry = await (await f.handler(request('/grade', {admin: true, body}))).json(); assert.equal(retry.replayed, true); assert.equal(retry.grade.revision, 1);
  assert.equal((await f.handler(request('/grade', {admin: true, body: {...body, feedback: 'Stale overwrite'}}))).status, 409);
  const updated = await (await f.handler(request('/grade', {admin: true, body: {...body, expected_grade_revision: 1, points: {...body.points, recommendation: 4}}}))).json(); assert.equal(updated.grade.revision, 2); assert.equal(updated.grade.total, 10);
});
test('private settings cannot be replaced through the open/close route', async () => {
  const f = await fixture(); assert.equal((await f.handler(request('/settings', {admin: true, method: 'PUT', body: {accepts_submissions: false, instructor_key_hash: 'attacker'}}))).status, 400); assert.equal(f.settings.accepts_submissions, true);
});
test('oversized streaming body is bounded and no mutation occurs', async () => {
  const f = await fixture(); const r = await f.handler(request('/submit', {body: input({recommendation: 'a'.repeat(20000)})})); assert.equal(r.status, 413); assert.equal(f.writes(), 0);
});
test('allowed preflight is credential-free with exact origin and custom headers', async () => {
  const f = await fixture(), r = await f.handler(request('/submit', {method: 'OPTIONS'})); assert.equal(r.status, 204); assert.equal(r.headers.get('access-control-allow-origin'), origin); assert.match(r.headers.get('access-control-allow-headers'), /X-Class-Code/); assert.equal(r.headers.get('access-control-allow-credentials'), null);
});
