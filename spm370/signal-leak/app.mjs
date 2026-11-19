import cf from './casefile.mjs';
import { formatClock } from './engine/kernel.mjs';
import { openPractice, storageWarning, readDraft, writeDraft, clearTab, hasEarlierRun, moveEarlierRun } from './practice.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const values = form => Object.fromEntries(new FormData(form));
const buttonList = (items,key) => items.map(item => `<button type="button" data-${key}="${escape(item.id)}">${escape(item.label || item.title)}</button>`).join('');
const sim = await openPractice();
let busy = false;

function field(f, value='') {
  if (f.type === 'select') {
    const options = f.options.map(([v,label]) => `<option value="${escape(v)}" ${v===value?'selected':''}>${escape(label)}</option>`);
    return `<label>${escape(f.label)}<select name="${f.id}">${options.join('')}</select></label>`;
  }
  return `<label>${escape(f.label)}<textarea name="${f.id}" maxlength="${f.max || 1800}" required>${escape(value)}</textarea></label>`;
}

function reportEntry(e) {
  const when = formatClock(cf,e.t);
  if (e.type==='doc.opened') return {when,who:'Record consulted',body:cf.documents[e.doc]?.title || e.doc};
  if (e.type==='actor.message') return {when,who:cf.actors[e.from].name,body:e.text};
  if (e.type==='student.message') return {when,who:'Director to '+cf.actors[e.to].name,body:e.text};
  if (e.type==='note') return {when,who:'Incident log',body:e.text};
  if (e.type!=='student.act') return null;
  const act = cf.acts[e.act];
  const body = act.fields.map(f => {
    const v = e.params[f.id] || '';
    const label = f.options?.find(([key])=>key===v)?.[1] || v;
    return f.label+' — '+label;
  }).join('\n');
  return {when,who:'Director · '+act.label,body};
}

function renderMessages(v) {
  const entries = v.events.map(e=>({e,line:reportEntry(e)})).filter(x=>x.line && x.e.type!=='doc.opened' && x.e.type!=='note');
  const milestone = v.events.filter(e=>e.type==='fact.learned' && e.who==='you' && ['visitor','repost'].includes(e.fact)).at(-1);
  const lastInput = entries.filter(x=>x.e.type.startsWith('student.')).at(-1);
  // Keep the current dispatch and most recent exchange in sight on small screens.
  const groups = {feed:[],past:[]};
  for (const {e,line} of entries) {
    const current = e.seq >= (lastInput?.e.seq ?? 0) || (milestone && e.requestId===milestone.requestId);
    groups[current?'feed':'past'].push(`<article class="update ${e.type.startsWith('student.')?'you':''}"><p class="meta">${escape(line.when)} · ${escape(line.who)}</p><p>${escape(line.body)}</p></article>`);
  }
  for (const [key,list] of Object.entries(groups)) $(key).innerHTML=list.join('');
  $('history').hidden=!groups.past.length;
}

function actionForm(id,params={}) {
  const a=cf.acts[id], form=$('actionForm');
  if (!a) { form.hidden=true; delete form.dataset.act;return; }
  form.dataset.act=id;
  form.innerHTML=`<h3>${escape(a.label)}</h3><p>${escape(a.blurb)}</p>${a.fields.map(f=>field(f,params[f.id])).join('')}<button>Record action</button> <button type="button" id="cancelAction" class="secondary">Cancel</button>`;
  form.hidden=false;
  $('cancelAction').onclick=()=>{actionForm(null);persistDraft();$('actions').querySelector('[data-act="'+id+'"]')?.focus();};
}

function persistDraft() {
  if (!sim.view || sim.view.submitted) return;
  writeDraft({memo:values($('memoForm')),question:values($('messageForm')),action:$('actionForm').hidden?null:{id:$('actionForm').dataset.act,params:values($('actionForm'))}});
  $('storageStatus').textContent=storageWarning();
}

function render(restore=false) {
  const v=sim.view;
  $('start').hidden=!!v;
  $('desk').hidden=!v;
  $('legacy').hidden=!!v || !hasEarlierRun();
  $('storageStatus').textContent=storageWarning();
  if (!v) return;
  const done=!!v.submitted, ended=!!v.ended;
  const updates=v.events.filter(e=>e.type==='fact.learned' && e.who==='you' && ['repost','visitor'].includes(e.fact));
  const last=updates.find(e=>e.fact==='visitor');
  const actions=v.events.filter(e=>e.type==='student.act');
  const reviewed=last && actions.some(e=>e.act==='decision' && e.seq>last.seq);
  $('clock').textContent=formatClock(cf,v.t);
  $('stage').textContent=done?'SHIFT HANDOFF SAVED':last?'FINAL UPDATE · NEXT SHIFT':updates.length?'UPDATE 1 OF 2':'OPENING REPORT';
  $('cue').textContent=done?'Your shift is complete. Open the downloaded report before you leave.':last?'Read the safety update. Set the next match decision, then write your handoff.':actions.length?'Read the reply. Give another instruction or advance to the next report.':'What needs an instruction first? Choose a response and explain why it comes first.';
  $('advance').hidden=done || ended || !v.nextEventAt;
  $('advance').disabled=busy || !actions.length;
  renderMessages(v);
  $('docs').innerHTML=buttonList(v.documents,'doc');
  $('actions').innerHTML=done||ended?'':buttonList(v.acts,'act');
  $('ask').hidden=done||ended;
  $('handoff').hidden=done;
  $('receipt').hidden=!done;
  $('handoffLink').href=done?'#receipt':'#handoff';
  $('handoffLink').textContent=done?'Save report':'Write handoff';
  if (done) {
    actionForm(null);
    $('receiptText').textContent='Your report is ready in this tab. Download the text file and open it to check your words and the timeline. Nothing has been sent to your instructor.';
    $('outcome').innerHTML=v.debrief.people.map(p=>`<h3>${escape(p.who)} · ${escape(p.headline)}</h3><p>${escape(p.detail)}</p>`).join('')+`<p>${escape(v.debrief.aftermath.join(' '))}</p>`;
    return;
  }
  if (restore || !$('memoForm').children.length) {
    const draft=readDraft();
    $('people').innerHTML=v.people.map(p=>`<option value="${p.id}">${escape(p.name)} · ${escape(p.role)}</option>`).join('');
    $('memoForm').innerHTML=cf.memoFields.map(f=>field(f,draft.memo?.[f.id])).join('')+'<button>Finalize handoff</button>';
    if (draft.question?.to) $('people').value=draft.question.to;
    $('messageForm').elements.message.value=draft.question?.message || '';
    $('ask').open=!!draft.question?.message;
    if (draft.action && !ended) actionForm(draft.action.id,draft.action.params);
  }
  const ready=last && (reviewed || ended);
  $('memoForm').querySelector('button').disabled=!ready;
  $('gate').textContent=ready?'All reports are in. Check each paragraph before finalizing.':last?'To finish, record a match decision after the final update.':'You can draft now. Read both updates and record your match decision before finalizing.';
}

