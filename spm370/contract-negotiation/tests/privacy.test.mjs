import test from 'node:test';
import assert from 'node:assert/strict';
import {FIELDS, TERMS_SCHEMA, sanitizeModel} from '../backend/policy.mjs';
import {createProvider, exposesPrivateCommentary} from '../backend/provider.mjs';
import {createHandler, digest} from '../backend/handler.mjs';

// Synthetic canaries and synthetic commercial values; no live case secrets.
const CANARY = 'PRIVATE_DIAGNOSTIC_CANARY';
const PUBLIC_REPLY = 'We can discuss that package. Which approved assets would it cover?';
const ID = '10000000-0000-4000-8000-000000000010';
const REQUEST_ID = '10000000-0000-4000-8000-000000000011';
const CREDENTIAL = 'synthetic-private-session-credential-for-tests';
const ADMIN = 'synthetic-instructor-credential-for-tests';
const policy = {
  id: 'synthetic-privacy-fixture', mode: 'graded', role: 'Private synthetic role for automated tests only.',
  public_case: 'Synthetic public case.', student_brief: 'Synthetic public business brief.',
  student_rules: [{field: 'fee', op: 'max', value: 500}], counterparty_rules: [], conditional_rules: [],
};
function terms() {
  return Object.fromEntries(FIELDS.map(field => {
    const schema = TERMS_SCHEMA.properties[field];
    return [field, field === 'fee' ? 123 : schema.enum ? schema.enum.find(x => x !== null) : schema.type.includes('number') ? 10 : true];
  }));
}
const output = overrides => ({
  reply: PUBLIC_REPLY, proposal: null, counterparty_accepts: false,
  summary_matches: true, discrepancies: [CANARY], ...overrides,
});

test('every bargaining sanitizer path removes auxiliary diagnostics and summary verdicts', () => {
  for (const proposal of [null, terms(), {...terms(), fee: null}, {...terms(), fee: 999}]) {
    const value = sanitizeModel(output({proposal}), policy, 'bargaining');
    assert.deepEqual(value.discrepancies, []);
    assert.equal(value.summary_matches, null);
    assert.equal(JSON.stringify(value).includes(CANARY), false);
  }
});

test('confirmation strips diagnostics and invented concessions while retaining a safe record check', () => {
  const value = sanitizeModel(output({reply: CANARY, proposal: terms(), counterparty_accepts: true}), policy, 'confirmation');
  assert.equal(JSON.stringify(value).includes(CANARY), false);
  assert.deepEqual(value.discrepancies, []);
  assert.equal(value.proposal, null);
  assert.equal(value.counterparty_accepts, false);
});

async function legacyFixture() {
  const session = {
    id: ID, token_hash: await digest(CREDENTIAL), name: 'Synthetic Participant',
    email: 'synthetic@example.invalid', mode: 'graded', case_id: policy.id,
    bargain_until: new Date(Date.now() + 60000).toISOString(),
    confirm_until: new Date(Date.now() + 120000).toISOString(),
  };
  const events = [{
    seq: 1, actor: 'counterpart', text: PUBLIC_REPLY, created_at: new Date().toISOString(),
    payload: {
      proposal: terms(), counterparty_accepts: false, discrepancies: [CANARY],
      summary_matches: true, validation_alert: CANARY, usage: {private_diagnostic: CANARY},
    },
  }];
  let modelCalls = 0;
  const store = {
    session: async id => id === ID ? session : null,
    policyById: async () => policy,
    events: async () => events,
    command: async (action, args) => {
      assert.equal(action, 'begin_turn');
      assert.equal(args.request_id, REQUEST_ID);
      return {status: 'complete'};
    },
  };
  const handler = createHandler({
    store, provider: {configured: true, reply: async () => {modelCalls++; throw Error('Replay must not call the model');}},
    instructorHash: await digest(ADMIN), allowedOrigins: ['https://class.example'],
  });
  return {handler, events, modelCalls: () => modelCalls};
}
function request(path, {admin = false, body} = {}) {
  return new Request('https://api.example/spm370-contract-negotiation' + path, {
    method: body ? 'POST' : 'GET',
    headers: {Origin: 'https://class.example', 'Content-Type': 'application/json',
      ...(admin ? {'X-Instructor-Key': ADMIN} : {'X-Session-Token': CREDENTIAL})},
    body: body ? JSON.stringify(body) : undefined,
  });
}
async function assertPublicResponse(response) {
  assert.equal(response.status, 200);
  const value = await response.json();
  assert.equal(JSON.stringify(value).includes(CANARY), false);
  assert.equal(value.session.events[0].text, PUBLIC_REPLY);
  assert.equal(value.session.events[0].payload.proposal.fee, 123);
  for (const event of value.session.events) {
    for (const field of ['discrepancies', 'summary_matches', 'usage', 'validation_alert']) {
      assert.equal(Object.hasOwn(event.payload, field), false, field + ' must stay private');
    }
  }
}

