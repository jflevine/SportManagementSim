-- Additive and isolated. Does not modify prior pilot or other course resources.
begin;
create table public.spm343_tap_v2_live (
 attempt_id uuid primary key, token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$'),
 version integer not null check(version>0), state jsonb not null,
 updated_at timestamptz not null default now(),
 check ((state->>'mode'='live' and state->>'classRun'='tap-events-2026-10' and state->>'individualWork'='true' and state->>'attemptId'=attempt_id::text and (state->>'version')::integer=version and state->>'email' ~* '^[^ @]+@lasalle\.edu$') is true)
);
create table public.spm343_tap_v2_test (
 attempt_id uuid primary key, token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$'),
 version integer not null check(version>0), state jsonb not null,
 updated_at timestamptz not null default now(),
 check ((state->>'mode'='test' and state->>'classRun'='tap-events-2026-10' and state->>'individualWork'='true' and state->>'attemptId'=attempt_id::text and (state->>'version')::integer=version and state->>'firstName'='Synthetic' and state->>'lastName'='Fixture' and state->>'email'='tap-v2@example.invalid') is true)
);
create table public.spm343_tap_v2_operations (
 mode text not null check(mode in ('live','test')), attempt_id uuid not null, request_id uuid not null,
 request_hash text not null check(request_hash ~ '^[a-f0-9]{64}$'), response jsonb not null,
 created_at timestamptz not null default now(), primary key(mode,attempt_id,request_id)
);
create table public.spm343_tap_v2_guest_projection (
 mode text not null check(mode in ('live','test')), attempt_id uuid not null,
 stage text not null check(stage in ('draft','plan_locked','submitted')),
 initial_choice text check(initial_choice in ('cup','open','showcase')),
 final_choice text check(final_choice in ('cup','open','showcase')),
 adjustment text check(adjustment in ('orientation','extra_host','rotations')),
 priority text check(priority in ('newcomers','club','operator')),
 runner_up text check(runner_up in ('cup','open','showcase')),
 published boolean not null default false, primary key(mode,attempt_id),
 check(not published or (stage='submitted' and initial_choice is not null and final_choice is not null and adjustment is not null and priority is not null and runner_up is not null))
);
alter table public.spm343_tap_v2_live enable row level security;
alter table public.spm343_tap_v2_live force row level security;
alter table public.spm343_tap_v2_test enable row level security;
alter table public.spm343_tap_v2_test force row level security;
alter table public.spm343_tap_v2_operations enable row level security;
alter table public.spm343_tap_v2_operations force row level security;
alter table public.spm343_tap_v2_guest_projection enable row level security;
alter table public.spm343_tap_v2_guest_projection force row level security;
revoke all on public.spm343_tap_v2_live,public.spm343_tap_v2_test,public.spm343_tap_v2_operations,public.spm343_tap_v2_guest_projection from public,anon,authenticated,service_role;
grant select,insert,update on public.spm343_tap_v2_live,public.spm343_tap_v2_test,public.spm343_tap_v2_guest_projection to service_role;
grant select,insert on public.spm343_tap_v2_operations to service_role;

