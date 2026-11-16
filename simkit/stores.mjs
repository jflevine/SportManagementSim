// Stores. A store keeps runs and their append-only event ledgers.
// The memory store backs tests, the local dev server and the in-browser preview
// (pass load/save to persist to localStorage). The Supabase store is in ./supabase/.
//
// Contract every store must honour:
//   append(runId, expectedSeq, requestId, events) -> 'ok' | 'replay' | 'conflict'
//     'replay'   the requestId was already applied; nothing is written
//     'conflict' the ledger moved on since the caller read it; nothing is written

export function createMemoryStore({ load, save } = {}) {
  let db = { runs: {}, events: {} };
  try { const saved = load?.(); if (saved?.runs) db = saved; } catch { /* start empty */ }
  const persist = () => { try { save?.(db); } catch { /* storage may be unavailable */ } };
  return {
    async createRun(run) { db.runs[run.id] = run; db.events[run.id] = []; persist(); },
    async getRun(id) { return db.runs[id] || null; },
    async getRunByJoinCode(code) { return Object.values(db.runs).find(r => r.joinCode === code) || null; },
    async addToken(id, hash) { db.runs[id].tokenHashes.push(hash); persist(); },
    async events(id) { return (db.events[id] || []).map(e => ({ ...e })); },
    async append(id, expectedSeq, requestId, events) {
      const cur = db.events[id]; if (!cur) return 'conflict';
      if (cur.some(e => e.requestId === requestId)) return 'replay';
      const last = cur.length ? cur[cur.length - 1].seq : 0;
      if (last !== expectedSeq) return 'conflict';
      cur.push(...events.map(e => ({ ...e }))); persist(); return 'ok';
    },
    async listRuns(caseId, classCode) {
      return Object.values(db.runs).filter(r => r.caseId === caseId && (!classCode || r.classCode === classCode))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async countRunsSince(iso) { return Object.values(db.runs).filter(r => r.createdAt >= iso).length; },
    _reset() { db = { runs: {}, events: {} }; persist(); },
  };
}