test('student readback excludes diagnostics already stored before the privacy fix', async () => {
  const f = await legacyFixture();
  await assertPublicResponse(await f.handler(request('/session/' + ID)));
  assert.equal(f.events[0].payload.discrepancies[0], CANARY, 'private stored record is preserved');
});

test('instructor record/export input uses the same safe event projection', async () => {
  const f = await legacyFixture();
  await assertPublicResponse(await f.handler(request('/instructor/session/' + ID, {admin: true})));
});

test('idempotent turn readback cannot re-expose legacy diagnostics', async () => {
  const f = await legacyFixture();
  await assertPublicResponse(await f.handler(request('/turn', {body: {
    session_id: ID, request_id: REQUEST_ID, text: 'Repeat delivery of an already saved message.',
  }})));
  assert.equal(f.modelCalls(), 0);
});

test('private commentary guard catches the observed minimum wording without blocking ordinary contract minimums', () => {
  for (const text of [
    'That meets Jordan’s minimum for this package.',
    "That meets Jordan's minimum.",
    'The private rule table permits this offer.',
    'This clears our fee floor.',
  ]) assert.equal(exposesPrivateCommentary(text), true, text);
  for (const text of [
    'No minimum sales or view count is guaranteed.',
    'The minimum segment length is 20 minutes.',
    'We can discuss a fixed five-year restriction; that is not perpetual.',
    'The opening advance is negotiable; what payment schedule can you propose?',
  ]) assert.equal(exposesPrivateCommentary(text), false, text);
});

function fakeProvider(replies) {
  const calls = [];
  const provider = createProvider({key: 'FAKE_TEST_ONLY', model: 'synthetic-model', fetcher: async (_url, options) => {
    calls.push(JSON.parse(options.body));
    const value = replies[calls.length - 1];
    assert(value, 'provider retry must be bounded');
    return Response.json({status: 'completed', id: 'synthetic-' + calls.length,
      output: [{type: 'message', content: [{type: 'output_text', text: JSON.stringify(value)}]}],
      usage: {input_tokens: 2, output_tokens: 3}});
  }});
  return {provider, calls};
}
const providerInput = {
  policy, session: {model_name: 'synthetic-model'}, sessionPhase: 'bargaining',
  events: [{actor: 'student', text: 'Can we discuss this proposed package?'}],
};

test('one private-commentary draft is regenerated once and only the clean reply survives', async () => {
  const f = fakeProvider([
    output({reply: 'That meets Jordan’s minimum. ' + CANARY}),
    output({reply: PUBLIC_REPLY}),
  ]);
  const result = await f.provider.reply(providerInput);
  assert.equal(f.calls.length, 2);
  assert.equal(result.value.reply, PUBLIC_REPLY);
  assert.deepEqual(result.value.discrepancies, []);
  assert.equal(JSON.stringify(result).includes(CANARY), false);
  assert.equal(JSON.stringify(f.calls[1]).includes(CANARY), false, 'leaking draft must not enter the retry transcript');
  assert.equal(result.usage.input_tokens, 4);
  assert.equal(result.usage.output_tokens, 6);
});

test('repeated private commentary produces a nonaccepting fallback after exactly two calls', async () => {
  const leak = output({reply: 'That meets Jordan’s minimum. ' + CANARY, proposal: terms(), counterparty_accepts: true});
  const f = fakeProvider([leak, leak]);
  const result = await f.provider.reply(providerInput);
  assert.equal(f.calls.length, 2);
  assert.equal(JSON.stringify(result).includes(CANARY), false);
  assert.equal(result.value.proposal, null);
  assert.equal(result.value.counterparty_accepts, false);
  assert.deepEqual(result.value.discrepancies, []);
  assert.equal(result.usage.response_source, 'private_commentary_guard');
});
