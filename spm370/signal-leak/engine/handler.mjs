// simkit handler — the one server-side entry point, written so it can also run in a
// browser tab (offline preview) or in Node (tests, local dev server).
//
//   const handle = createHandler({ store, cases, voice, instructorKeyHash });
//   const result = await handle('act', { runId, token, requestId, action });
//
// Guarantees the classroom depends on:
//   - every change is an appended event; nothing is edited in place
//   - a retried request (same requestId) never applies twice
//   - two pod members acting at once cannot corrupt the ledger (expected-seq check)
//   - the student view never contains what the student has not been shown

import { plan, reduce, studentView, briefFor, problem } from './kernel.mjs';

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
export const sha256 = async text => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(24)));
const joinCode = () => { const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; return [...crypto.getRandomValues(new Uint8Array(6))].map(b => a[b % a.length]).join(''); };
const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function createHandler({ store, cases, voice, instructorKeyHash = null, openInstructor = false, limits = {} }) {
  const maxEvents = limits.maxEvents ?? 600;
  const caseOf = id => cases[id] || fail('Unknown simulation.', 404);

  async function authed(body) {
    const run = await store.getRun(String(body.runId || ''));
    if (!run) fail('That session was not found on this device. Start again or use your team code.', 404);
    const h = await sha256(String(body.token || ''));
    if (!run.tokenHashes.includes(h)) fail('This device is not signed in to that team.', 401);
    return run;
  }
  const publicRun = run => ({ runId: run.id, team: run.team, members: run.members, classCode: run.classCode, mode: run.mode, joinCode: run.joinCode });

  // Give each character's line its voice. The authored line is always kept as the fallback.
  async function voiceAll(cf, before, fresh) {
    const jobs = fresh.filter(e => e.type === 'actor.message' && e.voice).map(async e => {
      const s = reduce(cf, before.concat(fresh), e.seq - 1);
      const lastStudent = [...before, ...fresh].filter(x => x.type === 'student.message' && x.to === e.from && x.seq < e.seq).pop();
      try {
        const r = await voice.render({ cf, brief: briefFor(cf, s, e.from), authored: e.text, must: e.must, free: !!e.free, studentText: lastStudent?.text || '' });
        if (r?.text) { e.text = r.text; e.source = r.source || 'ai'; }
      } catch { /* keep the authored line */ }
    });
    await Promise.all(jobs);
  }

  async function act(body) {
    const run = await authed(body);
    const cf = caseOf(run.caseId);
    const requestId = clean(body.requestId, 80) || fail('Missing request id.');
    for (let attempt = 0; attempt < 3; attempt++) {
      const events = await store.events(run.id);
      if (events.some(e => e.requestId === requestId)) return { ...publicRun(run), replay: true, view: studentView(cf, events) };
      if (events.length > maxEvents) fail('This session has reached its limit. Submit your memo.');
      const action = body.action || {};
      let acts = [];
      if (action.type === 'message') {
        const s = reduce(cf, events);
        try { acts = await voice.extract({ cf, to: action.to, text: String(action.text || ''), state: s }); }
        catch { acts = cf.detect ? cf.detect(action.to, String(action.text || '')) : []; }
      }
      const wall = new Date().toISOString();
      const fresh = plan(cf, events, action, acts).map(e => ({ ...e, requestId, wall }));
      await voiceAll(cf, events, fresh);
      const expected = events.length ? events[events.length - 1].seq : 0;
      const res = await store.append(run.id, expected, requestId, fresh);
      if (res === 'ok' || res === 'replay') return { ...publicRun(run), replay: res === 'replay', view: studentView(cf, await store.events(run.id)) };
    }
    fail('Your team acted at the same moment on another device. Check the screen and try again.', 409);
  }

  const ops = {
    async health() { return { ok: true, cases: Object.keys(cases), voice: voice.name }; },
    async start(body) {
      const cf = caseOf(body.caseId);
      const team = clean(body.team, 60) || fail('Enter a team name.');
      // Anonymous access is bounded, not proof of enrolment: cap new sessions per day.
      if (await store.countRunsSince(new Date(Date.now() - 864e5).toISOString()) >= (limits.maxRunsPerDay ?? 400)) fail('Too many sessions were started today. Tell your instructor.', 429);
      const token = randomToken();
      const run = {
        id: crypto.randomUUID(), caseId: cf.id, caseVersion: cf.version, team, members: clean(body.members, 200),
        classCode: clean(body.classCode, 40).toUpperCase() || 'OPEN', mode: body.mode === 'live' ? 'live' : 'test',
        joinCode: joinCode(), tokenHashes: [await sha256(token)], createdAt: new Date().toISOString(),
      };
      await store.createRun(run);
      const fresh = plan(cf, [], { type: 'start' }).map(e => ({ ...e, requestId: 'start', wall: run.createdAt }));
      await store.append(run.id, 0, 'start', fresh);
      return { ...publicRun(run), token, view: studentView(cf, fresh) };
    },
    async join(body) {
      const run = await store.getRunByJoinCode(clean(body.joinCode, 12).toUpperCase());
      if (!run) fail('No team has that code.', 404);
      const token = randomToken();
      await store.addToken(run.id, await sha256(token));
      return { ...publicRun(run), token, view: studentView(caseOf(run.caseId), await store.events(run.id)) };
    },
    async view(body) {
      const run = await authed(body);
      return { ...publicRun(run), view: studentView(caseOf(run.caseId), await store.events(run.id)) };
    },
    act,
    async 'instructor.runs'(body) {
      if (!openInstructor) {
        if (!instructorKeyHash || await sha256(String(body.key || '')) !== instructorKeyHash) fail('Instructor key not accepted.', 401);
      }
      const cf = caseOf(body.caseId);
      const runs = await store.listRuns(cf.id, clean(body.classCode, 40).toUpperCase() || null);
      const out = [];
      for (const r of runs) out.push({ ...publicRun(r), createdAt: r.createdAt, events: await store.events(r.id) });
      return { caseId: cf.id, runs: out };
    },
  };

  return async function handle(op, body = {}) {
    const fn = ops[op];
    if (!fn) fail('Unknown operation.', 404);
    return fn(body);
  };
}

function fail(message, status = 400) { throw problem(message, status); }

// HTTP wrapper shared by the Edge Function and the local dev server.
export function httpAdapter(handle, { allowedOrigins = [] } = {}) {
  return async function (request) {
    const origin = request.headers.get('origin') || '';
    const ok = allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const cors = { 'Access-Control-Allow-Origin': ok ? origin : allowedOrigins[0] || 'null', 'Access-Control-Allow-Headers': 'content-type, authorization, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
    const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method === 'GET') return json(200, await handle('health'));
    try {
      const body = await request.json();
      return json(200, await handle(String(body.op || ''), body));
    } catch (e) {
      if (e?.public) return json(e.status || 400, { error: e.message });
      console.error('simkit error', e?.message);
      return json(500, { error: 'Something went wrong on the server. Your work so far is saved; try again.' });
    }
  };
}
