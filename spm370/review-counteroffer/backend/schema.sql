-- New, isolated activity only. Never put credential values or student records in source.
create table public.spm370_counteroffer_settings (
  id text primary key check (id = 'main'),
  case_version text not null, schema_version integer not null,
  class_code_hash text not null check (class_code_hash ~ '^[0-9a-f]{64}$'),
  instructor_key_hash text not null check (instructor_key_hash ~ '^[0-9a-f]{64}$'),
  accepts_submissions boolean not null default true,
  max_submissions integer not null default 1000 check (max_submissions between 1 and 5000),
  updated_at timestamptz not null default now()
);
create table public.spm370_counteroffer_submissions (
  id uuid primary key, receipt uuid not null unique default gen_random_uuid(),
  case_version text not null, email text not null,
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  submitted_at timestamptz not null default now(),
  unique(case_version, email)
);
create table public.spm370_counteroffer_grades (
  submission_id uuid not null references public.spm370_counteroffer_submissions(id),
  revision integer not null check (revision > 0),
  points jsonb not null, feedback text not null check (length(feedback) <= 5000),
  graded_at timestamptz not null default now(),
  primary key(submission_id, revision),
  check (jsonb_typeof(points) = 'object' and points ?& array['recommendation','concept','clarification']),
  check ((points->>'recommendation')::numeric between 0 and 4),
  check ((points->>'concept')::numeric between 0 and 2),
  check ((points->>'clarification')::numeric between 0 and 4)
);
alter table public.spm370_counteroffer_settings enable row level security;
alter table public.spm370_counteroffer_submissions enable row level security;
alter table public.spm370_counteroffer_grades enable row level security;
revoke all on public.spm370_counteroffer_settings, public.spm370_counteroffer_submissions, public.spm370_counteroffer_grades from public, anon, authenticated, service_role;
grant select on public.spm370_counteroffer_settings to service_role;
grant update (accepts_submissions, updated_at) on public.spm370_counteroffer_settings to service_role;
grant select, insert on public.spm370_counteroffer_submissions, public.spm370_counteroffer_grades to service_role;

create function public.spm370_counteroffer_immutable() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'Saved submissions and grade revisions cannot be edited'; end; $$;
revoke all on function public.spm370_counteroffer_immutable() from public, anon, authenticated;
create trigger spm370_counteroffer_submission_immutable before update on public.spm370_counteroffer_submissions for each row execute function public.spm370_counteroffer_immutable();
create trigger spm370_counteroffer_grade_immutable before update on public.spm370_counteroffer_grades for each row execute function public.spm370_counteroffer_immutable();

