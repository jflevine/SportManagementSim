import {createHandler} from './handler.mjs';
import {createSupabaseStore} from './supabase-store.mjs';
import {deploymentConfig} from './deployment-config.mjs';
const expectedProject = 'https://havsvkhddvdbzbsmhqbr.supabase.co';
function existingRuntimeKey() {
  let key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY');
  if (!key) {try {key = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;} catch {}}
  return key;
}
const serverKey = existingRuntimeKey();
const configured = Deno.env.get('SUPABASE_URL') === expectedProject && Boolean(serverKey);
const store = configured ? createSupabaseStore({url: expectedProject, serviceRoleKey: serverKey}) : null;
Deno.serve(createHandler({store, instructorKeyHash: deploymentConfig.instructorKeyHash}));
