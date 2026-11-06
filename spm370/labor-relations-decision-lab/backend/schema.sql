-- Isolated addition only. No existing course tables, functions, rows, or grants are changed.
begin;
create table public.spm370_labor_v3_settings (
  id boolean primary key default true check(id),
  is_open boolean not null default false,
  assessment jsonb not null check(jsonb_typeof(assessment)='object')
);
create table public.spm370_labor_v3_attempts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check(char_length(full_name) between 2 and 120),
  email text not null check(email=lower(btrim(email)) and email ~ '^[^[:space:]@]+@lasalle\.edu$'),
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
  assessment_version text not null,
  role text not null check(role in ('management','union')),
  assessment_snapshot jsonb not null check(jsonb_typeof(assessment_snapshot)='object'),
  created_at timestamptz not null default now(),
  revision integer not null default 0 check(revision>=0),
  answers jsonb not null check(jsonb_typeof(answers)='array'),
  explanation text not null default '' check(char_length(explanation)<=6000),
  gameplay jsonb not null default '{}' check(jsonb_typeof(gameplay)='object'),
  submitted_at timestamptz,
  receipt text unique,
  submission_fingerprint text check(submission_fingerprint ~ '^[a-f0-9]{64}$'),
  mc_score integer check(mc_score>=0),
  writing_score numeric check(writing_score>=0 and writing_score*2=trunc(writing_score*2)),
  grader_notes text not null default '' check(char_length(grader_notes)<=4000),
  reviewer_type text check(reviewer_type in ('assistant','instructor')),
  reviewed_at timestamptz,
  unique(email,assessment_version),
  check((submitted_at is null and receipt is null and submission_fingerprint is null and mc_score is null) or (submitted_at is not null and receipt is not null and submission_fingerprint is not null and mc_score is not null)),
  check((writing_score is null and reviewed_at is null and reviewer_type is null) or (submitted_at is not null and writing_score is not null and reviewed_at is not null and reviewer_type is not null)),
  check(writing_score is null or writing_score <= (assessment_snapshot->>'writingMax')::numeric)
);
create table public.spm370_labor_v3_reviews (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.spm370_labor_v3_attempts(id),
  attempt_revision integer not null,
  writing_score numeric not null,
  grader_notes text not null,
  reviewer_type text not null check(reviewer_type in ('assistant','instructor')),
  reviewed_at timestamptz not null default now(),
  unique(attempt_id,attempt_revision)
);
create table public.spm370_labor_v3_limits (
  bucket text primary key check(bucket ~ '^[a-f0-9]{64}$'),
  hits integer not null,
  expires_at timestamptz not null
);
create index spm370_labor_v3_limits_expiry on public.spm370_labor_v3_limits(expires_at);
alter table public.spm370_labor_v3_settings enable row level security;
alter table public.spm370_labor_v3_attempts enable row level security;
alter table public.spm370_labor_v3_reviews enable row level security;
alter table public.spm370_labor_v3_limits enable row level security;
revoke all on public.spm370_labor_v3_settings,public.spm370_labor_v3_attempts,public.spm370_labor_v3_reviews,public.spm370_labor_v3_limits from public,anon,authenticated;
grant select,insert,update on public.spm370_labor_v3_settings,public.spm370_labor_v3_attempts to service_role;
grant select,insert on public.spm370_labor_v3_reviews to service_role;
grant select,insert,update,delete on public.spm370_labor_v3_limits to service_role;

