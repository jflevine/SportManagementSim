-- Draft. Do not apply to production without separately confirming database access.
begin;
create table public.spm370_signal_leak_pilot_roster (
 student_id uuid primary key
);
create table public.spm370_signal_leak_pilot_submissions (
 student_id uuid primary key references public.spm370_signal_leak_pilot_roster,
 attempt_id uuid not null unique,
 choices smallint[] not null check (cardinality(choices)=3 and choices <@ array[0,1]::smallint[]),
 answers text[] not null check (cardinality(answers)=3 and array_position(answers,null) is null and length(answers::text)<=7300),
 receipt uuid not null unique default gen_random_uuid(),
 saved_at timestamptz not null default now()
);
alter table public.spm370_signal_leak_pilot_roster enable row level security;
alter table public.spm370_signal_leak_pilot_submissions enable row level security;
revoke all on public.spm370_signal_leak_pilot_roster, public.spm370_signal_leak_pilot_submissions from public, anon, authenticated, service_role;
grant select on public.spm370_signal_leak_pilot_roster to service_role;
grant select,insert on public.spm370_signal_leak_pilot_submissions to service_role;
create function public.spm370_signal_leak_submit_pilot(p_student uuid,p_attempt uuid,p_choices smallint[],p_answers text[])
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.spm370_signal_leak_pilot_submissions%rowtype;
begin
 if not exists(select 1 from public.spm370_signal_leak_pilot_roster where student_id=p_student) then return null; end if;
 insert into public.spm370_signal_leak_pilot_submissions(student_id,attempt_id,choices,answers)
 values(p_student,p_attempt,p_choices,p_answers) on conflict do nothing;
 select * into r from public.spm370_signal_leak_pilot_submissions where student_id=p_student;
 if not found or r.attempt_id<>p_attempt or r.choices<>p_choices or r.answers<>p_answers then
  return jsonb_build_object('conflict',true);
 end if;
 return jsonb_build_object('receipt',r.receipt,'savedAt',r.saved_at);
end $$;
revoke all on function public.spm370_signal_leak_submit_pilot(uuid,uuid,smallint[],text[]) from public, anon, authenticated, service_role;
grant execute on function public.spm370_signal_leak_submit_pilot(uuid,uuid,smallint[],text[]) to service_role;
commit;
