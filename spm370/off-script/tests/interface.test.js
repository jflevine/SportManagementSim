'use strict';
// Controller/render checks with an explicit small DOM/storage test double.
// This tests state and generated markup, NOT browser layout or native UI behavior.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const M=require('../experience.js');
const L=require('../lab.js');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const KEY='spm370.offscript.v1.student';
const choices=['event','boundary','original','collab','human','scoped'];
function fixture(extra={}){
  return {version:'1.1.0',names:['Test Student',''],phase:'ending',briefingVersion:'1.1.0',briefStep:0,resumePhase:'story',active:'main',primary:M.rebuild(choices),alternate:null,forkAt:null,selected:'',read:[],reflections:['An earlier choice changed the fallback.','I would specify the duration.'],completedAt:'',id:'local-test',...extra};
}
function boot(saved,{blocked=false,query='',clipboardFail=false}={}){
  const data=new Map(saved===undefined?[]:[[KEY,typeof saved==='string'?saved:JSON.stringify(saved)]]);
  const listeners={},elements=new Map();let html='',modal=false,focused='',confirmation=true,copied='';
  const element=(id='')=>({id,value:'',textContent:'',innerHTML:'',disabled:false,dataset:{},classList:{add(){},remove(){},toggle(){}},setCustomValidity(t){this.validation=t;},reportValidity(){},focus(){focused=id;},select(){this.selected=true;},showModal(){modal=true;},close(){modal=false;},addEventListener(){},getBoundingClientRect(){return {left:0,right:500,top:0,bottom:500};},closest(){return this.dataset.action?this:null;}});
  const root=element('app');
  Object.defineProperty(root,'innerHTML',{get:()=>html,set:value=>{
    html=value;elements.clear();elements.set('app',root);
    for(const m of html.matchAll(/<(\w+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
      const el=element(m[3]),attrs=m[2];el.disabled=/\sdisabled(?:\s|$)/.test(attrs);el.value=attrs.match(/\bvalue="([^"]*)"/)?.[1]||'';
      if(m[1]==='textarea')el.value=html.slice(m.index+m[0].length).split('</textarea>')[0];
      if(m[1]==='select'){const inner=html.slice(m.index+m[0].length).split('</select>')[0];el.value=inner.match(/<option value="([^"]*)" selected/)?.[1]||'';}
      elements.set(el.id,el);
    }
  }});
  elements.set('app',root);elements.set('toast',element('toast'));
  const document={getElementById:id=>{if(id==='toast'&&!elements.has(id))elements.set(id,element(id));return elements.get(id)||null;},body:{classList:{toggle(){}},append(){}},querySelectorAll:()=>[],addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn)};
  const localStorage={getItem:key=>{if(blocked)throw new DOMException('Blocked','SecurityError');return data.get(key)??null;},setItem:(key,value)=>{if(blocked)throw new DOMException('Blocked','SecurityError');data.set(key,value);}};
  const context={document,localStorage,location:{search:query},URLSearchParams,crypto:{randomUUID:()=> 'test-uuid'},DOMException,console,setTimeout:()=>0,clearTimeout(){},confirm:()=>confirmation,navigator:{clipboard:{writeText:async t=>{if(clipboardFail)throw Error('Clipboard denied');copied=t;}}}};
  context.window={OffScript:M,OffScriptLab:{...L,bind(){}},matchMedia:()=>({matches:false}),scrollTo(){},print(){}};
  vm.runInNewContext(source,context,{filename:'app.js'});
  const dispatch=async(type,target)=>{for(const fn of listeners[type]||[])await fn({target,preventDefault(){}});};
  return {html:()=>html,state:()=>JSON.parse(data.get(KEY)),el:id=>document.getElementById(id),modal:()=>modal,focused:()=>focused,copied:()=>copied,data,
    click:async(action)=>{const el=element();el.dataset.action=action;await dispatch('click',el);},
    input:async(id,value)=>{const el=document.getElementById(id);el.value=value;await dispatch('input',el);},
    choose:async value=>{const el=element();el.name='decision';el.value=value;await dispatch('change',el);},
    submit:async id=>dispatch('submit',document.getElementById(id)),
    confirm:value=>confirmation=value};
}

