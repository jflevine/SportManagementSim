/** Server-only grading logic. Never import this module into the student page. */
export const PRODUCTION_ORIGIN = 'https://jflevine.github.io';
export const MAX_BODY_BYTES = 16_384;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERSION = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@lasalle\.edu$/;
const INPUT_KEYS = new Set(['attemptId', 'assessmentVersion', 'firstName', 'lastName', 'email', 'answers', 'clientStartedAt', 'score', 'financeScore', 'legalScore']);

/** Explicit runtime env values override a deployment-only private bundle. */
export function resolveRuntimeConfig({ enabledValue, rubricValue } = {}, bundle = {}) {
  return {
    enabled: enabledValue === undefined ? bundle.enabled === true : enabledValue === 'true',
    rubric: rubricValue === undefined ? bundle.rubric : rubricValue,
  };
}

class RequestError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

/** The only source of grading data is private runtime configuration. */
export function parseRubric(value) {
  try {
    const input = typeof value === 'string' ? JSON.parse(value) : value;
    if (!input || typeof input.assessmentVersion !== 'string' || typeof input.rubricVersion !== 'string' || !VERSION.test(input.assessmentVersion) || !VERSION.test(input.rubricVersion) || !Array.isArray(input.items) || input.items.length !== 10) return null;
    const ids = new Set();
    const items = input.items.map((item) => {
      if (!item || typeof item.questionId !== 'string' || !VERSION.test(item.questionId) || ids.has(item.questionId) || !['finance', 'legal'].includes(item.category) || !Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 2 || typeof item.explanation !== 'string' || !item.explanation.trim() || item.explanation.length > 2400) throw new Error('Invalid rubric');
      ids.add(item.questionId);
      return Object.freeze({ questionId: item.questionId, category: item.category, correctIndex: item.correctIndex, explanation: item.explanation.trim() });
    });
    if (items.filter((item) => item.category === 'finance').length !== 5) return null;
    return Object.freeze({ assessmentVersion: input.assessmentVersion, rubricVersion: input.rubricVersion, items: Object.freeze(items) });
  } catch { return null; }
}

function validatePayload(input, rubric, now) {
  const invalid = () => { throw new RequestError(400, 'INVALID_SUBMISSION', 'Check your name, La Salle email, and all ten answers.'); };
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((key) => !INPUT_KEYS.has(key))) invalid();
  if (typeof input.attemptId !== 'string' || !UUID_V4.test(input.attemptId)) invalid();
  if (input.assessmentVersion !== rubric.assessmentVersion) throw new RequestError(400, 'VERSION_MISMATCH', 'Reload the activity before starting a new attempt.');
  const name = (value) => {
    if (typeof value !== 'string' || value.length > 160 || /[\u0000-\u001f\u007f]/u.test(value)) invalid();
    const normalized = value.trim().replace(/\s+/gu, ' ').normalize('NFC');
    if (!normalized || normalized.length > 80 || !/\p{L}/u.test(normalized)) invalid();
    return normalized;
  };
  const firstName = name(input.firstName);
  const lastName = name(input.lastName);
  if (typeof input.email !== 'string' || input.email.length > 254) invalid();
  const email = input.email.trim().toLowerCase();
  if (!EMAIL.test(email) || email.startsWith('.') || email.includes('..') || email.split('@')[0].endsWith('.') || email.split('@')[0].length > 64) invalid();
  if (!Array.isArray(input.answers) || input.answers.length !== 10 || !input.answers.every((value) => Number.isInteger(value) && value >= 0 && value <= 2)) invalid();
  if (typeof input.clientStartedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(input.clientStartedAt)) invalid();
  const started = Date.parse(input.clientStartedAt);
  if (!Number.isFinite(started) || new Date(started).toISOString() !== input.clientStartedAt || started < Date.UTC(2000, 0, 1) || started > now.getTime() + 300_000) invalid();
  // Client scores are deliberately ignored and never persisted or trusted.
  return { attemptId: input.attemptId.toLowerCase(), assessmentVersion: input.assessmentVersion, firstName, lastName, email, answers: [...input.answers], clientStartedAt: input.clientStartedAt };
}

function grade(payload, rubric, submittedAt, receiptId) {
  let financeScore = 0;
  let legalScore = 0;
  const feedback = rubric.items.map((item, index) => {
    const correct = payload.answers[index] === item.correctIndex;
    if (correct && item.category === 'finance') financeScore += 1;
    if (correct && item.category === 'legal') legalScore += 1;
    return { questionId: item.questionId, selectedIndex: payload.answers[index], correctIndex: item.correctIndex, correct, explanation: item.explanation };
  });
  return { ok: true, receipt: { receiptId, attemptId: payload.attemptId, assessmentVersion: payload.assessmentVersion, submittedAt, score: financeScore + legalScore, maxScore: 10, financeScore, legalScore }, feedback };
}

