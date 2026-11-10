'use strict';
(()=>{
 const API='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-governance';
 const $=id=>document.getElementById(id);
 let instructorKey='',content=null,data=null,selectedId=null,busy=false;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const status=(message,error=false)=>{$('admin-status').textContent=message;$('admin-status').className='admin-status '+(error?'error':'success');};
 const formatDate=value=>value?new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/New_York'}).format(new Date(value))+' ET':'—';
 const state=r=>!r.submitted_at?'draft':r.graded_at?'graded':'pending';
 const stateLabel=r=>({draft:'Draft',pending:'Needs written review',graded:'Graded'})[state(r)];
 const writtenScore=r=>r.graded_at?Object.values(r.rubric||{}).reduce((a,b)=>a+Number(b),0):null;
 const total=r=>r.graded_at?Number(r.mc_score)+writtenScore(r):null;
 async function api(body){const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-instructor-key':instructorKey},body:JSON.stringify(body),cache:'no-store'});let result;try{result=await response.json();}catch{throw Error('The service returned an unreadable response. Please retry.');}if(!response.ok)throw Error(result.error||'The request could not be completed.');return result;}
 async function refresh(){data=await api({action:'admin_list'});render();}
 function render(){
  $('login').hidden=true;$('dashboard').hidden=false;
  $('deadline-label').textContent='Deadline: '+formatDate(data.deadline)+' · '+(data.isOpen?'Open':'Closed')+' · Debrief '+(data.debriefAvailable?'released':'locked');
  const stats=$('stats');stats.replaceChildren();const rows=data.rows;
  [['Started',rows.length],['Submitted',rows.filter(r=>r.submitted_at).length],['Needs review',rows.filter(r=>state(r)==='pending').length]].forEach(([label,n])=>{const c=el('div',undefined,'card stat');c.append(el('strong',String(n)),el('span',label));stats.append(c);});
  const local=new Date(data.deadline);const pad=n=>String(n).padStart(2,'0');$('deadline').value=`${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
  $('local-zone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
  $('is-open').checked=data.acceptingAttempts??data.isOpen;
  renderList();if(selectedId)renderDetail(selectedId);
 }
 function renderList(){
  const query=$('search').value.trim().toLowerCase(),filter=$('filter').value;
  const rows=data.rows.filter(r=>(filter==='all'||state(r)===filter)&&(!query||(r.name+' '+r.email).toLowerCase().includes(query)));
  const host=$('attempt-list');host.replaceChildren();if(!rows.length){host.append(el('p','No matching attempts.'));return;}
  const table=el('table',undefined,'admin-table');const head=el('thead'),hr=el('tr');['Student','Status','Selected response','Total','Submitted (ET)',''].forEach(t=>hr.append(el('th',t)));head.append(hr);table.append(head);
  const body=el('tbody');for(const r of rows){const tr=el('tr'),student=el('td');student.append(el('strong',r.name),el('br'),el('span',r.email,'muted'));tr.append(student,el('td',stateLabel(r)),el('td',r.submitted_at?`${r.mc_score}/7`:'—'),el('td',total(r)===null?'Pending':`${total(r)}/10`),el('td',formatDate(r.submitted_at)));const action=el('td'),button=el('button',r.submitted_at?'Review':'View draft','button secondary');button.addEventListener('click',()=>{selectedId=r.id;renderDetail(r.id);$('detail').focus();$('detail').scrollIntoView({behavior:'smooth',block:'start'});});action.append(button);tr.append(action);body.append(tr);}table.append(body);host.append(table);
 }
 function renderDetail(id){
  const r=data.rows.find(r=>r.id===id),host=$('detail');host.replaceChildren();if(!r)return;
  host.append(el('p',stateLabel(r),'eyebrow'),el('h2',r.name),el('p',r.email+' · Last saved '+formatDate(r.updated_at),'muted'));
  const columns=el('div',undefined,'admin-columns'),left=el('div'),right=el('div');
  left.append(el('h3','Selected responses'));
  for(const c of content.cases)for(const q of c.questions){const section=el('div',undefined,'admin-question');section.append(el('strong',q.id.toUpperCase()+' · '+q.prompt));const chosen=q.options.find(o=>o.id===r.answers?.[q.id]),correct=q.options.find(o=>o.id===data.key.questions[q.id].correctOptionId);section.append(el('p','Student: '+(chosen?chosen.text:'No answer')));section.append(el('p','Correct: '+correct.text,'muted'));section.append(el('p',data.key.questions[q.id].explanation,'admin-note'));left.append(section);}
  right.append(el('h3','Written recommendation'),el('p',r.written||'No recommendation saved.','admin-response'));
  if(r.submitted_at){
   const form=el('form');form.append(el('p',data.key.writing.grading,'admin-note'));
   for(const criterion of data.key.writing.criteria){const field=el('fieldset',undefined,'admin-rubric');field.append(el('legend',criterion.label+' · 1 point'),el('p',criterion.awardWhen,'admin-note'));for(const n of [0,1]){const label=el('label'),input=el('input');input.type='radio';input.name=criterion.id;input.value=String(n);input.required=true;input.checked=r.rubric?.[criterion.id]===n;label.append(input,document.createTextNode(n===1?'1 · Earned':'0 · Not yet demonstrated'));field.append(label);}form.append(field);}
   const feedbackLabel=el('label','Feedback (optional)'),feedback=el('textarea',undefined,'admin-feedback');feedback.id='review-feedback';feedbackLabel.htmlFor=feedback.id;feedback.maxLength=3000;feedback.value=r.feedback||'';const button=el('button',r.graded_at?'Update grade':'Save grade','button');button.type='submit';form.append(feedbackLabel,feedback,button);
   form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;try{const values=new FormData(form),rubric=Object.fromEntries(data.key.writing.criteria.map(c=>[c.id,Number(values.get(c.id))]));const result=await api({action:'admin_grade',id:r.id,gradeRevision:r.grade_revision,rubric,feedback:feedback.value});data.rows=data.rows.map(old=>old.id===r.id?result.row:old);render();status('Grade saved for '+r.name+'.');}catch(error){status(error.message,true);button.disabled=false;}});
   right.append(form);
   if(r.graded_at)right.append(el('p',`Total: ${total(r)}/10 · Last graded ${formatDate(r.graded_at)}`,'success'));
   const example=el('details');example.append(el('summary','Rubric example'),el('p',data.key.writing.exampleResponse),el('p',data.key.writing.exampleCaution,'muted admin-note'));right.append(example);
  }else right.append(el('p','This is a draft. Grading opens after the student submits.','muted'));
  columns.append(left,right);host.append(columns);
  const recover=el('details');recover.append(el('summary','Help this student resume'),el('p','Generate a replacement private resume key only after confirming the student’s identity. The old key will stop working. This does not reopen a final submission.','admin-note'));
  const recoverButton=el('button','Generate replacement resume key','button secondary'),recovery=el('div');recoverButton.addEventListener('click',async()=>{if(!window.confirm('Replace the private resume key for '+r.name+'? Their old key will stop working.'))return;recoverButton.disabled=true;try{const result=await api({action:'admin_recover',id:r.id});recovery.replaceChildren();const label=el('label','Replacement key — share privately with this student'),input=el('input',undefined,'admin-key-output');input.readOnly=true;input.value=result.resumeKey;input.id='replacement-key';label.htmlFor=input.id;const copy=el('button','Copy key','button secondary');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.resumeKey);status('Replacement key copied. Share it privately with the student.');}catch{input.focus();input.select();status('Select and copy the replacement key.');}});recovery.append(label,input,copy);status('Replacement resume key created.');}catch(error){status(error.message,true);recoverButton.disabled=false;}});recover.append(recoverButton,recovery);host.append(recover);
 }
 function csvValue(value){let s=String(value??'');if(/^[\s]*[=+@\-]/u.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
 function exportCSV(){if(!data)return;const headers=['Name','Email','Status','Started (UTC)','Submitted (UTC)','MC score /7','Written score /3','Total /10','Gap /1','Safeguard /1','Responsibility /1','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Written recommendation','Feedback','Attempt ID'];const rows=data.rows.map(r=>[r.name,r.email,stateLabel(r),r.created_at,r.submitted_at,r.submitted_at?r.mc_score:'',writtenScore(r),total(r),r.graded_at?r.rubric?.gap:'',r.graded_at?r.rubric?.safeguard:'',r.graded_at?r.rubric?.responsibility:'',...Array.from({length:7},(_,i)=>{const q=content.cases.flatMap(c=>c.questions).find(q=>q.id==='q'+(i+1));return q.options.find(o=>o.id===r.answers?.[q.id])?.text||'';}),r.written,r.feedback,r.id]);const blob=new Blob(['\ufeff'+[headers,...rows].map(row=>row.map(csvValue).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='SPM370_Governance_Grades_'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('CSV downloaded. Pending written scores and totals are blank.');}
 $('login-form').addEventListener('submit',async event=>{event.preventDefault();if(busy)return;busy=true;const button=event.currentTarget.querySelector('button');button.disabled=true;instructorKey=$('admin-key').value;try{if(!content){const response=await fetch('content.json');if(!response.ok)throw Error('Unable to load assessment content.');content=await response.json();}await refresh();$('admin-key').value='';status('Instructor view loaded.');}catch(error){instructorKey='';status(error.message,true);}finally{busy=false;button.disabled=false;}});
 $('refresh').addEventListener('click',async()=>{try{await refresh();status('Records refreshed.');}catch(error){status(error.message,true);}});
 $('logout').addEventListener('click',()=>{instructorKey='';data=null;selectedId=null;$('dashboard').hidden=true;$('login').hidden=false;$('stats').replaceChildren();$('attempt-list').replaceChildren();$('detail').replaceChildren();status('Signed out.');$('admin-key').focus();});
 $('search').addEventListener('input',renderList);$('filter').addEventListener('change',renderList);$('export').addEventListener('click',exportCSV);
 $('settings-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;try{await api({action:'admin_settings',deadline:new Date($('deadline').value).toISOString(),isOpen:$('is-open').checked});await refresh();status('Availability updated.');}catch(error){status(error.message,true);}finally{button.disabled=false;}});
})();
