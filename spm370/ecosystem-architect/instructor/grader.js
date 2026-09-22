(()=>{"use strict";

const ENDPOINT="https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-ldl1-instructor";
const SESSION_KEY="spm370_ldl1_instructor_access";

const CRISIS={
  pathway:"The Pathway Disappears",
  sponsor:"The Sponsor Walks",
  license:"The Unlicensed Major"
};
const ARCH={
  closed:"Closed / Partnered",
  open:"Open Circuit",
  hybrid:"Hybrid"
};
const STAKEHOLDER={
  publisher:"Publisher",
  team:"Team",
  player:"Players",
  sponsor:"Sponsors",
  community:"Community / Creators",
  investor:"Investors",
  organizer:"Tournament Organizer",
  platform:"Streaming Platform"
};
const CONTRACT={
  participation:"Participation / Partnership Agreement",
  license:"Publisher / Tournament License",
  revenue:"Revenue-Sharing Agreement",
  player:"Player Agreement",
  sponsor:"Sponsor Agreement",
  exit:"Exit / Buy-Back Clause",
  format:"Change-of-Format Clause",
  rulebook:"Rulebook Incorporation Clause",
  dispute:"Dispute Resolution Clause"
};
const REVENUE={
  sponsor:"Sponsorship",
  media:"Media / streaming",
  digital:"Publisher-mediated digital",
  support:"League / publisher support",
  merch:"Merchandise",
  live:"Live events",
  prize:"Prize money"
};

const RUBRICS=[
  {
    id:"issue",
    title:"1 · Issue Spotting",
    max:2,
    responseField:"issue_spotting",
    scoreField:"issue_spotting_score",
    purpose:"Identify the legally significant issue or issues raised by the selected crisis.",
    anchors:[
      ["2","Accurately identifies the central legal issue(s) with useful specificity."],
      ["1","Identifies a relevant general concern but misses an important issue or distinction."],
      ["0","Materially incorrect, unsupported, or does not identify a legal issue."]
    ]
  },
  {
    id:"legal",
    title:"2 · Legal Principle + Application",
    max:3,
    responseField:"legal_application",
    scoreField:"legal_application_score",
    purpose:"State the relevant legal principle, doctrine, contractual concept, or rule and apply it to the facts.",
    anchors:[
      ["3","Accurate principle and meaningful fact-specific application with clear reasoning."],
      ["2","Mostly accurate principle and application, but analysis is incomplete or underdeveloped."],
      ["1","Names a relevant doctrine or rule but offers little application or includes a meaningful error."],
      ["0","Missing, materially incorrect, or unsupported legal analysis."]
    ]
  },
  {
    id:"stakeholder",
    title:"3 · Stakeholder Analysis",
    max:2,
    responseField:"stakeholder_analysis",
    scoreField:"stakeholder_analysis_score",
    purpose:"Explain which stakeholders' rights, power, risk, or interests matter and why.",
    anchors:[
      ["2","Identifies materially affected stakeholders and explains the relevant rights, leverage, risks, or tradeoffs."],
      ["1","Names relevant stakeholders but provides limited explanation of why they matter."],
      ["0","Missing, materially incorrect, or unsupported stakeholder analysis."]
    ]
  },
  {
    id:"recommendation",
    title:"4 · Recommended Course of Action",
    max:3,
    responseField:"recommendation",
    scoreField:"recommendation_score",
    purpose:"Recommend a specific management response and defend it using law and the tradeoffs revealed by the simulation.",
    anchors:[
      ["3","Specific, feasible recommendation grounded in legal analysis and meaningful tradeoffs."],
      ["2","Defensible recommendation, but rationale, sequencing, or tradeoff analysis is underdeveloped."],
      ["1","Vague or weakly connected to the legal issue and facts."],
      ["0","Missing, unsupported, or materially inconsistent with the analysis."]
    ]
  }
];

const els={
  loginView:document.getElementById("loginView"),
  dashboardView:document.getElementById("dashboardView"),
  loginForm:document.getElementById("loginForm"),
  accessKey:document.getElementById("accessKey"),
  loginStatus:document.getElementById("loginStatus"),
  refreshBtn:document.getElementById("refreshBtn"),
  exportBtn:document.getElementById("exportBtn"),
  lockBtn:document.getElementById("lockBtn"),
  statTotal:document.getElementById("statTotal"),
  statUngraded:document.getElementById("statUngraded"),
  statGraded:document.getElementById("statGraded"),
  statAverage:document.getElementById("statAverage"),
  searchInput:document.getElementById("searchInput"),
  statusFilter:document.getElementById("statusFilter"),
  crisisFilter:document.getElementById("crisisFilter"),
  queueCount:document.getElementById("queueCount"),
  gradedProgress:document.getElementById("gradedProgress"),
  progressFill:document.getElementById("progressFill"),
  rosterList:document.getElementById("rosterList"),
  emptyState:document.getElementById("emptyState"),
  graderView:document.getElementById("graderView"),
  studentStatus:document.getElementById("studentStatus"),
  studentName:document.getElementById("studentName"),
  studentIdentity:document.getElementById("studentIdentity"),
  totalScore:document.getElementById("totalScore"),
  scorePercent:document.getElementById("scorePercent"),
  chosenCrisis:document.getElementById("chosenCrisis"),
  teamName:document.getElementById("teamName"),
  submittedAt:document.getElementById("submittedAt"),
  duration:document.getElementById("duration"),
  rubricContainer:document.getElementById("rubricContainer"),
  evidenceBody:document.getElementById("evidenceBody"),
  graderNotes:document.getElementById("graderNotes"),
  saveStatus:document.getElementById("saveStatus"),
  clearGradeBtn:document.getElementById("clearGradeBtn"),
  saveBtn:document.getElementById("saveBtn"),
  saveNextBtn:document.getElementById("saveNextBtn"),
  toast:document.getElementById("toast")
};

const state={
  key:"",
  submissions:[],
  filtered:[],
  selectedId:null,
  draft:null,
  dirty:false,
  saving:false,
  initialized:false
};

function isScored(s){
  return Number.isInteger(s.total_score);
}
function completeDraft(d){
  return d && RUBRICS.every(r=>Number.isInteger(d[r.scoreField]));
}
function draftTotal(d){
  if(!d)return null;
  if(!completeDraft(d))return null;
  return RUBRICS.reduce((sum,r)=>sum+d[r.scoreField],0);
}
function formatDate(value){
  if(!value)return "—";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "—";
  return d.toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
}
function words(value){
  const t=String(value||"").trim();
  return t ? t.split(/\s+/).length : 0;
}
function showToast(message){
  els.toast.textContent=message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>els.toast.classList.remove("show"),1800);
}
async function api(method,body){
  const options={
    method,
    headers:{
      "Content-Type":"application/json",
      "X-Instructor-Key":state.key
    }
  };
  if(body!==undefined)options.body=JSON.stringify(body);
  const res=await fetch(ENDPOINT,options);
  const data=await res.json().catch(()=>({}));
  if(!res.ok){
    const error=new Error(data.error||"Dashboard request failed.");
    error.status=res.status;
    throw error;
  }
  return data;
}
async function authenticate(key){
  state.key=String(key||"").trim();
  if(!state.key)throw new Error("Enter the instructor access key.");
  const data=await api("GET");
  state.submissions=Array.isArray(data.submissions)?data.submissions:[];
  sessionStorage.setItem(SESSION_KEY,state.key);
  if(!state.initialized){
    els.statusFilter.value="ungraded";
    state.initialized=true;
  }
  showDashboard();
  applyFilters();
}
function showDashboard(){
  els.loginView.hidden=true;
  els.dashboardView.hidden=false;
  els.refreshBtn.hidden=false;
  els.exportBtn.hidden=false;
  els.lockBtn.hidden=false;
  renderStats();
}
function lockDashboard(){
  if(state.dirty&&!confirm("Discard unsaved grading changes and lock the dashboard?"))return;
  sessionStorage.removeItem(SESSION_KEY);
  state.key="";
  state.submissions=[];
  state.filtered=[];
  state.selectedId=null;
  state.draft=null;
  state.dirty=false;
  els.dashboardView.hidden=true;
  els.refreshBtn.hidden=true;
  els.exportBtn.hidden=true;
  els.lockBtn.hidden=true;
  els.loginView.hidden=false;
  els.accessKey.value="";
  els.loginStatus.textContent="";
  els.accessKey.focus();
}
function renderStats(){
  const total=state.submissions.length;
  const graded=state.submissions.filter(isScored);
  const ungraded=total-graded.length;
  const average=graded.length ? graded.reduce((sum,s)=>sum+Number(s.total_score||0),0)/graded.length : null;
  els.statTotal.textContent=String(total);
  els.statUngraded.textContent=String(ungraded);
  els.statGraded.textContent=String(graded.length);
  els.statAverage.textContent=average===null?"—":average.toFixed(1)+" / 10";
  els.gradedProgress.textContent=graded.length+" / "+total;
  els.progressFill.style.width=total?((graded.length/total)*100)+"%":"0%";
}
function applyFilters(){
  const q=els.searchInput.value.trim().toLowerCase();
  const status=els.statusFilter.value;
  const crisis=els.crisisFilter.value;
  state.filtered=state.submissions.filter(s=>{
    const hay=[s.first_name,s.last_name,s.email,s.team_name].join(" ").toLowerCase();
    if(q&&!hay.includes(q))return false;
    if(status==="graded"&&!isScored(s))return false;
    if(status==="ungraded"&&isScored(s))return false;
    if(crisis!=="all"&&s.chosen_crisis!==crisis)return false;
    return true;
  }).sort((a,b)=>{
    const ln=String(a.last_name||"").localeCompare(String(b.last_name||""));
    return ln||String(a.first_name||"").localeCompare(String(b.first_name||""));
  });
  els.queueCount.textContent=String(state.filtered.length);
  renderStats();
  renderRoster();
  if(state.selectedId&&!state.submissions.some(s=>s.id===state.selectedId)){
    state.selectedId=null; state.draft=null; showEmpty();
  }
}
function renderRoster(){
  els.rosterList.replaceChildren();
  if(!state.filtered.length){
    const div=document.createElement("div");
    div.className="roster-empty";
    div.textContent=state.submissions.length?"No submissions match these filters.":"No student submissions yet. Use Refresh after students begin submitting.";
    els.rosterList.appendChild(div);
    return;
  }
  state.filtered.forEach(s=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="roster-row"+(s.id===state.selectedId?" active":"");
    const left=document.createElement("span");
    const name=document.createElement("span");
    name.className="name";
    name.textContent=(s.last_name||"")+", "+(s.first_name||"");
    const sub=document.createElement("span");
    sub.className="sub";
    sub.textContent=(CRISIS[s.chosen_crisis]||s.chosen_crisis||"No crisis")+" · "+(s.team_name||"No team");
    left.append(name,sub);
    const score=document.createElement("span");
    score.className="roster-score"+(isScored(s)?"":" ungraded");
    score.textContent=isScored(s)?s.total_score+"/10":"UNGRADED";
    btn.append(left,score);
    btn.addEventListener("click",()=>selectSubmission(s.id));
    els.rosterList.appendChild(btn);
  });
}
function showEmpty(){
  els.emptyState.hidden=false;
  els.graderView.hidden=true;
}
function selectSubmission(id){
  if(state.dirty&&id!==state.selectedId&&!confirm("Discard unsaved grading changes?"))return;
  const s=state.submissions.find(x=>x.id===id);
  if(!s)return;
  state.selectedId=id;
  state.draft={
    issue_spotting_score:Number.isInteger(s.issue_spotting_score)?s.issue_spotting_score:null,
    legal_application_score:Number.isInteger(s.legal_application_score)?s.legal_application_score:null,
    stakeholder_analysis_score:Number.isInteger(s.stakeholder_analysis_score)?s.stakeholder_analysis_score:null,
    recommendation_score:Number.isInteger(s.recommendation_score)?s.recommendation_score:null,
    grader_notes:s.grader_notes||""
  };
  state.dirty=false;
  renderRoster();
  renderGrader(s);
}
function renderGrader(s){
  els.emptyState.hidden=true;
  els.graderView.hidden=false;
  const graded=isScored(s);
  els.studentStatus.textContent=graded?"GRADED":"UNGRADED";
  els.studentStatus.classList.toggle("graded",graded);
  els.studentName.textContent=(s.first_name||"")+" "+(s.last_name||"");
  els.studentIdentity.textContent=(s.email||"")+" · Receipt "+(s.receipt||"—");
  els.chosenCrisis.textContent=CRISIS[s.chosen_crisis]||s.chosen_crisis||"—";
  els.teamName.textContent=(s.team_name||"—")+(s.join_code?" · "+s.join_code:"");
  els.submittedAt.textContent=formatDate(s.submitted_at);
  els.duration.textContent=s.duration_minutes===null||s.duration_minutes===undefined?"—":Number(s.duration_minutes).toFixed(1)+" min";
  els.graderNotes.value=state.draft.grader_notes||"";
  renderRubrics(s);
  renderEvidence(s);
  refreshScoreUI();
  setSaveStatus(graded?"Saved "+formatDate(s.graded_at):"Not yet graded","saved");
}
function renderRubrics(s){
  els.rubricContainer.replaceChildren();
  RUBRICS.forEach(r=>{
    const card=document.createElement("section");
    card.className="rubric-card";
    card.dataset.rubric=r.id;

    const head=document.createElement("div");
    head.className="rubric-head";
    const hwrap=document.createElement("div");
    const h=document.createElement("h3");h.textContent=r.title;
    const p=document.createElement("p");p.textContent=r.purpose;
    hwrap.append(h,p);
    const max=document.createElement("span");max.className="max-score";max.textContent=r.max+" pts";
    head.append(hwrap,max);

    const response=document.createElement("div");
    response.className="response-block";
    const label=document.createElement("div");label.className="response-label";
    const l=document.createElement("span");l.textContent="Student response";
    const wc=document.createElement("span");wc.textContent=words(s[r.responseField])+" words";
    label.append(l,wc);
    const txt=document.createElement("div");txt.className="response-text";txt.textContent=s[r.responseField]||"No response recorded.";
    response.append(label,txt);

    const scoreZone=document.createElement("div");scoreZone.className="score-zone";
    const row=document.createElement("div");row.className="score-row";
    const prompt=document.createElement("span");prompt.textContent="Score:";
    row.appendChild(prompt);
    for(let n=0;n<=r.max;n++){
      const b=document.createElement("button");
      b.type="button";
      b.className="score-btn";
      b.dataset.scoreField=r.scoreField;
      b.dataset.score=String(n);
      b.textContent=String(n);
      b.setAttribute("aria-label",r.title+" score "+n+" of "+r.max);
      b.addEventListener("click",()=>{
        state.draft[r.scoreField]=n;
        markDirty();
        refreshScoreUI();
      });
      row.appendChild(b);
    }
    const anchors=document.createElement("div");anchors.className="anchors";
    r.anchors.forEach(([score,text])=>{
      const line=document.createElement("div");
      const bold=document.createElement("b");bold.textContent=score+" = ";
      line.append(bold,document.createTextNode(text));
      anchors.appendChild(line);
    });
    scoreZone.append(row,anchors);
    card.append(head,response,scoreZone);
    els.rubricContainer.appendChild(card);
  });
}
function refreshScoreUI(){
  if(!state.draft)return;
  document.querySelectorAll(".score-btn").forEach(btn=>{
    const field=btn.dataset.scoreField;
    btn.classList.toggle("selected",Number(btn.dataset.score)===state.draft[field]);
  });
  const total=draftTotal(state.draft);
  const partial=RUBRICS.reduce((sum,r)=>sum+(Number.isInteger(state.draft[r.scoreField])?state.draft[r.scoreField]:0),0);
  const filled=RUBRICS.filter(r=>Number.isInteger(state.draft[r.scoreField])).length;
  if(total===null){
    els.totalScore.textContent=filled?partial+" / 10*":"— / 10";
    els.scorePercent.textContent=filled?filled+" of 4 rubric scores entered":"";
  }else{
    els.totalScore.textContent=total+" / 10";
    els.scorePercent.textContent=(total*10)+"%";
  }
}
function renderEvidence(s){
  els.evidenceBody.replaceChildren();
  const p=s.simulation_payload&&typeof s.simulation_payload==="object"?s.simulation_payload:{};
  const grid=document.createElement("div");grid.className="evidence-grid";
  [
    ["Architecture",ARCH[p.architecture]||p.architecture||"—"],
    ["Board priorities",Array.isArray(p.priorities)&&p.priorities.length?p.priorities.map(x=>STAKEHOLDER[x]||x).join(" · "):"—"],
    ["Publisher-linked revenue",p.publisherDependency===undefined?"—":p.publisherDependency+"%"],
    ["Year Two",p.yearDecision||"—"],
    ["Session",s.session_id||p.sessionId||"—"],
    ["Legal resilience",p.metrics&&p.metrics.resilience!==undefined?p.metrics.resilience+"/100":"—"]
  ].forEach(([label,value])=>{
    const c=document.createElement("div");c.className="evidence-card";
    const span=document.createElement("span");span.textContent=label;
    const strong=document.createElement("strong");strong.textContent=String(value);
    c.append(span,strong);grid.appendChild(c);
  });
  els.evidenceBody.appendChild(grid);

  const protections=document.createElement("div");protections.className="evidence-list";
  const ph=document.createElement("h4");ph.textContent="Legal protections selected";
  const pp=document.createElement("div");
  pp.textContent=Array.isArray(p.contracts)&&p.contracts.length?p.contracts.map(x=>CONTRACT[x]||x).join(" · "):"Not recorded";
  protections.append(ph,pp);
  els.evidenceBody.appendChild(protections);

  const revenue=document.createElement("div");revenue.className="evidence-list";
  const rh=document.createElement("h4");rh.textContent="Revenue mix";
  const rp=document.createElement("div");
  if(p.revenue&&typeof p.revenue==="object"){
    rp.textContent=Object.entries(p.revenue).sort((a,b)=>Number(b[1])-Number(a[1])).map(([k,v])=>(REVENUE[k]||k)+" "+v+"%").join(" · ")||"Not recorded";
  }else rp.textContent="Not recorded";
  revenue.append(rh,rp);
  els.evidenceBody.appendChild(revenue);

  const crisis=document.createElement("div");crisis.className="evidence-list";
  const ch=document.createElement("h4");ch.textContent="Group crisis decisions";
  const ul=document.createElement("ul");
  const journal=Array.isArray(p.journal)?p.journal.filter(x=>x&&x.type==="crisis decision"):[];
  if(journal.length){
    journal.forEach(x=>{
      const li=document.createElement("li");
      li.textContent=(x.title||"Crisis")+": "+(x.detail||"");
      ul.appendChild(li);
    });
  }else{
    const li=document.createElement("li");li.textContent="No crisis-decision journal entries recorded.";ul.appendChild(li);
  }
  crisis.append(ch,ul);
  els.evidenceBody.appendChild(crisis);

  if(p.yearReason){
    const yr=document.createElement("div");yr.className="evidence-list";
    const yh=document.createElement("h4");yh.textContent="Group Year Two defense";
    const yp=document.createElement("div");yp.textContent=String(p.yearReason);
    yr.append(yh,yp);els.evidenceBody.appendChild(yr);
  }
}
function markDirty(){
  state.dirty=true;
  setSaveStatus("Unsaved grading changes","dirty");
}
function setSaveStatus(message,kind){
  els.saveStatus.textContent=message||"";
  els.saveStatus.className="save-status"+(kind?" "+kind:"");
}
async function saveGrade(){
  if(!state.selectedId||!state.draft||state.saving)return false;
  state.saving=true;
  els.saveBtn.disabled=true;
  els.saveNextBtn.disabled=true;
  setSaveStatus("Saving…","");
  try{
    const data=await api("PATCH",{
      id:state.selectedId,
      issueSpottingScore:state.draft.issue_spotting_score,
      legalApplicationScore:state.draft.legal_application_score,
      stakeholderAnalysisScore:state.draft.stakeholder_analysis_score,
      recommendationScore:state.draft.recommendation_score,
      graderNotes:state.draft.grader_notes
    });
    const idx=state.submissions.findIndex(s=>s.id===state.selectedId);
    if(idx>=0&&data.submission)Object.assign(state.submissions[idx],data.submission);
    state.dirty=false;
    setSaveStatus(completeDraft(state.draft)?"Grade saved.":"Partial grading saved.","saved");
    renderStats();
    applyFilters();
    showToast("Grade saved");
    return true;
  }catch(e){
    setSaveStatus(e.message||"Could not save grade.","error");
    return false;
  }finally{
    state.saving=false;
    els.saveBtn.disabled=false;
    els.saveNextBtn.disabled=false;
  }
}
function getNextId(){
  const currentIndex=state.filtered.findIndex(s=>s.id===state.selectedId);
  if(currentIndex>=0&&currentIndex<state.filtered.length-1)return state.filtered[currentIndex+1].id;
  const ungraded=state.submissions.find(s=>s.id!==state.selectedId&&!isScored(s));
  return ungraded?ungraded.id:null;
}
async function saveAndNext(){
  const nextId=getNextId();
  const ok=await saveGrade();
  if(!ok)return;
  applyFilters();
  let target=nextId&&state.submissions.find(s=>s.id===nextId)?nextId:null;
  if(!target&&state.filtered.length)target=state.filtered[0].id;
  if(target&&target!==state.selectedId){
    selectSubmission(target);
  }else if(!state.filtered.length){
    state.selectedId=null;state.draft=null;showEmpty();renderRoster();
    showToast("Grading queue complete");
  }
}
async function clearScores(){
  if(!state.selectedId||!confirm("Clear all rubric scores for this student? Instructor notes will be preserved."))return;
  RUBRICS.forEach(r=>state.draft[r.scoreField]=null);
  markDirty();refreshScoreUI();
  await saveGrade();
}
async function refreshData(){
  if(state.dirty&&!confirm("Refresh and discard unsaved grading changes?"))return;
  els.refreshBtn.disabled=true;
  try{
    const selected=state.selectedId;
    const data=await api("GET");
    state.submissions=Array.isArray(data.submissions)?data.submissions:[];
    state.dirty=false;
    applyFilters();
    if(selected&&state.submissions.some(s=>s.id===selected))selectSubmission(selected);
    else if(state.filtered.length)selectSubmission(state.filtered[0].id);
    else showEmpty();
    showToast("Submissions refreshed");
  }catch(e){
    alert(e.message||"Could not refresh submissions.");
    if(e.status===401)lockDashboard();
  }finally{
    els.refreshBtn.disabled=false;
  }
}
function csvCell(value){
  const s=String(value??"").replace(/"/g,'""');
  return '"'+s+'"';
}
function exportCsv(){
  const rows=[[
    "Last Name","First Name","Email","Team","Pod Code","Chosen Crisis",
    "Issue Spotting /2","Legal Application /3","Stakeholder Analysis /2","Recommendation /3",
    "Total /10","Grader Notes","Graded At","Submitted At","Receipt"
  ]];
  state.submissions.forEach(s=>rows.push([
    s.last_name,s.first_name,s.email,s.team_name,s.join_code,CRISIS[s.chosen_crisis]||s.chosen_crisis,
    s.issue_spotting_score,s.legal_application_score,s.stakeholder_analysis_score,s.recommendation_score,
    s.total_score,s.grader_notes,s.graded_at,s.submitted_at,s.receipt
  ]));
  const csv="\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="spm370-legal-decision-lab-1-gradebook.csv";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function wire(){
  els.loginForm.addEventListener("submit",async e=>{
    e.preventDefault();
    els.loginStatus.textContent="Opening secure grading queue…";
    const submit=els.loginForm.querySelector('button[type="submit"]');
    submit.disabled=true;
    try{
      await authenticate(els.accessKey.value);
      els.loginStatus.textContent="";
      if(state.filtered.length)selectSubmission(state.filtered[0].id);
      else showEmpty();
    }catch(err){
      sessionStorage.removeItem(SESSION_KEY);
      els.loginStatus.textContent=err.message||"Could not open dashboard.";
    }finally{submit.disabled=false;}
  });
  [els.searchInput,els.statusFilter,els.crisisFilter].forEach(el=>el.addEventListener(el.tagName==="INPUT"?"input":"change",()=>{
    if(state.dirty&&!confirm("Changing the queue will discard unsaved grading changes.")){
      return;
    }
    state.dirty=false;
    applyFilters();
    if(state.filtered.length&&!state.filtered.some(s=>s.id===state.selectedId))selectSubmission(state.filtered[0].id);
    else if(!state.filtered.length)showEmpty();
  }));
  els.graderNotes.addEventListener("input",()=>{
    if(!state.draft)return;
    state.draft.grader_notes=els.graderNotes.value;
    markDirty();
  });
  els.saveBtn.addEventListener("click",saveGrade);
  els.saveNextBtn.addEventListener("click",saveAndNext);
  els.clearGradeBtn.addEventListener("click",clearScores);
  els.refreshBtn.addEventListener("click",refreshData);
  els.exportBtn.addEventListener("click",exportCsv);
  els.lockBtn.addEventListener("click",lockDashboard);
}
async function init(){
  wire();
  const stored=sessionStorage.getItem(SESSION_KEY);
  if(stored){
    els.loginStatus.textContent="Restoring instructor session…";
    try{
      await authenticate(stored);
      els.loginStatus.textContent="";
      if(state.filtered.length)selectSubmission(state.filtered[0].id);
      else showEmpty();
      return;
    }catch(e){
      sessionStorage.removeItem(SESSION_KEY);
      state.key="";
    }
  }
  els.accessKey.focus();
}
init();

})();