function sameSubmission(row, payload) {
  return row.attempt_id === payload.attemptId && row.assessment_version === payload.assessmentVersion && row.first_name === payload.firstName && row.last_name === payload.lastName && row.email === payload.email && new Date(row.client_started_at).toISOString() === payload.clientStartedAt && JSON.stringify(row.answers) === JSON.stringify(payload.answers);
}

async function readJson(request, signal) {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) throw new RequestError(413, 'PAYLOAD_TOO_LARGE', 'Submission is too large.');
  if (!request.body) throw new RequestError(400, 'INVALID_JSON', 'A JSON submission is required.');
  const reader = request.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      if (signal.aborted) throw new Error('Timed out');
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new RequestError(413, 'PAYLOAD_TOO_LARGE', 'Submission is too large.');
      }
      chunks.push(value);
    }
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); }
    catch { throw new RequestError(400, 'INVALID_JSON', 'A valid JSON submission is required.'); }
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}

/**
 * Store contract: insert(row, {signal}) -> 'inserted' | 'conflict';
 * findAttempt(attemptId, {signal}) -> stored row | null.
 * insert MUST use atomic DB uniqueness, never a check-then-insert sequence.
 * Only test harnesses may add exact localhost origins via allowedOrigins.
 */
export function createSubmissionHandler({ enabled = false, rubric: rawRubric, store, now = () => new Date(), randomUUID = () => crypto.randomUUID(), timeoutMs = 8000, allowedOrigins = [PRODUCTION_ORIGIN] } = {}) {
  const rubric = parseRubric(rawRubric);
  const configured = enabled === true && rubric && typeof store?.insert === 'function' && typeof store?.findAttempt === 'function';
  const origins = new Set(allowedOrigins);
  return async function handle(request) {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    const respond = (status, body) => new Response(body === null ? null : JSON.stringify(body), { status, headers });
    const fail = (status, code, message) => respond(status, { ok: false, error: { code, message } });
    if (!origin || !origins.has(origin)) return fail(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed.');
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'content-type';
    if (request.method === 'OPTIONS') return respond(204, null);
    if (request.method !== 'POST') { headers.Allow = 'POST, OPTIONS'; return fail(405, 'METHOD_NOT_ALLOWED', 'Submit using POST.'); }
    if (!configured) return fail(503, 'SUBMISSIONS_UNAVAILABLE', 'Submissions are not open. Please contact your instructor.');
    if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get('content-type') || '')) return fail(415, 'JSON_REQUIRED', 'Submit JSON only.');
    if (request.headers.has('content-encoding')) return fail(415, 'ENCODING_NOT_SUPPORTED', 'Compressed submissions are not supported.');
    const controller = new AbortController();
    let timer;
    try {
      const work = async () => {
        const input = await readJson(request, controller.signal);
        const timestamp = now();
        const payload = validatePayload(input, rubric, timestamp);
        const result = grade(payload, rubric, timestamp.toISOString(), randomUUID());
        const row = {
          attempt_id: payload.attemptId,
          assessment_version: payload.assessmentVersion,
          rubric_version: rubric.rubricVersion,
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          answers: payload.answers,
          score: result.receipt.score,
          finance_score: result.receipt.financeScore,
          legal_score: result.receipt.legalScore,
          client_started_at: payload.clientStartedAt,
          submitted_at: result.receipt.submittedAt,
          receipt: result,
        };
        const saved = await store.insert(row, { signal: controller.signal });
        if (saved === 'inserted') return respond(200, result);
        if (saved !== 'conflict') throw new Error('Unexpected store result');
        // Never look up by email and never return another attempt's result.
        const previous = await store.findAttempt(payload.attemptId, { signal: controller.signal });
        if (previous && sameSubmission(previous, payload)) return respond(200, previous.receipt);
        return fail(409, 'SUBMISSION_CONFLICT', 'This submission could not be accepted. Retry your original submission or contact your instructor.');
      };
      const deadline = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Timed out')); }, timeoutMs); });
      return await Promise.race([work(), deadline]);
    } catch (error) {
      if (error instanceof RequestError) return fail(error.status, error.code, error.message);
      // A timed-out save may have committed. Reusing the exact attempt and payload is safe.
      return fail(503, 'SAVE_UNCONFIRMED', 'We could not confirm your submission. Keep this page open and retry the same submission.');
    } finally { clearTimeout(timer); }
  };
}
