-- Only the Edge Function service credential accesses these tables.
create table if not exists public.spm343_arena_rooms (
 code text primary key,
 state jsonb not null,
 version integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.spm343_arena_rooms enable row level security;
revoke all on public.spm343_arena_rooms from public, anon, authenticated;
grant all on public.spm343_arena_rooms to service_role;
create table if not exists public.spm343_arena_access (
 id text primary key,
 key_hash text not null
);
alter table public.spm343_arena_access enable row level security;
revoke all on public.spm343_arena_access from public, anon, authenticated;
grant all on public.spm343_arena_access to service_role;
