import {InputError} from './model.mjs';
export function createSupabaseStore({url, serviceRoleKey, fetchImpl = fetch}) {
  if (url !== 'https://havsvkhddvdbzbsmhqbr.supabase.co' || !serviceRoleKey) throw new Error('Invalid server configuration');
  async function request(path, {method = 'GET', body} = {}) {
    const response = await fetchImpl(`${url}/rest/v1/${path}`, {method, headers: {'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json'}, ...(body === undefined ? {} : {body: JSON.stringify(body)}), signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Private storage request failed');
    const data = await response.json();
    if (data?.error) {const codes = new Set(['VERSION_CONFLICT', 'REQUEST_CONFLICT', 'STATE_CONFLICT']); throw new InputError(codes.has(data.error) ? data.error : 'STATE_CONFLICT', 'The operation conflicts with stored work. Refresh and retry safely.', 409);}
    return data;
  }
  return {
    async get(attemptId) {const data = await request(`spm343_tap_lab2_pilot_records?attempt_id=eq.${encodeURIComponent(attemptId)}&select=state&limit=1`); return data[0]?.state || null;},
    async list() {const data = await request('spm343_tap_lab2_pilot_records?select=state&order=attempt_id.asc&limit=2'); return data.map(row => row.state);},
    async replay(attemptId, requestId, hash) {
      const data = await request(`spm343_tap_lab2_operations?attempt_id=eq.${encodeURIComponent(attemptId)}&request_id=eq.${encodeURIComponent(requestId)}&select=request_hash,response&limit=1`);
      if (!data.length) return null;
      if (data[0].request_hash !== hash) throw new InputError('REQUEST_CONFLICT', 'This request identifier was used for a different operation.', 409);
      return data[0].response;
    },
    async apply(value) {return await request('rpc/spm343_tap_lab2_apply', {method: 'POST', body: {p_attempt_id: value.attemptId, p_request_id: value.requestId, p_request_hash: value.requestHash, p_expected_version: value.expectedVersion, p_next: value.next, p_response: value.response, p_publication: value.publication}});},
    async progress(value) {return await request('rpc/spm343_tap_lab2_progress', {method: 'POST', body: {p_format: value.format, p_stage: value.stage}});},
    async guest() {return await request('rpc/spm343_tap_lab2_guest', {method: 'POST', body: {}});}
  };
}
