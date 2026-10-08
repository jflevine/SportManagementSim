import { createClient } from 'npm:@supabase/supabase-js@2.117.1';
import { createHandler } from './server.mjs';
import { databaseStore } from './store.mjs';
const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const instructorKeyHash=Deno.env.get('INSTRUCTOR_KEY_HASH');
if(!serverKey||!instructorKeyHash)throw Error('Configure private server credentials.');
const db=createClient(Deno.env.get('SUPABASE_URL')!,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(createHandler({store:databaseStore(db),instructorKeyHash,rateSecret:serverKey}));
