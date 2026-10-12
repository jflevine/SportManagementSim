import {createStore} from './store.mjs';
import {createProvider} from './provider.mjs';
import {createHandler} from './handler.mjs';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const url=Deno.env.get('SUPABASE_URL')||'';
Deno.serve(createHandler({
 store:createStore({url,key}),
 provider:createProvider({key:Deno.env.get('OPENAI_API_KEY'),model:Deno.env.get('SPM370_CONTRACT_MODEL')||'gpt-4.1-mini-2025-04-14'}),
 instructorHash:Deno.env.get('SPM370_CONTRACT_INSTRUCTOR_KEY_HASH'),
 classHash:Deno.env.get('SPM370_CONTRACT_CLASS_CODE_HASH'),
 allowedOrigins:(Deno.env.get('SPM370_CONTRACT_ORIGINS')||'https://jflevine.github.io').split(',').map(s=>s.trim()),
 released:Deno.env.get('SPM370_CONTRACT_RELEASED')==='true'
}));
