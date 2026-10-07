export const VERSION = '1.0.0';
export const MAXIMA = Object.freeze([2, 3, 3, 2]);
export const FIXTURES = Object.freeze({
  guided: Object.freeze({
    attemptId: 'd1b1c5f0-0000-4000-8000-000000000001', firstName: 'Synthetic', lastName: 'Guided', email: 'tap-guided@example.invalid', format: 'guided',
    responses: [
      'SYNTHETIC EXAMPLE: Guided play with a short team exhibition gives first-time visitors a low-pressure way to join. The tradeoff is less structured competition for experienced players.',
      'SYNTHETIC EXAMPLE: Keep an accessible arrival route separate from play. Test the selected game and network before opening. Ask TAP to confirm usable stations and available support before choosing rotations.',
      'SYNTHETIC EXAMPLE: Arrival 15 minutes, guided play and exhibition 60, closing 15. A floor host explains rotations. Ask an exit-slip question about comfort participating; record responses and compare with a proposed 18-of-24 target.',
      'SYNTHETIC TEST ONLY, NOT AN ANDREW QUOTE: Suppose a guest emphasized clear newcomer orientation. Keep guided play and give the floor host a short demonstration at arrival. Verify the actual interview point before completing real work.'
    ],
    label: 'Synthetic proposal A',
    summary: 'Guided play with a short exhibition emphasizes newcomer comfort. The plan separates arrival from play, checks technology before opening, and uses a floor host plus an exit question. A hypothetical revision adds a short orientation demonstration. This is a fictional test, not a claim from the guest.'
  }),
  tournament: Object.freeze({
    attemptId: 'd1b1c5f0-0000-4000-8000-000000000002', firstName: 'Synthetic', lastName: 'Tournament', email: 'tap-tournament@example.invalid', format: 'tournament',
    responses: [
      'SYNTHETIC EXAMPLE: A beginner-friendly mini-tournament gives the group a shared goal. Short rounds and continued play after elimination help newcomers, but scheduling and fairness require more staff attention.',
      'SYNTHETIC EXAMPLE: Separate check-in and spectators from active stations with an accessible route. Test the bracket workflow and connections. Ask TAP to confirm whether the proposed layout and station count are workable.',
      'SYNTHETIC EXAMPLE: Arrival and orientation 20 minutes, short rounds and open play 55, closing 15. A match host explains rules and checks waits. An exit slip asks whether each visitor felt able to participate; count responses against an 18-of-24 target.',
      'SYNTHETIC TEST ONLY, NOT AN ANDREW QUOTE: Suppose a guest emphasized avoiding long waits. Keep the tournament format but retain open play after elimination. This requires enough confirmed stations and a host to manage rotations.'
    ],
    label: 'Synthetic proposal B',
    summary: 'A beginner-friendly mini-tournament offers a shared competitive goal with short rounds and continued play. The plan separates circulation from active stations and checks the bracket and connections. A hypothetical revision protects open play after elimination, subject to station and staffing confirmation. This is a fictional test.'
  })
});
export class InputError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
const bad = (message, code = 'INVALID_INPUT', status = 400) => { throw new InputError(code, message, status); };
export const isUuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function objectOnly(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) bad('Send a JSON object.');
  if (Object.keys(value).some(key => !keys.includes(key))) bad('Unexpected input field.');
}
export function operationInput(value, extra = []) {
  objectOnly(value, ['action', 'attemptId', 'requestId', 'expectedVersion', ...extra]);
  if (!isUuid(value.attemptId) || !isUuid(value.requestId) || !Number.isInteger(value.expectedVersion) || value.expectedVersion < 0) bad('Invalid operation identifier or version.');
}
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export async function sha256(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let difference = 0; for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
function validateAnswers(responses, {complete = false} = {}) {
  if (!Array.isArray(responses) || responses.length !== 4 || responses.some(s => typeof s !== 'string' || s.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))) bad('Four short text responses are required.');
  if (complete && responses.some(s => !s.trim())) bad('Complete all four responses before submitting.');
  return responses.map(s => s.trim());
}
// Pure state machine. Public deployment never exposes these student operations.
export function transition(previous, command, {now = new Date().toISOString(), receiptId = crypto.randomUUID()} = {}) {
  const state = previous ? structuredClone(previous) : null;
  if (command.action === 'start') {
    if (state) bad('The attempt already exists.', 'STATE_CONFLICT', 409);
    const fixture = FIXTURES[command.fixture]; if (!fixture) bad('Unknown synthetic fixture.');
    return {attemptId: fixture.attemptId, mode: 'pilot', synthetic: true, firstName: fixture.firstName, lastName: fixture.lastName, email: fixture.email, format: fixture.format, responses: ['', '', '', ''], initialPlan: null, status: 'draft', version: 1, createdAt: now, savedAt: now, submittedAt: null, receipt: null, review: null, guest: {published: false, summary: fixture.summary}, fixture: command.fixture};
  }
  if (!state) bad('Attempt not found.', 'NOT_FOUND', 404);
  if (state.synthetic !== true || state.mode !== 'pilot' || !FIXTURES[state.fixture] || state.attemptId !== FIXTURES[state.fixture].attemptId) bad('Live data is disabled.', 'LIVE_DISABLED', 403);
  if (command.action === 'save') {
    if (state.status === 'submitted') bad('A submitted attempt cannot be changed.', 'STATE_CONFLICT', 409);
    const responses = validateAnswers(command.responses);
    if (!['guided', 'tournament'].includes(command.format)) bad('Choose one of the two formats.');
    if (state.initialPlan && (command.format !== state.initialPlan.format || canonical(responses.slice(0, 3)) !== canonical(state.initialPlan.responses))) bad('The original plan is retained. Explain changes in response four.', 'STATE_CONFLICT', 409);
    state.format = command.format; state.responses = responses;
  } else if (command.action === 'lockPlan') {
    if (state.status !== 'draft' || state.initialPlan) bad('The initial plan is already locked.', 'STATE_CONFLICT', 409);
    if (state.responses.slice(0, 3).some(s => !s.trim())) bad('Complete the first three responses before locking the plan.');
    state.initialPlan = {format: state.format, responses: state.responses.slice(0, 3), lockedAt: now}; state.status = 'plan_locked';
  } else if (command.action === 'submit') {
    if (state.status !== 'plan_locked' || !state.initialPlan) bad('Lock the initial plan before submitting.', 'STATE_CONFLICT', 409);
    validateAnswers(state.responses, {complete: true}); state.status = 'submitted'; state.submittedAt = now;
    state.receipt = {receiptId: `TAP2-PILOT-${receiptId.toUpperCase()}`, attemptId: state.attemptId, submittedAt: now, status: 'submitted', synthetic: true, credit: false};
  } else if (command.action === 'instructorReview') {
    if (state.status !== 'submitted') bad('Only completed work can be reviewed.', 'STATE_CONFLICT', 409);
    if (!Array.isArray(command.scores) || command.scores.length !== 4 || command.scores.some((n, i) => !Number.isInteger(n) || n < 0 || n > MAXIMA[i])) bad('Scores must be integers within 2, 3, 3, and 2 points.');
    state.review = {scores: [...command.scores], total: command.scores.reduce((a, n) => a + n, 0), notes: 'Synthetic instructor review.', reviewedAt: now};
  } else if (command.action === 'instructorPublish') {
    if (state.status !== 'submitted') bad('Only completed synthetic work can be released.', 'STATE_CONFLICT', 409);
    if (typeof command.published !== 'boolean') bad('Choose release or hide.');
    state.guest = {published: command.published, summary: FIXTURES[state.fixture].summary};
  } else bad('Unknown operation.');
  state.version += 1; state.savedAt = now; return state;
}
export function privateProjection(state) {
  const {attemptId, firstName, lastName, email, format, responses, initialPlan, status, version, receipt, submittedAt, review, guest, synthetic} = state;
  return {attemptId, firstName, lastName, email, format, responses, initialPlan, status, version, receipt, submittedAt, review, guest, synthetic};
}
export function demoProjection(demo) {
  if (!demo || !FIXTURES[demo.format] || !['draft', 'plan_locked', 'submitted'].includes(demo.stage)) return null;
  return {label: 'Shared synthetic pilot', format: demo.format, stage: demo.stage, summary: FIXTURES[demo.format].summary, updatedAt: demo.updatedAt};
}
export function guestProjection(counts, publications, demo = null) {
  return {ok: true, mode: 'pilot', synthetic: true, liveEnabled: false, sharing: 'synthetic-only', aggregate: {started: counts.started, initialPlans: counts.initialPlans, completedRevisions: counts.completedRevisions, formats: {guided: counts.formats.guided, tournament: counts.formats.tournament}}, proposals: publications.filter(p => p.published === true && FIXTURES[p.format]).map(p => ({label: FIXTURES[p.format].label, format: p.format, summary: FIXTURES[p.format].summary})), demo: demoProjection(demo)};
}