test('fresh players see both setup screens and the NIL definition before choosing',async()=>{
  const ui=boot();assert.match(ui.html(),/Read the story setup/);
  assert.doesNotMatch(ui.html(),/id="name1"/);await ui.submit('start-form');
  assert.equal(ui.state().phase,'briefing');assert.match(ui.html(),/NIL means name, image, and likeness/);
  await ui.click('brief-next');assert.match(ui.html(),/Meet the people behind the deal/);
  await ui.click('brief-back');assert.equal(ui.state().briefStep,0);
  await ui.click('brief-next');await ui.click('brief-start');
  assert.equal(ui.state().phase,'story');assert.equal(ui.state().briefingVersion,'1.1.0');
  assert.equal(ui.el('commit').disabled,true);
});

test('v1.1 saves migrate without another introduction or loss of names, selections and writing',async()=>{
  const s=fixture({phase:'story',primary:M.rebuild(['broad']),selected:'waiver'}),ui=boot(s);
  assert.match(ui.html(),/Can you deliver the broader chair deal/);
  assert.match(ui.html(),/id="choice-waiver" checked/);
  assert.doesNotMatch(ui.html(),/Story setup ·/);
  assert.equal(ui.state().names[0],s.names[0]);
  assert.deepEqual(ui.state().reflections,s.reflections);
  await ui.click('commit');assert.equal(ui.state().version,'1.2.0');assert.equal(ui.state().primary.step,2);
});

test('v1.0 saves receive orientation and return to the saved consequence',async()=>{
  const ui=boot(fixture({version:'1.0.0',briefingVersion:'',phase:'reaction',primary:M.rebuild(['event'])}));
  assert.match(ui.html(),/Story setup · 1 of 2/);
  await ui.click('brief-next');await ui.click('brief-start');
  assert.equal(ui.state().phase,'reaction');assert.equal(ui.state().primary.history[0].option,'event');
});

test('all six decisions can be rewound, including only the final agreement',async()=>{
  const ui=boot(fixture());assert.match(ui.html(),/<option value="5"/);
  ui.el('fork-at').value='5';await ui.click('fork');
  assert.equal(ui.state().alternate.step,5);assert.equal(ui.state().primary.step,6);
  await ui.choose('extend');await ui.click('commit');
  assert.equal(ui.state().alternate.step,6);assert.equal(ui.state().phase,'reaction');
  await ui.click('return-main');await ui.click('resume-alt');
  assert.equal(ui.state().phase,'reaction');assert.match(ui.html(),/The deal changes before the use changes/);
  assert.deepEqual(ui.state().primary.history.map(h=>h.option),choices);
});

test('leaving and restoring an alternate retains its consequence and next uncommitted selection',async()=>{
  let ui=boot(fixture());ui.el('fork-at').value='4';await ui.click('fork');
  await ui.choose('specific');await ui.click('commit');await ui.click('return-main');
  ui=boot(ui.state());await ui.click('resume-alt');
  assert.equal(ui.state().phase,'reaction');assert.match(ui.html(),/Nova says yes to something specific/);
  await ui.click('continue');await ui.choose('extend');await ui.click('return-main');
  ui=boot(ui.state());await ui.click('resume-alt');
  assert.equal(ui.state().phase,'story');assert.equal(ui.state().selected,'extend');assert.equal(ui.el('commit').disabled,false);
  assert.match(ui.html(),/id="choice-extend" checked/);
});

test('repeat commits do not advance twice; help does not change selection',async()=>{
  const ui=boot(fixture({phase:'story',primary:M.initial()}));
  await ui.choose('broad');await ui.click('story-help');
  assert.equal(ui.modal(),true);assert.match(ui.html(),/aria-label="Close reference"/);
  await ui.click('close-file');assert.equal(ui.modal(),false);assert.equal(ui.state().selected,'broad');
  await ui.click('commit');await ui.click('commit');assert.equal(ui.state().primary.step,1);
});

test('completed summary includes both timelines and clipboard denial offers selected text',async()=>{
  const alternate=M.rebuild([...choices.slice(0,5),'extend']);
  const ui=boot(fixture({alternate,forkAt:5}),{clipboardFail:true});
  await ui.submit('brief-form');assert.equal(ui.state().phase,'report');
  assert.match(ui.el('receipt').value,/OPTIONAL ALTERNATE TIMELINE/);assert.match(ui.el('receipt').value,/Nothing is sent to Canvas automatically/);
  await ui.click('copy');assert.equal(ui.el('receipt').selected,true);
});

