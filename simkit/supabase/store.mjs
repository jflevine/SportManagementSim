// Supabase store: the same contract as stores.mjs, backed by simkit_runs / simkit_events.
// Uses PostgREST directly with the service-role key (server-side only; never in a browser).
export function createSupabaseStore({ url, key, fetcher = fetch }) {
  const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const rest = async (path, init = {}) => {
    const r = await fetcher(`${url}/rest/v1/${path}`, { ...init, headers: { ...h, ...(init.headers || {}) } });
    if (!r.ok) throw new Error(`store ${r.status}`);
    const text = await r.text();
    return text ? JSON.parse(text) : null;
  };
  const toRun = r => r && ({ id: r.id, caseId: r.case_id, caseVersion: r.case_version, team: r.team, members: r.members, classCode: r.class_code, mode: r.mode, joinCode: r.join_code, tokenHashes: r.token_hashes, createdAt: r.created_at });
  const q = encodeURIComponent;
  return {
    async createRun(run) {
      await rest('simkit_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ id: run.id, case_id: run.caseId, case_version: run.caseVersion, team: run.team, members: run.members, class_code: run.classCode, mode: run.mode, join_code: run.joinCode, token_hashes: run.tokenHashes, created_at: run.createdAt }) });
    },
    async getRun(id) { if (!/^[0-9a-f-]{36}$/i.test(id)) return null; return toRun((await rest(`simkit_runs?id=eq.${q(id)}&limit=1`))[0]); },
    async getRunByJoinCode(code) { return toRun((await rest(`simkit_runs?join_code=eq.${q(code)}&limit=1`))[0]); },
    async addToken(id, hash) {
      const run = await this.getRun(id);
      await rest(`simkit_runs?id=eq.${q(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ token_hashes: [...run.tokenHashes, hash].slice(-12) }) });
    },
    async events(id) { return (await rest(`simkit_events?run_id=eq.${q(id)}&select=body&order=seq.asc`)).map(r => r.body); },
    async append(id, expectedSeq, requestId, events) {
      return rest('rpc/simkit_append', { method: 'POST', body: JSON.stringify({ p_run: id, p_expected: expectedSeq, p_request: requestId, p_events: events }) });
    },
    async listRuns(caseId, classCode) {
      return (await rest(`simkit_runs?case_id=eq.${q(caseId)}${classCode ? `&class_code=eq.${q(classCode)}` : ''}&order=created_at.asc&limit=200`)).map(toRun);
    },
    async countRunsSince(iso) { return (await rest(`simkit_runs?created_at=gte.${q(iso)}&select=id&limit=401`)).length; },
    async setting(name) { return (await rest(`simkit_settings?key=eq.${q(name)}&select=value&limit=1`))[0]?.value || null; },
  };
}
