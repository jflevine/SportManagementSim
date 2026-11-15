// simkit kernel — a simulation is an append-only ledger of events plus a casefile.
//
// The kernel is pure and has no imports, so the same file runs in the browser
// (offline preview), in Node (tests) and in a Supabase Edge Function (class use).
//
//   reduce(casefile, events)            -> state   (who knows what, commitments, trust, clock…)
//   plan(casefile, events, action, acts) -> new events caused by one student action
//   briefFor(casefile, state, actorId)   -> what one character knows and wants right now
//   studentView / causalChain            -> what the student may see; why something happened
//
// Rules decide WHAT happens. Voices (AI or authored) only decide HOW it is said.

export const YOU = 'you';

export function initialState(cf) {
  const knows = { [YOU]: {} };
  for (const id of Object.keys(cf.actors)) knows[id] = {};
  for (const [fid, f] of Object.entries(cf.facts)) {
    for (const who of f.initial || []) knows[who][fid] = { seq: 0, t: cf.clock.start, via: 'start' };
  }
  const trust = {};
  for (const [id, a] of Object.entries(cf.actors)) trust[id] = a.trust ?? 0;
  return {
    t: cf.clock.start, seq: 0, knows, trust, flags: {}, commitments: {}, threads: {}, docs: {},
    acts: [], fired: {}, timers: {}, notes: [], ended: null, submitted: null, lastStudentSeq: 0,
  };
}

function applyEvent(s, e) {
  s.seq = e.seq; s.t = e.t;
  switch (e.type) {
    case 'student.message':
      (s.threads[e.to] ||= []).push({ from: YOU, text: e.text, seq: e.seq, t: e.t, acts: e.acts || [] });
      s.lastStudentSeq = e.seq; break;
    case 'actor.message':
      (s.threads[e.from] ||= []).push({ from: e.from, text: e.text, seq: e.seq, t: e.t, source: e.source });
      break;
    case 'fact.learned':
      if (!s.knows[e.who][e.fact]) s.knows[e.who][e.fact] = { seq: e.seq, t: e.t, via: e.via };
      break;
    case 'flag.set': s.flags[e.key] = { value: e.value, seq: e.seq, t: e.t }; break;
    case 'trust.changed': s.trust[e.who] = (s.trust[e.who] ?? 0) + e.delta; break;
    case 'commitment.made': s.commitments[e.id] = { ...e, status: 'open' }; break;
    case 'commitment.resolved': if (s.commitments[e.id]) Object.assign(s.commitments[e.id], { status: e.status, resolvedSeq: e.seq }); break;
    case 'doc.opened': if (!s.docs[e.doc]) s.docs[e.doc] = { seq: e.seq, t: e.t }; s.lastStudentSeq = e.seq; break;
    case 'student.act': s.acts.push({ id: e.act, params: e.params, seq: e.seq, t: e.t }); s.lastStudentSeq = e.seq; break;
    case 'rule.fired': s.fired[e.rule] = e.seq; break;
    case 'timer.set': s.timers[e.id] = { at: e.at, seq: e.seq }; break;
    case 'timer.cancelled': case 'timer.due': delete s.timers[e.id]; break;
    case 'note': s.notes.push({ text: e.text, seq: e.seq, t: e.t }); break;
    case 'run.ended': s.ended = { reason: e.reason, seq: e.seq, t: e.t }; break;
    case 'run.submitted': s.submitted = { memo: e.memo, seq: e.seq, t: e.t }; s.lastStudentSeq = e.seq; break;
  }
  return s;
}

export function reduce(cf, events, uptoSeq = Infinity) {
  const s = initialState(cf);
  for (const e of events) { if (e.seq > uptoSeq) break; applyEvent(s, e); }
  return s;
}

// ---- helpers a casefile's rules can use -------------------------------------------------
export const knows = (s, who, fact) => !!s.knows[who]?.[fact];
export const flag = (s, key) => s.flags[key]?.value;
export const did = (s, actId) => s.acts.some(a => a.id === actId);
export const open = (s, commitmentId) => s.commitments[commitmentId]?.status === 'open';