test('blocked/corrupt storage and canceled reset do not trap the activity',async()=>{
  let ui=boot(undefined,{blocked:true});assert.match(ui.html(),/Browser storage is blocked/);
  await ui.submit('start-form');assert.match(ui.html(),/Story setup ·/);
  ui=boot('{broken');assert.match(ui.html(),/previous save could not be restored/);
  ui=boot(fixture());ui.confirm(false);await ui.click('new');assert.equal(ui.state().primary.step,6);
});

test('instructor demo and guide do not overwrite the student save',()=>{
  const saved=fixture();const demo=boot(saved,{query:'?demo=1'});
  assert.match(demo.html(),/INSTRUCTOR DEMO/);assert.deepEqual(demo.state(),saved);
  const guide=boot(saved,{query:'?guide=1'});assert.match(guide.html(),/Instructor guide/);assert.deepEqual(guide.state(),saved);
});


test('all 14 scene variants render their required facts and three actions',()=>{
  const variants=new Map();
  function visit(s){if(s.step===6)return;const v=M.scene(s);if(!variants.has(v.id))variants.set(v.id,s);for(const o of v.options)visit(M.choose(s,o.id));}
  visit(M.initial());assert.equal(variants.size,14);
  for(const state of variants.values()){
    const ui=boot(fixture({phase:'story',primary:state}));
    assert.match(ui.html(),/Facts for this decision/);
    assert.equal((ui.html().match(/name="decision"/g)||[]).length,3);
    assert.doesNotMatch(ui.html(),/undefined|null/);
  }
});

test('portraits remain paired with visible character names and role labels',async()=>{
  const ui=boot(fixture({phase:'story',primary:M.initial()}));
  assert.match(ui.html(),/#crossplay-campaign/);assert.match(ui.html(),/Sponsor offer/);
  for(const [who] of M.scene(M.initial()).messages){
    const c=M.cast[who];assert.ok(ui.html().includes(`src="${c.avatar}" alt=""`));
    assert.ok(ui.html().includes(`<strong>${c.name}</strong><span class="role">${c.role}</span>`));
  }
  await ui.click('story-help');
  for(const who of ['blaze','nova','dev','mara']){
    const c=M.cast[who],markup=ui.el('file-content').innerHTML;
    assert.ok(markup.includes(`src="${c.avatar}" alt=""`));assert.ok(markup.includes(c.name));assert.ok(markup.includes(c.role));
  }
});


test('anonymous progress and previous completed v1.1.1 saves remain accessible',async()=>{
  let ui=boot(fixture({version:'1.1.1',names:['',''],phase:'story',primary:M.rebuild(['event'])}));
  assert.match(ui.html(),/Can a personal stream/);assert.doesNotMatch(ui.html(),/id="start-form"/);
  ui=boot(fixture({version:'1.1.1',phase:'report'}));assert.match(ui.html(),/A quick learning check/);assert.match(ui.html(),/id="lab-first"/);
});

test('pending submissions block story reset and reflection edits',async()=>{
  const l=L.fresh();l.attemptId='a';l.pending={attemptId:'a'};
  const ui=boot(fixture({phase:'report',lab:l}));ui.confirm(true);await ui.click('new');assert.equal(ui.state().primary.step,6);assert.ok(ui.state().lab.pending);
  await ui.click('edit');assert.match(ui.html(),/Retry the same submission/);
});

test('confirmed submissions export their frozen reflection snapshot',async()=>{
  const l=L.fresh();l.attemptId='test-attempt';l.firstName='Test';l.lastName='Student';l.email='test@example.com';l.checks=['permissions','new-agreement'];
  l.receipt={receipt:'receipt-test',score:10,maxScore:10,submittedAt:'2026-10-01T19:00:00Z'};
  l.submitted={attemptId:l.attemptId,firstName:'Test',lastName:'Student',email:l.email,choices,checks:l.checks,reflections:['Frozen first reflection about permissions.','Frozen second reflection about stakeholder consent.'],completedAt:'2026-10-01T19:00:00Z'};
  const ui=boot(fixture({phase:'report',lab:l}));
  assert.match(ui.el('receipt').value,/Frozen first reflection/);assert.doesNotMatch(ui.el('receipt').value,/An earlier choice changed the fallback/);
  await ui.click('edit');assert.match(ui.html(),/id="reflection1" maxlength="1000" readonly/);
});
