/** Service-role-only PostgREST adapter. Do not include it in a client bundle. */
export function createSupabaseStore({ url, serviceRoleKey, fetchImpl = fetch }) {
  const endpoint = new URL('/rest/v1/mgt340_kc2_submissions', url);
  if (endpoint.protocol !== 'https:' || !serviceRoleKey) throw new Error('Server database configuration is incomplete');
  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' };
  return {
    async insert(row, { signal }) {
      const response = await fetchImpl(endpoint, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(row), signal, redirect: 'error' });
      if (response.status === 201) return 'inserted';
      const detail = await response.json().catch(() => null);
      if (response.status === 409 && detail?.code === '23505') return 'conflict';
      throw new Error('Submission save failed');
    },
    async findAttempt(attemptId, { signal }) {
      const lookup = new URL(endpoint);
      lookup.searchParams.set('attempt_id', `eq.${attemptId}`);
      lookup.searchParams.set('select', 'attempt_id,assessment_version,first_name,last_name,email,answers,client_started_at,receipt');
      lookup.searchParams.set('limit', '1');
      const response = await fetchImpl(lookup, { method: 'GET', headers, signal, redirect: 'error' });
      if (!response.ok) throw new Error('Submission retry lookup failed');
      const rows = await response.json();
      if (!Array.isArray(rows) || rows.length > 1) throw new Error('Invalid retry lookup');
      return rows[0] || null;
    },
  };
}
