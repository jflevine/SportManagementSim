-- Isolated from the existing Eagles activity. Anonymous browsers access only the edge function.
create table public.mgt340_ad_chat_sessions (
 id uuid primary key default gen_random_uuid(), token_hash text not null unique check(length(token_hash)=64),
 state jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours', lock_id uuid, locked_until timestamptz,
 last_attempt_at timestamptz
);
create table public.mgt340_ad_chat_limits (
 bucket text primary key, count integer not null default 1, expires_at timestamptz not null
);
alter table public.mgt340_ad_chat_sessions enable row level security;
alter table public.mgt340_ad_chat_limits enable row level security;
revoke all on public.mgt340_ad_chat_sessions, public.mgt340_ad_chat_limits from public, anon, authenticated;
grant all on public.mgt340_ad_chat_sessions, public.mgt340_ad_chat_limits to service_role;
create function public.mgt340_ad_chat_start(p_hash text,p_bucket text,p_state jsonb) returns jsonb
language plpgsql set search_path=public as $$
declare s public.mgt340_ad_chat_sessions; n integer;
begin
 if p_hash !~ '^[0-9a-f]{64}$' then return jsonb_build_object('error','Invalid session token.','status',401); end if;
 select * into s from public.mgt340_ad_chat_sessions where token_hash=p_hash;
 if found then
  if s.expires_at<=now() then return jsonb_build_object('error','This session has expired. Start a new browser session.','status',401); end if;
  return jsonb_build_object('id',s.id,'state',s.state);
 end if;
 delete from public.mgt340_ad_chat_limits where expires_at<now();
 delete from public.mgt340_ad_chat_sessions where expires_at<now()-interval '7 days';
 insert into public.mgt340_ad_chat_limits(bucket,expires_at) values('ip:'||p_bucket,now()+interval '10 minutes') on conflict(bucket) do update set count=mgt340_ad_chat_limits.count+1 returning count into n;
 if n>100 then return jsonb_build_object('error','Too many new sessions. Please try again in ten minutes.','status',429); end if;
 insert into public.mgt340_ad_chat_limits(bucket,expires_at) values('starts:'||current_date,now()+interval '1 day') on conflict(bucket) do update set count=mgt340_ad_chat_limits.count+1 returning count into n;
 if n>120 then return jsonb_build_object('error','Today’s session limit has been reached. Use the clearly labeled offline activity.','status',429); end if;
 insert into public.mgt340_ad_chat_sessions(token_hash,state) values(p_hash,p_state) on conflict(token_hash) do update set token_hash=excluded.token_hash returning * into s;
 return jsonb_build_object('id',s.id,'state',s.state);
end $$;
create function public.mgt340_ad_chat_claim(p_id uuid,p_hash text,p_lock uuid,p_request uuid) returns jsonb
language plpgsql set search_path=public as $$
declare s public.mgt340_ad_chat_sessions; n integer;
begin
 select * into s from public.mgt340_ad_chat_sessions where id=p_id and token_hash=p_hash and expires_at>now() for update;
 if not found then return jsonb_build_object('error','This session was not found or has expired.','status',401); end if;
 if exists(select 1 from jsonb_array_elements(s.state->'done') d where d->>'requestId'=p_request::text) then return jsonb_build_object('state',s.state); end if;
 if s.locked_until>now() then return jsonb_build_object('error','A response is still being saved. Wait a moment and retry.','status',409); end if;
 if (s.state->>'turns')::integer>=36 then return jsonb_build_object('error','This session has reached its 36-message limit.','status',429); end if;
 if s.last_attempt_at>now()-interval '2 seconds' then return jsonb_build_object('error','Please wait a moment before sending another message.','status',429); end if;
 insert into public.mgt340_ad_chat_limits(bucket,expires_at) values('messages:'||current_date,now()+interval '1 day') on conflict(bucket) do update set count=mgt340_ad_chat_limits.count+1 returning count into n;
 if n>1800 then return jsonb_build_object('error','Today’s live-chat limit has been reached. Use the clearly labeled offline activity.','status',429); end if;
 update public.mgt340_ad_chat_sessions set lock_id=p_lock,locked_until=now()+interval '75 seconds',last_attempt_at=now() where id=p_id;
 return jsonb_build_object('state',s.state);
end $$;
create function public.mgt340_ad_chat_commit(p_id uuid,p_lock uuid,p_state jsonb) returns boolean
language plpgsql set search_path=public as $$
begin
 update public.mgt340_ad_chat_sessions set state=p_state,updated_at=now(),lock_id=null,locked_until=null where id=p_id and lock_id=p_lock;
 return found;
end $$;
revoke all on function public.mgt340_ad_chat_start(text,text,jsonb), public.mgt340_ad_chat_claim(uuid,text,uuid,uuid), public.mgt340_ad_chat_commit(uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.mgt340_ad_chat_start(text,text,jsonb), public.mgt340_ad_chat_claim(uuid,text,uuid,uuid), public.mgt340_ad_chat_commit(uuid,uuid,jsonb) to service_role;
