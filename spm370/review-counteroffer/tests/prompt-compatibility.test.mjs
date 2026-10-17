import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CASE_VERSION, SCHEMA_VERSION, STORAGE_KEY, decisions, responseText} from '../core.mjs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const student=read('index.html'),instructor=read('instructor.html'),admin=read('instructor.js');
test('prompt update preserves existing storage, case, decisions, and response fields',()=>{
 assert.equal(CASE_VERSION,'decision-lab-3-v1');assert.equal(SCHEMA_VERSION,1);assert.equal(STORAGE_KEY,'spm370-review-counteroffer-v1');
 assert.deepEqual(Object.keys(decisions),['proceed','counter','decline']);
 for(const name of ['name','email','decision','recommendation','clause_number','clarification'])assert(student.includes(`name="${name}"`));
 for(const [value,label] of Object.entries(decisions)){assert(student.includes(`value="${value}"`));assert(student.includes(label));}
});
test('new task remains one issue, two short answers, six clauses, and 10 points',()=>{
 assert.equal((student.match(/class="clause" id=/g)||[]).length,6);
 for(const text of ['120–180 words total','About 12 minutes, including class discussion','one priority issue','one specific change within your authority','one useful question','not sent to Casey','If you recommend declining'])assert(student.includes(text),text);
 assert.equal((student.match(/<strong>4 points:<\/strong>/g)||[]).length,2);assert.equal((student.match(/<strong>2 points:<\/strong>/g)||[]).length,1);
});
test('original clause revisions retain explicit fair grading without a question',()=>{
 for(const text of ['same 4 points','do not need to rewrite it as a message or add a question','no question is required'])assert(student.includes(text),text);
 for(const text of ['Original-version fairness','Do not require a question or message format','do not infer the task version from submission time'])assert(instructor.includes(text),text);
});
test('new and original response text exports are neutral and preserve content',()=>{
 for(const text of ['Please limit extra support to one story. What day works for you?','Creator will provide one event-week story; no additional support is required.']){
  const p={case_version:CASE_VERSION,name:'Test Student',email:'test@example.invalid',decision:'counter',recommendation:'A clear scope makes planning possible.',clause_number:5,clarification:text};
  const before=JSON.stringify(p),out=responseText(p);
  assert(out.includes('REPLY TO CASEY OR ORIGINAL CLAUSE REVISION'));assert(out.includes(text));assert.equal(JSON.stringify(p),before);
 }
 assert(admin.includes('Reply to Casey or original clause revision'));assert(instructor.includes('Reply or original revision / 4'));
});
test('instructor rubric distinguishes proposal and question while retaining original scoring keys',()=>{
 assert(instructor.includes('proposal within authority (2)'));assert(instructor.includes('priority issue (2)'));
 for(const key of ['recommendation','concept','clarification'])assert(instructor.includes(`id="score-${key}"`));
 assert(admin.includes("['recommendation','concept','clarification']"));
});