-- INVOKER, never SECURITY DEFINER. Only the server role may invoke these functions.
create function public.spm370_labor_v3_limit(p_bucket text,p_max integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  if p_max<1 or p_max>2000 then raise exception 'invalid limit'; end if;
  delete from public.spm370_labor_v3_limits where expires_at<now();
  insert into public.spm370_labor_v3_limits(bucket,hits,expires_at) values(p_bucket,1,now()+interval '2 minutes')
  on conflict(bucket) do update set hits=public.spm370_labor_v3_limits.hits+1 returning hits into n;
  return n<=p_max;
end $$;

create function public.spm370_labor_v3_change(p_id uuid,p_revision integer,p_action text,p_patch jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r public.spm370_labor_v3_attempts; calculated integer;
begin
  select * into r from public.spm370_labor_v3_attempts where id=p_id for update;
  if not found then return null; end if;
  -- Lost responses and concurrent submit replays always return the first committed snapshot.
  if r.submitted_at is not null and p_action in ('submit','saveDraft') then return to_jsonb(r); end if;
  if p_revision is null or p_revision<0 or r.revision is distinct from p_revision then return null; end if;
  if p_action in ('saveDraft','submit') then
    if not (select is_open from public.spm370_labor_v3_settings where id=true) then raise exception 'closed'; end if;
    if jsonb_typeof(p_patch->'answers') is distinct from 'array' or jsonb_array_length(p_patch->'answers')<>jsonb_array_length(r.assessment_snapshot->'questions') then raise exception 'invalid answers'; end if;
    if exists(select 1 from jsonb_array_elements(r.assessment_snapshot->'questions') with ordinality as q(value,n)
      where (p_patch->'answers'->(q.n::integer-1)) <> 'null'::jsonb
      and not exists(select 1 from jsonb_array_elements(q.value->'options') o where o->'id'=p_patch->'answers'->(q.n::integer-1))) then raise exception 'invalid choice'; end if;
    if jsonb_typeof(p_patch->'explanation') is distinct from 'string' or char_length(p_patch->>'explanation')>coalesce((r.assessment_snapshot->>'maxExplanationChars')::integer,6000) then raise exception 'invalid explanation'; end if;
    if jsonb_typeof(p_patch->'gameplay') is distinct from 'object' or octet_length((p_patch->'gameplay')::text)>16000 then raise exception 'invalid gameplay'; end if;
    if p_action='submit' then
      if btrim(p_patch->>'explanation')='' or cardinality(regexp_split_to_array(btrim(p_patch->>'explanation'),'\s+'))<coalesce((r.assessment_snapshot->>'explanationMinWords')::integer,1) then raise exception 'incomplete explanation'; end if;
      if exists(select 1 from jsonb_array_elements(p_patch->'answers') v where v='null'::jsonb) then raise exception 'incomplete'; end if;
      -- Derive score again in SQL from this attempt's private frozen key. Ignore any proposed score.
      select coalesce(sum(case when q.value->'answer'=p_patch->'answers'->(q.n::integer-1) then (q.value->>'points')::integer else 0 end),0) into calculated
      from jsonb_array_elements(r.assessment_snapshot->'questions') with ordinality as q(value,n);
    end if;
    update public.spm370_labor_v3_attempts set answers=p_patch->'answers',explanation=p_patch->>'explanation',gameplay=p_patch->'gameplay',
      revision=revision+1,submitted_at=case when p_action='submit' then now() else null end,
      receipt=case when p_action='submit' then p_patch->>'receipt' else null end,
      submission_fingerprint=case when p_action='submit' then p_patch->>'submission_fingerprint' else null end,
      mc_score=case when p_action='submit' then calculated else null end where id=p_id returning * into r;
  elsif p_action='grade' then
    if r.submitted_at is null then raise exception 'not submitted'; end if;
    if jsonb_typeof(p_patch->'grader_notes') is distinct from 'string' or char_length(btrim(p_patch->>'grader_notes'))=0 then raise exception 'missing review notes'; end if;
    update public.spm370_labor_v3_attempts set writing_score=(p_patch->>'writing_score')::numeric,grader_notes=p_patch->>'grader_notes',
      reviewer_type=p_patch->>'reviewer_type',reviewed_at=now(),revision=revision+1 where id=p_id returning * into r;
    insert into public.spm370_labor_v3_reviews(attempt_id,attempt_revision,writing_score,grader_notes,reviewer_type,reviewed_at)
      values(r.id,r.revision,r.writing_score,r.grader_notes,r.reviewer_type,r.reviewed_at);
  elsif p_action='recover' then
    update public.spm370_labor_v3_attempts set token_hash=p_patch->>'token_hash',revision=revision+1 where id=p_id returning * into r;
  else raise exception 'invalid operation'; end if;
  return to_jsonb(r);
end $$;
revoke all on function public.spm370_labor_v3_limit(text,integer),public.spm370_labor_v3_change(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.spm370_labor_v3_limit(text,integer),public.spm370_labor_v3_change(uuid,integer,text,jsonb) to service_role;
comment on table public.spm370_labor_v3_attempts is 'Pixel Forge graded dual-role lab. Self-reported identity. Private frozen assessment; server MC grading; writing and final total pending semantic assistant/instructor review. No browser role access.';
comment on table public.spm370_labor_v3_reviews is 'Append-only writing review history. Does not contain credentials. Private instructor access only.';
commit;
