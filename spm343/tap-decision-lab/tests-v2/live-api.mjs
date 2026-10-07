/** Deployed v2 test-mode smoke. No real identities, keys, grades, or deletion. */
import assert from 'node:assert/strict';
import {randomUUID, randomBytes, createHash} from 'node:crypto';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const endpoint = process.env.TAP_API_ENDPOINT || 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2-v2';
const output = process.env.TAP_QA_OUTPUT || '/tmp/tap-v2-qa';
const runId = randomUUID();
const report = {timestampUTC: new Date().toISOString(), runId, endpoint,
  scope: 'Deployed API; fixed synthetic identity in segregated test mode only. Test rows are retained. Real instructor-key success and real student records are not tested.',
  results: [], attempts: [], sourceSHA256: {}};
const identity = {firstName: 'Synthetic', lastName: 'Fixture', email: 'tap-v2@example.invalid', individualWork: true};
const emptyAnswers = {initialChoice: '', initialPosition: '', finalChoice: '', adjustment: '', priority: '', finalReason: '', runnerUp: '', tradeoff: '', guestConsent: false};
let guestBefore = null;
const privateMarker = `SYNTHETIC PRIVATE QA ${runId}`;

async function persist() {
  await mkdir(output, {recursive: true});
  for (const name of ['model.mjs', 'handler.mjs', 'schema.sql', 'CONTRACT.md']) {
    try {
      const bytes = await readFile(new URL('../backend-v2/' + name, import.meta.url));
      report.sourceSHA256[name] = createHash('sha256').update(bytes).digest('hex');
    } catch { /* Version may be hosted separately; omitted files are not claimed. */ }
  }
  await writeFile(path.join(output, 'live-api-results.json'), JSON.stringify(report, null, 2));
}

async function request(body, {query = '', token, key, origin, raw, headers = {}} = {}) {
  // This guard is separate from test assertions: never permit accidental live writes.
  if (body && ['start', 'resume', 'save', 'lockPlan', 'submit'].includes(body.action)) {
    assert.equal(body.mode, 'test', 'Safety guard: student operations must be segregated test mode');
  }
  const response = await fetch(endpoint + query, {
    method: body || raw !== undefined ? 'POST' : 'GET',
    headers: {'Content-Type': 'application/json', ...(token ? {'x-attempt-token': token} : {}),
      ...(key ? {'x-instructor-key': key} : {}), ...(origin ? {Origin: origin} : {}), ...headers},
    body: raw !== undefined ? raw : body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  let data;
  const text = await response.text();
  try { data = JSON.parse(text); } catch { throw Error(`Non-JSON response, status ${response.status}`); }
  assert.match(response.headers.get('cache-control') || '', /no-store/i, 'Private/student API responses must not be cached');
  return {status: response.status, data};
}

async function check(name, fn) {
  try {
    const detail = await fn();
    report.results.push({name, status: 'PASS', detail: detail || null});
    console.log('PASS', name);
  } catch (error) {
    report.results.push({name, status: 'FAIL', detail: error.message, stack: error.stack});
    console.error('FAIL', name, error.message);
  }
  await persist();
}

function expectStatus(result, status, code) {
  assert.equal(result.status, status, JSON.stringify(result));
  if (code) assert.equal(result.data.error?.code, code, JSON.stringify(result));
  if (status === 200 && result.data.submission) studentPrivate(result.data.submission);
  return result.data;
}

function studentPrivate(state) {
  for (const field of ['review', 'finalGrade', 'scores', 'notes', 'feedback']) assert(!Object.hasOwn(state, field), `Student projection leaked ${field}`);
}

function operation(attempt, action, fields = {}, version = attempt.version) {
  return {action, mode: 'test', attemptId: attempt.attemptId, requestId: randomUUID(), expectedVersion: version, ...fields};
}

async function mutate(attempt, action, fields = {}) {
  const input = operation(attempt, action, fields);
  const result = await request(input, {token: attempt.token});
  const data = expectStatus(result, 200);
  assert.equal(data.mode, 'test');
  assert.equal(data.submission.mode, 'test');
  assert.equal(data.submission.synthetic, true);
  assert.equal(data.submission.attemptId, attempt.attemptId);
  assert.equal(data.submission.version, attempt.version + 1);
  attempt.version = data.submission.version;
  attempt.state = data.submission;
  attempt.lastOperation = input;
  return data;
}

async function newAttempt() {
  const attempt = {attemptId: randomUUID(), token: randomBytes(32).toString('base64url'), version: 0};
  report.attempts.push({attemptId: attempt.attemptId, mode: 'test', retained: true, identity: 'Fixed Synthetic Fixture / tap-v2@example.invalid'});
  await mutate(attempt, 'start', {identity});
  return attempt;
}

function initial(choice) {
  return {...emptyAnswers, initialChoice: choice,
    initialPosition: privateMarker + ': This original format uses the supplied stations, stays within $300, and offers a credible event before the visitor experience mix is known.'};
}

function final(choice, adjustment = 'rotations') {
  return {finalChoice: choice, adjustment, priority: 'newcomers', runnerUp: choice === 'showcase' ? 'cup' : 'showcase',
    finalReason: privateMarker + ': Sixteen novices need supported turns. I would use the adjustment to improve access while protecting a short competitive finish and managing the waiting risk.',
    tradeoff: privateMarker + ': The experienced club players give up uninterrupted play. The runner-up provides a worthwhile spectacle or sharper contest, but supported access is my priority.'};
}

function checkGuestProjection(data) {
  assert.equal(data.mode, 'live');
  const forbidden = new Set(['attemptId', 'firstName', 'lastName', 'email', 'identity', 'answers', 'responses',
    'initialPosition', 'finalReason', 'tradeoff', 'review', 'notes', 'finalGrade', 'score', 'scores', 'receipt', 'token', 'tokenHash', 'requestId']);
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert(!forbidden.has(key), `Guest leaked forbidden field ${key}`);
      walk(child);
    }
  }
  walk(data);
  assert(!JSON.stringify(data).includes(privateMarker));
  for (const proposal of data.proposals) {
    assert.deepEqual(Object.keys(proposal).sort(), ['label', 'initialChoice', 'finalChoice', 'adjustment', 'priority', 'runnerUp'].sort());
    for (const field of ['initialChoice', 'finalChoice', 'runnerUp']) assert(['cup', 'open', 'showcase'].includes(proposal[field]));
    assert(['orientation', 'extra_host', 'rotations'].includes(proposal.adjustment));
    assert(['newcomers', 'club', 'operator'].includes(proposal.priority));
  }
}

