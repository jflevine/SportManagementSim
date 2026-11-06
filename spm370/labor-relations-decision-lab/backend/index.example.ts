import {createClient} from 'npm:@supabase/supabase-js@2.117.1';
import {createHandler} from './server.mjs';
import {databaseStore} from './store.mjs';
// Deployment reuses the existing course verifier privately. No digest belongs in this repository.
const instructorKeyHash=Deno.env.get('INSTRUCTOR_KEY_HASH');
const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if(!serverKey||!instructorKeyHash)throw Error('Missing existing private server configuration');
const db=createClient(Deno.env.get('SUPABASE_URL')!,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(createHandler({store:databaseStore(db),instructorKeyHash,rateSecret:serverKey}));