create function public.spm370_counteroffer_submit(args jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  cfg public.spm370_counteroffer_settings%rowtype;
  item public.spm370_counteroffer_submissions%rowtype;
  submitted_payload jsonb := args->'payload';
begin
  -- The small class's settings row serializes create/close and duplicate-email checks.
  select * into cfg from public.spm370_counteroffer_settings where id = 'main' for update;
  if not found then raise exception 'VERSION_MISMATCH'; end if;
  select * into item from public.spm370_counteroffer_submissions where id = (args->>'id')::uuid;
  if found then
    if item.token_hash <> args->>'token_hash' or item.payload_hash <> args->>'payload_hash' then raise exception 'RETRY_MISMATCH'; end if;
    return jsonb_build_object('submission_id',item.id,'receipt',item.receipt,'submitted_at',item.submitted_at,'case_version',item.case_version,'replayed',true);
  end if;
  if not cfg.accepts_submissions then raise exception 'ACTIVITY_CLOSED'; end if;
  if submitted_payload->>'case_version' <> cfg.case_version or (submitted_payload->>'schema_version')::integer <> cfg.schema_version then raise exception 'VERSION_MISMATCH'; end if;
  if exists(select 1 from public.spm370_counteroffer_submissions where case_version=cfg.case_version and email=submitted_payload->>'email') then raise exception 'DUPLICATE_EMAIL'; end if;
  if (select count(*) from public.spm370_counteroffer_submissions where case_version=cfg.case_version) >= cfg.max_submissions then raise exception 'CAPACITY_REACHED'; end if;
  insert into public.spm370_counteroffer_submissions(id,case_version,email,token_hash,payload_hash,payload)
    values((args->>'id')::uuid,cfg.case_version,submitted_payload->>'email',args->>'token_hash',args->>'payload_hash',submitted_payload) returning * into item;
  return jsonb_build_object('submission_id',item.id,'receipt',item.receipt,'submitted_at',item.submitted_at,'case_version',item.case_version,'replayed',false);
end; $$;
revoke all on function public.spm370_counteroffer_submit(jsonb) from public, anon, authenticated;
grant execute on function public.spm370_counteroffer_submit(jsonb) to service_role;

create function public.spm370_counteroffer_grade(args jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  item public.spm370_counteroffer_submissions%rowtype;
  current_grade public.spm370_counteroffer_grades%rowtype;
  next_revision integer;
  replayed boolean := false;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('spm370-counteroffer-grade:'||(args->>'submission_id'),0));
  select * into item from public.spm370_counteroffer_submissions where id=(args->>'submission_id')::uuid;
  if not found then raise exception 'NOT_FOUND'; end if;
  select * into current_grade from public.spm370_counteroffer_grades where submission_id=item.id order by revision desc limit 1;
  next_revision := coalesce(current_grade.revision,0)+1;
  if coalesce(current_grade.revision,0) <> (args->>'expected_grade_revision')::integer then
    if current_grade.revision = (args->>'expected_grade_revision')::integer+1 and current_grade.points = args->'points' and current_grade.feedback = args->>'feedback' then replayed := true;
    else raise exception 'GRADE_CONFLICT'; end if;
  else
    insert into public.spm370_counteroffer_grades(submission_id,revision,points,feedback) values(item.id,next_revision,args->'points',args->>'feedback') returning * into current_grade;
  end if;
  return jsonb_build_object('submission_id',item.id,'replayed',replayed,'grade',jsonb_build_object('revision',current_grade.revision,'points',current_grade.points,'feedback',current_grade.feedback,'graded_at',current_grade.graded_at,'total',(current_grade.points->>'recommendation')::numeric+(current_grade.points->>'concept')::numeric+(current_grade.points->>'clarification')::numeric));
end; $$;
revoke all on function public.spm370_counteroffer_grade(jsonb) from public, anon, authenticated;
grant execute on function public.spm370_counteroffer_grade(jsonb) to service_role;

create function public.spm370_counteroffer_list(only_id uuid default null) returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(record order by submitted_at desc),'[]'::jsonb) from (
    select s.submitted_at, s.payload || jsonb_build_object('submission_id',s.id,'receipt',s.receipt,'submitted_at',s.submitted_at,'grade',
      (select jsonb_build_object('revision',g.revision,'points',g.points,'feedback',g.feedback,'graded_at',g.graded_at,'total',(g.points->>'recommendation')::numeric+(g.points->>'concept')::numeric+(g.points->>'clarification')::numeric)
       from public.spm370_counteroffer_grades g where g.submission_id=s.id order by g.revision desc limit 1)) as record
    from public.spm370_counteroffer_submissions s where only_id is null or s.id=only_id
    order by s.submitted_at desc limit 5000
  ) records;
$$;
revoke all on function public.spm370_counteroffer_list(uuid) from public, anon, authenticated;
grant execute on function public.spm370_counteroffer_list(uuid) to service_role;
comment on table public.spm370_counteroffer_submissions is 'Decision Lab 3 self-reported school identity and immutable individual responses. Private server API only.';
comment on table public.spm370_counteroffer_grades is 'Instructor-only rubric scores and feedback. Append-only revisions with conflict detection.';