// ---- planning: one student action -> the events it causes -------------------------------
// `acts` is the list of speech-act ids found in a message (by AI or by the casefile's patterns).
export function plan(cf, events, action, acts = []) {
  const s = reduce(cf, events);
  if (action.type === 'start' && events.length) throw problem('This run has already started.');
  if (s.submitted) throw problem('This file has already been submitted.');
  if (s.ended && action.type !== 'submit') throw problem('Time has run out. Write and submit your memo.');
  const out = [];
  const emit = (e, at = s.t) => { const ev = { ...e, seq: s.seq + 1, t: at }; out.push(ev); applyEvent(s, ev); return ev; };

  const runEffects = (effects, because, rule) => {
    for (const fx of effects || []) {
      const meta = { because, ...(rule ? { rule } : {}) };
      if (fx.say) emit({ type: 'actor.message', from: fx.say.from, text: fx.say.text, must: fx.say.must || fx.say.text, voice: fx.say.voice !== false, source: 'authored', ...meta });
      else if (fx.learn) { if (!knows(s, fx.learn.who, fx.learn.fact)) emit({ type: 'fact.learned', ...fx.learn, ...meta }); }
      else if (fx.flag) emit({ type: 'flag.set', key: fx.flag.key, value: fx.flag.value ?? true, ...meta });
      else if (fx.trust) emit({ type: 'trust.changed', ...fx.trust, ...meta });
      else if (fx.commit) emit({ type: 'commitment.made', ...fx.commit, ...meta });
      else if (fx.resolve) { if (open(s, fx.resolve.id)) emit({ type: 'commitment.resolved', ...fx.resolve, ...meta }); }
      else if (fx.after !== undefined) { if (!s.timers[fx.id]) emit({ type: 'timer.set', id: fx.id, at: s.t + fx.after, ...meta }); }
      else if (fx.at !== undefined) { if (!s.timers[fx.id]) emit({ type: 'timer.set', id: fx.id, at: fx.at, ...meta }); }
      else if (fx.cancel) { if (s.timers[fx.cancel]) emit({ type: 'timer.cancelled', id: fx.cancel, ...meta }); }
      else if (fx.note) emit({ type: 'note', text: fx.note, ...meta });
      else if (fx.end) { if (!s.ended) emit({ type: 'run.ended', reason: fx.end, ...meta }); }
    }
  };

  // After every event, give each rule that has not fired yet a chance to react.
  let cursor = 0;
  const settle = () => {
    while (cursor < out.length) {
      const ev = out[cursor++];
      for (const rule of cf.rules) {
        if (s.fired[rule.id] && rule.once !== false) continue;
        let hit = false;
        try { hit = rule.when(s, ev); } catch { hit = false; }
        if (!hit) continue;
        const fired = emit({ type: 'rule.fired', rule: rule.id, why: rule.why, because: [ev.seq] });
        runEffects(rule.then(s, ev), [fired.seq], rule.id);
      }
    }
  };

  const advanceTo = target => {
    for (;;) {
      const due = Object.entries(s.timers).filter(([, v]) => v.at <= target).sort((a, b) => a[1].at - b[1].at || a[1].seq - b[1].seq)[0];
      if (!due) break;
      const [id, v] = due;
      const ev = emit({ type: 'timer.due', id, because: [v.seq] }, Math.max(s.t, v.at));
      const fn = cf.timers[id];
      if (fn) runEffects(fn(s), [ev.seq], `timer:${id}`);
      settle();
    }
    if (target > s.t) emit({ type: 'clock', because: [] }, target);
    if (s.t >= cf.clock.end && !s.ended) { emit({ type: 'run.ended', reason: 'deadline', because: [] }); settle(); }
  };

  const cost = cf.costs || {};
  if (action.type === 'start') {
    const ev = emit({ type: 'run.started', because: [] });
    runEffects(cf.opening ? cf.opening(s) : [], [ev.seq], 'opening'); settle();
  } else if (action.type === 'open') {
    const doc = cf.documents[action.doc];
    if (!doc || (doc.available && !doc.available(s))) throw problem('That document is not available to you.');
    const first = !s.docs[action.doc];
    emit({ type: 'doc.opened', doc: action.doc, because: [] });
    for (const f of doc.reveals || []) runEffects([{ learn: { who: YOU, fact: f, via: `doc:${action.doc}` } }], [s.seq]);
    settle(); advanceTo(s.t + (first ? (doc.cost ?? cost.open ?? 5) : 0));
  } else if (action.type === 'message') {
    if (!cf.actors[action.to] || cf.actors[action.to].reachable === false) throw problem('You cannot reach that person from here.');
    const text = String(action.text || '').trim().slice(0, cf.limits?.message ?? 900);
    if (!text) throw problem('Write a message first.');
    const valid = acts.filter(a => cf.speechActs[a] && (!cf.speechActs[a].to || cf.speechActs[a].to.includes(action.to)));
    const msg = emit({ type: 'student.message', to: action.to, text, acts: valid, because: [] });
    settle();
    // If no rule made this person answer, they answer for themselves (voice fills it in).
    if (!out.some(e => e.type === 'actor.message' && e.from === action.to && e.seq > msg.seq)) {
      const fb = cf.fallbackReply ? cf.fallbackReply(s, action.to, text) : '…';
      emit({ type: 'actor.message', from: action.to, text: fb, must: null, voice: true, free: true, source: 'authored', because: [msg.seq] });
      settle();
    }
    advanceTo(s.t + (cost.message ?? 10));
  } else if (action.type === 'act') {
    const act = cf.acts[action.act];
    if (!act || (act.available && !act.available(s))) throw problem('That action is not available right now.');
    const params = act.clean ? act.clean(action.params || {}, s) : (action.params || {});
    const ev = emit({ type: 'student.act', act: action.act, params, because: [] });
    if (act.effect) runEffects(act.effect(s, params), [ev.seq]);
    settle(); advanceTo(s.t + (act.cost ?? cost.act ?? 10));
  } else if (action.type === 'wait') {
    const next = Object.values(s.timers).map(v => v.at).sort((a, b) => a - b)[0];
    advanceTo(Math.min(cf.clock.end, next ?? cf.clock.end));
  } else if (action.type === 'submit') {
    const memo = cf.cleanMemo ? cf.cleanMemo(action.memo || {}) : action.memo;
    emit({ type: 'run.submitted', memo, because: [] });
    if (cf.afterSubmit) { runEffects(cf.afterSubmit(s), [s.seq], 'aftermath'); settle(); }
  } else throw problem('Unknown action.');
  return out;
}

