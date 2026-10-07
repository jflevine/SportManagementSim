-- Isolated SYNTHETIC PILOT only. No existing tables, policies, keys or rows change.
begin;
create table public.spm343_tap_lab2_pilot_records (
  attempt_id uuid primary key check (attempt_id in ('d1b1c5f0-0000-4000-8000-000000000001'::uuid, 'd1b1c5f0-0000-4000-8000-000000000002'::uuid)),
  version integer not null check (version > 0),
  state jsonb not null check ((jsonb_typeof(state) = 'object' and state->>'mode' = 'pilot' and state->>'synthetic' = 'true' and state->>'firstName' = 'Synthetic' and state->>'email' in ('tap-guided@example.invalid', 'tap-tournament@example.invalid')) is true),
  updated_at timestamptz not null default now(),
  check ((state->>'attemptId' = attempt_id::text and (state->>'version')::integer = version) is true)
);
create table public.spm343_tap_lab2_operations (
  attempt_id uuid not null references public.spm343_tap_lab2_pilot_records(attempt_id),
  request_id uuid not null,
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  response jsonb not null check (jsonb_typeof(response) = 'object'),
  created_at timestamptz not null default now(),
  primary key (attempt_id, request_id)
);
create table public.spm343_tap_lab2_guest_publications (
  attempt_id uuid primary key references public.spm343_tap_lab2_pilot_records(attempt_id),
  label text not null check (label in ('Synthetic proposal A', 'Synthetic proposal B')),
  format text not null check (format in ('guided', 'tournament')),
  summary text not null check (char_length(summary) between 1 and 1500),
  published boolean not null default false
);
-- Single globally shared demonstration, deliberately not one row per student.
-- Enums only: no identity, free text, client identifier, or browser telemetry.
create table public.spm343_tap_lab2_shared_demo (
  id boolean primary key default true check (id),
  format text not null check (format in ('guided', 'tournament')),
  stage text not null check (stage in ('draft', 'plan_locked', 'submitted')),
  updated_at timestamptz not null default now()
);
alter table public.spm343_tap_lab2_pilot_records enable row level security;
alter table public.spm343_tap_lab2_pilot_records force row level security;
alter table public.spm343_tap_lab2_operations enable row level security;
alter table public.spm343_tap_lab2_operations force row level security;
alter table public.spm343_tap_lab2_guest_publications enable row level security;
alter table public.spm343_tap_lab2_guest_publications force row level security;
alter table public.spm343_tap_lab2_shared_demo enable row level security;
alter table public.spm343_tap_lab2_shared_demo force row level security;
revoke all on public.spm343_tap_lab2_pilot_records, public.spm343_tap_lab2_operations, public.spm343_tap_lab2_guest_publications, public.spm343_tap_lab2_shared_demo from public, anon, authenticated, service_role;
grant select, insert, update on public.spm343_tap_lab2_pilot_records, public.spm343_tap_lab2_guest_publications, public.spm343_tap_lab2_shared_demo to service_role;
grant select, insert on public.spm343_tap_lab2_operations to service_role;

