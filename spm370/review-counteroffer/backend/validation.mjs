export const CASE_VERSION = 'decision-lab-3-v1';
export const SCHEMA_VERSION = 1;
export const LIMITS = Object.freeze({name_min: 3, name_max: 120, recommendation_min: 20, recommendation_max: 4000, clarification_min: 10, clarification_max: 2000, clause_min: 1, clause_max: 6});
export const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const fail = (status, message, code = 'invalid_request') => Object.assign(new Error(message), {status, code});
function string(value, min, max, label) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw fail(400, `${label} must contain ${min}–${max} characters.`);
  return value.trim();
}
export function submission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail(400, 'Provide a submission.');
  if (!uuid(body.submission_id) || typeof body.submission_token !== 'string' || !/^[A-Za-z0-9_-]{64,128}$/.test(body.submission_token)) throw fail(400, 'The private submission identifier is invalid. Reload the activity before submitting.');
  if (body.case_version !== CASE_VERSION || body.schema_version !== SCHEMA_VERSION) throw fail(409, 'This activity version is out of date. Save your answers, then reload the activity.', 'version_mismatch');
  const email = string(body.email, 6, 160, 'School email').toLowerCase();
  if (!/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@lasalle\.edu$/.test(email)) throw fail(400, 'Enter your La Salle email ending in @lasalle.edu.');
  if (!['proceed', 'counter', 'decline'].includes(body.decision)) throw fail(400, 'Choose proceed, counter, or decline.');
  if (!Number.isInteger(body.clause_number) || body.clause_number < LIMITS.clause_min || body.clause_number > LIMITS.clause_max) throw fail(400, 'Choose a clause numbered 1–6.');
  return {
    schema_version: SCHEMA_VERSION, case_version: CASE_VERSION,
    name: string(body.name, LIMITS.name_min, LIMITS.name_max, 'Name'), email,
    decision: body.decision,
    recommendation: string(body.recommendation, LIMITS.recommendation_min, LIMITS.recommendation_max, 'Recommendation'),
    clause_number: body.clause_number,
    clarification: string(body.clarification, LIMITS.clarification_min, LIMITS.clarification_max, 'Clarification')
  };
}
export function grade(body) {
  if (!uuid(body?.submission_id) || !Number.isInteger(body.expected_grade_revision) || body.expected_grade_revision < 0) throw fail(400, 'Provide a valid submission and grade revision.');
  const points = body.points;
  if (!points || typeof points !== 'object' || Array.isArray(points) || Object.keys(points).length !== 3 || !Object.entries({recommendation: 4, concept: 2, clarification: 4}).every(([key, max]) => Number.isFinite(points[key]) && points[key] >= 0 && points[key] <= max && Number.isInteger(points[key] * 2))) throw fail(400, 'Use points within 4 / 2 / 4, in whole or half-point increments.');
  if (typeof body.feedback !== 'string' || body.feedback.trim().length > 5000) throw fail(400, 'Feedback must be no more than 5,000 characters.');
  return {submission_id: body.submission_id, expected_grade_revision: body.expected_grade_revision, points: {recommendation: points.recommendation, concept: points.concept, clarification: points.clarification}, feedback: body.feedback.trim()};
}
export async function digest(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export function equalHash(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== 64 || b.length !== 64) return false;
  let diff = 0; for (let i = 0; i < 64; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
