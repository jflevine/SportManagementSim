import test from 'node:test';
import assert from 'node:assert/strict';
const handlers={}, nodes={};
const node=id=>nodes[id]??=( {innerHTML:'',textContent:'',focus(){},scrollIntoView(){},addEventListener(type,fn){handlers[type]=fn;}} );
let saved=null,downloads=0;
globalThis.document={querySelector:node,createElement:()=>({click(){downloads++;}})};
globalThis.location={search:''};
globalThis.window={scrollTo(){},print(){}};
globalThis.localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value;}};
function click(action){handlers.click({target:{closest:()=>({dataset:{action}})}});}
function input(name,value){handlers.input({target:{name,value}});}
function change(name,value){handlers.change({target:{name,value,closest:()=>({offsetTop:0})}});}
test('complete all decision paths, validation, save/resume, safe summary and export',async()=>{
 await import('./app.mjs?flow');
 assert.match(node('#main').innerHTML,/The Conference Invitation/);
 click('consult');assert.match(node('#error').textContent,/Choose a recommendation/);
 for(const decision of ['accept','decline','negotiate']){
  if(saved)click('restart');
  change('initial',decision);input('priority','athletes');input('reason','Compare opportunity with required courses');click('consult');
  assert.equal(JSON.parse(saved).step,1);
  click('decide');assert.match(node('#error').textContent,/three briefings/);
  for(const [id,val] of [['finance','net'],['academic','audit'],['operations','shared']])change('answer-'+id,val);
  click('decide');assert.equal(JSON.parse(saved).step,2);
  change('final',decision);input('rationale','<img src=x onerror=alert(1)> financial and academic tradeoffs');input('condition','Verify entry obligations');input('owner','Business office with athletics');input('measure','Missed required classes');
  click('finish');assert.equal(JSON.parse(saved).step,3);
  assert.ok(node('#main').innerHTML.includes('&lt;img'));assert.ok(!node('#main').innerHTML.includes('<img src=x'));
  click('download');
  await import('./app.mjs?resume-'+decision);assert.match(node('#main').innerHTML,/Your recommendation is ready/);
  click('revise');assert.equal(JSON.parse(saved).step,2);
 }
 assert.equal(downloads,3);
});
