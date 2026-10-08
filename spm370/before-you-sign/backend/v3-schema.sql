create table public.spm370_llc3_v3_attempts (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check(char_length(full_name) between 2 and 120),
 email text not null unique check(email=lower(email)),
 token_hash text not null unique check(char_length(token_hash)=64),
 created_at timestamptz not null default now(),
 revision integer not null default 0,
 stage_answers jsonb not null default '[null,null,null,null,null,null]'::jsonb check(jsonb_array_length(stage_answers)=6),
 notes jsonb not null default '["","","","","",""]'::jsonb check(jsonb_array_length(notes)=6),
 final_decision text not null default '',
 final_brief text not null default '',
 submitted_at timestamptz,
 receipt text unique,
 mc_score integer not null default 0 check(mc_score between 0 and 12),
 note_scores jsonb check(note_scores is null or (jsonb_array_length(note_scores)=6 and note_scores <@ '[0,0.5,1]'::jsonb)),
 brief_score numeric check(brief_score between 0 and 2 and brief_score*2=trunc(brief_score*2)),
 grader_notes text not null default '',
 reviewed_at timestamptz
);
create table public.spm370_llc3_v3_settings (
 id boolean primary key default true check(id),
 is_open boolean not null default true,
 assessment jsonb not null
);
alter table public.spm370_llc3_v3_attempts enable row level security;
alter table public.spm370_llc3_v3_settings enable row level security;
revoke all on public.spm370_llc3_v3_attempts, public.spm370_llc3_v3_settings from public,anon,authenticated;
grant all on public.spm370_llc3_v3_attempts, public.spm370_llc3_v3_settings to service_role;
comment on table public.spm370_llc3_v3_attempts is 'Single six-vignette LLC3. MC /12 scored on server; six notes /6 and final brief /2 reviewed semantically by instructor or assistant. Self-reported identity. Previous BYS submissions remain separate.';
