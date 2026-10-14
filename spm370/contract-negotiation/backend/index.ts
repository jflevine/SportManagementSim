import {createStore} from './store.mjs';
import {createProvider} from './provider.mjs';
import {createHandler} from './handler.mjs';
import {loadAccess} from './access.mjs';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const url=Deno.env.get('SUPABASE_URL')||'';
const store=createStore({url,key});
// Accept a copied dotenv assignment without changing any key characters.
const rawProviderKey=Deno.env.get('OPENAI_API_KEY')||'';
let providerKey=rawProviderKey.trim().replace(/^OPENAI_API_KEY\s*=\s*/, '');
if((providerKey.startsWith('"')&&providerKey.endsWith('"'))||(providerKey.startsWith("'")&&providerKey.endsWith("'")))providerKey=providerKey.slice(1,-1);
const options={
 store,
 provider:createProvider({key:providerKey,model:Deno.env.get('SPM370_CONTRACT_MODEL')||'gpt-4.1-mini-2025-04-14'}),
 allowedOrigins:(Deno.env.get('SPM370_CONTRACT_ORIGINS')||'https://jflevine.github.io').split(',').map(s=>s.trim()),
 released:Deno.env.get('SPM370_CONTRACT_RELEASED')==='true'
};
// Resolve missing access hashes privately per request, so a failed lookup never
// enables access and a corrected configuration does not require an isolate restart.
Deno.serve(async req=>{
 const access=await loadAccess({store,instructorEnv:Deno.env.get('SPM370_CONTRACT_INSTRUCTOR_KEY_HASH'),classEnv:Deno.env.get('SPM370_CONTRACT_CLASS_CODE_HASH')});
 return createHandler({...options,...access})(req);
});
