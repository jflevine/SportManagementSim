import {config} from './config.js';
import {assessment} from './questions.js';
import {cleanIdentity, identityError, validAnswers, validResult, recoverState, buildPayload, escapeHTML as esc, STORAGE_PREFIX} from './model.js';

const $ = id => document.getElementById(id);
const questions = assessment.questions;
const pilotRequested = ['pilot','demo'].some(key => new URLSearchParams(location.search).get(key) === '1');
const preview = pilotRequested || !config.submissionEndpoint;
const storageKey = STORAGE_PREFIX + config.assessmentVersion + (preview ? ':preview' : ':live');
let state = null;
let inFlight = false;
let storageOK = true;
try { state = recoverState(sessionStorage.getItem(storageKey), config.assessmentVersion, preview); } catch { storageOK = false; }
$('storageNotice').hidden = storageOK;
$('modeNotice').textContent = pilotRequested ? 'Instructor preview · Try all ten decisions. No name or email is collected, nothing is submitted, and no grade is issued.' : preview ? 'Instructor preview · Official submissions are not connected. This preview does not collect a name, send responses, or issue a grade.' : 'Individual knowledge check · Your official submission is complete only when a server receipt appears.';
const stageCaptions = ['Chapters 5 and 6', 'Legal duties and risk management', 'Ethical reasoning and stakeholders', 'Review before submitting', 'Submission recorded'];
function save() {
  if (!state) return false;
  try { const encoded = JSON.stringify(state); sessionStorage.setItem(storageKey, encoded); if (sessionStorage.getItem(storageKey) !== encoded) throw new Error('Recovery not confirmed'); storageOK = true; $('storageNotice').hidden = true; return true; } catch { storageOK = false; $('storageNotice').hidden = false; return false; }
}
function announce(text) { $('announcement').textContent = text; }
function focusHeading() { const h = $('screen').querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({preventScroll:true}); } }
function setScene(phase) {
  document.querySelector('.arena').className = 'arena assessment-mark' + (phase === 2 ? ' phase-ethics' : phase === 4 ? ' phase-finish' : '');
  $('sceneCaption').textContent = stageCaptions[phase];
}
function move(hash, replace = false) {
  if (replace) history.replaceState(null, '', hash);
  else history.pushState(null, '', hash);
  render();
  focusHeading();
  window.scrollTo({top: Math.min($('screen').getBoundingClientRect().top + window.scrollY - 16, window.scrollY), behavior:'instant'});
}
function progress(index, label) {
  const complete = state.answers.filter(a => a !== null).length;
  return `<div class="progress-label"><span>${label}</span><span>${complete}/10 answered</span></div><div class="progress" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${complete}"><span style="width:${complete * 10}%"></span></div>`;
}
function intro() {
  setScene(0);
  $('screen').innerHTML = `<div class="eyebrow">Chapters 5 and 6 · Individual assessment</div><h2>Legal and ethical responsibilities.</h2><p class="lede">${esc(assessment.intro)}</p><div class="brief-cards"><div><strong>12–15 min</strong>Suggested time</div><div><strong>10 points</strong>1 per question</div><div><strong>Just you</strong>Individual work</div></div><p class="explain">Choose one answer for each question. You can go back and change answers before submitting. Legal and ethics each count for 5 points. Your score and explanations appear after your submission is saved. This is individual work; use only resources your instructor permits. There is no countdown or speed bonus.</p>${preview ? `<div class="submission-state"><strong>${pilotRequested ? 'Preview every question' : 'Review the experience'}</strong><p>${pilotRequested ? 'This pilot keeps answers in this tab only. Official scoring is available in the student version.' : 'Questions work in this preview. Final grading stays off until the instructor activates secure submission.'}</p></div><button id="start" class="btn" type="button">Preview the ten questions <span aria-hidden="true">→</span></button>${pilotRequested && config.submissionEndpoint ? '<p class="save-note"><a href="./">Open the student version</a></p>' : ''}` : `<form id="identityForm" class="identity"><div class="identity-grid"><label class="field">First name<input id="firstName" name="given-name" autocomplete="given-name" required maxlength="60"></label><label class="field">Last name<input id="lastName" name="family-name" autocomplete="family-name" required maxlength="60"></label><label class="field full">La Salle email<input id="email" name="email" type="email" autocomplete="email" required maxlength="120" placeholder="you@lasalle.edu"></label></div><label class="check"><input id="honor" type="checkbox" required><span>I’m completing this knowledge check individually and following my instructor’s resource rules.</span></label><p class="explain">When you submit, your name, La Salle email, answers, scores, timing, and receipt are sent to your instructor’s private course record. Use your own university email. Your identity is self-reported.</p><p class="save-note">A draft stays in this browser tab for refresh recovery. Close the tab or clear the browser copy when you finish on a shared device.</p><p id="identityError" class="error" role="alert"></p><button id="start" class="btn" type="submit">Begin Knowledge Check 3 <span aria-hidden="true">→</span></button><p class="save-note"><a href="?pilot=1">Instructor pilot: try it without submitting</a></p></form>`}`;
  const begin = event => {
    event?.preventDefault();
    const identity = preview ? null : cleanIdentity($('firstName').value, $('lastName').value, $('email').value);
    if (!preview) {
      const error = identityError(identity) || (!$('honor').checked ? 'Confirm the individual-work statement before starting.' : '');
      if (error) { $('identityError').textContent = error; return; }
    }
    if (!crypto.randomUUID) { announce('This browser cannot create a safe submission ID. Use a current browser.'); return; }
    state = {assessmentVersion:config.assessmentVersion, preview, attemptId:crypto.randomUUID(), identity, answers:Array(10).fill(null), clientStartedAt:new Date().toISOString(), status:'answering', result:null};
    save(); move('#q1');
  };
  if (preview) $('start').addEventListener('click', begin); else $('identityForm').addEventListener('submit', begin);
}
function question(index) {
  const q = questions[index];
  setScene(index < 5 ? 1 : 2);
  $('sceneCaption').textContent = q.stage;
  $('screen').innerHTML = `${progress(index, `Question ${index + 1} of 10 · ${index < 5 ? 'Legal' : 'Ethics'}`)}<div class="eyebrow">${esc(q.stage || (index < 5 ? 'Legal responsibilities' : 'Ethical reasoning'))}</div><h2>${esc(q.title)}</h2><p class="story-bridge">${esc(q.transition)}</p><div class="context">${esc(q.context)}${q.facts?.length ? `<div class="fact-strip">${q.facts.map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}</div><form id="questionForm"><fieldset><legend>${esc(q.stem)}</legend>${q.options.map((o, i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${state.answers[index] === i ? 'checked' : ''} required><span class="letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${esc(o.text || o)}</span></label>`).join('')}</fieldset><p id="selectionNote" class="save-note">${state.answers[index] === null ? 'Choose one answer. You can revise it before submitting.' : 'Answer selected. You can revise it before submitting.'}</p><div class="actions split"><button class="btn secondary" id="back" type="button" ${index === 0 ? 'disabled' : ''}>Back</button><button class="btn" id="next" type="submit" ${state.answers[index] === null ? 'disabled' : ''}>${index === 9 ? 'Review all answers' : 'Next decision'} <span aria-hidden="true">→</span></button></div></form>`;
  $('questionForm').addEventListener('change', e => {
    if (e.target.name !== 'answer') return;
    state.answers[index] = Number(e.target.value); save(); $('next').disabled = false;
    $('selectionNote').textContent = 'Answer selected. You can revise it before submitting.';
    const completed = state.answers.filter(a => a !== null).length;
    $('screen').querySelector('.progress-label span:last-child').textContent = `${completed}/10 answered`;
    $('screen').querySelector('.progress').setAttribute('aria-valuenow', String(completed));
    $('screen').querySelector('.progress>span').style.width = `${completed*10}%`;
  });
  $('questionForm').addEventListener('submit', e => {e.preventDefault(); if (state.answers[index] !== null) move(index === 9 ? '#review' : `#q${index+2}`);});
  $('back').addEventListener('click', () => {if (index > 0) move(`#q${index}`);});
}
function review() {
  setScene(3);
  const locked = state.status !== 'answering';
  const complete = validAnswers(state.answers, true);
  $('screen').innerHTML = `${progress(10,'Review your answers')}<div class="eyebrow">Before you submit</div><h2>${locked ? 'Keep this submission together.' : 'Your ten decisions.'}</h2><p class="explain">${locked ? 'Your original answers are locked while the server receipt is being confirmed. Retrying sends the same attempt and cannot create a second score.' : 'Review all ten answers and check your name and email. Each correct response earns 1 point. Your first accepted submission is the official attempt.'}</p>${!preview && state.identity ? `<p class="save-note">Submitting as ${esc(state.identity.firstName)} ${esc(state.identity.lastName)} · ${esc(state.identity.email)}</p>` : ''}<div class="review-list">${questions.map((q,i) => `<div class="review-row"><p><strong>${i+1}. ${esc(q.title)}</strong><small>${state.answers[i] === null ? 'No answer selected' : `${String.fromCharCode(65+state.answers[i])}. ${esc(q.options[state.answers[i]].text || q.options[state.answers[i]])}`}</small></p>${!locked ? `<button type="button" class="btn secondary" data-edit="${i}" aria-label="Change answer to question ${i+1}">Change</button>` : ''}</div>`).join('')}</div><div class="submission-state" id="submissionState" role="status"><strong>${inFlight ? 'Submitting…' : preview ? 'Preview only · Not submitted' : state.status === 'error' ? 'Receipt not confirmed' : 'Ready to submit?'}</strong><p>${inFlight ? 'Keep this page open while the server saves your work.' : preview ? 'This version cannot issue an official score. Your responses are only in this browser tab.' : state.status === 'error' ? 'The server may have received your answers, but this tab has no confirmed receipt. Retry the same submission. If that fails, download your responses and notify your instructor.' : 'A server receipt will confirm that your instructor’s record was saved.'}</p></div><p id="submitError" class="error" role="alert"></p><div class="actions"><button id="submit" class="btn" type="button" ${!complete || inFlight ? 'disabled' : ''}>${inFlight ? 'Saving…' : preview ? 'Finish preview' : locked ? 'Retry same submission' : 'Submit for 10 points'}</button><button id="download" class="btn secondary" type="button">Download responses</button></div><p class="save-note">A downloaded response file is a backup, not proof of official submission.</p>`;
  $('screen').querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>move(`#q${Number(b.dataset.edit)+1}`)));
  $('download').addEventListener('click', download);
  const fallback = document.createElement('button'); fallback.className = 'btn text'; fallback.type = 'button'; fallback.textContent = 'Show text backup'; fallback.addEventListener('click', showBackup); $('download').parentElement.append(fallback);
  $('submit').addEventListener('click', submit);
  if (!preview && !locked) {
    const edit = document.createElement('button'); edit.className = 'btn text'; edit.type = 'button'; edit.textContent = 'Edit my name or email';
    $('screen').querySelector('.review-list').before(edit);
    edit.addEventListener('click', () => {
      edit.disabled = true;
      const form = document.createElement('form'); form.className = 'identity';
      form.innerHTML = '<div class="identity-grid"><label class="field">First name<input id="editFirst" required maxlength="60" autocomplete="given-name"></label><label class="field">Last name<input id="editLast" required maxlength="60" autocomplete="family-name"></label><label class="field full">La Salle email<input id="editEmail" type="email" required maxlength="120" autocomplete="email"></label></div><p class="error" id="editError" role="alert"></p><div class="actions"><button class="btn" type="submit">Save identity</button><button class="btn secondary" id="cancelIdentity" type="button">Cancel</button></div>';
      edit.after(form); $('editFirst').value = state.identity.firstName; $('editLast').value = state.identity.lastName; $('editEmail').value = state.identity.email; $('editFirst').focus();
      $('submit').disabled = true;
      $('cancelIdentity').addEventListener('click', () => {review();focusHeading();});
      form.addEventListener('submit', e => {e.preventDefault();const identity = cleanIdentity($('editFirst').value,$('editLast').value,$('editEmail').value);const error = identityError(identity);if(error){$('editError').textContent=error;return;}state.identity=identity;save();review();focusHeading();announce('Identity updated. Your answers were preserved.');});
    });
  }
}
async function submit() {
  if (inFlight || !validAnswers(state.answers, true)) return;
  if (preview) { state.status = 'preview-complete'; save(); move('#result'); return; }
  state.status = 'pending';
  if (!save()) { state.status = 'error'; review(); $('submitError').textContent = 'Submission paused: this browser cannot save a safe retry copy. No new request was sent. Allow site storage and retry, or download your responses and notify your instructor.'; $('submitError').tabIndex = -1; $('submitError').focus(); return; }
  inFlight = true; review();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    const response = await fetch(config.submissionEndpoint, {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':`Bearer ${config.publicApiKey}`, 'apikey':config.publicApiKey}, body:JSON.stringify(buildPayload(state)), signal:controller.signal, credentials:'omit', cache:'no-store'});
    let result;
    try { result = await response.json(); } catch { throw new Error('The server returned an unreadable response. Retry the same submission.'); }
    if (!response.ok) {
      const duplicate = response.status === 409;
      throw new Error(duplicate ? 'This submission conflicts with an existing attempt. Download your responses and ask your instructor to check the record. No other student’s result can be retrieved here.' : (result.error?.code === 'SUBMISSIONS_UNAVAILABLE' ? 'Official submission is temporarily unavailable. Keep this tab open and notify your instructor.' : 'A server receipt was not confirmed. Retry the same submission or download your responses.'));
    }
    if (!validResult(result, state)) throw new Error('The server receipt did not match this attempt. Keep your backup and notify your instructor.');
    state.result = result; state.status = 'saved'; save();
    inFlight = false; move('#result', true); announce('Official submission saved. Your score and receipt are ready.');
  } catch (error) {
    state.status = 'error'; save(); inFlight = false; review();
    $('submitError').textContent = error.name === 'AbortError' ? 'The connection timed out. Your answers are preserved. Retry to recover the same receipt if the server already saved it.' : error.message;
    $('submitError').tabIndex = -1; $('submitError').focus();
  } finally { clearTimeout(timeout); }
}
function result() {
  const official = state.status === 'saved';
  setScene(official ? 4 : 3);
  const r = state.result?.receipt;
  $('screen').innerHTML = `<div class="eyebrow">${official ? 'Knowledge Check 3 · Recorded' : 'Instructor preview · Finished'}</div><h2>${official ? 'Your knowledge check is saved.' : 'Preview complete.'}</h2>${official ? `<div class="score-block"><div class="score-number">${r.score}<small>/10</small></div><div class="score-label"><strong>Official score</strong><span>Legal ${r.legalScore}/5 · Ethics ${r.ethicsScore}/5</span></div></div><p class="explain">${esc(state.identity.firstName)} ${esc(state.identity.lastName)} · ${esc(state.identity.email)}</p><div class="submission-state" role="status"><strong>Official submission saved</strong><p>The server accepted this attempt. Your instructor has the responses and score.</p></div><div class="receipt"><strong>Server receipt</strong>${esc(r.receiptId)}<br>Saved ${esc(new Date(r.submittedAt).toLocaleString())}</div><div class="actions"><button id="download" class="btn" type="button">Download receipt + answers</button><button id="copy" class="btn secondary" type="button">Copy receipt</button></div><section class="feedback" aria-label="Question feedback"><h3>Learn from the decisions</h3><p class="explain">Each correct answer earned exactly 1 point. Open a question to review its course concept.</p>${state.result.feedback.map((f,i) => `<details><summary><span class="point ${f.correct ? '' : 'miss'}">${f.correct ? '1' : '0'}/1</span> ${i+1}. ${esc(questions[i].title)}</summary><p>Your answer: ${String.fromCharCode(65+f.selectedIndex)}. ${esc(questions[i].options[f.selectedIndex].text || questions[i].options[f.selectedIndex])}</p><p><strong>Correct answer: ${String.fromCharCode(65+f.correctIndex)}. ${esc(questions[i].options[f.correctIndex].text || questions[i].options[f.correctIndex])}</strong></p><p>${esc(f.explanation)}</p></details>`).join('')}</section>` : `<p class="lede">You have reviewed all ten legal and ethical decisions. No student record has been created.</p><div class="submission-state"><strong>No grade issued · Not submitted</strong><p>This is an instructor review, with no student identity collected and no responses sent to a server.</p></div><div class="actions"><button id="download" class="btn secondary" type="button">Download preview responses</button><button id="reviewPreview" class="btn" type="button">Review my choices</button></div>`}<p id="resultNotice" class="save-note" role="status"></p><div class="actions"><button id="clear" class="btn text" type="button">Clear this browser copy</button></div><p class="save-note">${official ? 'Clearing the browser copy does not delete your instructor’s saved record. Download your receipt first.' : 'Clearing removes only this tab’s preview.'}</p>`;
  $('download').addEventListener('click', download);
  const fallback = document.createElement('button'); fallback.className = 'btn text'; fallback.type = 'button'; fallback.textContent = 'Show text backup'; fallback.addEventListener('click', showBackup); $('download').parentElement.append(fallback);
  if (official) $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`MGT 340 Knowledge Check 3\n${state.identity.firstName} ${state.identity.lastName}\nScore: ${r.score}/10 (Legal ${r.legalScore}/5; Ethics ${r.ethicsScore}/5)\nReceipt: ${r.receiptId}\nSubmitted: ${r.submittedAt}`); $('resultNotice').textContent='Receipt copied.';}catch{$('resultNotice').textContent='Clipboard unavailable. Download the receipt or select its text above.';}});
  else $('reviewPreview').addEventListener('click',()=>{state.status='answering';save();move('#review');});
  $('clear').addEventListener('click',()=>{
    if (!confirm('Clear the copy in this browser tab? Download your receipt or responses first. This does not change any server record.')) return;
    try { sessionStorage.removeItem(storageKey); if (sessionStorage.getItem(storageKey) !== null) throw new Error('Clear failed'); } catch { $('resultNotice').textContent = 'This browser would not confirm removal. Close this tab to end the session and clear this site’s browser data on a shared device. Your instructor’s server record is unchanged.'; return; }
    state = null; move('#brief', true); announce('Browser copy cleared.');
  });
}
function responseText() {
  const official = state.status === 'saved';
  const r = state.result?.receipt;
  const lines = ['MGT 340 Knowledge Check 3 — Legal and ethical responsibilities in sport', official ? 'OFFICIAL SUBMISSION: server receipt confirmed' : preview ? 'INSTRUCTOR PREVIEW — NOT SUBMITTED — NO GRADE' : 'RESPONSE BACKUP — SERVER RECEIPT NOT CONFIRMED', '', ...(state.identity ? [`Name: ${state.identity.firstName} ${state.identity.lastName}`, `Email: ${state.identity.email}`] : []), `Assessment: ${state.assessmentVersion}`, `Attempt ID: ${state.attemptId}`, `Started (browser time): ${state.clientStartedAt}`, ...(official ? [`Score: ${r.score}/10`, `Legal: ${r.legalScore}/5`, `Ethics: ${r.ethicsScore}/5`, `Receipt: ${r.receiptId}`, `Submitted (server time): ${r.submittedAt}`] : ['No official score is available. Give this backup to your instructor if requested.']), '', ...questions.flatMap((q,i) => [`${i+1}. ${q.stem}`, state.answers[i] === null ? 'Answer: Unanswered' : `Answer: ${String.fromCharCode(65+state.answers[i])}. ${q.options[state.answers[i]].text || q.options[state.answers[i]]}`, ...(official ? [`Points: ${state.result.feedback[i].correct ? 1 : 0}/1`, `Explanation: ${state.result.feedback[i].explanation}`] : []), '']), 'This browser file is a copy. The instructor’s private server record is authoritative.'];
  return lines.join('\n');
}
function showBackup() {
  let box = $('textBackup');
  if (!box) { box = document.createElement('section'); box.id = 'textBackup'; box.className = 'submission-state'; box.innerHTML = '<label class="field" for="backupText">Copyable response backup</label><p class="save-note">Select the text and save it yourself if downloading does not work.</p><textarea id="backupText" rows="10" readonly></textarea>'; $('screen').append(box); }
  $('backupText').value = responseText(); $('backupText').focus();
}
function download() {
  let url; const a = document.createElement('a');
  try {
    const blob = new Blob([responseText()], {type:'text/plain;charset=utf-8'});
    url = URL.createObjectURL(blob); a.href = url; a.download = `MGT340-KC3-${state.status === 'saved' ? 'receipt' : 'response-backup'}.txt`; document.body.append(a); a.click();
  } catch { showBackup(); announce('Download unavailable. Your copyable response backup is shown.'); }
  finally { a.remove(); if (url) setTimeout(()=>URL.revokeObjectURL(url),1000); }
}
function render() {
  if (!state) { intro(); return; }
  if (state.status === 'saved' || state.status === 'preview-complete') { result(); return; }
  if (state.status === 'pending' || state.status === 'error') { review(); return; }
  const match = /^#q(10|[1-9])$/.exec(location.hash);
  if (match) question(Number(match[1])-1); else if (location.hash === '#review' || validAnswers(state.answers, true)) review(); else question(Math.max(0,state.answers.indexOf(null)));
}
window.addEventListener('popstate',()=>{render();focusHeading();});
window.addEventListener('beforeunload', e => {if (inFlight || (state && !storageOK && state.status !== 'saved')) {e.preventDefault();e.returnValue='';}});
render();

