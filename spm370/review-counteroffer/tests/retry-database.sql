-- Transaction-scoped synthetic QA; intentionally rolls back all fixtures and settings.
begin;
do $$
declare
 a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid();
 p jsonb; args jsonb; original_args jsonb; retry_args jsonb; r jsonb; receipt uuid;
 original_count integer; original_digest text;
begin
 select count(*),md5(string_agg((to_jsonb(s)-'original_submission_id')::text,'' order by id)) into original_count,original_digest from public.spm370_counteroffer_submissions s;
 p := jsonb_build_object('case_version','decision-lab-3-v1','schema_version',1,'email','synthetic-'||a||'@lasalle.edu','name','Synthetic Retry QA','decision','counter','recommendation','Synthetic test only, never a real student response.','clause_number',3,'clarification','Synthetic test clarification only.');
 original_args := jsonb_build_object('id',a,'token_hash',repeat('a',64),'payload_hash',repeat('b',64),'payload',p);
 r := public.spm370_counteroffer_submit(original_args);
 if (r->>'attempt_number')::int <> 1 then raise exception 'original attempt metadata failed'; end if;
 receipt := (r->>'receipt')::uuid;
 args := original_args || jsonb_build_object('id',b);
 begin perform public.spm370_counteroffer_submit(args); raise exception 'duplicate accepted'; exception when others then if sqlerrm <> 'DUPLICATE_EMAIL' then raise; end if; end;
 retry_args := args || jsonb_build_object('payload',p||'{"retry_attempt":true}'::jsonb,'payload_hash',repeat('c',64));
 begin perform public.spm370_counteroffer_submit(retry_args); raise exception 'unauthorized retry accepted'; exception when others then if sqlerrm <> 'RETRY_NOT_AUTHORIZED' then raise; end if; end;
 insert into public.spm370_counteroffer_retry_authorizations(original_submission_id) values(a);
 begin perform public.spm370_counteroffer_submit(args); raise exception 'ordinary route consumed grant'; exception when others then if sqlerrm <> 'DUPLICATE_EMAIL' then raise; end if; end;
 begin perform public.spm370_counteroffer_submit(retry_args || jsonb_build_object('payload',p||jsonb_build_object('retry_attempt',true,'email','wrong-'||a||'@lasalle.edu'))); raise exception 'wrong email accepted'; exception when others then if sqlerrm <> 'RETRY_NOT_AUTHORIZED' then raise; end if; end;
 -- Exercise the RPC using its actual service role privileges, without credentials.
 set local role service_role;
 r := public.spm370_counteroffer_submit(retry_args);
 if (r->>'attempt_number')::int <> 2 or (r->>'original_submission_id')::uuid <> a then raise exception 'retry metadata failed'; end if;
 if (public.spm370_counteroffer_submit(retry_args)->>'replayed')::boolean is not true then raise exception 'replay failed'; end if;
 begin perform public.spm370_counteroffer_submit(retry_args||jsonb_build_object('id',c)); raise exception 'second retry accepted'; exception when others then if sqlerrm <> 'RETRY_NOT_AUTHORIZED' then raise; end if; end;
 begin perform public.spm370_counteroffer_submit(retry_args||jsonb_build_object('payload_hash',repeat('d',64))); raise exception 'changed retry accepted'; exception when others then if sqlerrm <> 'RETRY_MISMATCH' then raise; end if; end;
 if (public.spm370_counteroffer_list(a)->0->>'attempt_number')::int <> 1 or (public.spm370_counteroffer_list(b)->0->>'attempt_number')::int <> 2 then raise exception 'list metadata failed'; end if;
 update public.spm370_counteroffer_settings set accepts_submissions=false where id='main';
 if (public.spm370_counteroffer_submit(original_args)->>'receipt')::uuid <> receipt then raise exception 'closed original replay failed'; end if;
 if (public.spm370_counteroffer_submit(retry_args)->>'replayed')::boolean is not true then raise exception 'closed retry replay failed'; end if;
 reset role;
 if (select count(*) from public.spm370_counteroffer_submissions where id in(a,b)) <> 2 then raise exception 'wrong synthetic record count'; end if;
 if (select payload from public.spm370_counteroffer_submissions where id=a) <> p then raise exception 'original payload changed'; end if;
 if (select count(*) from public.spm370_counteroffer_submissions where id not in(a,b)) <> original_count then raise exception 'existing count changed'; end if;
 if (select md5(string_agg((to_jsonb(s)-'original_submission_id')::text,'' order by id)) from public.spm370_counteroffer_submissions s where id not in(a,b)) <> original_digest then raise exception 'existing records changed'; end if;
end $$;
rollback;
select 'PASS: duplicate rejection, private authorization, explicit retry, wrong email, one-use limit, exact replay, mismatch, service role privileges, close replay, original preservation; all fixtures rolled back' as qa_result;
