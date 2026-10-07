import {VERSION, FIXTURES, InputError, objectOnly, operationInput, canonical, sha256, safeCompare, transition, privateProjection, guestProjection, demoProjection} from './model.mjs';
const PUBLIC_ORIGIN = 'https://jflevine.github.io';
const STUDENT_ACTIONS = new Set(['start', 'resume', 'save', 'lockPlan', 'submit']);
const LIMIT = 16000;
async function readBody(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type') || '') || req.headers.has('content-encoding')) throw new InputError('UNSUPPORTED_MEDIA', 'Send uncompressed JSON.', 415);
  if (Number(req.headers.get('content-length') || 0) > LIMIT) throw new InputError('BODY_TOO_LARGE', 'The request is too large.', 413);
  const reader = req.body?.getReader(); if (!reader) throw new InputError('INVALID_INPUT', 'The request is empty.');
  let size = 0; const chunks = [];
  try {while (true) {const {done, value} = await reader.read(); if (done) break; size += value.byteLength; if (size > LIMIT) {await reader.cancel(); throw new InputError('BODY_TOO_LARGE', 'The request is too large.', 413);} chunks.push(value);}} finally {reader.releaseLock();}
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.byteLength;}
  try {return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));} catch {throw new InputError('INVALID_INPUT', 'The JSON request could not be read.');}
}
export function createHandler({store, instructorKeyHash, now = () => new Date().toISOString(), allowedOrigins = [PUBLIC_ORIGIN]}) {
  const origins = new Set(allowedOrigins);
  async function apply(command) {
    const hash = await sha256(canonical(command));
    const oldOperation = await store.replay(command.attemptId, command.requestId, hash);
    if (oldOperation) return oldOperation;
    const current = await store.get(command.attemptId);
    if ((current?.version || 0) !== command.expectedVersion) throw new InputError('VERSION_CONFLICT', 'Newer work was saved. Refresh before making another change.', 409);
    const next = transition(current, command, {now: now()});
    const response = {ok: true, mode: 'pilot', synthetic: true, submission: privateProjection(next)};
    const fixture = FIXTURES[next.fixture];
    const publication = {label: fixture.label, format: fixture.format, summary: fixture.summary, published: next.guest.published};
    return await store.apply({attemptId: command.attemptId, requestId: command.requestId, requestHash: hash, expectedVersion: command.expectedVersion, next, response, publication});
  }
  async function syntheticTest(fixtureKey) {
    const fixture = FIXTURES[fixtureKey]; if (!fixture) throw new InputError('INVALID_INPUT', 'Choose guided or tournament.');
    const existing = await store.get(fixture.attemptId);
    if (existing?.status === 'submitted') return {ok: true, mode: 'pilot', synthetic: true, submission: privateProjection(existing)};
    const actions = [
      {action: 'start', fixture: fixtureKey},
      {action: 'save', format: fixture.format, responses: [...fixture.responses.slice(0, 3), '']},
      {action: 'lockPlan'},
      {action: 'save', format: fixture.format, responses: fixture.responses},
      {action: 'submit'}
    ];
    let result;
    for (let index = 0; index < actions.length; index++) {
      const requestId = `d1b1c5f0-000${fixtureKey === 'guided' ? '1' : '2'}-4000-8000-00000000000${index + 1}`;
      result = await apply({...actions[index], attemptId: fixture.attemptId, requestId, expectedVersion: index});
    }
    return result;
  }
  return async req => {
    const origin = req.headers.get('origin');
    const headers = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Access-Control-Allow-Origin': origins.has(origin) ? origin : PUBLIC_ORIGIN, 'Access-Control-Allow-Headers': 'content-type, x-instructor-key', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Vary': 'Origin'};
    const send = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
    const errorResponse = error => error instanceof InputError ? send({ok: false, error: {code: error.code, message: error.message}}, error.status) : send({ok: false, error: {code: 'STORAGE_UNAVAILABLE', message: 'The server could not confirm this request. Retry the exact same operation.'}}, 503);
    if (origin && !origins.has(origin)) return errorResponse(new InputError('ORIGIN_DENIED', 'Origin not allowed.', 403));
    const url = new URL(req.url);
    if (!['/spm343-tap-lab2', '/functions/v1/spm343-tap-lab2'].includes(url.pathname.replace(/\/$/, ''))) return errorResponse(new InputError('NOT_FOUND', 'Route not found.', 404));
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});
    if (!['GET', 'POST'].includes(req.method)) return errorResponse(new InputError('METHOD_NOT_ALLOWED', 'Method not allowed.', 405));
    try {
      if (req.method === 'GET') {
        if (url.searchParams.get('view') === 'guest') {
          if (!store) throw new Error('Storage unavailable');
          // Adapter returns only SQL aggregate counters and the separate publication table.
          const publicData = await store.guest(); return send(guestProjection(publicData.aggregate, publicData.publications, publicData.demo));
        }
        if (url.searchParams.has('view') && url.searchParams.get('view') !== 'status') throw new InputError('NOT_FOUND', 'View not found.', 404);
        return send({ok: true, version: VERSION, mode: 'pilot', liveEnabled: false, studentStorage: 'browser-local', grading: 'instructor-only', maxScore: 10});
      }
      const body = await readBody(req);
      if (STUDENT_ACTIONS.has(body?.action)) throw new InputError('LIVE_DISABLED', 'This is an instructor-review pilot. Real student storage and submission are disabled.', 403);
      if (body?.action === 'pilotProgress') {
        objectOnly(body, ['action', 'format', 'stage']);
        if (!['guided', 'tournament'].includes(body.format) || !['draft', 'plan_locked', 'submitted'].includes(body.stage)) throw new InputError('INVALID_INPUT', 'Choose a synthetic format and stage.');
        if (!store) throw new Error('Storage unavailable');
        const demo = await store.progress({format: body.format, stage: body.stage});
        return send({ok: true, mode: 'pilot', synthetic: true, demo: demoProjection(demo)});
      }
      // No private read or mutation occurs before this existing-key verification.
      const key = req.headers.get('x-instructor-key') || '';
      if (!key || key.length > 200 || !instructorKeyHash || !safeCompare(await sha256(key), instructorKeyHash)) throw new InputError('UNAUTHORIZED', 'Invalid instructor access key.', 401);
      if (!store) throw new Error('Storage unavailable');
      if (body.action === 'instructorList') {
        objectOnly(body, ['action']);
        const records = await store.list();
        return send({ok: true, mode: 'pilot', liveEnabled: false, submissions: records.map(privateProjection), maxScore: 10});
      }
      if (body.action === 'instructorTest') {objectOnly(body, ['action', 'fixture']); return send(await syntheticTest(body.fixture));}
      if (body.action === 'instructorReview') {operationInput(body, ['scores']); return send(await apply(body));}
      if (body.action === 'instructorPublish') {operationInput(body, ['published']); return send(await apply(body));}
      throw new InputError('INVALID_INPUT', 'Unknown operation.');
    } catch (error) {return errorResponse(error);}
  };
}
