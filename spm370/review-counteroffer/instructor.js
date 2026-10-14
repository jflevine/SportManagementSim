import {decisions,clauseTitles,toCSV,download,responseText,request} from './core.mjs';
const $=id=>document.getElementById(id);let key='',submissions=[],selected=null,settings={accepts_submissions:true},dirty=false;
function status(text,kind=''){$('admin-status').textContent=text;$('admin-status').className='status '+kind;}
function gradeOf(row){return row.grade||null;}
function pointsOf(row){const g=gradeOf(row);return g?.points||{};}
function total(points){return ['recommendation','concept','clarification'].reduce((s,k)=>s+Number(points[k]||0),0);}
function controls(){const open=settings.accepts_submissions===true;$('toggle-open').textContent=open?'Close submissions':'Open submissions';$('access-status').textContent=open?'Submissions are open. Existing submissions remain available after you close access.':'Submissions are closed. Existing records and instructor grading remain available.';}
function renderList(){
 const filter=$('filter').value.trim().toLowerCase();const root=$('submission-list');root.replaceChildren();
 const rows=submissions.filter(x=>(x.name+' '+x.email).toLowerCase().includes(filter));
 for(const row of rows){const b=document.createElement('button');b.type='button';b.className='submission-button';b.setAttribute('aria-pressed',String(selected?.submission_id===row.submission_id));
  const n=document.createElement('strong');n.textContent=row.name;const e=document.createElement('span');e.className='small';e.textContent=row.email;const g=document.createElement('span');g.className='small';g.textContent=row.grade?`${total(pointsOf(row))}/10 · Assessed`:'Awaiting review';b.append(n,e,g);b.addEventListener('click',()=>choose(row));root.append(b);
 }if(!rows.length){const p=document.createElement('p');p.className='empty';p.textContent=submissions.length?'No matching students.':'No submissions yet.';root.append(p);}
 $('submission-count').textContent=`${submissions.length} submission${submissions.length===1?'':'s'} · ${submissions.filter(x=>x.grade).length} assessed`;
}
function choose(row,force=false){
 if(dirty&&!force&&!confirm('Leave this unsaved assessment?'))return;
 selected=row;dirty=false;$('review-panel').hidden=false;$('no-selection').hidden=true;$('review-name').textContent=row.name;
 $('review-meta').textContent=`${row.email} · ${new Date(row.submitted_at).toLocaleString()} · Receipt ${row.receipt}`;
 $('review-decision').textContent=decisions[row.decision]||row.decision;$('review-recommendation').textContent=row.recommendation;
 $('review-clause').textContent=`Proposed replacement · Clause ${row.clause_number}: ${clauseTitles[row.clause_number-1]||''}`;$('review-clarification').textContent=row.clarification;
 const p=pointsOf(row);for(const k of ['recommendation','concept','clarification'])$('score-'+k).value=p[k]??'';
 $('feedback').value=gradeOf(row)?.feedback||'';$('grade-status').textContent=row.grade?'Saved assessment loaded.':'This response has not been assessed.';updateTotal();renderList();
}
function updateTotal(){const vals=['recommendation','concept','clarification'].map(k=>$('score-'+k).value);$('grade-total').textContent=vals.every(x=>x!=='')?`Total: ${vals.reduce((s,x)=>s+Number(x),0)} / 10`:'Enter all three rubric scores.';}
function setSaving(busy){for(const el of $('dashboard').querySelectorAll('button,input,textarea,select'))el.disabled=busy;}
async function load(){
 const r=await request('/instructor',{headers:{'X-Instructor-Key':key}});submissions=(r.submissions||[]).sort((a,b)=>{const last=s=>s.trim().split(/\s+/).pop();return last(a.name).localeCompare(last(b.name))||a.name.localeCompare(b.name);});settings=r.settings||{accepts_submissions:r.accepts_submissions};
 $('dashboard').hidden=false;$('login-section').hidden=true;controls();renderList();
 if(selected){const row=submissions.find(x=>x.submission_id===selected.submission_id);if(row)choose(row,true);else{$('review-panel').hidden=true;selected=null;}}
 return r;
}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();key=$('instructor-key').value.trim();status('Opening submissions…');try{await load();$('instructor-key').value='';status('Submissions loaded.','success');}catch(err){key='';status(err.message,'error');}});
$('filter').addEventListener('input',renderList);
$('refresh').addEventListener('click',async()=>{if(dirty&&!confirm('Refresh and discard your unsaved assessment?'))return;setSaving(true);try{await load();status('Refreshed.','success');}catch(err){status(err.message,'error');}finally{setSaving(false);}});
$('logout').addEventListener('click',()=>{if(dirty&&!confirm('Sign out without saving this assessment?'))return;key='';submissions=[];selected=null;dirty=false;location.reload();});
$('toggle-open').addEventListener('click',async()=>{const open=!settings.accepts_submissions;if(!confirm(open?'Open student submissions?':'Close new submissions? Saved records will remain available.'))return;try{await request('/settings',{method:'PUT',headers:{'X-Instructor-Key':key},body:{accepts_submissions:open}});settings.accepts_submissions=open;controls();status(open?'Submissions opened.':'Submissions closed.','success');}catch(err){status(err.message,'error');}});
$('grade-form').addEventListener('input',()=>{dirty=true;updateTotal();$('grade-status').textContent='Assessment has unsaved changes.';});
$('grade-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!selected||!$('grade-form').reportValidity())return;
 const id=selected.submission_id,points=Object.fromEntries(['recommendation','concept','clarification'].map(k=>[k,Number($('score-'+k).value)]));
 setSaving(true);$('grade-status').textContent='Saving…';
 try{const r=await request('/grade',{method:'POST',headers:{'X-Instructor-Key':key},body:{submission_id:id,expected_grade_revision:gradeOf(selected)?.revision||0,points,feedback:$('feedback').value.trim()}});
  // Reload the authoritative saved record; never mark an unconfirmed local score as saved.
  dirty=false;await load();$('grade-status').textContent='Assessment saved.';status('Assessment saved successfully.','success');
 }catch(err){$('grade-status').textContent=err.status===409?'Another assessment revision was saved. Copy your feedback, refresh, and review the current scores before trying again.':'Save was not confirmed. '+err.message;}finally{setSaving(false);}
});
$('export').addEventListener('click',()=>{if(dirty&&!confirm('Export only saved assessments? Unsaved changes will not be included.'))return;const rows=[['Name','Email','Decision','Recommendation','Priority clause','Proposed replacement','Recommendation /4','Course concept /2','Clarification /4','Total /10','Feedback','Grade revision','Submitted at','Receipt','Case version']];for(const r of submissions){const p=pointsOf(r);rows.push([r.name,r.email,decisions[r.decision]||r.decision,r.recommendation,r.clause_number,r.clarification,p.recommendation??'',p.concept??'',p.clarification??'',r.grade?total(p):'',r.grade?.feedback||'',r.grade?.revision||'',r.submitted_at,r.receipt,r.case_version]);}download('SPM370_Decision_Lab_3_Responses.csv',toCSV(rows),'text/csv;charset=utf-8');});
$('download-response').addEventListener('click',()=>{if(selected)download('SPM370_Decision_Lab_3_Response.txt',responseText(selected,selected));});
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