async function perform(fn, nextFocus, restore=false) {
  if (busy) return;
  busy=true;
  $('notice').textContent='';
  let success=false;
  try { await fn();success=true; }
  catch (e) { $('notice').textContent=e.message || 'The action could not be saved. Your writing is still here.'; }
  finally {busy=false;}
  render(restore && success);
  $(success?nextFocus:'notice')?.focus();
}

$('startForm').onsubmit=e=>{
  e.preventDefault();
  perform(()=>sim.start({team:values(e.target).alias,classCode:'SIGNAL-QA',mode:'test'}),'clock',true);
};
$('recover').onclick=()=>perform(async()=>{ moveEarlierRun();if (!await sim.resume()) throw Error('Earlier run could not be opened.'); },'clock',true);
$('advance').onclick=()=>perform(()=>sim.send({type:'wait'}),'incoming');
$('docs').onclick=e=>{
  const id=e.target.closest('button')?.dataset.doc;
  if (!id) return;
  perform(async()=>{
    let d=sim.view.documents.find(x=>x.id===id);
    if (!sim.view.ended && !sim.view.submitted && !d.opened) {await sim.send({type:'open',doc:id});d=sim.view.documents.find(x=>x.id===id);}
    $('document').innerHTML=`<h3>${escape(d.title)}</h3>${(d.body||cf.documents[id].body).map(p=>'<p>'+escape(p)+'</p>').join('')}`;
  },'document');
};
$('actions').onclick=e=>{
  const id=e.target.closest('button')?.dataset.act;
  if (busy || !id) return;
  if (!$('actionForm').hidden && $('actionForm').dataset.act===id) { $('actionForm').querySelector('select,textarea').focus();return; }
  if (!$('actionForm').hidden && [...$('actionForm').querySelectorAll('textarea')].some(el=>el.value.trim()) && !confirm('Discard this unrecorded instruction and open another?')) return;
  actionForm(id);persistDraft();$('actionForm').querySelector('select,textarea').focus();
};
$('messageForm').onsubmit=e=>{
  e.preventDefault();const {to,message}=values(e.target);
  perform(async()=>{await sim.send({type:'message',to,text:message});$('messageForm').elements.message.value='';persistDraft();},'incoming');
};
$('actionForm').onsubmit=e=>{
  e.preventDefault();const {act}=e.target.dataset, params=values(e.target);
  if (Object.values(params).some(v=>!v.trim())) { $('notice').textContent='Add a reason before recording this instruction.';$('notice').focus();return; }
  perform(async()=>{await sim.send({type:'act',act,params});actionForm(null);persistDraft();},'incoming');
};
for (const id of ['actionForm','memoForm','messageForm']) $(id).addEventListener('input',persistDraft);
$('memoForm').onsubmit=e=>{
  e.preventDefault();persistDraft();
  perform(()=>sim.send({type:'submit',memo:values(e.target)}),'receipt');
};

function download(asJSON) {
  const v=sim.view;
  const report={title:cf.title,version:v.version,practiceOnly:true,alias:sim.run.team,runId:sim.run.runId,handoff:v.submitted.memo,decisionLog:v.events.map(reportEntry).filter(Boolean)};
  const lines=['SIGNAL LEAK — INCIDENT HANDOFF AND DECISION LOG','Local copy · Nothing sent to the instructor','Fictional alias: '+report.alias,'',...cf.memoFields.flatMap(f=>[f.label,report.handoff[f.id],'']),'CHRONOLOGICAL DECISION LOG','',...report.decisionLog.map(e=>e.when+' | '+e.who+'\n'+e.body+'\n')];
  const url=URL.createObjectURL(new Blob([asJSON?JSON.stringify(report,null,2):lines.join('\n')],{type:asJSON?'application/json':'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Signal-Leak-'+sim.run.runId.slice(0,8)+(asJSON?'.json':'.txt');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('downloadText').onclick=()=>download(false);
$('download').onclick=()=>download(true);
$('erase').onclick=()=>{
  if (busy || !confirm('Erase this run, its drafts and its decision log from this tab? Keep your downloaded copy first. Downloads are separate.')) return;
  sim.leave();clearTab();location.reload();
};
try { await sim.resume();render(true); }
catch { $('notice').textContent='Saved progress could not be opened. Keep any downloaded copy. You may start a new incident.';render(); }
