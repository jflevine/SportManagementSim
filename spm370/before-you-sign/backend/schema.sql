create table public.spm370_bys_attempts (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check (char_length(full_name) between 2 and 120),
 email text not null unique check (email=lower(email)),
 token_hash text not null unique check (char_length(token_hash)=64),
 created_at timestamptz not null default now(),
 revision integer not null default 0,
 activity jsonb,
 activity_submitted_at timestamptz,
 activity_receipt text unique,
 quiz_answers jsonb not null default '[]',
 quiz_submitted_at timestamptz,
 quiz_receipt text unique,
 mc_score integer check (mc_score between 0 and 12),
 activity_score numeric check (activity_score between 0 and 10),
 essay_scores jsonb,
 grader_notes text not null default '',
 reviewed_at timestamptz
);
create table public.spm370_bys_settings (
 id boolean primary key default true check(id),
 is_open boolean not null default true,
 assessment jsonb not null
);
create table public.spm370_bys_limits (
 bucket text primary key,
 hits integer not null,
 expires_at timestamptz not null
);
alter table public.spm370_bys_attempts enable row level security;
alter table public.spm370_bys_settings enable row level security;
alter table public.spm370_bys_limits enable row level security;
revoke all on public.spm370_bys_attempts, public.spm370_bys_settings, public.spm370_bys_limits from public, anon, authenticated;
grant all on public.spm370_bys_attempts, public.spm370_bys_settings, public.spm370_bys_limits to service_role;
comment on table public.spm370_bys_attempts is 'SPM370 Before You Sign and LLC3. Private identified submissions. Names/emails are self-reported, not verified. Attempt bearer credentials are hashed. No direct browser access.';
create function public.spm370_bys_limit(p_bucket text, p_max integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.spm370_bys_limits where expires_at < now();
 insert into public.spm370_bys_limits(bucket,hits,expires_at) values(p_bucket,1,now()+interval '2 minutes')
 on conflict(bucket) do update set hits=public.spm370_bys_limits.hits+1 returning hits into n;
 return n<=p_max;
end $$;
revoke all on function public.spm370_bys_limit(text,integer) from public,anon,authenticated;
grant execute on function public.spm370_bys_limit(text,integer) to service_role;
