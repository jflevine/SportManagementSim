import {CASE_VERSION, SCHEMA_VERSION, LIMITS, uuid, submission, grade, digest, equalHash, fail} from './validation.mjs';
async function readJson(req) {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw fail(415, 'Use a JSON request.');
  if (Number(req.headers.get('content-length')) > 16000) throw fail(413, 'The request is too large.');
  const reader = req.body?.getReader(); if (!reader) throw fail(400, 'Provide a request body.');
  const chunks = []; let size = 0;
  while (true) { const {value, done} = await reader.read(); if (done) break; size += value.length; if (size > 16000) { await reader.cancel(); throw fail(413, 'The request is too large.'); } chunks.push(value); }
  const all = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
  try { const body = JSON.parse(new TextDecoder().decode(all)); if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error(); return body; } catch { throw fail(400, 'The request is not valid JSON.'); }
}
function publicSettings(s) { return {case_version: CASE_VERSION, schema_version: SCHEMA_VERSION, accepts_submissions: s?.accepts_submissions === true, limits: LIMITS}; }
const databaseErrors = {
  ACTIVITY_CLOSED: [409, 'Submissions are closed. Download your answers and contact the instructor.', 'activity_closed'],
  DUPLICATE_EMAIL: [409, 'A response already exists for this email. Your saved response was not changed; contact the instructor if needed.', 'duplicate_email'],
  RETRY_NOT_AUTHORIZED: [409, 'An additional attempt is not available for this email. Check your school email or contact your instructor. Your original submission was not changed.', 'retry_not_authorized'],
  RETRY_MISMATCH: [409, 'This submission identifier belongs to a different request. Your original response was not changed.', 'retry_mismatch'],
  GRADE_CONFLICT: [409, 'This grade changed in another window. Refresh the record before saving again.', 'grade_conflict'],
  NOT_FOUND: [404, 'The submission was not found.', 'not_found'],
  VERSION_MISMATCH: [409, 'The activity version is out of date. Save your answers and reload.', 'version_mismatch'],
  CAPACITY_REACHED: [503, 'The activity cannot accept more submissions. Save your answers and contact the instructor.', 'capacity_reached']
};
export function createHandler({store, allowedOrigins = ['https://jflevine.github.io', 'http://localhost:8765', 'http://127.0.0.1:8765']}) {
  return async req => {
    const origin = req.headers.get('origin');
    const headers = {'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Class-Code,X-Instructor-Key', 'X-Content-Type-Options': 'nosniff'};
    if (origin && allowedOrigins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const send = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
    try {
      if (origin && !allowedOrigins.includes(origin)) throw fail(403, 'This website is not allowed to use the activity.', 'origin_denied');
      if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});
      const path = new URL(req.url).pathname.replace(/^.*\/spm370-counteroffer/, '').replace(/\/$/, '') || '/';
      if (!['GET', 'POST', 'PUT'].includes(req.method)) throw fail(405, 'Method not supported.');
      const settings = await store.settings();
      if (path === '/health' && req.method === 'GET') return send({ok: true, configured: !!settings?.class_code_hash && !!settings?.instructor_key_hash, accepts_submissions: settings?.accepts_submissions === true});
      if (!settings) throw fail(503, 'This activity is not configured yet.');
      if (path === '/meta' && req.method === 'GET') return send({ok: true, ...publicSettings(settings)});
      if (path === '/submit' && req.method === 'POST') {
        const classCode = req.headers.get('x-class-code') || '';
        if (classCode.length < 12 || classCode.length > 128 || !equalHash(await digest(classCode), settings.class_code_hash)) throw fail(403, 'The class access code was not verified.', 'class_code_invalid');
        const body = await readJson(req), payload = submission(body);
        const result = await store.submit({id: body.submission_id, token_hash: await digest(body.submission_token), payload_hash: await digest(JSON.stringify(payload)), payload});
        return send({ok: true, ...result});
      }
      if (path === '/instructor' || path === '/grade' || path === '/settings') {
        const key = req.headers.get('x-instructor-key') || '';
        if (key.length < 32 || key.length > 128 || !equalHash(await digest(key), settings.instructor_key_hash)) throw fail(401, 'Instructor access was not verified.', 'instructor_access_denied');
        if (path === '/instructor' && req.method === 'GET') {
          const onlyId = new URL(req.url).searchParams.get('submission_id');
          if (onlyId && !uuid(onlyId)) throw fail(400, 'Invalid submission identifier.');
          return send({ok: true, settings: publicSettings(settings), submissions: await store.list(onlyId)});
        }
        if (path === '/grade' && req.method === 'POST') return send({ok: true, ...(await store.grade(grade(await readJson(req))))});
        if (path === '/settings' && req.method === 'PUT') {
          const body = await readJson(req);
          if (typeof body.accepts_submissions !== 'boolean' || Object.keys(body).length !== 1) throw fail(400, 'Provide accepts_submissions as true or false.');
          return send({ok: true, settings: publicSettings(await store.setOpen(body.accepts_submissions))});
        }
      }
      throw fail(404, 'Route not found.', 'not_found');
    } catch (error) {
      const mapped = databaseErrors[error.message];
      if (mapped) return send({ok: false, error: mapped[1], code: mapped[2]}, mapped[0]);
      if (error.status) return send({ok: false, error: error.message, code: error.code}, error.status);
      return send({ok: false, error: 'The server could not confirm this request. Keep your answers and retry the same submission; no overwrite will occur.', code: 'server_unavailable'}, 503);
    }
  };
}

