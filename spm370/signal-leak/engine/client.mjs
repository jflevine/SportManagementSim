// simkit client — what a page uses to talk to a simulation. It imposes no interface.
//
//   const sim = await connect({ caseId, casefile, endpoint });
//   await sim.start({ team, members, classCode });   // or sim.join(code) / sim.resume()
//   await sim.send({ type: 'message', to: 'rin', text });  // safe to retry; never applies twice
//   sim.view  -> what the student may see
//
// With an `endpoint` it talks to the Edge Function. Without one it runs the same handler
// inside this browser tab against localStorage, with authored voices: the offline preview.

import { createHandler } from './handler.mjs';
import { createMemoryStore } from './stores.mjs';
import { authoredVoice } from './voice.mjs';

const mem = {};
const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { mem[k] = v; } },
  del(k) { try { localStorage.removeItem(k); } catch { delete mem[k]; } },
};

export function localDriver(casefile, { storeKey = 'simkit.local.v1', persistence = storage, limits } = {}) {
  const store = createMemoryStore({ load: () => JSON.parse(persistence.get(storeKey) || 'null'), save: db => persistence.set(storeKey, JSON.stringify(db)) });
  const handle = createHandler({ store, cases: { [casefile.id]: casefile }, voice: authoredVoice(), openInstructor: true, limits });
  return { kind: 'local', call: (op, body) => handle(op, body), store };
}

export function remoteDriver(endpoint, { fetcher = (...a) => fetch(...a), anonKey = '' } = {}) {
  return {
    kind: 'remote',
    async call(op, body) {
      const headers = { 'Content-Type': 'application/json', ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}) };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let r, data;
      try {
        r = await fetcher(endpoint, { method: 'POST', headers, signal: controller.signal, body: JSON.stringify({ op, ...body }) });
        data = await r.json().catch(() => ({}));
      } finally { clearTimeout(timeout); }
      if (!r.ok) { const e = new Error(data.error || 'The server could not be reached.'); e.status = r.status; e.public = !!data.error; throw e; }
      return data;
    },
  };
}

export async function connect({ caseId, casefile, endpoint, driver, credentials = storage }) {
  driver ||= endpoint ? remoteDriver(endpoint) : localDriver(casefile);
  const credKey = `simkit.cred.${caseId}.${driver.kind}`;
  const sim = {
    driver, view: null, run: null, online: true,
    creds() { try { return JSON.parse(credentials.get(credKey) || 'null'); } catch { return null; } },
    _adopt(res) { if (res.token) credentials.set(credKey, JSON.stringify({ runId: res.runId, token: res.token })); sim.run = { runId: res.runId, team: res.team, members: res.members, classCode: res.classCode, joinCode: res.joinCode, mode: res.mode }; sim.view = res.view; return res; },
    async start(info) { return sim._adopt(await driver.call('start', { caseId, ...info })); },
    async join(code) { return sim._adopt(await driver.call('join', { joinCode: code })); },
    async resume() {
      const c = sim.creds(); if (!c) return null;
      try { return sim._adopt(await driver.call('view', c)); }
      catch (e) { if (e.status === 401 || e.status === 404) { credentials.del(credKey); return null; } throw e; }
    },
    async refresh() { const c = sim.creds(); return c ? sim._adopt(await driver.call('view', c)) : null; },
    // One student action. The requestId is fixed before the first attempt, so a retry after a
    // dropped connection replays the saved result instead of acting twice.
    async send(action, { requestId = crypto.randomUUID(), tries = 3 } = {}) {
      const c = sim.creds(); if (!c) throw new Error('Not signed in to a team on this device.');
      let lastError;
      for (let i = 0; i < tries; i++) {
        try { const res = await driver.call('act', { ...c, requestId, action }); sim.online = true; return sim._adopt(res); }
        catch (e) { lastError = e; if (e.public || (e.status && e.status < 500 && e.status !== 409)) throw e; sim.online = false; await new Promise(r => setTimeout(r, 600 * (i + 1))); }
      }
      throw lastError;
    },
    leave() { credentials.del(credKey); sim.view = null; sim.run = null; },
    instructor: (key, classCode) => driver.call('instructor.runs', { caseId, key, classCode }),
  };
  return sim;
}
