import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assessment} from '../questions.js';
import {validResult} from '../model.js';
test('ten public prompts: five finance then five legal, one point, three options',()=>{assert.equal(assessment.questions.length,10);assert.equal(assessment.totalPoints,10);assessment.questions.forEach((q,i)=>{assert.equal(q.id,`q${i+1}`);assert.equal(q.section,i<5?'finance':'legal');assert.equal(q.points,1);assert.equal(q.options.length,3);assert.equal(new Set(q.options.map(o=>o.id)).size,3);for(const key of ['title','context','stem'])assert.ok(q[key]?.trim());assert.ok(q.options.every(o=>o.text?.trim()));});});
test('public content contains neither grading answers nor learning explanations',async()=>{const source=await readFile(new URL('../questions.js',import.meta.url),'utf8');for(const word of ['correctIndex','correctOptionId','explanation','answerKey'])assert.equal(source.includes(`"${word}"`),false,word);});
test('malformed feedback is rejected rather than throwing',()=>{const s={attemptId:'test-attempt',assessmentVersion:'test',answers:Array(10).fill(0)};const result={ok:true,receipt:{attemptId:s.attemptId,assessmentVersion:s.assessmentVersion,receiptId:'test-receipt',submittedAt:'2026-10-05T12:00:00Z',maxScore:10,score:0,financeScore:0,legalScore:0},feedback:Array(10).fill(null)};assert.equal(validResult(result,s),false);});


test('every question advances the fixed event story with a concise stage and bridge',()=>{
  for (const q of assessment.questions) {
    assert.ok(q.stage?.trim(),q.id);
    assert.ok(q.transition?.trim(),q.id);
    assert.ok(q.transition.split(/\s+/).length <= 24,q.id);
  }
  assert.match(assessment.questions[0].stage,/Monday/);
  assert.match(assessment.questions[1].context,/choosing the report now/);
  assert.match(assessment.questions[5].stage,/Saturday/);
  assert.match(assessment.questions[6].stage,/Early entry/);
  assert.match(assessment.questions[7].transition,/Jordan/);
  assert.match(assessment.questions[8].transition,/Jordan/);
  assert.match(assessment.questions[9].transition,/Northside/);
});


test('Q10 uses the approved concrete remedy scenario and unchanged question',()=>{
  const q=assessment.questions[9];
  assert.equal(q.id,'q10');
  assert.equal(q.context,'One hour before tipoff, the league bars Northside from playing, saying its roster paperwork arrived late. Northside disputes that decision and asks a court to temporarily stop the league from enforcing the ban so the team can play tonight. It is not asking for money.');
  assert.equal(q.stem,'What type of remedy is Northside requesting?');
  assert.equal(q.points,1);
});
