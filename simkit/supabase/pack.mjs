// Collects the files the Edge Function needs into simkit/supabase/.deploy/ as one flat folder,
// rewriting imports so they resolve there. Run from the repository root:
//   node simkit/supabase/pack.mjs
//   supabase functions deploy simkit --no-verify-jwt --project-ref havsvkhddvdbzbsmhqbr   (from .deploy's parent as configured)
// An AI coding session with the Supabase connector can instead upload the files in .deploy/ directly.
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { cases } from '../cases.mjs';
const out = new URL('./.deploy/', import.meta.url);
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true });
const copy = async (from, to, edit = s => s) => writeFile(new URL(to, out), edit(await readFile(new URL(from, import.meta.url), 'utf8')));
for (const f of ['kernel.mjs', 'handler.mjs', 'voice.mjs']) await copy(`../${f}`, f);
await copy('./store.mjs', 'store.mjs'); await copy('./index.ts', 'index.ts');
const src = await readFile(new URL('../cases.mjs', import.meta.url), 'utf8');
let i = 0; const jobs = [];
const flat = src.replace(/from '\.\.\/([^']+casefile\.mjs)'/g, (_, path) => { const name = `case-${i++}.mjs`; jobs.push(copy(`../../${path}`, name)); return `from './${name}'`; });
await Promise.all(jobs); await writeFile(new URL('cases.mjs', out), flat);
console.log(`Packed ${Object.keys(cases).length} case(s) into simkit/supabase/.deploy/`);
