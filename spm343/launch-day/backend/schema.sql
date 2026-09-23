create table public.spm343_kc2_assessments (
 id text primary key,
 questions jsonb not null,
 answer_key jsonb not null
);
create table public.spm343_kc2_sessions (
 code text primary key,
 label text not null,
 is_open boolean not null default false,
 results_released boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.spm343_kc2_attempts (
 id uuid primary key default gen_random_uuid(),
 session_code text not null references public.spm343_kc2_sessions(code),
 student_name text not null check (char_length(student_name) between 2 and 100),
 email text not null check (email=lower(email)),
 token_hash text not null unique,
 answers jsonb not null default '{}',
 version integer not null default 0,
 started_at timestamptz not null default now(),
 submitted_at timestamptz,
 score integer check (score between 0 and 12),
 round_scores jsonb,
 unique(session_code,email)
);
alter table public.spm343_kc2_assessments enable row level security;
alter table public.spm343_kc2_sessions enable row level security;
alter table public.spm343_kc2_attempts enable row level security;
revoke all on public.spm343_kc2_assessments, public.spm343_kc2_sessions, public.spm343_kc2_attempts from anon, authenticated;
grant all on public.spm343_kc2_assessments, public.spm343_kc2_sessions, public.spm343_kc2_attempts to service_role;
