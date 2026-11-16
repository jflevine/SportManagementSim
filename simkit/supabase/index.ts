// Edge Function entry point for every simkit simulation (function name: simkit).
//
// The function is deliberately tiny: it loads the kit and the casefiles straight from the
// public repository at ONE pinned commit. To release new code, replace the commit SHA in the
// four import lines below and redeploy this single file (see README.md in this folder).
// The SHA here is the one last deployed by the author of this file; the function that is
// actually running may be pinned to a later commit.
//
// verify_jwt is off because the handler checks its own team tokens and instructor key.
// No provider key or service key ever reaches a browser.
import { createHandler, httpAdapter } from 'https://raw.githubusercontent.com/jflevine/SportManagementSim/2b893bdd2d1ec59825aaecc82de90b1d5d34af3f/simkit/handler.mjs';
import { createSupabaseStore } from 'https://raw.githubusercontent.com/jflevine/SportManagementSim/2b893bdd2d1ec59825aaecc82de90b1d5d34af3f/simkit/supabase/store.mjs';
import { openaiVoice, authoredVoice } from 'https://raw.githubusercontent.com/jflevine/SportManagementSim/2b893bdd2d1ec59825aaecc82de90b1d5d34af3f/simkit/voice.mjs';
import { cases } from 'https://raw.githubusercontent.com/jflevine/SportManagementSim/2b893bdd2d1ec59825aaecc82de90b1d5d34af3f/simkit/cases.mjs';

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
