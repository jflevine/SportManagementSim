-- Pilot access hashes only. Raw credentials must never be added to this file.
create table public.spm370_contract_access (
  id text primary key check (id = 'main'),
  instructor_key_hash text not null check (instructor_key_hash ~ '^[0-9a-f]{64}$'),
  class_code_hash text not null check (class_code_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
alter table public.spm370_contract_access enable row level security;
revoke all on public.spm370_contract_access from public, anon, authenticated, service_role;
grant select on public.spm370_contract_access to service_role;
comment on table public.spm370_contract_access is 'Private fallback access hashes for the contract pilot. Service-role read only. No raw credentials or API provider key.';
