// Edge Function entry point for every simkit simulation (function name: simkit).
//
// The function is deliberately tiny: it loads the kit and the casefiles straight from this
// public repository at ONE pinned commit. To release new code, change PIN to the new commit
// SHA and redeploy this single file (see simkit/supabase/README.md). Nothing else is uploaded.
//
// verify_jwt is off because the handler checks its own team tokens and instructor key.
// No provider key or service key ever reaches a browser.
const PIN = 'REPLACE_WITH_COMMIT_SHA';
const BASE = `https://raw.githubusercontent.com/jflevine/SportManagementSim/${PIN}/simkit`;

const { createHandler, httpAdapter } = await import(`${BASE}/handler.mjs`);
const { createSupabaseStore } = await import(`${BASE}/supabase/store.mjs`);
const { openaiVoice, authoredVoice } = await import(`${BASE}/voice.mjs`);
const { cases } = await import(`${BASE}/cases.mjs`);

const store = createSupabaseStore({ url: Deno.env.get('SUPABASE_URL') || '', key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '' });
const key = (Deno.env.get('OPENAI_API_KEY') || '').trim().replace(/^OPENAI_API_KEY\s*=\s*/, '').replace(/^["']|["']$/g, '');
const voice = key ? openaiVoice({ key, model: Deno.env.get('SIMKIT_MODEL') || 'gpt-4.1-mini-2025-04-14' }) : authoredVoice();
const origins = (Deno.env.get('SIMKIT_ORIGINS') || 'https://jflevine.github.io').split(',').map((s: string) => s.trim());

Deno.serve(async (req: Request) => {
  // Read the instructor key hash per request so it can be rotated without a redeploy.
  let instructorKeyHash: string | null = null;
  try { instructorKeyHash = await store.setting('instructor_key_hash'); } catch { /* fails closed */ }
  return httpAdapter(createHandler({ store, cases, voice, instructorKeyHash }), { allowedOrigins: origins })(req);
});
