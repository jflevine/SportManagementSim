export const QUESTION_COUNT = 10;
export const STORAGE_PREFIX = 'mgt340-kc2:';
export function cleanIdentity(firstName, lastName, email) {
  return {firstName: firstName.trim().replace(/\s+/gu, ' ').normalize('NFC'), lastName: lastName.trim().replace(/\s+/gu, ' ').normalize('NFC'), email: email.trim().toLowerCase()};
}
export function identityError(identity) {
  if (!identity.firstName || !identity.lastName || !/\p{L}/u.test(identity.firstName) || !/\p{L}/u.test(identity.lastName) || /[\u0000-\u001f\u007f]/u.test(identity.firstName + identity.lastName)) return 'Enter your first and last name.';
  if (identity.firstName.length > 60 || identity.lastName.length > 60) return 'Use no more than 60 characters for each name.';
  if (identity.email.length > 120 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@lasalle\.edu$/.test(identity.email) || identity.email.startsWith('.') || identity.email.includes('..') || identity.email.split('@')[0].endsWith('.') || identity.email.split('@')[0].length > 64) return 'Enter your La Salle email address ending in @lasalle.edu.';
  return '';
}
export function validAnswers(answers, complete = false) {
  return Array.isArray(answers) && answers.length === QUESTION_COUNT && answers.every(a => (!complete && a === null) || (Number.isInteger(a) && a >= 0 && a <= 2));
}
export function validResult(result, state) {
  const r = result?.receipt;
  if (result?.ok !== true || !r || r.attemptId !== state.attemptId || r.assessmentVersion !== state.assessmentVersion || !r.receiptId || typeof r.receiptId !== 'string' || r.receiptId.length > 160 || !Number.isFinite(Date.parse(r.submittedAt))) return false;
  if (r.maxScore !== 10 || !Number.isInteger(r.score) || !Number.isInteger(r.financeScore) || !Number.isInteger(r.legalScore) || r.financeScore < 0 || r.financeScore > 5 || r.legalScore < 0 || r.legalScore > 5 || r.score !== r.financeScore + r.legalScore) return false;
  if (!Array.isArray(result.feedback) || result.feedback.length !== 10) return false;
  return result.feedback.every((f, i) => f && typeof f === 'object' && f.questionId === `q${i + 1}` && f.selectedIndex === state.answers[i] && Number.isInteger(f.correctIndex) && f.correctIndex >= 0 && f.correctIndex <= 2 && f.correct === (f.selectedIndex === f.correctIndex) && typeof f.explanation === 'string' && f.explanation.length <= 2400) && result.feedback.filter(f => f.correct).length === r.score && result.feedback.slice(0, 5).filter(f => f.correct).length === r.financeScore;
}
export function recoverState(raw, version, preview) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.assessmentVersion !== version || s.preview !== preview || !validAnswers(s.answers) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s.attemptId) || !Number.isFinite(Date.parse(s.clientStartedAt))) return null;
    if (!preview && (!s.identity || typeof s.identity.firstName !== 'string' || typeof s.identity.lastName !== 'string' || typeof s.identity.email !== 'string' || identityError(s.identity))) return null;
    if (!['answering', 'pending', 'error', 'saved', 'preview-complete'].includes(s.status)) return null;
    if ((preview && ['pending', 'error', 'saved'].includes(s.status)) || (!preview && s.status === 'preview-complete')) return null;
    if (s.status !== 'answering' && !validAnswers(s.answers, true)) return null;
    if (s.status === 'saved' && !validResult(s.result, s)) return null;
    if (s.status === 'pending') s.status = 'error';
    return s;
  } catch { return null; }
}
export function buildPayload(state) {
  return {attemptId: state.attemptId, assessmentVersion: state.assessmentVersion, ...state.identity, answers: [...state.answers], clientStartedAt: state.clientStartedAt};
}
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