create function public.spm343_tap_v2_apply(p_mode text,p_attempt_id uuid,p_request_id uuid,p_request_hash text,p_expected_version integer,p_token_hash text,p_next jsonb,p_response jsonb,p_publication jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare old_op public.spm343_tap_v2_operations%rowtype; old_state jsonb; old_hash text; current_version integer; target text;
begin
 if p_mode not in ('live','test') or p_request_hash !~ '^[a-f0-9]{64}$' or p_token_hash !~ '^[a-f0-9]{64}$' or p_expected_version<0 then return jsonb_build_object('error','STATE_CONFLICT'); end if;
 target := case p_mode when 'live' then 'spm343_tap_v2_live' else 'spm343_tap_v2_test' end;
 perform pg_advisory_xact_lock(hashtextextended(p_mode||':'||p_attempt_id::text,34322));
 execute format('select state,token_hash,version from public.%I where attempt_id=$1 for update',target) into old_state,old_hash,current_version using p_attempt_id;
 if old_hash is not null and old_hash<>p_token_hash then return jsonb_build_object('error','STATE_CONFLICT'); end if;
 select * into old_op from public.spm343_tap_v2_operations where mode=p_mode and attempt_id=p_attempt_id and request_id=p_request_id;
 if found then if old_op.request_hash<>p_request_hash then return jsonb_build_object('error','REQUEST_CONFLICT'); end if;return old_op.response;end if;
 current_version:=coalesce(current_version,0);
 if current_version<>p_expected_version then return jsonb_build_object('error','VERSION_CONFLICT');end if;
 if ((p_next->>'version')::integer=current_version+1 and p_next->>'mode'=p_mode and p_next->>'attemptId'=p_attempt_id::text and p_next->>'classRun'='tap-events-2026-10') is not true then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if old_state is not null and (old_state->>'firstName' is distinct from p_next->>'firstName' or old_state->>'lastName' is distinct from p_next->>'lastName' or old_state->>'email' is distinct from p_next->>'email') then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if old_state->'initialPlan' is not null and old_state->'initialPlan'<>'null'::jsonb and old_state->'initialPlan' is distinct from p_next->'initialPlan' then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if old_state->>'status'='submitted' and (old_state->'answers' is distinct from p_next->'answers' or old_state->'receipt' is distinct from p_next->'receipt' or p_next->>'status'<>'submitted' or old_state->'submittedAt' is distinct from p_next->'submittedAt') then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if p_publication->>'mode' is distinct from p_mode or p_publication->>'stage' is distinct from p_next->>'status' or p_publication->>'initial_choice' is distinct from p_next->'initialPlan'->>'initialChoice' then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if p_next->>'status'='submitted' and (p_publication->>'final_choice' is distinct from p_next->'answers'->>'finalChoice' or p_publication->>'adjustment' is distinct from p_next->'answers'->>'adjustment' or p_publication->>'priority' is distinct from p_next->'answers'->>'priority' or p_publication->>'runner_up' is distinct from p_next->'answers'->>'runnerUp') then return jsonb_build_object('error','STATE_CONFLICT');end if;
 if (p_publication->>'published')::boolean and ((p_next->'answers'->>'guestConsent')::boolean is not true or (p_next->>'guestPublished')::boolean is not true or p_next->>'status'<>'submitted') then return jsonb_build_object('error','STATE_CONFLICT');end if;
 execute format('insert into public.%I(attempt_id,token_hash,version,state) values($1,$2,$3,$4) on conflict(attempt_id) do update set version=excluded.version,state=excluded.state,updated_at=now()',target) using p_attempt_id,p_token_hash,current_version+1,p_next;
 insert into public.spm343_tap_v2_guest_projection(mode,attempt_id,stage,initial_choice,final_choice,adjustment,priority,runner_up,published)
 values(p_mode,p_attempt_id,p_publication->>'stage',p_publication->>'initial_choice',p_publication->>'final_choice',p_publication->>'adjustment',p_publication->>'priority',p_publication->>'runner_up',(p_publication->>'published')::boolean)
 on conflict(mode,attempt_id) do update set stage=excluded.stage,initial_choice=excluded.initial_choice,final_choice=excluded.final_choice,adjustment=excluded.adjustment,priority=excluded.priority,runner_up=excluded.runner_up,published=excluded.published;
 insert into public.spm343_tap_v2_operations(mode,attempt_id,request_id,request_hash,response) values(p_mode,p_attempt_id,p_request_id,p_request_hash,p_response);
 return p_response;
end;$$;
create function public.spm343_tap_v2_guest() returns jsonb language sql stable security invoker set search_path='' as $$
 with p as (select * from public.spm343_tap_v2_guest_projection where mode='live'),counts as (
 select count(*) as started,count(*) filter(where stage in ('plan_locked','submitted')) as locked,count(*) filter(where stage='submitted') as submitted,
 count(*) filter(where initial_choice='cup') as ic,count(*) filter(where initial_choice='open') as io,count(*) filter(where initial_choice='showcase') as ish,
 count(*) filter(where final_choice='cup') as fc,count(*) filter(where final_choice='open') as fo,count(*) filter(where final_choice='showcase') as fsh from p)
 select jsonb_build_object('aggregate',jsonb_build_object('started',started,'initialPlans',locked,'completedRevisions',submitted,'initialChoices',jsonb_build_object('cup',ic,'open',io,'showcase',ish),'finalChoices',jsonb_build_object('cup',fc,'open',fo,'showcase',fsh)),
 'publications',coalesce((select jsonb_agg(jsonb_build_object('initial_choice',initial_choice,'final_choice',final_choice,'adjustment',adjustment,'priority',priority,'runner_up',runner_up,'published',published) order by attempt_id) from p where published),'[]'::jsonb)) from counts;
$$;
revoke all on function public.spm343_tap_v2_apply(text,uuid,uuid,text,integer,text,jsonb,jsonb,jsonb),public.spm343_tap_v2_guest() from public,anon,authenticated,service_role;
grant execute on function public.spm343_tap_v2_apply(text,uuid,uuid,text,integer,text,jsonb,jsonb,jsonb),public.spm343_tap_v2_guest() to service_role;
comment on table public.spm343_tap_v2_live is 'Private SPM343 TAP Decision Lab2 live class run. Names/emails are self-reported; private student bearer session is hashed, attempt-scoped, and separate from instructor access.';
comment on table public.spm343_tap_v2_test is 'Isolated synthetic test records. Fixed example.invalid identity required; never included in live guest or default gradebook.';
comment on table public.spm343_tap_v2_guest_projection is 'Dedicated enum-only public projection source. No identity, raw responses, grades, receipt, session token, or free text. Access only through private service-role guest RPC.';
commit;