async function main() {
  if (process.env.TAP_LIVE_API_TEST !== '1') {
    report.results.push({name: 'Explicit synthetic persistence opt-in', status: 'BLOCKED',
      detail: 'Set TAP_LIVE_API_TEST=1 after deploying v2. No request was sent.'});
    await persist();
    console.error('BLOCKED: TAP_LIVE_API_TEST=1 is required; no request was sent.');
    process.exitCode = 1;
    return;
  }
  await check('Health, live availability and manual rubric', async () => {
    const data = expectStatus(await request(), 200);
    assert.equal(data.version, '2.0.1');
    assert.equal(data.liveEnabled, true);
    assert.equal(data.studentStorage, 'private-server');
    assert.equal(data.grading, 'instructor-only');
    assert.equal(data.maxScore, 10);
    assert.deepEqual(data.rubricMax, [2, 3, 3, 2]);
    return {version: data.version, identityVerification: data.identityVerification};
  });
  await check('Capture live guest baseline before test writes', async () => {
    const data = expectStatus(await request(undefined, {query: '?view=guest'}), 200);
    checkGuestProjection(data); guestBefore = data;
    return {aggregate: data.aggregate, proposalCount: data.proposals.length};
  });
  await check('No key and fake instructor key are denied', async () => {
    expectStatus(await request({action: 'instructorList', mode: 'test'}), 401, 'UNAUTHORIZED');
    expectStatus(await request({action: 'instructorList', mode: 'test'}, {key: 'deliberately-invalid-synthetic-key'}), 401, 'UNAUTHORIZED');
  });
  await check('Foreign browser origin is denied', async () => {
    expectStatus(await request(undefined, {origin: 'https://untrusted.example.invalid'}), 403, 'ORIGIN_DENIED');
  });
  await check('Attempt capability and exact synthetic identity required', async () => {
    const a = {attemptId: randomUUID(), token: randomBytes(32).toString('base64url'), version: 0};
    expectStatus(await request(operation(a, 'start', {identity})), 401, 'UNAUTHORIZED');
    expectStatus(await request(operation(a, 'start', {identity: {...identity, email: 'someone-else@example.invalid'}}), {token: a.token}), 400, 'INVALID_INPUT');
    expectStatus(await request({action: 'resume', mode: 'test', attemptId: a.attemptId}, {token: a.token}), 401, 'UNAUTHORIZED');
  });

  for (const [choice, adjustment] of [['cup', 'orientation'], ['open', 'extra_host'], ['showcase', 'rotations']]) {
    await check(`Durable ${choice} lifecycle, replay, immutability and receipt`, async () => {
      const a = await newAttempt();
      assert.equal(a.state.status, 'draft');
      studentPrivate(a.state);
      assert.equal(a.state.answers.guestConsent, false);
      const startRequest = a.lastOperation;
      const startState = structuredClone(a.state);
      const replayStart = expectStatus(await request(startRequest, {token: a.token}), 200);
      assert.deepEqual(replayStart.submission, startState);
      expectStatus(await request({...startRequest, identity: {...identity, firstName: 'Changed'}}, {token: a.token}), 409, 'REQUEST_CONFLICT');
      expectStatus(await request({action: 'resume', mode: 'test', attemptId: a.attemptId}, {token: randomBytes(32).toString('base64url')}), 401, 'UNAUTHORIZED');
      expectStatus(await request(operation(a, 'lockPlan'), {token: a.token}), 400, 'INVALID_INPUT');
      expectStatus(await request(operation(a, 'save', {answers: {...initial(choice), ...final(choice)}}), {token: a.token}), 409, 'STATE_CONFLICT');
      const initialAnswer = initial(choice);
      await mutate(a, 'save', {answers: initialAnswer});
      const saveRequest = a.lastOperation;
      const saveState = structuredClone(a.state);
      assert.deepEqual(expectStatus(await request(saveRequest, {token: a.token}), 200).submission, saveState);
      expectStatus(await request(operation(a, 'save', {answers: initialAnswer}, 0), {token: a.token}), 409, 'VERSION_CONFLICT');
      expectStatus(await request({...operation(a, 'save', {answers: initialAnswer}), score: 999}, {token: a.token}), 400, 'INVALID_INPUT');
      await mutate(a, 'lockPlan');
      const snapshot = structuredClone(a.state.initialPlan);
      assert.equal(snapshot.initialChoice, choice);
      assert.equal(snapshot.initialPosition, initialAnswer.initialPosition);
      expectStatus(await request(operation(a, 'save', {answers: {...initialAnswer, initialPosition: privateMarker + ' Altered immutable initial response is not allowed.'}}), {token: a.token}), 409, 'STATE_CONFLICT');
      expectStatus(await request(operation(a, 'lockPlan'), {token: a.token}), 409, 'STATE_CONFLICT');
      if (choice !== 'open') {
        await mutate(a, 'save', {answers: {...initialAnswer, ...final(choice, 'extra_host')}});
        expectStatus(await request(operation(a, 'submit'), {token: a.token}), 400, 'BUDGET_EXCEEDED');
      }
      const finalAnswer = {...initialAnswer, ...final(choice, adjustment)};
      await mutate(a, 'save', {answers: finalAnswer});
      await mutate(a, 'submit');
      const submitted = structuredClone(a.state);
      const submitRequest = a.lastOperation;
      assert.equal(submitted.status, 'submitted');
      assert.match(submitted.receipt, /^TAP2-TEST-/);
      studentPrivate(submitted);
      assert.equal(submitted.reviewStatus, 'pending');
      assert.deepEqual(submitted.initialPlan, snapshot);
      assert.equal(submitted.guest.published, false);
      assert.deepEqual(expectStatus(await request(submitRequest, {token: a.token}), 200).submission, submitted);
      assert.deepEqual(expectStatus(await request({action: 'resume', mode: 'test', attemptId: a.attemptId}, {token: a.token}), 200).submission, submitted);
      expectStatus(await request(operation(a, 'submit'), {token: a.token}), 409, 'STATE_CONFLICT');
      expectStatus(await request(operation(a, 'save', {answers: finalAnswer}), {token: a.token}), 409, 'STATE_CONFLICT');
      report.attempts.find(row => row.attemptId === a.attemptId).receipt = submitted.receipt;
      return {attemptId: a.attemptId, receipt: submitted.receipt, choice, adjustment, version: submitted.version, reviewStatus: 'pending manual review; scores remain instructor-only'};
    });
  }
  await check('Guest projection excludes all identity, response and grade fields', async () => {
    const data = expectStatus(await request(undefined, {query: '?view=guest'}), 200);
    checkGuestProjection(data);
    assert(guestBefore, 'Guest baseline was not captured');
    assert.deepEqual(data.aggregate, guestBefore.aggregate, 'Test-mode writes must leave live guest counts unchanged; concurrent real class activity also requires investigation');
    assert.deepEqual(data.proposals, guestBefore.proposals, 'Test-mode writes must not enter live released proposals');
    return {sharing: data.sharing, proposalCount: data.proposals.length};
  });
  await persist();
  const counts = report.results.reduce((m, r) => ({...m, [r.status]: (m[r.status] || 0) + 1}), {});
  console.log(JSON.stringify({counts, syntheticAttemptsRetained: report.attempts.map(a => ({attemptId: a.attemptId, mode: a.mode, receipt: a.receipt || null}))}, null, 2));
  if (report.results.some(r => r.status !== 'PASS')) process.exitCode = 1;
}

main().catch(async error => {
  report.results.push({name: 'Harness execution', status: 'BLOCKED', detail: error.message});
  await persist();
  console.error('BLOCKED', error.message);
  process.exitCode = 1;
});
