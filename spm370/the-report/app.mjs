// THE REPORT — student desk. This file is the interface only; what happens is decided by
// casefile.mjs through the simkit kernel. A different simulation should write a different
// interface: this one is an operations desk because the job is an operations desk.
import cf from './casefile.mjs';
import { connect } from '../../simkit/client.mjs';
import { formatClock, causalChain } from '../../simkit/kernel.mjs';
import { describe, esc } from '../../simkit/describe.mjs';

const first = n => n.split(' ')[0];
const DRAFT = 'thereport.draft.';
const draft = {
  get(k) { try { return sessionStorage.getItem(DRAFT + k) || ''; } catch { return ''; } },
  set(k, v) { try { sessionStorage.setItem(DRAFT + k, v); } catch { /* fine */ } },
};

export async function mount(root, { endpoint = '' } = {}) {
  const sim = await connect({ caseId: cf.id, casefile: cf, endpoint });
  const ui = { pane: { kind: 'thread', id: 'rin' }, busy: false, error: '', notice: '', seen: JSON.parse(draft.get('seen') || '{}'), why: null };
  const view = () => sim.view;
  const fmt = t => formatClock(cf, t);

  function markSeen() { const p = ui.pane; if (p.kind === 'thread') ui.seen[p.id] = view().seq; draft.set('seen', JSON.stringify(ui.seen)); }
  const thread = id => view().events.filter(e => (e.type === 'student.message' && e.to === id) || (e.type === 'actor.message' && e.from === id));
  const unread = id => thread(id).some(e => e.type === 'actor.message' && e.seq > (ui.seen[id] || 0));

  try { await sim.resume(); } catch { ui.error = 'The server could not be reached. Check the connection and reload; your team’s work is saved.'; }
  if (view()) markSeen();
  render();
  // Teammates on other devices share one file: pick up their actions without disturbing typing.
  if (sim.driver.kind === 'remote') setInterval(async () => {
    if (!view() || ui.busy || document.hidden || view().submitted) return;
    const before = view().seq;
    try { await sim.refresh(); } catch { return; }
    if (view().seq === before) return;
    const el = document.activeElement, id = el?.id || el?.name, pos = el?.selectionStart;
    ui.notice = 'A teammate just acted. The file is up to date.'; render();
    const again = id && (root.querySelector('#' + CSS.escape(id)) || root.querySelector(`[name="${id}"]`));
    if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch { /* not a text field */ } }
  }, 6000);


  async function act(action, after) {
    if (ui.busy) return;
    ui.busy = true; ui.error = ''; ui.notice = action.type === 'message' ? 'Sending…' : 'Working…'; render();
    try {
      const before = view().seq;
      await sim.send(action);
      ui.notice = '';
      const fresh = view().events.filter(e => e.seq > before && e.type === 'actor.message');
      const others = [...new Set(fresh.map(e => e.from))].filter(f => !(ui.pane.kind === 'thread' && ui.pane.id === f));
      if (others.length) ui.notice = `New message from ${others.map(o => first(cf.actors[o].name)).join(' and ')}.`;
      after?.(); markSeen();
    } catch (e) {
      ui.notice = '';
      ui.error = e.public ? e.message : 'That did not go through. Nothing was lost and nothing was sent twice. Try again.';
    } finally { ui.busy = false; render(); }
  }

  // ------------------------------------------------------------------ render
  function render() {
    root.innerHTML = view() ? desk() : welcome();
    const log = root.querySelector('.thread-log'); if (log) log.scrollTop = log.scrollHeight;
    const file = root.querySelector('.file-log'); if (file) file.scrollTop = file.scrollHeight;
  }

  function welcome() {
    return `<main class="welcome">
      <p class="kicker">${esc(cf.course)}</p>
      <h1>The Report</h1>
      <p class="lede">You are the <strong>Team Operations Manager</strong> at Harbor City Esports. It is Thursday, 1:10 PM. The Meridian Circuit qualifier is on Saturday.</p>
      <p>Two messages are waiting. One is logistics from your general manager. The other is from an academy player who wants to talk.</p>
      <ul class="plain">
        <li>You can message people, read the organisation’s documents, and take formal steps that leave a dated record.</li>
        <li>Time moves when you act. Other people act on their own clock, with what they know.</li>
        <li>There is no score. On Friday you write a short memo, and then you see what happened to each person and why.</li>
      </ul>
      <p class="small">Everyone here is fictional and an adult. You are a business professional, not a lawyer: work from the organisation’s own documents.</p>
      <form id="start" class="card">
        <label>Team name<input name="team" required maxlength="60" placeholder="e.g. Pod 3"></label>
        <label>Who is on the team<input name="members" maxlength="200" placeholder="First names"></label>
        <label>Class code from your instructor<input name="classCode" maxlength="40" placeholder="e.g. SPM370-TUE"></label>
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Open the desk</button>
      </form>
      <form id="join" class="card slim">
        <label>Joining teammates on another device? Enter the team code<input name="code" maxlength="8" placeholder="6 characters"></label>
        <button ${ui.busy ? 'disabled' : ''}>Join team</button>
      </form>
      ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
      ${sim.driver.kind === 'local' ? '<p class="badge">Offline preview: runs in this browser with prepared voices. Nothing is sent anywhere.</p>' : ''}
    </main>`;
  }

  function desk() {
    const v = view(); const done = !!v.submitted;
    return `<div class="desk">
      <header class="bar">
        <div><strong>Harbor City Esports</strong><span>Operations desk · ${esc(sim.run.team)}</span></div>
        <div class="clock"><b>${fmt(v.t)}</b><span>Travel roster Fri 10:00 AM · League check-in Fri 5:00 PM</span></div>
        <div class="right"><span>Team code <b>${esc(sim.run.joinCode)}</b></span><span class="${sim.online ? 'ok' : 'bad'}">${sim.driver.kind === 'local' ? 'Offline preview' : sim.online ? 'Saved' : 'Reconnecting…'}</span></div>
      </header>
      <nav class="rail" aria-label="Desk">
        <h2>People</h2>
        ${v.people.map(p => `<button class="who ${ui.pane.kind === 'thread' && ui.pane.id === p.id ? 'on' : ''}" data-thread="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.role.split(',')[0])}</span><i>${esc(p.channel)}</i>${unread(p.id) ? '<em aria-label="unread">●</em>' : ''}</button>`).join('')}
        <h2>Documents</h2>
        ${v.documents.map(d => `<button class="doc ${ui.pane.kind === 'doc' && ui.pane.id === d.id ? 'on' : ''}" data-doc="${d.id}"><b>${esc(d.title.split(' — ')[0])}</b><span>${esc(d.kind)}${d.opened ? ' · read' : ''}</span></button>`).join('')}
        ${done ? '' : `<h2>Formal steps</h2>
        ${v.acts.map(a => `<button class="step ${ui.pane.kind === 'act' && ui.pane.id === a.id ? 'on' : ''}" data-act="${a.id}"><b>${esc(a.label)}</b></button>`).join('')}
        <h2>Time</h2>
        <button class="step" data-wait ${ui.busy || v.ended ? 'disabled' : ''}><b>Step away until something happens</b></button>
        <button class="step ${ui.pane.kind === 'memo' ? 'on' : ''}" data-memo><b>Write the memo and close the file</b></button>`}
        ${done ? `<button class="step ${ui.pane.kind === 'debrief' ? 'on' : ''}" data-debrief><b>What happened, and why</b></button>` : ''}
      </nav>
      <section class="pane" aria-live="polite">
        ${ui.notice ? `<p class="notice">${esc(ui.notice)}</p>` : ''}${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ''}
        ${v.ended && !done ? '<p class="notice strong">League check-in has closed. Write your memo and close the file.</p>' : ''}
        ${pane()}
      </section>
      <aside class="file"><h2>Case file</h2><p class="small">What you have done and learned, with times. This is your record.</p><div class="file-log">${caseFile()}</div></aside>
    </div>`;
  }

  function pane() {
    const p = ui.pane, v = view();
    if (p.kind === 'thread') return threadPane(p.id);
    if (p.kind === 'doc') {
      const d = v.documents.find(x => x.id === p.id);
      return `<article class="paper"><p class="kicker">${esc(d.kind)}</p><h1>${esc(d.title)}</h1>${d.body.map(x => `<p>${esc(x)}</p>`).join('')}</article>`;
    }
    if (p.kind === 'act') {
      const a = v.acts.find(x => x.id === p.id); if (!a) return '<p>That step has been taken.</p>';
      return `<form class="formal" id="formal"><p class="kicker">Formal step · takes about ${a.cost} minutes · logged with the time</p><h1>${esc(a.label)}</h1><p>${esc(a.blurb)}</p>
        ${a.fields.map(f => f.type === 'select'
          ? `<label>${esc(f.label)}<select name="${f.id}">${f.options.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select></label>`
          : `<label>${esc(f.label)}<textarea name="${f.id}" maxlength="${f.max}" required rows="5">${esc(draft.get(a.id + f.id))}</textarea></label>`).join('')}
        <button class="primary" ${ui.busy ? 'disabled' : ''}>Send and log</button></form>`;
    }
    if (p.kind === 'memo') return `<form class="formal" id="memo"><p class="kicker">To: Priya Raman, General Manager</p><h1>Memo: closing the file</h1><p>Three short paragraphs. Once you send this, the file closes and you will see what happened next.</p>
      ${cf.memoFields.map(f => `<label>${esc(f.label)}<textarea name="${f.id}" maxlength="900" required rows="4">${esc(draft.get('memo' + f.id))}</textarea></label>`).join('')}
      <button class="primary" ${ui.busy ? 'disabled' : ''}>Send memo and close the file</button></form>`;
    if (p.kind === 'debrief') return debrief();
    return '';
  }

  function threadPane(id) {
    const a = cf.actors[id], v = view(), items = thread(id);
    const style = a.channel === 'Discord DM' ? 'discord' : a.channel === 'Text' ? 'sms' : 'email';
    return `<div class="thread ${style}"><header><h1>${esc(a.name)}</h1><p>${esc(a.role)} · ${esc(a.channel)}</p></header>
      <div class="thread-log" role="log">${items.length ? items.map(e => `<div class="msg ${e.type === 'student.message' ? 'me' : 'them'}"><span class="when">${fmt(e.t)}</span><p>${esc(e.text)}</p></div>`).join('') : `<p class="empty">Nothing yet between you and ${esc(first(a.name))}.</p>`}</div>
      ${v.submitted ? '' : `<form id="compose"><label class="sr" for="msg">Message to ${esc(a.name)}</label><textarea id="msg" maxlength="900" rows="3" placeholder="Write to ${esc(first(a.name))}. What you say is on the record." ${v.ended ? 'disabled' : ''}>${esc(draft.get('msg' + id))}</textarea>
      <div class="row"><span class="small">Sending takes about 10 minutes of your afternoon.</span><button class="primary" ${ui.busy || v.ended ? 'disabled' : ''}>Send</button></div></form>`}</div>`;
  }

  function caseFile() {
    const rows = view().events.map(e => ({ e, d: describe(cf, e) })).filter(({ e, d }) => !d.minor && d.kind !== 'hidden' && e.type !== 'actor.message' && e.type !== 'run.started');
    return rows.map(({ e, d }) => `<div class="entry ${d.kind}"><span class="when">${fmt(e.t)}</span><p>${esc(d.text)}</p></div>`).join('') || '<p class="empty">Nothing on file yet.</p>';
  }

  function debrief() {
    const v = view(), o = v.debrief;
    const whyBlock = seq => {
      if (!seq) return '';
      const chain = causalChain(v.events, seq).map(e => ({ e, d: describe(cf, e) })).filter(x => !x.d.minor || x.d.why);
      return `<details ${ui.why === seq ? 'open' : ''}><summary>Why this happened</summary><ol class="chain">${chain.map(({ e, d }) => `<li class="${d.why ? 'because' : d.kind}"><span class="when">${fmt(e.t)}</span> ${esc(d.text)}</li>`).join('')}</ol></details>`;
    };
    return `<article class="debrief"><p class="kicker">File closed ${fmt(v.submitted.t)} · saved</p><h1>What happened, and why</h1>
      <p class="saved">Your memo was received. Your instructor can see this same page for your team.</p>
      ${o.promise ? `<section class="promise"><h2>What you told Rin</h2><blockquote>“${esc(o.promise.quote)}”</blockquote><p>That promise ended up <strong>${esc(o.promise.status === 'open' ? 'kept' : o.promise.status)}</strong>.</p>${whyBlock(o.promise.resolvedSeq || o.promise.seq)}</section>` : ''}
      ${o.people.map(p => `<section><h2>${esc(p.who)}: ${esc(p.headline)}</h2><p>${esc(p.detail)}</p>${whyBlock(p.seq)}</section>`).join('')}
      ${o.aftermath.length ? `<section><h2>After you closed the file</h2>${o.aftermath.map(n => `<p>${esc(n)}</p>`).join('')}</section>` : ''}
      <section><h2>Something you ${o.priorFound ? 'found' : 'did not find'}</h2><p>${o.priorFound ? 'You learned about March: an earlier informal complaint about the same coach that was never referred.' : 'There was an earlier complaint about the same coach, in March. Two people could have told you, and one record held it.'}</p></section>
      <section><h2>Your memo</h2>${cf.memoFields.map(f => `<h3>${esc(f.label)}</h3><p>${esc(v.submitted.memo[f.id])}</p>`).join('')}</section>
      <button data-leave>Leave this device</button></article>`;
  }

  // ------------------------------------------------------------------ events
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const set = pane => { ui.pane = pane; ui.notice = ''; ui.error = ''; if (pane.kind === 'thread') markSeen(); render(); };
    if (b.dataset.thread) return set({ kind: 'thread', id: b.dataset.thread });
    if (b.dataset.doc) { const d = view().documents.find(x => x.id === b.dataset.doc); return d.opened ? set({ kind: 'doc', id: d.id }) : act({ type: 'open', doc: d.id }, () => { ui.pane = { kind: 'doc', id: d.id }; }); }
    if (b.dataset.act) return set({ kind: 'act', id: b.dataset.act });
    if ('memo' in b.dataset) return set({ kind: 'memo' });
    if ('debrief' in b.dataset) return set({ kind: 'debrief' });
    if ('wait' in b.dataset) return act({ type: 'wait' });
    if ('leave' in b.dataset) { sim.leave(); ui.pane = { kind: 'thread', id: 'rin' }; render(); }
  });
  root.addEventListener('input', e => {
    const t = e.target; if (t.tagName !== 'TEXTAREA') return;
    const p = ui.pane; draft.set(p.kind === 'thread' ? 'msg' + p.id : p.kind === 'memo' ? 'memo' + t.name : p.id + t.name, t.value);
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.id === 'msg') { e.preventDefault(); root.querySelector('#compose')?.requestSubmit(); } });
  root.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, data = Object.fromEntries(new FormData(f));
    if (f.id === 'start' || f.id === 'join') {
      ui.busy = true; ui.error = ''; render();
      try { if (f.id === 'start') await sim.start({ team: data.team, members: data.members, classCode: data.classCode, mode: sim.driver.kind === 'local' ? 'test' : 'live' }); else await sim.join(data.code); markSeen(); }
      catch (err) { ui.error = err.public ? err.message : 'Could not reach the server. Check the connection and try again.'; }
      ui.busy = false; return render();
    }
    if (f.id === 'compose') { const id = ui.pane.id, text = root.querySelector('#msg').value.trim(); if (!text) return; return act({ type: 'message', to: id, text }, () => draft.set('msg' + id, '')); }
    if (f.id === 'formal') { const id = ui.pane.id; return act({ type: 'act', act: id, params: data }, () => { Object.keys(data).forEach(k => draft.set(id + k, '')); ui.pane = { kind: 'thread', id: id === 'refer' ? 'dana' : id === 'recommend' ? 'priya' : ui.lastThread || 'rin' }; }); }
    if (f.id === 'memo') return act({ type: 'submit', memo: data }, () => { ui.pane = { kind: 'debrief' }; });
  });
}
