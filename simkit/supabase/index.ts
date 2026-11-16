// Edge Function entry point for every simkit simulation. Deploy with `node simkit/supabase/pack.mjs`
// (see README there). verify_jwt is off because the handler checks its own team tokens and
// instructor key; no provider key or service key ever reaches a browser.
import { createHandler, httpAdapter } from './handler.mjs';
import { createSupabaseStore } from './store.mjs';
import { openaiVoice, authoredVoice } from './voice.mjs';
import { cases } from './cases.mjs';

const store = createSupabaseStore({ url: Deno.env.get('SUPABASE_URL') || '', key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '' });
let key = (Deno.env.get('OPENAI_API_KEY') || '').trim().replace(/^OPENAI_API_KEY\s*=\s*/, '').replace(/^["']|["']$/g, '');
const voice = key ? openaiVoice({ key, model: Deno.env.get('SIMKIT_MODEL') || 'gpt-4.1-mini-2025-04-14' }) : authoredVoice();
const origins = (Deno.env.get('SIMKIT_ORIGINS') || 'https://jflevine.github.io').split(',').map(s => s.trim());

Deno.serve(async req => {
  // Read the instructor key hash per request so it can be rotated without a redeploy.
  let instructorKeyHash: string | null = null;
  try { instructorKeyHash = await store.setting('instructor_key_hash'); } catch { /* fails closed */ }
  return httpAdapter(createHandler({ store, cases, voice, instructorKeyHash }), { allowedOrigins: origins })(req);
});
