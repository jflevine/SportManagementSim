import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {ASSESSMENT, QUESTIONS} from '../questions.mjs';
import {config} from '../config.mjs';
import {VERSION, MC_IDS, BRIEF_IDS, MAX_BRIEF_LENGTH, cleanIdentity, identityError, emptyResponses, completeQuestion, validResponses, buildPayload, validPayload, validResult, recoverState, escapeHTML} from '../model.mjs';

const ATTEMPT = '11111111-1111-4111-8111-111111111111';
const RECEIPT = '22222222-2222-4222-9222-222222222222';
const complete = () => ({...Object.fromEntries(MC_IDS.map((id, i) => [id, i % 4])), q5: {a: 'Player safety', b: 'Local injury data'}, q10: {a: 'Scholarship slots', b: 'Buyer may walk away'}});
const sample = (over = {}) => ({version: VERSION, pilot: false, attemptId: ATTEMPT, clientStartedAt: '2026-11-05T14:30:00.000Z', identity: {firstName: 'Test', lastName: 'Only', email: 'test@lasalle.edu'}, responses: complete(), status: 'answering', view: 'question', current: 0, ...over});
const receipt = (payload, over = {}) => ({ok: true, receipt: {receiptId: RECEIPT, attemptId: payload.attemptId, assessmentVersion: payload.assessmentVersion, submittedAt: '2026-11-05T14:44:00.000Z', mcScore: 6, maxMcScore: 8, maxScore: 12, briefPointsPending: 4, reviewStatus: 'pending_instructor_review', foundationsMcScore: 3, issuesMcScore: 3, ...over}});

