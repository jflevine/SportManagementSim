-- REVIEW-ONLY PROPOSAL. Do not run against a live project without approval.
-- This is not a generated migration and makes no changes until applied.
begin;

create table public.mgt340_kc2_submissions (
  attempt_id uuid primary key,
  assessment_version text not null check (assessment_version ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  rubric_version text not null check (rubric_version ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null check (email = lower(btrim(email)) and char_length(email) <= 254 and email ~ '^[^@[:space:]]+@lasalle[.]edu$'),
  answers smallint[] not null check (
    cardinality(answers) = 10 and array_ndims(answers) = 1 and array_length(answers, 1) = 10
    and array_lower(answers, 1) = 1 and array_position(answers, null) is null
    and answers <@ array[0, 1, 2]::smallint[]
  ),
  score smallint not null check (score between 0 and 10),
  finance_score smallint not null check (finance_score between 0 and 5),
  legal_score smallint not null check (legal_score between 0 and 5),
  client_started_at timestamptz not null,
  submitted_at timestamptz not null,
  -- The full immutable post-save response enables exact, bounded retries.
  -- It contains grading feedback and must remain private with the student record.
  receipt jsonb not null check (jsonb_typeof(receipt) = 'object'),
  constraint mgt340_kc2_email_version_unique unique (email, assessment_version),
  constraint mgt340_kc2_score_total check (score = finance_score + legal_score)
);

alter table public.mgt340_kc2_submissions enable row level security;
alter table public.mgt340_kc2_submissions force row level security;
-- No anon/authenticated policies, RPCs, public views, analytics, or lookup routes.
revoke all on table public.mgt340_kc2_submissions from public, anon, authenticated;
revoke all on table public.mgt340_kc2_submissions from service_role;
-- Explicit grants also handle Supabase's newer Data API opt-in defaults.
grant select, insert on table public.mgt340_kc2_submissions to service_role;
comment on table public.mgt340_kc2_submissions is
  'MGT340 KC2 private submissions. Typed identity and La Salle email are unverified. No browser role access.';

commit;
