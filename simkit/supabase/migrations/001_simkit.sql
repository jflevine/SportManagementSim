-- simkit: one shared, append-only ledger for every simulation built with the kit.
-- A new simulation needs NO new tables: it is a new casefile and a new case_id.
-- Nothing here is readable or writable from a browser; only the Edge Function
-- (service role) can reach these objects.

create table if not exists public.simkit_runs (
  id uuid primary key,
  case_id text not null,
  case_version integer not null,
  team text not null,
  members text not null default '',
  class_code text not null default 'OPEN',
  mode text not null default 'test' check (mode in ('test','live')),
  join_code text not null unique,
  token_hashes text[] not null default '{}',
  created_at timestamptz not null default now()
);
comment on table public.simkit_runs is 'simkit: one row per team run of a simulation. Self-reported team/member names. mode=test rows are fictional. Access only through the simkit Edge Function.';

create table if not exists public.simkit_events (
  run_id uuid not null references public.simkit_runs(id) on delete cascade,
  seq integer not null,
  request_id text not null,
  body jsonb not null,
  created_at timestamptz not null default now(),
  primary key (run_id, seq)
);
comment on table public.simkit_events is 'simkit: append-only event ledger. Rows are never updated. Corrections are new events.';
create index if not exists simkit_events_request on public.simkit_events(run_id, request_id);
create index if not exists simkit_runs_case on public.simkit_runs(case_id, class_code);

create table if not exists public.simkit_settings (
  key text primary key,
  value text not null
);
comment on table public.simkit_settings is 'simkit: private settings (e.g. instructor_key_hash, a SHA-256 hash; never the key itself).';

alter table public.simkit_runs enable row level security;
alter table public.simkit_events enable row level security;
alter table public.simkit_settings enable row level security;
revoke all on public.simkit_runs, public.simkit_events, public.simkit_settings from public, anon, authenticated;
grant select, insert, update on public.simkit_runs to service_role;
grant select, insert on public.simkit_events to service_role;
grant select on public.simkit_settings to service_role;

-- Atomic append. Returns 'ok', 'replay' (request already applied) or 'conflict'
-- (the ledger moved on since the caller read it). The row lock on the run makes two
-- devices acting at once take turns.
create or replace function public.simkit_append(p_run uuid, p_expected integer, p_request text, p_events jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare cur integer;
begin
  perform 1 from public.simkit_runs where id = p_run for update;
  if not found then return 'conflict'; end if;
  if exists (select 1 from public.simkit_events where run_id = p_run and request_id = p_request) then return 'replay'; end if;
  select coalesce(max(seq), 0) into cur from public.simkit_events where run_id = p_run;
  if cur <> p_expected then return 'conflict'; end if;
  insert into public.simkit_events(run_id, seq, request_id, body)
    select p_run, (e->>'seq')::integer, p_request, e from jsonb_array_elements(p_events) as e;
  return 'ok';
end $$;
revoke all on function public.simkit_append(uuid, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.simkit_append(uuid, integer, text, jsonb) to service_role;
