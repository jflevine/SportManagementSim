# simkit on Supabase

Project: `havsvkhddvdbzbsmhqbr` ("MGT 340 Week 2 Knowledge Check"). Function: `simkit`.
Endpoint: `https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/simkit`

## What exists

- `migrations/001_simkit.sql` — applied once. Three tables (`simkit_runs`, `simkit_events`,
  `simkit_settings`) and one function (`simkit_append`). Row-level security on, no browser
  grants. **A new simulation needs no new tables.** Do not rerun or edit this migration;
  add `002_…` if the kit itself ever needs a schema change.
- `index.ts` — the whole Edge Function. It imports the kit and the casefiles from this public
  repository at one pinned commit.
- `store.mjs` — the Supabase store used by the function.

## Releasing new code or a new simulation

1. Merge or push the commit you want students to run. Note its full SHA.
2. In `index.ts`, replace the SHA in the four import lines with that SHA.
3. Redeploy the single file `index.ts` as function `simkit` with JWT verification **off**
   (the handler checks its own tokens). With the Supabase connector: deploy_edge_function,
   name `simkit`, entrypoint `index.ts`, verify_jwt false, one file. With the CLI:
   `supabase functions deploy simkit --no-verify-jwt --project-ref havsvkhddvdbzbsmhqbr`.
4. Open the endpoint in a browser. It should return `{"ok":true,"cases":[…]}` listing your
   simulation.

Student pages go live when the branch is merged to `main` (GitHub Pages serves `main`).

## Settings and secrets

- `OPENAI_API_KEY` is the project's existing server-side secret. If it is missing the
  function still works, with prepared voices.
- The instructor key is stored only as a SHA-256 hash in `simkit_settings`
  (`instructor_key_hash`). To change it, compute the SHA-256 of a new key and update that row.
- `SIMKIT_ORIGINS` (optional) lists allowed page origins; the default is
  `https://jflevine.github.io`. Localhost is always allowed for development.

## Data

Runs carry `mode` (`test` or `live`) and a `class_code`. Team and member names are
self-reported. Events are append-only. To clear fictional test data:
`delete from simkit_runs where mode = 'test';` (events cascade). Never delete `live` rows
without Jeff's say-so.
