import {createHandler} from './handler.mjs';
import {createStore} from './store.mjs';
// Credentials for the database are Supabase-managed runtime environment values.
// Activity instructor/class credentials are hashed in the private settings table.
Deno.serve(createHandler({store: createStore({url: Deno.env.get('SUPABASE_URL') || '', key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''})}));
