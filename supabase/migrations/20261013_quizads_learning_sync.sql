-- QuizADS learning sync · local-first snapshots + append-only evidence
-- Apply with the Supabase migration workflow. The browser uses only anon + RLS.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  module_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, track_id, module_id)
);

create table if not exists public.competency_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  module_id text not null,
  competency_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, track_id, module_id, competency_id)
);

create table if not exists public.activity_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  module_id text not null,
  competency_id text not null,
  signature text not null,
  source text not null check (source in ('practice', 'checkpoint', 'boss', 'lab', 'conclusion')),
  correct boolean not null default false,
  evidence_weight numeric(5,4) not null default 0 check (evidence_weight between 0 and 1),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id, module_id, competency_id, signature)
);

create table if not exists public.conclusion_evidence (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  module_id text not null,
  evidence_id text not null,
  answer text not null,
  approved boolean not null default false,
  rubric_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id, module_id, evidence_id)
);

create table if not exists public.sync_metadata (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  last_synced_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  primary key (user_id, client_id)
);

alter table public.profiles enable row level security;
alter table public.module_progress enable row level security;
alter table public.competency_state enable row level security;
alter table public.activity_history enable row level security;
alter table public.conclusion_evidence enable row level security;
alter table public.sync_metadata enable row level security;

drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "module_progress_owner_all" on public.module_progress;
create policy "module_progress_owner_all" on public.module_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "competency_state_owner_all" on public.competency_state;
create policy "competency_state_owner_all" on public.competency_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activity_history_owner_all" on public.activity_history;
create policy "activity_history_owner_all" on public.activity_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "conclusion_evidence_owner_all" on public.conclusion_evidence;
create policy "conclusion_evidence_owner_all" on public.conclusion_evidence
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sync_metadata_owner_all" on public.sync_metadata;
create policy "sync_metadata_owner_all" on public.sync_metadata
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists activity_history_user_module_created_idx
  on public.activity_history (user_id, track_id, module_id, created_at desc);

create index if not exists conclusion_evidence_user_module_created_idx
  on public.conclusion_evidence (user_id, track_id, module_id, created_at desc);
