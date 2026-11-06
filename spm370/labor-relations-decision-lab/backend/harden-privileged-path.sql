create or replace function public.spm370_labor_v3_change(p_id uuid,p_revision integer,p_action text,p_patch jsonb) returns jsonb
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