test('version, endpoint, and assessment facts', () => {
  assert.equal(VERSION, 'mgt340-youth-sport-v2');
  assert.equal(config.submissionEndpoint, 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/submit-mgt340-youth-sport');
  assert.equal(ASSESSMENT.id, VERSION);
  assert.equal(ASSESSMENT.date, 'Week 10');
  assert.match(ASSESSMENT.instructions, /Work individually.*open-notes/);
  assert.equal(ASSESSMENT.totalPoints, 12);
  assert.equal(ASSESSMENT.expectedMinutes, 15);
  assert.deepEqual(ASSESSMENT.sections.map(s => s.id), ['foundations', 'issues']);
});

test('ten items: q1–q5 foundations, q6–q10 issues; 8 MC with four options, 2 two-part briefs', () => {
  assert.equal(QUESTIONS.length, 10);
  assert.deepEqual(QUESTIONS.map(q => q.id), ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10']);
  assert.deepEqual(MC_IDS, ['q1','q2','q3','q4','q6','q7','q8','q9']);
  assert.deepEqual(BRIEF_IDS, ['q5','q10']);
  assert.deepEqual(QUESTIONS.filter(q => q.kind === 'mc').map(q => q.id), MC_IDS);
  assert.deepEqual(QUESTIONS.filter(q => q.kind === 'brief').map(q => q.id), BRIEF_IDS);
  QUESTIONS.forEach((q, i) => {
    assert.equal(q.category, i < 5 ? 'foundations' : 'issues', q.id);
    for (const key of ['title', 'context', 'prompt']) assert.ok(q[key]?.trim(), `${q.id} ${key}`);
    if (q.kind === 'mc') {
      assert.equal(q.points, 1);
      assert.deepEqual(q.options.map(o => o.id), ['A','B','C','D']);
      assert.ok(q.options.every(o => o.text.trim()));
    } else {
      assert.equal(q.points, 2);
      assert.deepEqual(q.parts.map(p => p.id), ['a','b']);
      assert.ok(q.parts.every(p => p.prompt.endsWith('(1 point)')));
    }
  });
  const points = QUESTIONS.reduce((n, q) => n + q.points, 0);
  assert.equal(points, 12);
  for (const cat of ['foundations', 'issues']) assert.equal(QUESTIONS.filter(q => q.category === cat).reduce((n, q) => n + q.points, 0), 6);
});

test('revised stems preserve governing body, study population and NIL precision', () => {
  const q = id => QUESTIONS.find(x => x.id === id);
  assert.equal(q('q1').options[2].text, 'The Pennsylvania Interscholastic Athletic Association (PIAA)');
  assert.equal(q('q2').prompt, 'Which of these is a core function of the NFHS?');
  assert.match(q('q1').prompt, /Within the association's eligibility and appeal process/);
  assert.doesNotMatch(q('q1').prompt, /final authority/);
  assert.equal(q('q2').options[0].text, 'Developing playing rules and providing education and training resources for high school coaches and officials');
  assert.equal(q('q4').options[1].text, 'Payment cannot be a prerequisite for participation; inability to pay must not exclude an otherwise eligible child');
  assert.match(q('q6').prompt, /58% of U.S. youth ages 6–17/);
  assert.match(q('q6').prompt, /2024 National Survey of Children’s Health/);
  assert.match(q('q6').prompt, /36\.3%.*below the federal poverty threshold/);
  assert.match(q('q7').prompt, /\$1,016.*up 46% from 2019.*ages 6–18 who regularly played sports/);
  assert.equal(q('q8').options[3].text, 'Private venue decisions about prices and recording policies can limit family access and voice');
  assert.equal(q('q9').options[1].text, 'She may earn NIL compensation, subject to restrictions on school and PIAA identification, and she or her parent/guardian must notify her principal or athletic director within 72 hours after entering the agreement');
  assert.equal(q('q9').options[2].text, 'A coach who is not her parent may arrange her NIL deal');
  assert.equal(q('q10').parts[1].prompt, 'Name one plausible cost or risk of insisting on that term. (1 point)');
});

test('public files contain no answer key or grading fields', async () => {
  const dir = new URL('../', import.meta.url);
  const files = (await readdir(dir)).filter(f => /\.(mjs|html|css|md)$/.test(f));
  for (const f of files) {
    const src = await readFile(new URL(f, dir), 'utf8');
    for (const word of ['correctIndex', 'correctOptionId', 'answerKey', 'mcKey', 'explanation:', 'rationale']) assert.equal(src.includes(word), false, `${f}: ${word}`);
  }
});

test('legacy sales/sponsorship copy is gone', async () => {
  const dir = new URL('../', import.meta.url);
  for (const f of ['app.mjs', 'questions.mjs', 'index.html', 'model.mjs']) {
    const src = await readFile(new URL(f, dir), 'utf8');
    assert.doesNotMatch(src, /sales|sponsorship|Ticket Desk|Partner Desk|coffee|Philly Sports|October 29/i, f);
  }
});

test('identity normalization and strict La Salle domain', () => {
  assert.deepEqual(cleanIdentity(' Test ', ' Only ', ' TEST@LASALLE.EDU '), sample().identity);
  assert.equal(identityError(sample().identity), '');
  for (const email of ['test@example.com', 'test@lasalle.edu.evil.test', 'x@y@lasalle.edu', '.x@lasalle.edu']) assert.notEqual(identityError({...sample().identity, email}), '');
});

test('responses: drafts may be partial, submission must be complete and bounded', () => {
  assert.equal(validResponses(emptyResponses()), true);
  assert.equal(validResponses(emptyResponses(), true), false);
  assert.equal(validResponses(complete(), true), true);
  assert.equal(validResponses({...complete(), q1: 4}), false);
  assert.equal(validResponses({...complete(), q5: {a: 'x'.repeat(MAX_BRIEF_LENGTH + 1), b: 'y'}}), false);
  assert.equal(validResponses({...complete(), q10: {a: 'ok', b: '   '}}, true), false);
  assert.equal(completeQuestion(QUESTIONS[0], 2), true);
  assert.equal(completeQuestion(QUESTIONS[4], {a: 'goal', b: ''}), false);
});

test('payload has exactly the designated fields, eight MC indexes, trimmed briefs', () => {
  const s = sample({responses: {...complete(), q5: {a: '  Safety first  ', b: 'Injury data'}}, score: 12});
  const p = buildPayload(s);
  assert.deepEqual(Object.keys(p).sort(), ['answers','assessmentVersion','attemptId','briefs','clientStartedAt','email','firstName','lastName']);
  assert.deepEqual(p.answers, [0,1,2,3,0,1,2,3]);
  assert.equal(p.answers.length, 8);
  assert.deepEqual(Object.keys(p.briefs), ['q5','q10']);
  assert.equal(p.briefs.q5.a, 'Safety first');
  assert.equal(validPayload(p), true);
  assert.equal(validPayload({...p, answers: p.answers.slice(0, 7)}), false);
  assert.equal(validPayload({...p, assessmentVersion: 'mgt340-sales-sponsorship-v1'}), false);
});

test('receipt validation requires matching attempt and new subscore fields', () => {
  const p = buildPayload(sample());
  assert.equal(validResult(receipt(p), p), true);
  assert.equal(validResult(receipt(p, {mcScore: 8, foundationsMcScore: 4, issuesMcScore: 4}), p), true);
  assert.equal(validResult(receipt(p, {mcScore: 0, foundationsMcScore: 0, issuesMcScore: 0}), p), true);
  const bad = [
    {mcScore: 7},
    {foundationsMcScore: 5, issuesMcScore: 1},
    {issuesMcScore: -1, mcScore: 2},
    {foundationsMcScore: '3'},
    {attemptId: '33333333-3333-4333-8333-333333333333'},
    {assessmentVersion: 'other'},
    {receiptId: 'not-a-uuid'},
    {maxScore: 10},
    {briefPointsPending: 0},
    {reviewStatus: 'graded'},
    {submittedAt: 'never'}
  ];
  for (const over of bad) assert.equal(validResult(receipt(p, over), p), false, JSON.stringify(over));
  // The legacy sales/sponsorship receipt shape is rejected.
  const legacy = receipt(p); delete legacy.receipt.foundationsMcScore; delete legacy.receipt.issuesMcScore; Object.assign(legacy.receipt, {salesMcScore: 3, sponsorshipMcScore: 3});
  assert.equal(validResult(legacy, p), false);
  assert.equal(validResult({...receipt(p), ok: false}, p), false);
  assert.equal(validResult(null, p), false);
});

test('recovery: valid draft restores; corrupt, version, and mode crossovers fail closed', () => {
  const s = sample();
  assert.deepEqual(recoverState(JSON.stringify(s), false), s);
  for (const raw of ['broken', 'null', '{}', JSON.stringify({...s, attemptId: 'bad'}), JSON.stringify({...s, version: 'mgt340-sales-sponsorship-v1'}), JSON.stringify({...s, current: 10})]) assert.equal(recoverState(raw, false), null);
  assert.equal(recoverState(JSON.stringify(s), true), null);
  assert.equal(recoverState(JSON.stringify({...s, pilot: true, identity: {}, status: 'saved'}), true), null);
  assert.equal(recoverState(JSON.stringify({...s, status: 'pilot-complete'}), false), null);
  assert.equal(recoverState(JSON.stringify({...s, pilot: true, identity: {}, status: 'pilot-complete'}), true).status, 'pilot-complete');
});

test('interrupted submission restores frozen for same-attempt retry; altered payload rejected', () => {
  const s = sample();
  s.frozen = buildPayload(s);
  const pending = recoverState(JSON.stringify({...s, status: 'pending'}), false);
  assert.equal(pending.status, 'error');
  assert.deepEqual(pending.frozen, s.frozen);
  const altered = {...s, status: 'error', responses: {...s.responses, q1: 3}};
  assert.equal(recoverState(JSON.stringify(altered), false), null);
  assert.equal(recoverState(JSON.stringify({...s, status: 'saved', result: receipt(s.frozen)}), false).status, 'saved');
  assert.equal(recoverState(JSON.stringify({...s, status: 'saved', result: receipt(s.frozen, {mcScore: 1})}), false), null);
});

test('display values are escaped', () => assert.equal(escapeHTML('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;'));

