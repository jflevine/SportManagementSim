'use strict';
(() => {
const ENDPOINT = 'https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm370-llc2';
const VERSION = '3.0-liberty-cup';
const STORE = 'spm370_llc2_attempt_v2'; // Keep existing browser attempts resumable.
const PREVIEW = new URLSearchParams(location.search).get('preview') === '1';
// This is question text only. Correct answers and official scoring remain on the server.
const legacy = [
['Copyright basics','The saved poster','A student designer creates an original tournament poster and saves the file to her laptop.','When does copyright protection generally begin?',['Only after the work is registered with the U.S. Copyright Office','When the original work is fixed in the saved file','Only after the poster is sold or publicly displayed','Only after the creator places a copyright notice on it']],
['Ideas and expression','The shared mechanic','Two competitive games both use teams fighting to capture control points.','What would copyright most clearly protect?',['The general idea of teams capturing control points','The concept of assigning players different strategic roles','Specific character artwork, animations, music, and code','The basic rules needed to play the game']],
['Ownership','The team designer','A team employee creates original promotional graphics within her assigned job duties. No agreement changes the usual ownership rule.','Who generally owns that employee-created expression?',['The employer under the work-made-for-hire rule','The employee in every situation because she physically created it','The players promoted by the team','The streaming platform that later hosts the graphics']],
['Exclusive rights','The live match','A tournament streams moving gameplay live to an online audience.','Which exclusive copyright right most directly concerns presenting those moving images?',['Distribution','Public display','Public performance','Digital audio performance of sound recordings']],
['Permission','The walk-on song','A publisher permits the tournament to stream its game. The production team wants to add a popular commercial song to the broadcast.','Which statement should guide the organizer?',['Permission to stream the game automatically includes any commercial music','Game-stream permission does not automatically clear third-party music','Music never raises copyright issues when used during esports','Buying a personal music subscription automatically clears broadcast use']],
['DMCA','The removed video','A platform removes a creator’s archived match video after receiving a copyright notice.','What does the platform’s removal itself establish?',['A court has conclusively found the creator liable for infringement','The creator has automatically lost all fair-use arguments','The copyright owner has automatically won statutory damages','It is a platform action under notice and takedown, not a court judgment']],
['DMCA','The locked gate','A modding tool bypasses an effective technological access control on a game.','Which legal framework specifically addresses that bypass?',['The DMCA anti-circumvention rules','The copyright registration process','The copyright joint-authorship rules','The DMCA notice-and-takedown process']],
['Fair use','The highlight market','An analysis show uses match clips. You are specifically concerned viewers may use the show instead of obtaining the publisher’s official highlights.','Which fair-use factor does that concern most directly address?',['Purpose and character of the use','Nature of the copyrighted work','Effect on the market for the original or a relevant licensing market','Amount and substantiality used']]
].map(([topic,title,fact,question,options]) => ({topic,title,stage:'Original question set',document:'Scenario',facts:[fact],question,options}));
const cases = [
{
 topic:'Copyright protection', stage:'Before departure', title:'The poster in the packing list',
 document:'CREW MESSAGE · ALEX, DESIGN',
 facts:['“I drew our Liberty Cup event illustration from scratch and saved the finished file. It has not been posted online or registered with the Copyright Office.”','Jordan asks whether the crew should treat the illustration as unprotected until registration.'],
 question:'Which statement about the saved illustration is correct?',
 options:['Copyright starts only after the Copyright Office registers it.','The original illustration can already be protected because it is recorded in a saved file.','It must be posted publicly before copyright can begin.','Adding a copyright notice is what creates its copyright protection.']
},
{
 topic:'Ideas and expression', stage:'Event promotion', title:'What belongs on the event page?',
 document:'DRAFT EVENT PAGE · ALEX, DESIGN',
 facts:['Alex’s Liberty Cup page explains the game’s capture-point rules, attacker and healer roles, and respawn system. Beside that explanation, Alex has pasted an official character illustration copied from the publisher’s website.'],
 question:'Which element is protected expression rather than an underlying game idea or rule?',
 options:['The rule that the first team to capture three points wins.','The idea of giving players attacker and healer roles.','The system that lets eliminated players respawn.','The publisher’s specific illustrated character artwork.']
},
{
 topic:'Employee-created work', stage:'Packing the graphics', title:'Who can license Alex’s work?',
 document:'EMPLOYMENT RECORD · EXPLORER ESPORTS',
 facts:['Alex is an employee of Explorer Esports, and creating original promotional graphics is part of Alex’s assigned job duties. No signed agreement changes the usual ownership rule.','Jordan wants to let Liberty Cup use Alex’s new, original team graphics—not any publisher artwork.'],
 question:'Who generally owns Alex’s original graphics under these facts?',
 options:['Explorer Esports, under the employee work-made-for-hire rule.','Alex in every case, because Alex personally drew them.','Liberty Cup, because the graphics will promote its event.','Alex and Explorer Esports automatically share ownership as joint authors.']
},
{
 topic:'Scope of permission', stage:'Broadcast planning', title:'The screenshot permission',
 document:'PERMISSION EMAIL + PRODUCTION PLAN',
 facts:['Publisher email: “You may place still screenshots on the Liberty Cup event page.”','Jordan’s plan: “I also want to livestream the entire championship match with commentary. The permission email does not mention live broadcasts.”'],
 question:'Before approving Jordan’s livestream plan, what is the best next step?',
 options:['Treat screenshot permission as permission for any use of game content.','Proceed because adding commentary automatically makes the broadcast fair use.','Check whether a publisher policy or license also authorizes the live gameplay broadcast.','Proceed because a free-to-watch broadcast cannot raise copyright concerns.']
},
{
 topic:'Music permission', stage:'Sound check', title:'The sponsor’s walk-on song',
 document:'PRODUCTION MESSAGE · JORDAN',
 facts:['For this checkpoint, the gameplay broadcast is authorized. The sponsor has sent a popular commercial song for the team’s entrance.','Jordan says: “I have a paid personal music subscription. I can play the song from my account during our stream.”'],
 question:'What should you tell Jordan before the song is added?',
 options:['The sponsor’s request is enough to authorize the song.','The personal listening subscription also covers the event broadcast.','Giving the artist credit removes the need to check permission.','Check whether the planned use of this song in the stream is separately authorized.']
},
{
 topic:'DMCA: access controls', stage:'Equipment setup', title:'The locked game build',
 document:'TECHNICIAN’S NOTE · RELAYED BY JORDAN',
 facts:['During Liberty Cup setup, the game’s effective access lock prevents a modified build from opening. A technician proposes a tool that bypasses the lock instead of using the game’s approved settings.','Jordan asks which legal issue needs a separate review before the crew uses that tool.'],
 question:'Which framework specifically addresses bypassing that access control?',
 options:['DMCA anti-circumvention rules—bypassing effective access controls.','Copyright registration rules—filing an application for a new work.','Joint-authorship rules—deciding whether creators share ownership.','DMCA notice and takedown—platform responses to content complaints.']
},
{
 topic:'DMCA: notice and takedown', stage:'After the final', title:'“Did we just lose a lawsuit?”',
 document:'PLATFORM NOTIFICATION + CREW MESSAGE',
 facts:['Platform notification: “Your Liberty Cup replay has been removed after we received a copyright notice concerning music in the video.”','Jordan messages: “Does this mean a judge already decided that we infringed?”'],
 question:'What is the most accurate response to Jordan?',
 options:['Yes—the platform can remove a video only after a court decides the case.','No—the platform has acted on a notice; that action is not itself a court judgment.','Yes—the notice automatically establishes that the team owes damages.','No—the platform’s safe harbor automatically protects our team from liability.']
},
{
 topic:'Fair use: identify the concern', stage:'Publishing the recap', title:'The audience’s highlight choice',
 document:'RECAP REVIEW · VIEWER COMMENT',
 facts:['The publisher sells official Liberty Cup highlights. Your crew’s planned analysis recap also includes match clips.','A viewer writes: “If your recap includes all the best match moments, I won’t need to buy the official highlights.”'],
 question:'Which fair-use factor most directly addresses that concern about replacing official highlights?',
 options:['Purpose and character of the use.','Nature of the copyrighted work.','Effect on the potential market.','Amount and substantiality of the portion used.']
}
];
const $ = id => document.getElementById(id);
let saved = null, state = null, busy = false, selected = null, activeQuestion = 0;
let sound = false, audio, previewKey = '', pendingPreview = null;
let calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const knownVersion = v => ['1.0','2.0-basic',VERSION].includes(v);
const questionSet = () => state?.version === VERSION ? cases : legacy;
function notice(text) { $('message').textContent = text; $('message').hidden = !text; }
function write() {
 if (PREVIEW) return true;
 try { localStorage.setItem(STORE, JSON.stringify(saved)); return true; }
 catch { notice('Local saving is blocked. Use a normal browser window so this attempt can be resumed.'); return false; }
}
function screens(name) { ['intro','play','finish'].forEach(id => $(id).hidden = id !== name); }
function setMotion() {
 document.body.classList.toggle('calm',calm);
 $('motion').textContent = calm ? 'Motion off' : 'Motion on';
 $('motion').setAttribute('aria-pressed',String(calm));
}
function tone() {
 if (!sound || calm) return;
 try {
  audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume();
  [392,494,587].forEach((f,i) => { const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.11;
   o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);
   o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.16);
  });
 } catch {}
}
function wagon(animate=false) {
 const score=state?.score || 0;
 $('rig').style.transform=`translate(${20+score*85}px,137px)`;
 $('wagonScore').textContent=`WAGON POINTS ${score} / 8`;
 if (animate) { $('rig').classList.remove('travel');void $('rig').getBoundingClientRect();$('rig').classList.add('travel');tone();setTimeout(()=>$('rig').classList.remove('travel'),1500); }
}
$('motion').onclick=()=>{calm=!calm;setMotion();};setMotion();
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));};
$('plain').onclick=()=>{const off=$('scene').classList.toggle('hidden-scene');$('plain').textContent=off?'Show scenery':'Text view';$('plain').setAttribute('aria-pressed',String(off));};
async function api(body, instructorPreview=false) {
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try {
  const r=await fetch(ENDPOINT+(instructorPreview?'/preview':''),{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',...(instructorPreview?{'x-instructor-key':previewKey}:{})},body:JSON.stringify(body),signal:controller.signal});
  let d;try {d=await r.json();} catch {throw new Error('The server did not return a confirmation. Resume your saved attempt.');}
  if (!r.ok) {const e=new Error(d.error||'Could not confirm this request.');e.code=d.code;e.status=r.status;throw e;}return d;
 } finally {clearTimeout(timer);}
}
function accept(d) {
 if (!d.ok || !knownVersion(d.version) || !Array.isArray(d.responses) || d.answered!==d.responses.length || d.answered<0 || d.answered>8 || !Number.isInteger(d.score) || d.score<0 || d.score>d.answered)
  throw new Error('The question version or saved progress could not be verified. Refresh and resume; do not start over.');
 state=d;
}
function updateProgress() {
 $('points').textContent=`POINTS ${state.score} / 8`;
 $('progress').replaceChildren(...Array.from({length:8},(_,i)=>{const n=document.createElement('span');n.className=i<state.answered?'done':'';return n;}));
}
function render() {
 notice('');if (state.complete) {finish();return;}
 screens('play');activeQuestion=state.answered+1;selected=null;
 const item=questionSet()[state.answered];
 $('qProgress').textContent=`QUESTION ${activeQuestion} OF 8`;updateProgress();
 const isStory=state.version===VERSION;
 $('mission').hidden=!isStory;$('legacyNotice').hidden=isStory;
 $('topic').textContent=item.topic;$('stage').textContent=item.stage;$('title').textContent=item.title;
 $('documentLabel').textContent=item.document;$('facts').replaceChildren(...item.facts.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
 $('question').textContent=item.question;$('options').replaceChildren();
 item.options.forEach((text,i)=>{
  const label=document.createElement('label');label.className='option';
  const radio=document.createElement('input');radio.type='radio';radio.name='choice';radio.value=i;
  radio.onchange=()=>{selected=i;$('lock').disabled=false;};
  const letter=document.createElement('span');letter.className='letter';letter.textContent=String.fromCharCode(65+i);
  const copy=document.createElement('span');copy.textContent=text;label.append(radio,letter,copy);$('options').append(label);
 });
 $('choices').disabled=false;$('lock').hidden=false;$('lock').disabled=true;$('lock').textContent='Lock answer';
 $('feedback').hidden=true;$('retry').hidden=true;$('saveStatus').textContent='You can change your choice until you lock it.';
 wagon();$('title').focus({preventScroll:true});
}
function finish() {
 screens('finish');wagon();notice('');
 $('finishName').textContent=PREVIEW?'Instructor preview · no student record created':`${state.firstName} ${state.lastName} · ${state.email}`;
 $('finalScore').textContent=`${state.score} / 8`;
 $('finishTitle').textContent=PREVIEW?'Preview complete. Nothing was graded.':'Your score is saved.';
 $('copy').hidden=PREVIEW;$('forget').hidden=PREVIEW;$('previewAgain').hidden=!PREVIEW;
 $('receipt').hidden=PREVIEW;$('clearNote').hidden=PREVIEW;
 $('submitted').textContent=PREVIEW?'This walkthrough does not save names, responses, or scores to the gradebook.':'Server confirmed '+new Date(state.submittedAt).toLocaleString();
 if (!PREVIEW) {
  if (!state.receipt) {notice('A receipt was not returned. Resume to confirm submission.');return;}
  $('receipt').textContent=state.receipt;$('copy').textContent='Copy receipt';saved.pending=null;saved.identity=null;write();
 }
}
async function resume() {
 if (busy || !saved?.token || PREVIEW) return;
 busy=true;$('resume').disabled=true;notice('Checking your saved progress…');
 try {
  let d;try {d=await api({action:'resume',attemptToken:saved.token});}
  catch (e) {
   if (e.code==='INVALID_ATTEMPT' && saved.identity) d=await api({action:'start',attemptToken:saved.token,questionSetVersion:saved.version||'2.0-basic',...saved.identity});
   else throw e;
  }
  accept(d);saved.identity=null;saved.version=d.version;
  if (saved.pending && saved.pending.questionNumber<=state.answered) saved.pending=null;
  write();busy=false;render();if (saved.pending && !state.complete) await sendAnswer(saved.pending);
 } catch(e) {
  notice(e.name==='AbortError'?'The connection timed out. Your resume token has been kept. Try Resume saved attempt again.':e.message);
  $('resume').hidden=false;
 } finally {busy=false;$('resume').disabled=false;}
}
$('resume').onclick=resume;
$('identity').onsubmit=async event=>{
 event.preventDefault();if (busy || PREVIEW) return;
 const identity={firstName:$('first').value.trim(),lastName:$('last').value.trim(),email:$('email').value.trim().toLowerCase()};
 if (!identity.firstName || !identity.lastName || !$('honor').checked) {notice('Enter your first and last name and confirm the individual-work statement.');return;}
 if (!/^[^\s@]+@lasalle\.edu$/i.test(identity.email)) {notice('Please use your La Salle email ending in @lasalle.edu.');return;}
 if (saved?.token) {notice('This browser already has a saved attempt. Choose Resume saved attempt.');$('resume').hidden=false;return;}
 saved={token:Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join(''),version:VERSION,identity,pending:null};
 if (!write()) {saved=null;return;}
 busy=true;$('begin').disabled=true;notice('Creating your private attempt…');
 try {accept(await api({action:'start',attemptToken:saved.token,questionSetVersion:VERSION,...identity}));saved.identity=null;saved.version=state.version;write();render();}
 catch(e) {
  if (e.status===400 || e.code==='EXISTING_ATTEMPT') {try{localStorage.removeItem(STORE);}catch{}saved=null;}
  notice(e.name==='AbortError'?'The connection timed out. Use Resume saved attempt; do not start over.':e.message);$('resume').hidden=!saved?.token;
 } finally {busy=false;$('begin').disabled=false;}
};
async function beginPreview() {
 if (busy) return;previewKey=$('previewKey').value.trim();if(!previewKey)return;
 busy=true;$('previewBegin').disabled=true;notice('Opening instructor preview…');
 try {
  const d=await api({action:'start',questionSetVersion:VERSION},true);
  accept(d);pendingPreview=null;render();
 } catch(e) {notice(e.name==='AbortError'?'The connection timed out. Try opening the preview again.':e.message);}
 finally {busy=false;$('previewBegin').disabled=false;}
}
$('previewForm').onsubmit=e=>{e.preventDefault();beginPreview();};
$('previewAgain').onclick=beginPreview;
async function sendAnswer(pending) {
 if (busy) return;busy=true;
 if (PREVIEW) pendingPreview=pending;else {saved.pending=pending;write();}
 $('choices').disabled=true;$('lock').disabled=true;$('lock').textContent=PREVIEW?'Checking…':'Saving…';$('retry').hidden=true;notice('');
 try {
  const prior=state.score;
  if (PREVIEW) {
   const result=await api({action:'answer',questionSetVersion:VERSION,...pending},true);
   const responses=[...state.responses,{question:pending.questionNumber,answerIndex:pending.answerIndex,correct:result.correct}];
   accept({...state,responses,answered:responses.length,score:responses.filter(r=>r.correct).length,complete:responses.length===8});
   pendingPreview=null;showFeedback(result.correct,prior);
  } else {
   const d=await api({action:'answer',attemptToken:saved.token,questionSetVersion:state.version,...pending});
   accept(d);saved.pending=null;write();showFeedback(d.correct,prior);
  }
 } catch(e) {
  notice(e.name==='AbortError'?'The connection timed out before confirmation. Your answer may already be saved. Retry below; it cannot count twice.':e.message);
  $('retry').hidden=false;$('saveStatus').textContent=PREVIEW?'Waiting for the preview response.':'Waiting for server confirmation. Your selected answer is kept.';
 } finally {busy=false;}
}
function showFeedback(correct,prior) {
 wagon(state.score>prior);updateProgress();$('lock').hidden=true;
 $('saveStatus').textContent=PREVIEW?`Preview only · ${state.answered} of 8 answered`:`Saved to your instructor · ${state.answered} of 8 answered`;
 $('feedback').className='feedback'+(correct?'':' miss');
 $('feedbackTitle').textContent=correct?'One point. Wagon rolling!':'Answer saved. Keep going.';
 if(PREVIEW&&!correct)$('feedbackTitle').textContent='No point on this preview question.';
 $('feedbackText').textContent=correct?'Your wagon advanced one trail segment.':'No point this time. There is no extra penalty, and you can still complete every question.';
 $('next').textContent=state.complete?(PREVIEW?'View preview result':'View saved score'):'Next checkpoint';$('feedback').hidden=false;$('next').focus({preventScroll:true});
}
$('lock').onclick=()=>{if(selected!==null&&!busy)sendAnswer({questionNumber:activeQuestion,answerIndex:selected});};
$('retry').onclick=()=>{const p=PREVIEW?pendingPreview:saved?.pending;if(p)sendAnswer(p);};
$('next').onclick=()=>{if(!busy)render();};
$('copy').onclick=async()=>{
 const text=`SPM 370 Legal Literacy Check 2\n${state.firstName} ${state.lastName}\n${state.email}\nVersion: ${state.version}\nScore: ${state.score}/8\nReceipt: ${state.receipt}`;
 try {await navigator.clipboard.writeText(text);$('copy').textContent='Receipt copied';}catch{notice('Select and copy the receipt displayed above.');}
};
$('forget').onclick=()=>{if(confirm('Remove only this browser’s resume token? Your official score stays saved with your instructor.')){localStorage.removeItem(STORE);location.reload();}};
if (PREVIEW) {
 $('previewBanner').hidden=false;$('previewForm').hidden=false;$('identity').hidden=true;
 try {$('previewKey').value=sessionStorage.getItem('spm370_llc2_teacher_v2')||'';}catch{}
} else {
 try {saved=JSON.parse(localStorage.getItem(STORE)||'null');if(!saved?.token){const old=JSON.parse(localStorage.getItem('spm370_llc2_attempt_v1')||'null');if(old?.token)saved={token:old.token,version:'1.0',pending:null};}}catch{}
 const incoming=new URLSearchParams(location.hash.slice(1)).get('resume');
 if(incoming&&/^[a-f0-9]{48}$/i.test(incoming)){saved={token:incoming,pending:null};write();history.replaceState(null,'',location.pathname+location.search);}
 if(saved?.token){$('resume').hidden=false;resume();}
}
})();
