-- Upgrade the namespaced command only: final term sheet is submitted separately in Canvas.
create or replace function public.spm370_contract_command(action text,args jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.spm370_contract_sessions%rowtype; p public.spm370_contract_policies%rowtype; q public.spm370_contract_requests%rowtype; n integer; rid uuid; deadline timestamptz;
begin
 if action='create' then
  select * into p from public.spm370_contract_policies where id=args->>'case_id' and active for update;
  if not found then raise exception 'Case is not available'; end if;
  if now()<(p.body->>'release_at')::timestamptz or now()>(p.body->>'close_at')::timestamptz then raise exception 'Class session is closed'; end if;
  if (select count(*) from public.spm370_contract_sessions where case_id=p.id)>=(p.body->>'max_sessions')::integer then raise exception 'Session capacity reached'; end if;
  insert into public.spm370_contract_sessions(id,token_hash,name,email,mode,model_name,case_id,bargain_until,confirm_until)
   values((args->>'id')::uuid,args->>'token_hash',args->>'name',args->>'email',p.mode,args->>'model_name',p.id,now()+make_interval(mins=>(p.body->>'bargaining_minutes')::integer),now()+make_interval(mins=>((p.body->>'bargaining_minutes')::integer+(p.body->>'confirmation_minutes')::integer))) returning * into s;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,1,'counterpart',p.body->>'opening');
  return jsonb_build_object('id',s.id);
 end if;
 select * into s from public.spm370_contract_sessions where id=(args->>'session_id')::uuid for update;
 if not found then raise exception 'Session not found'; end if;
 select * into p from public.spm370_contract_policies where id=s.case_id;
 select coalesce(max(seq),0)+1 into n from public.spm370_contract_events where session_id=s.id;
 if s.submitted_at is not null and action<>'reset_token' then
  if action='submit' then return jsonb_build_object('receipt',s.receipt,'submitted_at',s.submitted_at); end if;
  raise exception 'Session already submitted';
 end if;
 if action='begin_turn' then
  rid:=(args->>'request_id')::uuid;
  select * into q from public.spm370_contract_requests where session_id=s.id and id=rid;
  if found then return jsonb_build_object('status',q.status); end if;
  if s.paused_at is not null then raise exception 'Session is paused'; end if;
  if s.lock_id is not null then raise exception 'A turn is already pending; refresh to recover'; end if;
  if now()>=s.confirm_until then raise exception 'Conversation window has closed'; end if;
  if (select count(*) from public.spm370_contract_requests where session_id=s.id)>=(p.body->>'max_turns')::integer then raise exception 'Conversation limit reached; ask your instructor'; end if;
  insert into public.spm370_contract_requests(session_id,id,status,phase) values(s.id,rid,'pending',case when now()<s.bargain_until then 'bargaining' else 'confirmation' end) returning * into q;
  update public.spm370_contract_sessions set lock_id=rid where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text,payload) values(s.id,n,'student',args->>'text',jsonb_build_object('request_id',rid));
  return jsonb_build_object('status','started','phase',q.phase);
 elsif action='finish_turn' then
  rid:=(args->>'request_id')::uuid;
  if s.lock_id is distinct from rid then raise exception 'Turn lock changed'; end if;
  insert into public.spm370_contract_events(session_id,seq,actor,text,payload) values(s.id,n,'counterpart',args->>'text',args->'payload');
  update public.spm370_contract_requests set status='complete' where session_id=s.id and id=rid;
  update public.spm370_contract_sessions set lock_id=null where id=s.id;
  return jsonb_build_object('saved',true);
 elsif action='fail_turn' then
  rid:=(args->>'request_id')::uuid;
  if s.lock_id is distinct from rid then return jsonb_build_object('saved',false); end if;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','The AI connection did not complete. Your message is saved. The session is paused; contact your instructor.');
  update public.spm370_contract_requests set status='failed' where session_id=s.id and id=rid;
  update public.spm370_contract_sessions set lock_id=null,paused_at=coalesce(paused_at,now()) where id=s.id;
  return jsonb_build_object('saved',true);
 elsif action='accept' then
  if s.lock_id is not null or s.paused_at is not null or now()>=s.bargain_until then raise exception 'Package confirmation is unavailable'; end if;
  if not exists(select 1 from public.spm370_contract_events e where e.session_id=s.id and e.seq=(args->>'source_seq')::integer and e.actor='counterpart' and e.seq=(select max(seq) from public.spm370_contract_events where session_id=s.id and actor='counterpart') and (e.payload->>'counterparty_accepts')::boolean=true and e.payload->'proposal'=args->'proposal') then raise exception 'The offer has changed; refresh before accepting'; end if;
  if s.accepted=args->'proposal' then return jsonb_build_object('saved',true); end if;
  update public.spm370_contract_sessions set accepted=args->'proposal' where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text,payload) values(s.id,n,'student','I provisionally accept the recorded package, subject to final management approval, legal review and signature.',jsonb_build_object('accepted_proposal',args->'proposal','source_seq',args->'source_seq'));
 elsif action='sheet' then
  if s.lock_id is not null then raise exception 'Wait for the current turn'; end if;
  update public.spm370_contract_sessions set sheet=args->'sheet' where id=s.id;
 elsif action='end' then
  if s.lock_id is not null or s.paused_at is not null then raise exception 'Wait for the current turn or ask the instructor'; end if;
  if now()<s.bargain_until then
   update public.spm370_contract_sessions set bargain_until=now(),confirm_until=now()+make_interval(mins=>(p.body->>'confirmation_minutes')::integer) where id=s.id;
   insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Bargaining ended. Confirmation may clarify the existing record but cannot add concessions.');
  end if;
 elsif action='submit' then
  if s.lock_id is not null then raise exception 'A turn is pending; refresh or ask the instructor'; end if;
  update public.spm370_contract_sessions set submitted_at=now(),receipt=gen_random_uuid(),outcome=args->>'outcome' where id=s.id returning * into s;
  insert into public.spm370_contract_events(session_id,seq,actor,text,payload) values(s.id,n,'system','Student finished the conversation record. The separate term sheet and transcript must still be submitted in Canvas.',jsonb_build_object('term_sheet',s.sheet,'receipt',s.receipt,'outcome',s.outcome));
  return jsonb_build_object('receipt',s.receipt,'submitted_at',s.submitted_at);
 elsif action='pause' then
  update public.spm370_contract_sessions set paused_at=coalesce(paused_at,now()) where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Instructor paused the session: '||(args->>'note'));
 elsif action='resume' then
  if s.lock_id is not null then raise exception 'Pending turn must be recovered before resuming'; end if;
  if s.paused_at is not null then
   update public.spm370_contract_sessions set bargain_until=bargain_until+(now()-s.paused_at),confirm_until=confirm_until+(now()-s.paused_at),paused_at=null where id=s.id;
  end if;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Instructor resumed the session; paused time was restored. '||(args->>'note'));
 elsif action='extend' then
  if (args->>'minutes')::integer not between 1 and 120 then raise exception 'Invalid extension'; end if;
  update public.spm370_contract_sessions set bargain_until=case when coalesce(s.paused_at,now())<s.bargain_until then bargain_until+make_interval(mins=>(args->>'minutes')::integer) else bargain_until end,confirm_until=confirm_until+make_interval(mins=>(args->>'minutes')::integer) where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Instructor extended the session: '||(args->>'note'));
 elsif action='recover' then
  if s.lock_id is null then raise exception 'No pending turn'; end if;
  select * into q from public.spm370_contract_requests where session_id=s.id and id=s.lock_id;
  if now()<q.created_at+interval '2 minutes' then raise exception 'Wait two minutes before recovery'; end if;
  update public.spm370_contract_requests set status='failed' where session_id=s.id and id=s.lock_id;
  update public.spm370_contract_sessions set lock_id=null,paused_at=coalesce(paused_at,now()) where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Instructor recovered an interrupted turn. The original message remains; no response has been invented. '||(args->>'note'));
 elsif action='reset_token' then
  update public.spm370_contract_sessions set token_hash=args->>'token_hash' where id=s.id;
  insert into public.spm370_contract_events(session_id,seq,actor,text) values(s.id,n,'system','Instructor issued a new private resume credential after identity verification.');
 else raise exception 'Unknown command'; end if;
 return jsonb_build_object('saved',true);
end; $$;
revoke all on function public.spm370_contract_command(text,jsonb) from public,anon,authenticated;
grant execute on function public.spm370_contract_command(text,jsonb) to service_role;
comment on table public.spm370_contract_sessions is 'Private SPM370 negotiation attempts; self-reported identity, hashed attempt credentials. One attempt per case/email.';
comment on table public.spm370_contract_events is 'Append-only numbered transcript. No public table access. Corrections are new events.';
