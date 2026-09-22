(()=>{"use strict";
const SESSION_ENDPOINT="https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-ldl1-session";
const SUBMIT_ENDPOINT="https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/submit-spm370-ldl1";
const APP_VERSION="Individual Handoff 1.0";

const ARCH={closed:"Closed / Partnered",open:"Open Circuit",hybrid:"Hybrid"};
const STAKE={publisher:"Publisher",team:"Teams",player:"Players",sponsor:"Sponsors",community:"Community / Creators",investor:"Investors",organizer:"Tournament Organizer",platform:"Streaming Platform"};
const CRISES={
  pathway:{
    title:"The Pathway Disappears",
    short:"Publisher redesigns elite qualification.",
    scenario:"Partner organizations and challenger teams built sponsor, roster, and revenue plans around the current pathway. The publisher announces a new structure that changes seeding and qualification."
  },
  sponsor:{
    title:"The Sponsor Walks",
    short:"A player creates a brand crisis.",
    scenario:"Within 24 hours, the largest automotive sponsor invokes its brand-safety rights and announces termination. The team warns that losing the deal will force roster cuts."
  },
  license:{
    title:"The Unlicensed Major",
    short:"A $500K invitational lacks formal publisher approval.",
    scenario:"A creator announces a $500K invitational using official assets and a modified client. The event has major sponsors and co-streaming plans but no formal publisher approval and is scheduled to launch in 72 hours."
  }
};

const els={
  joinView:document.getElementById("joinView"),joinForm:document.getElementById("joinForm"),podCode:document.getElementById("podCode"),joinBtn:document.getElementById("joinBtn"),joinStatus:document.getElementById("joinStatus"),
  assessmentView:document.getElementById("assessmentView"),changePodBtn:document.getElementById("changePodBtn"),loadedTeam:document.getElementById("loadedTeam"),loadedCode:document.getElementById("loadedCode"),loadedSession:document.getElementById("loadedSession"),
  summaryArchitecture:document.getElementById("summaryArchitecture"),summaryPriorities:document.getElementById("summaryPriorities"),summaryDependency:document.getElementById("summaryDependency"),summaryYear:document.getElementById("summaryYear"),
  assessmentForm:document.getElementById("assessmentForm"),firstName:document.getElementById("firstName"),lastName:document.getElementById("lastName"),email:document.getElementById("email"),
  crisisChoices:document.getElementById("crisisChoices"),crisisBrief:document.getElementById("crisisBrief"),issueSpotting:document.getElementById("issueSpotting"),legalApplication:document.getElementById("legalApplication"),stakeholderAnalysis:document.getElementById("stakeholderAnalysis"),recommendation:document.getElementById("recommendation"),
  submitBtn:document.getElementById("submitBtn"),formStatus:document.getElementById("formStatus"),
  receiptView:document.getElementById("receiptView"),receiptStudent:document.getElementById("receiptStudent"),receiptCode:document.getElementById("receiptCode")
};
const state={session:null,crisisId:null,submitting:false};

function normalizeCode(value){
  const compact=String(value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(compact.length<5)return "";
  return compact.slice(0,-3)+"-"+compact.slice(-3);
}
function setJoinStatus(msg,kind=""){
  els.joinStatus.textContent=msg;
  els.joinStatus.className="status"+(kind?" "+kind:"");
}
function setFormStatus(msg,kind=""){
  els.formStatus.textContent=msg;
  els.formStatus.className="status submit-status"+(kind?" "+kind:"");
}
async function loadSession(rawCode){
  const code=normalizeCode(rawCode);
  if(!code){setJoinStatus("Enter the pod code shown on your group's final screen.","error");return;}
  els.podCode.value=code;els.joinBtn.disabled=true;setJoinStatus("Loading your group's completed run…");
  try{
    const res=await fetch(SESSION_ENDPOINT+"?code="+encodeURIComponent(code));
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||"Pod run could not be loaded.");
    state.session=data;
    renderSession();
    history.replaceState(null,"",location.pathname+"?code="+encodeURIComponent(data.joinCode));
  }catch(e){
    setJoinStatus(e.message||"Pod run could not be loaded.","error");
  }finally{els.joinBtn.disabled=false;}
}
function renderSession(){
  const s=state.session,p=s.simulationPayload||{};
  els.joinView.hidden=true;els.assessmentView.hidden=false;els.receiptView.hidden=true;
  els.loadedTeam.textContent=s.teamName||p.team||"Pod";
  els.loadedCode.textContent=s.joinCode||"—";els.loadedSession.textContent=s.sessionId||"—";
  els.summaryArchitecture.textContent=ARCH[p.architecture]||p.architecture||"—";
  els.summaryPriorities.textContent=Array.isArray(p.priorities)&&p.priorities.length?p.priorities.map(x=>STAKE[x]||x).join(" · "):"—";
  els.summaryDependency.textContent=p.publisherDependency===undefined?"—":p.publisherDependency+"%";
  els.summaryYear.textContent=yearLabel(p.yearDecision);
  renderCrises();
  updateGate();
  window.scrollTo({top:0,behavior:"smooth"});
}
function yearLabel(v){return v==="approve"?"Approve":v==="restructure"?"Approve with Restructuring":v==="reject"?"Do Not Renew":v||"—"}
function podDecision(id){
  const j=state.session?.simulationPayload?.journal;
  if(!Array.isArray(j))return "";
  const item=j.find(x=>x&&x.type==="crisis decision"&&String(x.title||"").toLowerCase().includes(CRISES[id].title.toLowerCase()));
  return item?.detail||"";
}
function renderCrises(){
  els.crisisChoices.replaceChildren();
  Object.entries(CRISES).forEach(([id,c])=>{
    const b=document.createElement("button");b.type="button";b.className="crisis-choice";b.dataset.crisis=id;
    const strong=document.createElement("strong");strong.textContent=c.title;
    const span=document.createElement("span");span.textContent=c.short;
    b.append(strong,span);b.addEventListener("click",()=>selectCrisis(id));els.crisisChoices.appendChild(b);
  });
}
function selectCrisis(id){
  state.crisisId=id;
  document.querySelectorAll(".crisis-choice").forEach(b=>b.classList.toggle("selected",b.dataset.crisis===id));
  const c=CRISES[id],decision=podDecision(id);
  els.crisisBrief.hidden=false;
  els.crisisBrief.replaceChildren();
  const strong=document.createElement("strong");strong.textContent=c.title+": ";
  els.crisisBrief.append(strong,document.createTextNode(c.scenario));
  if(decision){
    const p=document.createElement("p");p.style.margin=".6rem 0 0";p.style.color="#566173";
    const b=document.createElement("b");b.textContent="Your pod chose: ";p.append(b,document.createTextNode(decision));els.crisisBrief.appendChild(p);
  }
  updateGate();
}
function validEmail(){return /^[^\s@]+@lasalle\.edu$/i.test(els.email.value.trim())}
function updateCounters(){
  [["issueSpotting",20],["legalApplication",40],["stakeholderAnalysis",20],["recommendation",40]].forEach(([id,min])=>{
    const input=els[id],out=document.querySelector('[data-count-for="'+id+'"]'),n=input.value.trim().length;
    out.textContent=n+" characters · minimum "+min;out.classList.toggle("ready",n>=min);
  });
}
function ready(){
  return !!(state.session&&state.crisisId&&els.firstName.value.trim()&&els.lastName.value.trim()&&validEmail()&&els.issueSpotting.value.trim().length>=20&&els.legalApplication.value.trim().length>=40&&els.stakeholderAnalysis.value.trim().length>=20&&els.recommendation.value.trim().length>=40);
}
function updateGate(){
  updateCounters();
  const ok=ready();els.submitBtn.disabled=!ok||state.submitting;
  let msg="Complete all required fields to submit.";
  if(state.session&&!state.crisisId)msg="Choose one of the three crises.";
  else if(state.crisisId&&!els.firstName.value.trim())msg="Enter your first name.";
  else if(state.crisisId&&!els.lastName.value.trim())msg="Enter your last name.";
  else if(state.crisisId&&els.email.value.trim()&&!validEmail())msg="Use your La Salle email ending in @lasalle.edu.";
  else if(state.crisisId&&!els.email.value.trim())msg="Enter your La Salle email.";
  else if(ready())msg="Ready for official submission.";
  setFormStatus(msg,ok?"good":"");
}
async function submitAssessment(e){
  e.preventDefault();if(!ready()||state.submitting)return;
  state.submitting=true;updateGate();els.submitBtn.textContent="Submitting…";setFormStatus("Saving your official submission…");
  try{
    const payload={
      firstName:els.firstName.value.trim(),lastName:els.lastName.value.trim(),email:els.email.value.trim().toLowerCase(),
      chosenCrisis:state.crisisId,issueSpotting:els.issueSpotting.value.trim(),legalApplication:els.legalApplication.value.trim(),
      stakeholderAnalysis:els.stakeholderAnalysis.value.trim(),recommendation:els.recommendation.value.trim(),
      joinCode:state.session.joinCode,version:APP_VERSION
    };
    const res=await fetch(SUBMIT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const err=new Error(data.error||"Submission could not be saved.");err.code=data.code;err.receipt=data.receipt;throw err;
    }
    showReceipt(data.receipt);
  }catch(e){
    if(e.code==="ALREADY_SUBMITTED"){
      setFormStatus("A Legal Decision Lab 1 submission already exists for this La Salle email.","error");
      if(e.receipt){showReceipt(e.receipt,true);return;}
    }else setFormStatus(e.message||"Submission could not be saved. Keep this page open and notify your instructor.","error");
    state.submitting=false;els.submitBtn.textContent="Submit Legal Decision Lab";updateGate();
  }
}
function showReceipt(receipt,existing=false){
  const name=(els.firstName.value.trim()+" "+els.lastName.value.trim()).trim();
  els.assessmentView.hidden=true;els.joinView.hidden=true;els.receiptView.hidden=false;
  els.receiptStudent.textContent=(existing?"An existing submission was found for ":"Submission received for ")+name+".";
  els.receiptCode.textContent=receipt||"Saved";
  window.scrollTo({top:0,behavior:"smooth"});
}
function changePod(){
  if((els.issueSpotting.value.trim()||els.legalApplication.value.trim()||els.stakeholderAnalysis.value.trim()||els.recommendation.value.trim())&&!confirm("Change pods? Your unsent individual responses on this page will be cleared."))return;
  state.session=null;state.crisisId=null;els.assessmentForm.reset();els.assessmentView.hidden=true;els.receiptView.hidden=true;els.joinView.hidden=false;els.podCode.value="";setJoinStatus("");history.replaceState(null,"",location.pathname);els.podCode.focus();
}
els.joinForm.addEventListener("submit",e=>{e.preventDefault();loadSession(els.podCode.value)});
els.changePodBtn.addEventListener("click",changePod);
els.assessmentForm.addEventListener("submit",submitAssessment);
[els.firstName,els.lastName,els.email,els.issueSpotting,els.legalApplication,els.stakeholderAnalysis,els.recommendation].forEach(x=>x.addEventListener("input",updateGate));
const initial=new URLSearchParams(location.search).get("code");
if(initial){els.podCode.value=normalizeCode(initial);loadSession(initial)}else els.podCode.focus();
})();