export function problem(message, status = 400) { const e = new Error(message); e.status = status; e.public = true; return e; }

// ---- what one character knows and wants at a given moment -------------------------------
// This is the whole of what a voice (AI or human reader) is given about the world.
export function briefFor(cf, s, actorId) {
  const a = cf.actors[actorId];
  const facts = Object.entries(s.knows[actorId] || {}).map(([fid, k]) => ({ id: fid, text: cf.facts[fid].text, how: k.via, t: k.t, guarded: typeof cf.facts[fid].guarded === 'function' ? !!cf.facts[fid].guarded(s, actorId) : false }));
  const concern = typeof a.concern === 'function' ? a.concern(s) : a.concern;
  return {
    id: actorId, name: a.name, role: a.role, channel: a.channel, voice: a.voice, wants: a.wants, fears: a.fears,
    concern, trust: s.trust[actorId] ?? 0, knows: facts,
    thread: (s.threads[actorId] || []).slice(-8).map(m => ({ from: m.from === YOU ? 'student' : a.name, text: m.text })),
  };
}

// ---- views ------------------------------------------------------------------------------
const STUDENT_VISIBLE = new Set(['student.message', 'actor.message', 'doc.opened', 'student.act', 'note', 'clock', 'run.ended', 'run.submitted', 'commitment.made']);

export function studentView(cf, events) {
  const s = reduce(cf, events);
  const revealed = !!s.submitted;
  const visible = events.filter(e => revealed || STUDENT_VISIBLE.has(e.type) || (e.type === 'fact.learned' && e.who === YOU))
    .map(e => revealed ? e : strip(e));
  const acts = Object.entries(cf.acts).filter(([, a]) => !a.available || a.available(s))
    .map(([id, a]) => ({ id, label: a.label, blurb: a.blurb, cost: a.cost ?? cf.costs?.act ?? 10, fields: a.fields || [] }));
  const documents = Object.entries(cf.documents).filter(([, d]) => !d.available || d.available(s))
    .map(([id, d]) => ({ id, title: d.title, kind: d.kind, opened: !!s.docs[id], body: s.docs[id] ? d.body : null }));
  const people = Object.entries(cf.actors).filter(([, a]) => a.reachable !== false)
    .map(([id, a]) => ({ id, name: a.name, role: a.role, channel: a.channel }));
  return {
    caseId: cf.id, version: cf.version, title: cf.title, seq: s.seq, t: s.t, clock: cf.clock,
    ended: s.ended, submitted: s.submitted, events: visible, acts, documents, people,
    nextEventAt: Object.values(s.timers).length ? 'pending' : null,
    debrief: revealed && cf.outcome ? cf.outcome(s, events) : null,
  };
}
function strip(e) { const { must, rule, because, free, why, ...rest } = e; return rest; }

// Walk backwards from an event through `because` links: the hindsight explanation.
export function causalChain(events, seq) {
  const by = new Map(events.map(e => [e.seq, e]));
  const chain = []; const seen = new Set(); let frontier = [seq];
  while (frontier.length) {
    const n = frontier.shift(); if (seen.has(n)) continue; seen.add(n);
    const e = by.get(n); if (!e) continue; chain.push(e);
    frontier.push(...(e.because || []));
  }
  return chain.sort((a, b) => a.seq - b.seq);
}

// Who knew what, as of a moment — for the instructor's inspector.
export function knowledgeAt(cf, events, seq) {
  const s = reduce(cf, events, seq);
  return Object.fromEntries(Object.entries(s.knows).map(([who, m]) => [who, Object.keys(m)]));
}

export function formatClock(cf, t) {
  const days = cf.clock.days || ['Day 1', 'Day 2', 'Day 3'];
  const d = Math.floor(t / 1440), m = t % 1440, h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
  return `${days[d] || 'Day ' + (d + 1)} ${((h + 11) % 12) + 1}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}
