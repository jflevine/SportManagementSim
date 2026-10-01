-- OFF SCRIPT / SPM 370 Legal Decision Lab 2. New isolated tables only.
begin;
create table public.spm370_offscript_submissions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique,
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  assessment text not null default 'SPM 370 Legal Decision Lab 2 — OFF SCRIPT',
  version text not null check (version = '1.2.0'),
  source_version text not null,
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name text not null check (char_length(last_name) between 1 and 60),
  email text not null unique check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  partner_name text,
  choices jsonb not null check (jsonb_typeof(choices)='array' and jsonb_array_length(choices)=6),
  checks jsonb not null check (jsonb_typeof(checks)='array' and jsonb_array_length(checks)=2),
  reflections jsonb not null check (jsonb_typeof(reflections)='array' and jsonb_array_length(reflections)=2),
  ending_id text not null,
  completion_score smallint not null check (completion_score=6),
  concept_score smallint not null check (concept_score in (0,2,4)),
  score smallint generated always as (completion_score + concept_score) stored,
  max_score smallint not null default 10 check (max_score=10),
  review_status text not null default 'PENDING_REVIEW' check (review_status in ('PENDING_REVIEW','REVIEWED')),
  grade_override smallint check (grade_override between 0 and 10),
  grader_notes text check (char_length(grader_notes)<=2000),
  graded_at timestamptz,
  receipt text not null unique,
  client_completed_at timestamptz,
  submitted_at timestamptz not null default now()
);
alter table public.spm370_offscript_submissions enable row level security;
revoke all on public.spm370_offscript_submissions from public, anon, authenticated;
grant select,insert,update,delete on public.spm370_offscript_submissions to service_role;
create index spm370_offscript_submissions_submitted_at_idx on public.spm370_offscript_submissions (submitted_at desc);

-- Short-lived pseudonymous abuse counters: no names, raw IP addresses or content.
create table public.spm370_offscript_rate_limits (
  bucket text primary key check (bucket ~ '^[a-f0-9]{64}$'),
  requests integer not null check (requests>0),
  expires_at timestamptz not null
);
alter table public.spm370_offscript_rate_limits enable row level security;
revoke all on public.spm370_offscript_rate_limits from public, anon, authenticated;
grant select,insert,update,delete on public.spm370_offscript_rate_limits to service_role;
create index spm370_offscript_rate_limits_expiry_idx on public.spm370_offscript_rate_limits (expires_at);

create function public.spm370_offscript_check_rate(p_bucket text, p_limit integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  if p_bucket !~ '^[a-f0-9]{64}$' or p_limit<1 or p_limit>1000 then
    raise exception 'Invalid rate limit';
  end if;
  delete from public.spm370_offscript_rate_limits where expires_at<now();
  insert into public.spm370_offscript_rate_limits as counters (bucket,requests,expires_at)
  values (p_bucket,1,now()+interval '11 minutes')
  on conflict (bucket) do update set requests=counters.requests+1
  returning requests into n;
  return n<=p_limit;
end;
$$;
revoke all on function public.spm370_offscript_check_rate(text,integer) from public,anon,authenticated;
grant execute on function public.spm370_offscript_check_rate(text,integer) to service_role;
commit;
