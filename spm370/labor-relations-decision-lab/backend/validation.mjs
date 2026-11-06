export class InputError extends Error {
  constructor(message, status = 400, code = 'INVALID_INPUT') { super(message); this.status = status; this.code = code; }
}
export const reject = (message, status, code) => { throw new InputError(message, status, code); };
export const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const words = s => (s.trim().match(/\S+/gu) || []).length;
const id = v => typeof v === 'string' && /^[a-zA-Z0-9_.-]{1,80}$/.test(v);
const text = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.length <= max;
export function selectAssessment(raw, role) {
  if (!['management','union'].includes(role)) reject('Choose your adviser role.');
  return validateAssessment({...raw,role,explanationMinWords:raw.explanationMinWords ?? raw.policy?.explanationMinWords, maxExplanationChars:raw.maxExplanationChars ?? raw.policy?.maxExplanationChars ?? 6000, questions:raw.questions.filter(q=>!q.roles||q.roles.includes(role)).map(q=>({...q,points:q.points??1,why:q.why??q.feedback}))});
}
export function validateAssessment(a) {
  if (!isObject(a) || !id(a.version) || !text(a.title, 1, 200) || !text(a.explanationPrompt, 1, 6000) || !Number.isInteger(a.explanationMinWords) || a.explanationMinWords < 1 || a.explanationMinWords > 500 || !Number.isInteger(a.writingMax * 2) || a.writingMax <= 0 || a.writingMax > 20 || !isObject(a.rubric) || !Array.isArray(a.questions) || a.questions.length < 1 || a.questions.length > 30) throw Error('Assessment configuration invalid');
  const ids = new Set();
  for (const q of a.questions) {
    if (!isObject(q) || !id(q.id) || ids.has(q.id) || !text(q.prompt, 1, 6000) || !text(q.why, 1, 6000) || !Number.isInteger(q.points) || q.points < 1 || q.points > 10 || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 8) throw Error('Question configuration invalid');
    ids.add(q.id);
    const options = new Set();
    for (const o of q.options) { if (!isObject(o) || !id(o.id) || options.has(o.id) || !text(o.text, 1, 3000)) throw Error('Option configuration invalid'); options.add(o.id); }
    if (!options.has(q.answer)) throw Error('Answer configuration invalid');
  }
  return a;
}
export function publicAssessment(a) {
  const mcMax = a.questions.reduce((sum, q) => sum + q.points, 0);
  return { version: a.version, title: a.title, maxPoints: mcMax + a.writingMax, mcMax, writingMax: a.writingMax, explanationPrompt: a.explanationPrompt, explanationMinWords: a.explanationMinWords, maxExplanationChars:a.maxExplanationChars??6000, role:a.role, questions: a.questions.map(q => ({id:q.id,prompt:q.prompt,options:q.options.map(o=>({id:o.id,text:o.text}))})) };
}
export function exactKeys(b, keys) {
  if (Object.keys(b).some(k => !keys.includes(k))) reject('The request contains an unsupported field.');
}
export function validateIdentity(b) {
  if (!text(b.name, 2, 120) || typeof b.email !== 'string' || b.email.length > 150 || !/^[^\s@]{1,100}@lasalle\.edu$/.test(b.email.trim().toLowerCase()) || b.attest !== true) reject('Enter your full name and La Salle email, then confirm individual work.');
  return { full_name: b.name.trim(), email: b.email.trim().toLowerCase() };
}
export function validateWork(b, a, final = false) {
  if (!Array.isArray(b.answers) || b.answers.length !== a.questions.length || b.answers.some((v,i) => !(v === null && !final) && !a.questions[i].options.some(o => o.id === v))) reject('Choose one answer for each question before submitting.');
  if (!text(b.explanation, 0, a.maxExplanationChars??6000)) reject(`The explanation must be text no longer than ${a.maxExplanationChars??6000} characters.`);
  const gameplay = b.gameplay === undefined ? {} : b.gameplay;
  if (!isObject(gameplay) || new TextEncoder().encode(JSON.stringify(gameplay)).byteLength > 16000) reject('The saved gameplay summary is too large or invalid.');
  if (final && (b.attest !== true || words(b.explanation) < a.explanationMinWords)) reject(`Write at least ${a.explanationMinWords} words and confirm individual work before submitting.`);
  return { answers: [...b.answers], explanation: b.explanation.trim(), gameplay };
}
export function validateGrade(b, a) {
  if (typeof b.writingScore !== 'number' || !Number.isFinite(b.writingScore) || b.writingScore < 0 || b.writingScore > a.writingMax || !Number.isInteger(b.writingScore * 2)) reject(`Enter a writing grade from 0 to ${a.writingMax} in half-point increments.`);
  if (!text(b.notes, 1, 4000) || !['assistant','instructor'].includes(b.reviewerType)) reject('Provide student-facing review feedback and reviewer type.');
  return { writing_score: b.writingScore, grader_notes: b.notes.trim(), reviewer_type: b.reviewerType };
}
export function scoreAnswers(answers, a) { return a.questions.reduce((sum,q,i)=>sum+(answers[i]===q.answer?q.points:0),0); }
