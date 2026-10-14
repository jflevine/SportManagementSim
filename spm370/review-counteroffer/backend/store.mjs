export function createStore({url, key, fetcher = fetch}) {
  async function request(path, method = 'GET', body) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetcher(`${url}/rest/v1/${path}`, {
        method, signal: controller.signal,
        headers: {apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation'},
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw Object.assign(new Error(result.message || 'Database request failed'), {databaseCode: result.code});
      return result;
    } finally { clearTimeout(timer); }
  }
  return {
    async settings() { return (await request('spm370_counteroffer_settings?id=eq.main&select=*'))[0] || null; },
    async submit(args) { return request('rpc/spm370_counteroffer_submit', 'POST', {args}); },
    async list(onlyId = null) { return request('rpc/spm370_counteroffer_list', 'POST', {only_id: onlyId}); },
    async grade(args) { return request('rpc/spm370_counteroffer_grade', 'POST', {args}); },
    async setOpen(open) { return (await request('spm370_counteroffer_settings?id=eq.main', 'PATCH', {accepts_submissions: open, updated_at: new Date().toISOString()}))[0]; }
  };
}
