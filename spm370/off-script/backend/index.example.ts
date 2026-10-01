// Example only. Configure secrets privately in the authorized deployment environment.
import { createClient } from 'npm:@supabase/supabase-js@2.117.1';
import { createHandler } from './server.mjs';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const instructorKeyHash = Deno.env.get('INSTRUCTOR_KEY_HASH');
const url = Deno.env.get('SUPABASE_URL');
if (!serviceKey || !instructorKeyHash || !url) throw new Error('Private deployment configuration is incomplete');
Deno.serve(createHandler({ instructorKeyHash, rateSecret: serviceKey,
  db: () => createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}));
