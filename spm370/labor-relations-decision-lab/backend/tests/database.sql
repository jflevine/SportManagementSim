-- Run against the authorized existing course database. All synthetic data/settings roll back.
begin;
do $$
declare a jsonb; r jsonb; x jsonb; aid uuid:=gen_random_uuid(); duplicate_id uuid; synthetic_email text:='synthetic-labor-qa-'||gen_random_uuid()::text||'@lasalle.edu';
begin
  if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'spm370_labor_v3_%' and c.relkind='r' and (not c.relrowsecurity or has_table_privilege('anon',c.oid,'select,insert,update,delete') or has_table_privilege('authenticated',c.oid,'select,insert,update,delete'))) then raise exception 'table privacy failed'; end if;
  if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'spm370_labor_v3_%' and (p.prosecdef or has_function_privilege('anon',p.oid,'execute') or has_function_privilege('authenticated',p.oid,'execute'))) then raise exception 'RPC privacy failed'; end if;
  select jsonb_build_object('version','synthetic-database-qa','title','Synthetic assessment, not course content','writingMax',2,'explanationMinWords',3,'questions',jsonb_agg(jsonb_build_object('id','test-'||i,'points',1,'answer','a','options',jsonb_build_array(jsonb_build_object('id','a','text','Synthetic A'),jsonb_build_object('id','b','text','Synthetic B'))))) into a from generate_series(1,8) i;
  insert into public.spm370_labor_v3_attempts(id,full_name,email,token_hash,assessment_version,role,assessment_snapshot,answers)
    values(aid,'Synthetic Database QA',synthetic_email,encode(extensions.digest(gen_random_uuid()::text,'sha256'),'hex'),'synthetic-database-qa','management',a,'[null,null,null,null,null,null,null,null]');
  begin
    insert into public.spm370_labor_v3_attempts(full_name,email,token_hash,assessment_version,role,assessment_snapshot,answers)
      values('Synthetic Duplicate QA',synthetic_email,encode(extensions.digest(gen_random_uuid()::text,'sha256'),'hex'),'synthetic-database-qa','union',a,'[null,null,null,null,null,null,null,null]');
    raise exception 'duplicate identity unexpectedly accepted';
  exception when unique_violation then null; end;
  begin
    perform public.spm370_labor_v3_change(aid,0,'grade','{"writing_score":2,"grader_notes":"Synthetic","reviewer_type":"assistant"}');
    raise exception 'draft grade unexpectedly accepted';
  exception when raise_exception then if sqlerrm<>'not submitted' then raise; end if; end;
  -- Opening here is transaction-local and is never committed or visible to API clients.
  update public.spm370_labor_v3_settings set is_open=true where id=true;
  if public.spm370_labor_v3_change(aid,null,'saveDraft','{}') is not null then raise exception 'NULL revision bypass'; end if;
  r:=public.spm370_labor_v3_change(aid,0,'saveDraft','{"answers":[null,null,null,null,null,null,null,null],"explanation":"Synthetic draft","gameplay":{}}');
  if (r->>'revision')::integer<>1 or r->>'mc_score' is not null then raise exception 'draft score/revision failed'; end if;
  x:=public.spm370_labor_v3_change(aid,0,'saveDraft','{"answers":[null,null,null,null,null,null,null,null],"explanation":"Stale draft","gameplay":{}}');
  if x is not null then raise exception 'stale revision accepted'; end if;
  begin
    perform public.spm370_labor_v3_change(aid,1,'submit','{"answers":[null,null,null,null,null,null,null,null],"explanation":"Synthetic complete explanation","gameplay":{},"receipt":"SYNTHETIC-INVALID"}');
    raise exception 'incomplete submit unexpectedly accepted';
  exception when raise_exception then if sqlerrm<>'incomplete' then raise; end if; end;
  begin
    perform public.spm370_labor_v3_change(aid,1,'submit','{"answers":["z","a","a","a","a","a","a","a"],"explanation":"Synthetic complete explanation","gameplay":{}}');
    raise exception 'invalid choice unexpectedly accepted';
  exception when raise_exception then if sqlerrm<>'invalid choice' then raise; end if; end;
  begin
    perform public.spm370_labor_v3_change(aid,1,'submit','{"answers":["a","a","a","a","a","a","a","a"],"explanation":"short","gameplay":{}}');
    raise exception 'short explanation unexpectedly accepted';
  exception when raise_exception then if sqlerrm<>'incomplete explanation' then raise; end if; end;
  r:=public.spm370_labor_v3_change(aid,1,'submit',jsonb_build_object('answers','["a","a","a","a","a","a","a","a"]'::jsonb,'explanation','Synthetic complete explanation','gameplay','{}'::jsonb,'mc_score',999,'receipt','SYNTHETIC-'||gen_random_uuid()::text,'submission_fingerprint',repeat('0',64)));
  if (r->>'mc_score')::integer<>8 or r->>'writing_score' is not null or r->>'reviewed_at' is not null or r->>'receipt' is null then raise exception 'canonical score/receipt/pending gating failed'; end if;
  x:=public.spm370_labor_v3_change(aid,1,'submit','{"answers":["b","b","b","b","b","b","b","b"],"explanation":"Changed after feedback"}');
  if x->>'receipt'<>r->>'receipt' or x->'answers'<>r->'answers' or x->>'explanation'<>r->>'explanation' then raise exception 'submit replay overwrote snapshot'; end if;
  x:=public.spm370_labor_v3_change(aid,2,'saveDraft','{"explanation":"Overwrite"}');
  if x<>r then raise exception 'post-submit draft changed record'; end if;
  if public.spm370_labor_v3_change(aid,1,'grade','{"writing_score":2,"grader_notes":"Synthetic","reviewer_type":"assistant"}') is not null then raise exception 'stale grade accepted'; end if;
  begin
    perform public.spm370_labor_v3_change(aid,2,'grade','{"writing_score":3,"grader_notes":"Synthetic","reviewer_type":"assistant"}');
    raise exception 'excess grade unexpectedly accepted';
  exception when check_violation then null; end;
  begin
    perform public.spm370_labor_v3_change(aid,2,'grade','{"writing_score":1,"grader_notes":" ","reviewer_type":"assistant"}');
    raise exception 'blank review notes unexpectedly accepted';
  exception when raise_exception then if sqlerrm<>'missing review notes' then raise; end if; end;
  x:=public.spm370_labor_v3_change(aid,2,'grade','{"writing_score":1.5,"grader_notes":"Synthetic supportive review","reviewer_type":"assistant"}');
  if (x->>'writing_score')::numeric<>1.5 or (x->>'mc_score')::integer<>8 or x->'answers'<>r->'answers' or x->>'explanation'<>r->>'explanation' then raise exception 'grade changed original work'; end if;
  if not exists(select 1 from public.spm370_labor_v3_reviews where attempt_id=aid and attempt_revision=3 and writing_score=1.5) then raise exception 'review audit missing'; end if;
end $$;
select 'PASS: isolated synthetic DB privacy, constraints, canonical scoring, receipt replay, optimistic grade and audit checks; rolling back' as result;
rollback;
