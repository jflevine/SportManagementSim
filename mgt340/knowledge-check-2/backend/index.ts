// Proposed entrypoint for submit-mgt340-kc2. Not deployed by this draft.
// These are server imports, never imports for the GitHub Pages application.
import { createSubmissionHandler, resolveRuntimeConfig } from './handler.mjs';
import { deploymentConfig } from './deployment-config.mjs';
import { createSupabaseStore } from './supabase-store.mjs';

const expectedProject = 'https://havsvkhddvdbzbsmhqbr.supabase.co';
const runtime = resolveRuntimeConfig({
  enabledValue: Deno.env.get('MGT340_KC2_ENABLED'),
  rubricValue: Deno.env.get('MGT340_KC2_RUBRIC'),
}, deploymentConfig);
const approvedFlag = runtime.enabled;
const url = Deno.env.get('SUPABASE_URL');
// Supabase's existing runtime value. Do not print, copy into files, or expose it.
const serviceRoleKey = approvedFlag ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : undefined;
const configured = approvedFlag && url === expectedProject && Boolean(serviceRoleKey);
const store = configured ? createSupabaseStore({ url, serviceRoleKey }) : undefined;

Deno.serve(createSubmissionHandler({
  enabled: configured,
  rubric: runtime.rubric,
  store,
}));
