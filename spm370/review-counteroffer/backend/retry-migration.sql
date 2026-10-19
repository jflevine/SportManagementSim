-- One additional attempt only when privately authorized. No student data belongs here.
-- Existing responses, receipts, payload hashes, and grade revisions remain unchanged.
alter table public.spm370_counteroffer_submissions add column original_submission_id uuid references public.spm370_counteroffer_submissions(id);
alter table public.spm370_counteroffer_submissions add constraint spm370_counteroffer_not_self_retry check (original_submission_id is distinct from id);
create unique index spm370_counteroffer_original_email on public.spm370_counteroffer_submissions(case_version,email) where original_submission_id is null;
create unique index spm370_counteroffer_one_retry on public.spm370_counteroffer_submissions(original_submission_id) where original_submission_id is not null;
alter table public.spm370_counteroffer_submissions drop constraint spm370_counteroffer_submissions_case_version_email_key;
create table public.spm370_counteroffer_retry_authorizations (
  original_submission_id uuid primary key references public.spm370_counteroffer_submissions(id),
  authorized_at timestamptz not null default now()
);
alter table public.spm370_counteroffer_retry_authorizations enable row level security;
revoke all on public.spm370_counteroffer_retry_authorizations from public, anon, authenticated, service_role;
grant select on public.spm370_counteroffer_retry_authorizations to service_role;
comment on table public.spm370_counteroffer_retry_authorizations is 'Private owner-approved one-use retry permissions. Used when a linked retry submission exists; no public management endpoint.';
create or replace function public.spm370_counteroffer_submit(args jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  cfg public.spm370_counteroffer_settings%rowtype;
  item public.spm370_counteroffer_submissions%rowtype;
  original public.spm370_counteroffer_submissions%rowtype;
  parent_id uuid := null;
  submitted_payload jsonb := args->'payload';
begin
  -- The small class's settings row serializes create/close and duplicate-email checks.
  select * into cfg from public.spm370_counteroffer_settings where id = 'main' for update;
  if not found then raise exception 'VERSION_MISMATCH'; end if;
  select * into item from public.spm370_counteroffer_submissions where id = (args->>'id')::uuid;
  if found then
    if item.token_hash <> args->>'token_hash' or item.payload_hash <> args->>'payload_hash' then raise exception 'RETRY_MISMATCH'; end if;
    return jsonb_build_object('submission_id',item.id,'receipt',item.receipt,'submitted_at',item.submitted_at,'case_version',item.case_version,'attempt_number',case when item.original_submission_id is null then 1 else 2 end,'original_submission_id',item.original_submission_id,'replayed',true);
  end if;
  if not cfg.accepts_submissions then raise exception 'ACTIVITY_CLOSED'; end if;
  if submitted_payload->>'case_version' <> cfg.case_version or (submitted_payload->>'schema_version')::integer <> cfg.schema_version then raise exception 'VERSION_MISMATCH'; end if;
  select * into original from public.spm370_counteroffer_submissions
    where case_version=cfg.case_version and email=submitted_payload->>'email' and original_submission_id is null;
  if coalesce((submitted_payload->>'retry_attempt')::boolean,false) then
    if original.id is null then raise exception 'RETRY_NOT_AUTHORIZED'; end if;
    if not exists(select 1 from public.spm370_counteroffer_retry_authorizations where original_submission_id=original.id)
      or exists(select 1 from public.spm370_counteroffer_submissions where original_submission_id=original.id)
      then raise exception 'RETRY_NOT_AUTHORIZED'; end if;
    parent_id := original.id;
  elsif original.id is not null then raise exception 'DUPLICATE_EMAIL';
  end if;
  if (select count(*) from public.spm370_counteroffer_submissions where case_version=cfg.case_version) >= cfg.max_submissions then raise exception 'CAPACITY_REACHED'; end if;
  insert into public.spm370_counteroffer_submissions(id,case_version,email,token_hash,payload_hash,payload,original_submission_id)
    values((args->>'id')::uuid,cfg.case_version,submitted_payload->>'email',args->>'token_hash',args->>'payload_hash',submitted_payload,parent_id) returning * into item;
  return jsonb_build_object('submission_id',item.id,'receipt',item.receipt,'submitted_at',item.submitted_at,'case_version',item.case_version,'attempt_number',case when item.original_submission_id is null then 1 else 2 end,'original_submission_id',item.original_submission_id,'replayed',false);
end; $$;
create or replace function public.spm370_counteroffer_list(only_id uuid default null) returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(record order by submitted_at desc),'[]'::jsonb) from (
    select s.submitted_at, s.payload || jsonb_build_object('submission_id',s.id,'attempt_number',case when s.original_submission_id is null then 1 else 2 end,'original_submission_id',s.original_submission_id,'receipt',s.receipt,'submitted_at',s.submitted_at,'grade',
      (select jsonb_build_object('revision',g.revision,'points',g.points,'feedback',g.feedback,'graded_at',g.graded_at,'total',(g.points->>'recommendation')::numeric+(g.points->>'concept')::numeric+(g.points->>'clarification')::numeric)
       from public.spm370_counteroffer_grades g where g.submission_id=s.id order by g.revision desc limit 1)) as record
    from public.spm370_counteroffer_submissions s where only_id is null or s.id=only_id
    order by s.submitted_at desc limit 5000
  ) records;
$$;