create function public.spm343_tap_lab2_apply(p_attempt_id uuid, p_request_id uuid, p_request_hash text, p_expected_version integer, p_next jsonb, p_response jsonb, p_publication jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare old_op public.spm343_tap_lab2_operations%rowtype; old_state public.spm343_tap_lab2_pilot_records%rowtype; current_version integer;
begin
  if p_attempt_id not in ('d1b1c5f0-0000-4000-8000-000000000001'::uuid, 'd1b1c5f0-0000-4000-8000-000000000002'::uuid) or p_request_hash !~ '^[a-f0-9]{64}$' or p_expected_version < 0 then return jsonb_build_object('error', 'STATE_CONFLICT'); end if;
  -- Serialize the attempt, including its first INSERT; request replay and state
  -- change are one transaction, never a check-then-overwrite in separate calls.
  perform pg_advisory_xact_lock(hashtextextended(p_attempt_id::text, 3432));
  select * into old_op from public.spm343_tap_lab2_operations where attempt_id = p_attempt_id and request_id = p_request_id;
  if found then
    if old_op.request_hash <> p_request_hash then return jsonb_build_object('error', 'REQUEST_CONFLICT'); end if;
    return old_op.response;
  end if;
  select * into old_state from public.spm343_tap_lab2_pilot_records where attempt_id = p_attempt_id for update;
  current_version := coalesce(old_state.version, 0);
  if current_version <> p_expected_version then return jsonb_build_object('error', 'VERSION_CONFLICT'); end if;
  if (p_next->>'version')::integer <> current_version + 1 or p_next->>'attemptId' <> p_attempt_id::text or p_next->>'synthetic' <> 'true' or p_next->>'mode' <> 'pilot' then return jsonb_build_object('error', 'STATE_CONFLICT'); end if;
  if old_state.state->'initialPlan' is not null and old_state.state->'initialPlan' <> 'null'::jsonb and old_state.state->'initialPlan' is distinct from p_next->'initialPlan' then return jsonb_build_object('error', 'STATE_CONFLICT'); end if;
  if old_state.state->>'status' = 'submitted' and (old_state.state->'responses' is distinct from p_next->'responses' or old_state.state->'receipt' is distinct from p_next->'receipt' or old_state.state->>'status' is distinct from p_next->>'status') then return jsonb_build_object('error', 'STATE_CONFLICT'); end if;
  insert into public.spm343_tap_lab2_pilot_records(attempt_id, version, state) values (p_attempt_id, current_version + 1, p_next)
  on conflict (attempt_id) do update set version = excluded.version, state = excluded.state, updated_at = now();
  insert into public.spm343_tap_lab2_guest_publications(attempt_id, label, format, summary, published)
  values (p_attempt_id, p_publication->>'label', p_publication->>'format', p_publication->>'summary', (p_publication->>'published')::boolean)
  on conflict (attempt_id) do update set label = excluded.label, format = excluded.format, summary = excluded.summary, published = excluded.published;
  insert into public.spm343_tap_lab2_operations(attempt_id, request_id, request_hash, response) values (p_attempt_id, p_request_id, p_request_hash, p_response);
  return p_response;
end;
$$;
create function public.spm343_tap_lab2_progress(p_format text, p_stage text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare demo public.spm343_tap_lab2_shared_demo%rowtype;
begin
  if p_format not in ('guided', 'tournament') or p_stage not in ('draft', 'plan_locked', 'submitted') then return jsonb_build_object('error', 'STATE_CONFLICT'); end if;
  insert into public.spm343_tap_lab2_shared_demo(id, format, stage) values (true, p_format, p_stage)
  on conflict (id) do update set format = excluded.format, stage = excluded.stage, updated_at = case when spm343_tap_lab2_shared_demo.format is distinct from excluded.format or spm343_tap_lab2_shared_demo.stage is distinct from excluded.stage then now() else spm343_tap_lab2_shared_demo.updated_at end
  returning * into demo;
  return jsonb_build_object('format', demo.format, 'stage', demo.stage, 'updatedAt', demo.updated_at);
end;
$$;
create function public.spm343_tap_lab2_guest()
returns jsonb language sql stable security invoker set search_path = '' as $$
  with phases as (
    select state->>'format' as format, state->>'status' as stage from public.spm343_tap_lab2_pilot_records
    union all select format, stage from public.spm343_tap_lab2_shared_demo
  ), counts as (
    select count(*) as started, count(*) filter (where stage in ('plan_locked', 'submitted')) as initial_plans,
      count(*) filter (where stage = 'submitted') as completed_revisions,
      count(*) filter (where format = 'guided') as guided, count(*) filter (where format = 'tournament') as tournament from phases
  )
  select jsonb_build_object(
    'aggregate', jsonb_build_object('started', started, 'initialPlans', initial_plans, 'completedRevisions', completed_revisions, 'formats', jsonb_build_object('guided', guided, 'tournament', tournament)),
    'publications', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'format', format, 'summary', summary, 'published', published) order by label) from public.spm343_tap_lab2_guest_publications where published), '[]'::jsonb),
    'demo', (select jsonb_build_object('format', format, 'stage', stage, 'updatedAt', updated_at) from public.spm343_tap_lab2_shared_demo where id)
  ) from counts;
$$;
revoke all on function public.spm343_tap_lab2_apply(uuid, uuid, text, integer, jsonb, jsonb, jsonb), public.spm343_tap_lab2_progress(text, text), public.spm343_tap_lab2_guest() from public, anon, authenticated, service_role;
grant execute on function public.spm343_tap_lab2_apply(uuid, uuid, text, integer, jsonb, jsonb, jsonb), public.spm343_tap_lab2_progress(text, text), public.spm343_tap_lab2_guest() to service_role;
comment on table public.spm343_tap_lab2_pilot_records is 'SPM343 TAP Decision Lab2 isolated synthetic-only instructor fixtures; not a student submission table. No real classroom data.';
comment on table public.spm343_tap_lab2_shared_demo is 'One shared synthetic real-time demonstration. Only two format enums and three stage enums may be stored. No student identities or responses.';
commit;
